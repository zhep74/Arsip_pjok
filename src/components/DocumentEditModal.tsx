import React, { useState } from 'react';
import { X, Save, Edit3, Layers, Calendar, Tag } from 'lucide-react';
import { DocumentItem, Category } from '../types';
import { StorageService } from '../services/storageService';

interface DocumentEditModalProps {
  document: DocumentItem | null;
  categories: Category[];
  onClose: () => void;
  onDocumentUpdated: (updatedDoc: DocumentItem) => void;
  showToast: (msg: string, type?: 'success' | 'error') => void;
}

export const DocumentEditModal: React.FC<DocumentEditModalProps> = ({
  document: doc,
  categories,
  onClose,
  onDocumentUpdated,
  showToast,
}) => {
  if (!doc) return null;

  const [title, setTitle] = useState(doc.title);
  const [documentCode, setDocumentCode] = useState(doc.documentCode);
  const [categoryId, setCategoryId] = useState(doc.categoryId);
  const [subcategoryId, setSubcategoryId] = useState(doc.subcategoryId || '');
  const [academicYear, setAcademicYear] = useState(doc.academicYear);
  const [semester, setSemester] = useState(doc.semester);
  const [gradeLevel, setGradeLevel] = useState(doc.gradeLevel || 'Fase E (Kelas X)');
  const [documentDate, setDocumentDate] = useState(doc.documentDate);
  const [description, setDescription] = useState(doc.description || '');
  const [tags, setTags] = useState((doc.tags || []).join(', '));

  const parentCategories = categories.filter((c) => !c.parentId && c.isActive);
  const subCategories = categories.filter((c) => c.parentId === categoryId && c.isActive);

  const handleSave = () => {
    if (!title.trim()) {
      showToast('Judul dokumen tidak boleh kosong.', 'error');
      return;
    }

    const updated = StorageService.updateDocument(doc.id, {
      title,
      documentCode,
      categoryId,
      subcategoryId: subcategoryId || undefined,
      academicYear,
      semester,
      gradeLevel,
      documentDate,
      description,
      tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
    });

    if (updated) {
      onDocumentUpdated(updated);
      showToast('Metadata dokumen berhasil diperbarui.');
      onClose();
    } else {
      showToast('Gagal memperbarui metadata dokumen.', 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <Edit3 className="w-5 h-5 text-blue-600" />
            <h2 className="text-sm font-bold text-slate-900">
              Edit Metadata Dokumen
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-4 text-xs text-slate-700 max-h-[75vh] overflow-y-auto">
          <div>
            <label className="block text-[10px] font-semibold text-slate-500 mb-1">
              Judul Dokumen
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-xs py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-semibold text-slate-500 mb-1">
                Kode / Nomor Dokumen
              </label>
              <input
                type="text"
                value={documentCode}
                onChange={(e) => setDocumentCode(e.target.value)}
                className="w-full text-xs py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600 font-mono"
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-slate-500 mb-1">
                Tanggal Dokumen
              </label>
              <input
                type="date"
                value={documentDate}
                onChange={(e) => setDocumentDate(e.target.value)}
                className="w-full text-xs py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-semibold text-slate-500 mb-1">
                Kategori PJOK
              </label>
              <select
                value={categoryId}
                onChange={(e) => {
                  setCategoryId(e.target.value);
                  setSubcategoryId('');
                }}
                className="w-full text-xs py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600"
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
                value={subcategoryId}
                onChange={(e) => setSubcategoryId(e.target.value)}
                className="w-full text-xs py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600"
              >
                <option value="">Pilih Subkategori...</option>
                {subCategories.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.namaKategori}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[10px] font-semibold text-slate-500 mb-1">
                Tahun Pelajaran
              </label>
              <select
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                className="w-full text-xs py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600"
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
                value={semester}
                onChange={(e) => setSemester(e.target.value as any)}
                className="w-full text-xs py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600"
              >
                <option value="Ganjil">Ganjil</option>
                <option value="Genap">Genap</option>
                <option value="Tahunan">Tahunan</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-slate-500 mb-1">
                Fase / Tingkat
              </label>
              <select
                value={gradeLevel}
                onChange={(e) => setGradeLevel(e.target.value)}
                className="w-full text-xs py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600"
              >
                <option value="Fase E (Kelas X)">Fase E (Kelas X)</option>
                <option value="Fase F (Kelas XI)">Fase F (Kelas XI)</option>
                <option value="Fase F (Kelas XII)">Fase F (Kelas XII)</option>
                <option value="Semua Tingkat">Semua Tingkat</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-semibold text-slate-500 mb-1">
              Deskripsi / Keterangan Berkas
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
            />
          </div>

          <div>
            <label className="block text-[10px] font-semibold text-slate-500 mb-1">
              Kata Kunci / Tag (Pisahkan dengan koma)
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="Modul, Atletik, Fase E"
              className="w-full text-xs py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 bg-slate-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
          >
            Batal
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-xs"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Simpan Perubahan</span>
          </button>
        </div>
      </div>
    </div>
  );
};
