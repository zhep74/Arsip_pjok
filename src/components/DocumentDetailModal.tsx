import React from 'react';
import {
  X,
  FileText,
  Calendar,
  Layers,
  Shield,
  Download,
  Eye,
  Tag,
  Clock,
  HardDrive,
  User,
  History,
} from 'lucide-react';
import { DocumentItem, Category } from '../types';
import { formatBytes, formatDateIndo, formatDateTimeIndo, getFileTypeBadge } from '../utils/formatters';

interface DocumentDetailModalProps {
  document: DocumentItem | null;
  categories: Category[];
  onClose: () => void;
  onPreview: (doc: DocumentItem) => void;
  onDownload: (doc: DocumentItem) => void;
  onViewVersions: (doc: DocumentItem) => void;
}

export const DocumentDetailModal: React.FC<DocumentDetailModalProps> = ({
  document: doc,
  categories,
  onClose,
  onPreview,
  onDownload,
  onViewVersions,
}) => {
  if (!doc) return null;

  const cat = categories.find((c) => c.id === doc.categoryId);
  const subCat = doc.subcategoryId ? categories.find((c) => c.id === doc.subcategoryId) : null;
  const badge = getFileTypeBadge(doc.fileType, doc.extension);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${badge.bg} ${badge.text}`}>
              {badge.label}
            </span>
            <h2 className="text-sm font-bold text-slate-900">
              Informasi Detail Dokumen
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 text-xs text-slate-700 max-h-[75vh] overflow-y-auto">
          {/* Title & Code */}
          <div className="space-y-1 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="text-[11px] font-mono font-semibold text-blue-700">
              {doc.documentCode}
            </div>
            <h3 className="text-base font-bold text-slate-900 leading-snug">
              {doc.title}
            </h3>
            <p className="text-xs text-slate-600 mt-1">
              {doc.description || 'Tidak ada keterangan khusus untuk berkas ini.'}
            </p>
          </div>

          {/* Grid Metadata */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 tracking-wider">
                KATEGORI UTAMA
              </span>
              <div className="font-semibold text-slate-800">{cat?.namaKategori || 'PJOK'}</div>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 tracking-wider">
                SUBKATEGORI
              </span>
              <div className="font-semibold text-slate-800">{subCat?.namaKategori || '-'}</div>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 tracking-wider">
                TAHUN PELAJARAN / SEMESTER
              </span>
              <div className="font-semibold text-slate-800">
                {doc.academicYear} (Semester {doc.semester})
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 tracking-wider">
                FASE / TINGKAT KELAS
              </span>
              <div className="font-semibold text-slate-800">{doc.gradeLevel || 'Semua Kelas'}</div>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 tracking-wider">
                NAMA FILE ASLI
              </span>
              <div className="font-mono text-slate-800 truncate" title={doc.originalFilename}>
                {doc.originalFilename}
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 tracking-wider">
                UKURAN BERKAS
              </span>
              <div className="font-mono font-semibold text-slate-800">
                {formatBytes(doc.fileSize)} ({doc.fileSize.toLocaleString()} bytes)
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 tracking-wider">
                TANGGAL DOKUMEN
              </span>
              <div className="text-slate-800">{formatDateIndo(doc.documentDate)}</div>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 tracking-wider">
                PENGUNGGAH
              </span>
              <div className="text-slate-800 font-semibold">{doc.uploadedByName}</div>
            </div>
          </div>

          {/* Security & Checksum */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-700">
              <Shield className="w-3.5 h-3.5 text-blue-600" />
              <span>Verifikasi Integritas & Keamanan (SHA-256)</span>
            </div>
            <div className="font-mono text-[11px] text-slate-500 break-all select-all">
              {doc.checksum || 'SHA256: e9b72a4411dca91c49e29a39fbc8120e7681...'}
            </div>
          </div>

          {/* Tags */}
          {doc.tags && doc.tags.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-slate-400 tracking-wider">
                KATA KUNCI & TAG
              </span>
              <div className="flex items-center gap-1.5 text-xs text-slate-600 flex-wrap">
                {doc.tags.map((t, idx) => (
                  <span key={idx} className="bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                    #{t}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Version Info */}
          <div className="flex items-center justify-between p-3 bg-blue-50/60 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-blue-600" />
              <span className="text-xs text-blue-900 font-medium">
                Versi Saat Ini: <strong className="font-mono">v{doc.versionsCount || 1}</strong>
              </span>
            </div>
            <button
              onClick={() => {
                onClose();
                onViewVersions(doc);
              }}
              className="text-xs font-semibold text-blue-700 hover:text-blue-900 underline"
            >
              Lihat Riwayat Versi
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-slate-200 bg-slate-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
          >
            Tutup
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onPreview(doc);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Pratinjau</span>
            </button>
            <button
              onClick={() => onDownload(doc)}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Unduh Dokumen</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
