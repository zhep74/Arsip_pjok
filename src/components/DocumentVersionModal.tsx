import React, { useState } from 'react';
import {
  X,
  History,
  Upload,
  Download,
  Clock,
  User,
  FileCheck,
  Plus,
} from 'lucide-react';
import { DocumentItem, DocumentVersion } from '../types';
import { StorageService } from '../services/storageService';
import { formatBytes, formatDateTimeIndo } from '../utils/formatters';

interface DocumentVersionModalProps {
  document: DocumentItem | null;
  onClose: () => void;
  onVersionUploaded: (updatedDoc: DocumentItem) => void;
  showToast: (msg: string, type?: 'success' | 'error') => void;
}

export const DocumentVersionModal: React.FC<DocumentVersionModalProps> = ({
  document: doc,
  onClose,
  onVersionUploaded,
  showToast,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [versionNote, setVersionNote] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  if (!doc) return null;

  const versions: DocumentVersion[] = StorageService.getDocumentVersions(doc.id);

  const handleUploadNewVersion = async () => {
    if (!selectedFile) {
      showToast('Pilih berkas versi baru terlebih dahulu.', 'error');
      return;
    }

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const dataUrl = reader.result as string;
        const ext = selectedFile.name.split('.').pop()?.toLowerCase() || doc.extension;
        const updated = StorageService.uploadNewVersion(
          doc.id,
          dataUrl,
          selectedFile.name,
          selectedFile.size,
          selectedFile.type,
          ext,
          versionNote || `Revisi versi ${(doc.versionsCount || 1) + 1}`
        );

        if (updated) {
          onVersionUploaded(updated);
          showToast(`Berhasil memperbarui ke Versi ${(doc.versionsCount || 1) + 1}.`);
          setSelectedFile(null);
          setVersionNote('');
          setIsUploading(false);
        }
      };
      reader.readAsDataURL(selectedFile);
    } catch {
      showToast('Gagal memproses unggah versi baru.', 'error');
    }
  };

  const handleDownloadVersion = (ver: DocumentVersion) => {
    if (ver.fileDataUrl) {
      const a = document.createElement('a');
      a.href = ver.fileDataUrl;
      a.download = `v${ver.versionNumber}_${doc.originalFilename}`;
      a.click();
    } else {
      showToast(`Mengunduh berkas arsip versi ${ver.versionNumber}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-purple-50 text-purple-700 rounded-lg">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Riwayat Versi Dokumen
              </h2>
              <p className="text-xs text-slate-500 font-mono">
                {doc.documentCode} · {doc.title}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 text-xs text-slate-700 max-h-[70vh] overflow-y-auto">
          {/* Upload New Version Toggle Card */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="font-bold text-slate-900">
                Unggah File Versi Pembaruan (v{(doc.versionsCount || 1) + 1})
              </div>
              {!isUploading ? (
                <button
                  onClick={() => setIsUploading(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Perbarui Berkas</span>
                </button>
              ) : (
                <button
                  onClick={() => setIsUploading(false)}
                  className="text-xs text-slate-500 hover:text-slate-800"
                >
                  Batal
                </button>
              )}
            </div>

            {isUploading && (
              <div className="space-y-3 pt-2 border-t border-slate-200">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 mb-1">
                    Pilih File Revisi
                  </label>
                  <input
                    type="file"
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                    className="w-full text-xs text-slate-700 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 mb-1">
                    Catatan Perubahan Versi
                  </label>
                  <input
                    type="text"
                    value={versionNote}
                    onChange={(e) => setVersionNote(e.target.value)}
                    placeholder="Contoh: Revisi rubrik penilaian lari cepat dan jadwal remedial"
                    className="w-full text-xs py-1.5 px-2 bg-white border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600"
                  />
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    onClick={handleUploadNewVersion}
                    disabled={!selectedFile}
                    className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 disabled:opacity-50 rounded-lg shadow-xs"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Simpan Versi Baru</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Version Logs Timeline */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-800">
              Daftar Riwayat Perubahan File
            </h3>

            {versions.length === 0 ? (
              <div className="p-4 bg-slate-50 rounded-lg text-slate-500 text-center">
                Belum ada riwayat revisi tambahan. Dokumen ini masih berada pada versi awal (v1).
              </div>
            ) : (
              <div className="space-y-2.5">
                {versions.map((ver) => (
                  <div
                    key={ver.id}
                    className="p-3.5 bg-white border border-slate-200 rounded-xl flex items-center justify-between gap-3 shadow-2xs hover:border-slate-300 transition-colors"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 font-mono font-bold flex items-center justify-center shrink-0">
                        v{ver.versionNumber}
                      </div>
                      <div className="min-w-0 space-y-0.5">
                        <div className="text-xs font-semibold text-slate-800 truncate">
                          {ver.versionNote || `Versi ${ver.versionNumber}`}
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-2">
                          <span>{ver.uploadedBy}</span>
                          <span>·</span>
                          <span className="font-mono tabular-nums">{formatDateTimeIndo(ver.createdAt)}</span>
                          <span>·</span>
                          <span className="font-mono tabular-nums">{formatBytes(ver.fileSize)}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDownloadVersion(ver)}
                      className="p-2 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-lg shrink-0 transition-colors"
                      title="Unduh versi ini"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-3.5 border-t border-slate-200 bg-slate-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
