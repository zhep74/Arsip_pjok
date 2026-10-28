import React, { useState, useRef } from 'react';
import {
  X,
  UploadCloud,
  FileText,
  FileSpreadsheet,
  FileCheck,
  Image as ImageIcon,
  File,
  AlertCircle,
  CheckCircle2,
  Trash2,
  Plus,
  Layers,
} from 'lucide-react';
import { Category, DocumentItem, User } from '../types';
import { calculateChecksum, StorageService } from '../services/storageService';
import { formatBytes } from '../utils/formatters';

interface DocumentUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  currentUser: User;
  onDocumentAdded: (doc: DocumentItem) => void;
  showToast: (msg: string, type?: 'success' | 'error') => void;
}

interface UploadQueueItem {
  id: string;
  file: File;
  title: string;
  documentCode: string;
  categoryId: string;
  subcategoryId: string;
  academicYear: string;
  semester: 'Ganjil' | 'Genap' | 'Tahunan';
  documentDate: string;
  gradeLevel: string;
  description: string;
  tags: string;
  status: 'pending' | 'processing' | 'done' | 'error';
  errorMessage?: string;
}

export const DocumentUploadModal: React.FC<DocumentUploadModalProps> = ({
  isOpen,
  onClose,
  categories,
  currentUser,
  onDocumentAdded,
  showToast,
}) => {
  const [queue, setQueue] = useState<UploadQueueItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Common defaults to apply across batch
  const [batchCategory, setBatchCategory] = useState<string>('cat-perangkat');
  const [batchYear, setBatchYear] = useState<string>('2025/2026');
  const [batchSemester, setBatchSemester] = useState<'Ganjil' | 'Genap' | 'Tahunan'>('Ganjil');
  const [batchGradeLevel, setBatchGradeLevel] = useState<string>('Fase E (Kelas X)');

  if (!isOpen) return null;

  const parentCategories = categories.filter((c) => !c.parentId && c.isActive);

  // Determine file type category
  const detectFileType = (filename: string): DocumentItem['fileType'] => {
    const ext = filename.split('.').pop()?.toLowerCase() || '';
    if (['doc', 'docx'].includes(ext)) return 'word';
    if (['xls', 'xlsx', 'xlsm'].includes(ext)) return 'excel';
    if (ext === 'pdf') return 'pdf';
    if (['jpg', 'jpeg', 'png', 'webp'].includes(ext)) return 'image';
    return 'other';
  };

  const handleFilesAdded = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const newItems: UploadQueueItem[] = [];
    const today = new Date().toISOString().substring(0, 10);

    Array.from(files).forEach((file) => {
      // Clean display name
      const nameWithoutExt = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
      const formattedTitle = nameWithoutExt.replace(/[_-]/g, ' ');

      const codeSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
      const code = `PJOK-${new Date().getFullYear()}-${codeSuffix}`;

      newItems.push({
        id: `q-${Date.now()}-${Math.random()}`,
        file,
        title: formattedTitle,
        documentCode: code,
        categoryId: batchCategory,
        subcategoryId: '',
        academicYear: batchYear,
        semester: batchSemester,
        documentDate: today,
        gradeLevel: batchGradeLevel,
        description: '',
        tags: 'PJOK, Administrasi',
        status: 'pending',
      });
    });

    setQueue((prev) => [...prev, ...newItems]);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFilesAdded(e.dataTransfer.files);
  };

  const removeItem = (id: string) => {
    setQueue((prev) => prev.filter((item) => item.id !== id));
  };

  const updateItem = (id: string, updates: Partial<UploadQueueItem>) => {
    setQueue((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  };

  // Convert File to base64 Data URL for persistent preview & download
  const readFileAsDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleSubmitAll = async () => {
    if (queue.length === 0) return;
    setIsSubmitting(true);

    let successCount = 0;
    let duplicateCount = 0;

    for (const item of queue) {
      try {
        const dataUrl = await readFileAsDataUrl(item.file);
        const checksum = await calculateChecksum(dataUrl);
        const extension = item.file.name.split('.').pop()?.toLowerCase() || 'bin';
        const fileType = detectFileType(item.file.name);
        const now = new Date().toISOString().replace('T', ' ').substring(0, 19);

        const newDoc: DocumentItem = {
          id: `doc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          documentCode: item.documentCode || `PJOK-${Date.now().toString().slice(-6)}`,
          title: item.title || item.file.name,
          originalFilename: item.file.name,
          storedFilename: `doc_${Date.now()}_${item.file.name.replace(/\s+/g, '_')}`,
          mimeType: item.file.type || 'application/octet-stream',
          extension,
          fileSize: item.file.size,
          fileType,
          fileDataUrl: dataUrl,
          categoryId: item.categoryId,
          subcategoryId: item.subcategoryId || undefined,
          academicYear: item.academicYear,
          semester: item.semester,
          documentDate: item.documentDate,
          gradeLevel: item.gradeLevel,
          subject: 'PJOK',
          description: item.description,
          tags: item.tags.split(',').map((t) => t.trim()).filter(Boolean),
          checksum,
          isFavorite: false,
          status: 'active',
          uploadedBy: currentUser.id,
          uploadedByName: currentUser.name,
          createdAt: now,
          updatedAt: now,
          versionsCount: 1,
        };

        const result = StorageService.addDocument(newDoc);
        if (result.success) {
          successCount++;
          onDocumentAdded(newDoc);
        } else if (result.isDuplicate) {
          duplicateCount++;
          updateItem(item.id, { status: 'error', errorMessage: 'Berkas duplikat' });
        }
      } catch (e) {
        console.error(e);
        updateItem(item.id, { status: 'error', errorMessage: 'Gagal memproses berkas' });
      }
    }

    setIsSubmitting(false);

    if (successCount > 0) {
      showToast(`Berhasil menyimpan ${successCount} dokumen ke arsip digital.`);
      onClose();
    } else if (duplicateCount > 0) {
      showToast('Dokumen yang diunggah terdeteksi duplikat atau sudah ada di arsip.', 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Unggah Berkas Administrasi PJOK
            </h2>
            <p className="text-xs text-slate-500">
              Dukung berkas Word (.docx), Excel (.xlsx), PDF, dan Foto (.jpg, .png)
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Drag & Drop Area */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
              isDragging
                ? 'border-blue-600 bg-blue-50/60'
                : 'border-slate-300 hover:border-blue-500 bg-slate-50/50 hover:bg-blue-50/20'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => handleFilesAdded(e.target.files)}
              multiple
              accept=".pdf,.docx,.doc,.xlsx,.xls,.xlsm,.jpg,.jpeg,.png,.webp"
              className="hidden"
            />
            <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-700 mx-auto flex items-center justify-center mb-3">
              <UploadCloud className="w-6 h-6" />
            </div>
            <div className="text-sm font-semibold text-slate-800">
              Seret dan lepaskan berkas ke sini, atau{' '}
              <span className="text-blue-600 underline">pilih dari komputer</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Dapat mengunggah satu atau beberapa berkas sekaligus (Maksimal 50 MB per berkas)
            </p>
          </div>

          {/* Batch Default Form (Only if queue > 1) */}
          {queue.length > 1 && (
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                <Layers className="w-4 h-4 text-blue-600" />
                <span>Pengaturan Kategori Massal (Diterapkan ke Semua Berkas)</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 mb-1">
                    Kategori Induk
                  </label>
                  <select
                    value={batchCategory}
                    onChange={(e) => {
                      setBatchCategory(e.target.value);
                      setQueue((prev) =>
                        prev.map((i) => ({ ...i, categoryId: e.target.value, subcategoryId: '' }))
                      );
                    }}
                    className="w-full text-xs py-1.5 px-2 bg-white border border-slate-200 rounded-md"
                  >
                    {parentCategories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.namaKategori}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 mb-1">
                    Tahun Pelajaran
                  </label>
                  <select
                    value={batchYear}
                    onChange={(e) => {
                      setBatchYear(e.target.value);
                      setQueue((prev) => prev.map((i) => ({ ...i, academicYear: e.target.value })));
                    }}
                    className="w-full text-xs py-1.5 px-2 bg-white border border-slate-200 rounded-md"
                  >
                    <option value="2024/2025">2024/2025</option>
                    <option value="2025/2026">2025/2026</option>
                    <option value="2026/2027">2026/2027</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 mb-1">
                    Semester
                  </label>
                  <select
                    value={batchSemester}
                    onChange={(e) => {
                      const val = e.target.value as any;
                      setBatchSemester(val);
                      setQueue((prev) => prev.map((i) => ({ ...i, semester: val })));
                    }}
                    className="w-full text-xs py-1.5 px-2 bg-white border border-slate-200 rounded-md"
                  >
                    <option value="Ganjil">Semester Ganjil</option>
                    <option value="Genap">Semester Genap</option>
                    <option value="Tahunan">Tahunan</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 mb-1">
                    Fase / Kelas
                  </label>
                  <select
                    value={batchGradeLevel}
                    onChange={(e) => {
                      setBatchGradeLevel(e.target.value);
                      setQueue((prev) => prev.map((i) => ({ ...i, gradeLevel: e.target.value })));
                    }}
                    className="w-full text-xs py-1.5 px-2 bg-white border border-slate-200 rounded-md"
                  >
                    <option value="Fase E (Kelas X)">Fase E (Kelas X)</option>
                    <option value="Fase F (Kelas XI)">Fase F (Kelas XI)</option>
                    <option value="Fase F (Kelas XII)">Fase F (Kelas XII)</option>
                    <option value="Semua Tingkat">Semua Tingkat</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Upload Queue List */}
          {queue.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-800">
                  Daftar Berkas Siap Diunggah ({queue.length})
                </h3>
                <button
                  onClick={() => setQueue([])}
                  className="text-xs text-rose-600 hover:text-rose-700 font-medium"
                >
                  Hapus Semua
                </button>
              </div>

              <div className="space-y-3">
                {queue.map((item, index) => {
                  const subCats = categories.filter(
                    (c) => c.parentId === item.categoryId && c.isActive
                  );

                  return (
                    <div
                      key={item.id}
                      className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 font-mono text-[10px] flex items-center justify-center font-bold shrink-0">
                            {index + 1}
                          </span>
                          <div className="min-w-0">
                            <div className="text-xs font-semibold text-slate-800 truncate">
                              {item.file.name}
                            </div>
                            <div className="text-[10px] text-slate-500 font-mono tabular-nums">
                              {formatBytes(item.file.size)}
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                          title="Hapus dari antrean"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Fields */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="sm:col-span-2">
                          <label className="block text-[10px] font-semibold text-slate-500 mb-1">
                            Judul Dokumen
                          </label>
                          <input
                            type="text"
                            value={item.title}
                            onChange={(e) => updateItem(item.id, { title: e.target.value })}
                            className="w-full text-xs py-1.5 px-2 bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
                            placeholder="Contoh: Modul Ajar Senam Lantai Fase E"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-semibold text-slate-500 mb-1">
                            Kode / No Dokumen
                          </label>
                          <input
                            type="text"
                            value={item.documentCode}
                            onChange={(e) => updateItem(item.id, { documentCode: e.target.value })}
                            className="w-full text-xs py-1.5 px-2 bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600 font-mono"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div>
                          <label className="block text-[10px] font-semibold text-slate-500 mb-1">
                            Kategori PJOK
                          </label>
                          <select
                            value={item.categoryId}
                            onChange={(e) =>
                              updateItem(item.id, { categoryId: e.target.value, subcategoryId: '' })
                            }
                            className="w-full text-xs py-1.5 px-2 bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600"
                          >
                            {parentCategories.map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.namaKategori}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-semibold text-slate-500 mb-1">
                            Subkategori
                          </label>
                          <select
                            value={item.subcategoryId}
                            onChange={(e) => updateItem(item.id, { subcategoryId: e.target.value })}
                            className="w-full text-xs py-1.5 px-2 bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600"
                          >
                            <option value="">Pilih Subkategori...</option>
                            {subCats.map((sub) => (
                              <option key={sub.id} value={sub.id}>
                                {sub.namaKategori}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-semibold text-slate-500 mb-1">
                            Tahun Pelajaran
                          </label>
                          <select
                            value={item.academicYear}
                            onChange={(e) => updateItem(item.id, { academicYear: e.target.value })}
                            className="w-full text-xs py-1.5 px-2 bg-slate-50 border border-slate-200 rounded-md"
                          >
                            <option value="2024/2025">2024/2025</option>
                            <option value="2025/2026">2025/2026</option>
                            <option value="2026/2027">2026/2027</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-semibold text-slate-500 mb-1">
                            Semester
                          </label>
                          <select
                            value={item.semester}
                            onChange={(e) =>
                              updateItem(item.id, { semester: e.target.value as any })
                            }
                            className="w-full text-xs py-1.5 px-2 bg-slate-50 border border-slate-200 rounded-md"
                          >
                            <option value="Ganjil">Ganjil</option>
                            <option value="Genap">Genap</option>
                            <option value="Tahunan">Tahunan</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-semibold text-slate-500 mb-1">
                            Deskripsi / Keterangan
                          </label>
                          <textarea
                            rows={2}
                            value={item.description}
                            onChange={(e) => updateItem(item.id, { description: e.target.value })}
                            className="w-full text-xs py-1 px-2 bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-none"
                            placeholder="Catatan ringkas isi materi atau tujuan asesmen..."
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-semibold text-slate-500 mb-1">
                            Kata Kunci / Tag (Pisahkan dengan koma)
                          </label>
                          <input
                            type="text"
                            value={item.tags}
                            onChange={(e) => updateItem(item.id, { tags: e.target.value })}
                            className="w-full text-xs py-1.5 px-2 bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-none"
                            placeholder="PJOK, Modul, Lari, Fase E"
                          />
                          <p className="text-[10px] text-slate-400 mt-1">
                            Tag memudahkan pencarian cepat di masa mendatang.
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 bg-slate-50">
          <div className="text-xs text-slate-500">
            {queue.length > 0 ? (
              <span>{queue.length} berkas siap disimpan ke database arsip</span>
            ) : (
              <span>Pilih berkas terlebih dahulu untuk melanjutkan</span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Batal
            </button>
            <button
              onClick={handleSubmitAll}
              disabled={queue.length === 0 || isSubmitting}
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-xs transition-colors flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Menyimpan ke Arsip...</span>
                </>
              ) : (
                <>
                  <UploadCloud className="w-4 h-4" />
                  <span>Simpan ke Arsip ({queue.length})</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
