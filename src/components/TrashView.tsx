import React from 'react';
import {
  Trash2,
  RotateCcw,
  AlertTriangle,
  File,
  FileText,
  FileSpreadsheet,
  FileCheck,
  Image as ImageIcon,
} from 'lucide-react';
import { DocumentItem, User } from '../types';
import { formatBytes, formatDateTimeIndo, getFileTypeBadge } from '../utils/formatters';

interface TrashViewProps {
  documents: DocumentItem[];
  currentUser: User;
  onRestore: (doc: DocumentItem) => void;
  onForceDelete: (doc: DocumentItem) => void;
  onEmptyTrash: () => void;
  showToast: (msg: string, type?: 'success' | 'error') => void;
}

export const TrashView: React.FC<TrashViewProps> = ({
  documents,
  currentUser,
  onRestore,
  onForceDelete,
  onEmptyTrash,
  showToast,
}) => {
  const trashDocs = documents.filter((d) => d.status === 'trash');

  const handleEmptyTrash = () => {
    if (confirm('PERINGATAN: Seluruh dokumen di kotak sampah akan dihapus secara PERMANEN dari sistem. Tindakan ini tidak dapat dibatalkan. Lanjutkan?')) {
      onEmptyTrash();
      showToast('Kotak sampah berhasil dikosongkan.');
    }
  };

  const handleSingleDelete = (doc: DocumentItem) => {
    if (confirm(`Hapus permanen dokumen "${doc.title}"?`)) {
      onForceDelete(doc);
      showToast(`Dokumen "${doc.title}" dihapus permanen.`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            Kotak Sampah (Berkas Terhapus Sementara)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Sistem menggunakan Soft Delete. Berkas yang dihapus dapat dipulihkan kapan saja atau dihapus permanen oleh Administrator.
          </p>
        </div>

        {trashDocs.length > 0 && currentUser.role === 'admin' && (
          <button
            onClick={handleEmptyTrash}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-xs transition-colors shrink-0"
          >
            <Trash2 className="w-4 h-4" />
            <span>Kosongkan Seluruh Kotak Sampah</span>
          </button>
        )}
      </div>

      {/* List */}
      {trashDocs.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center space-y-3 shadow-2xs">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
            <Trash2 className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-800">
            Kotak Sampah Kosong
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Tidak ada dokumen yang berada di kotak sampah saat ini. Seluruh berkas arsip tersimpan dengan aman.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Nama Dokumen & Kode</th>
                  <th className="py-3 px-3">Tipe</th>
                  <th className="py-3 px-3">Ukuran</th>
                  <th className="py-3 px-4">Waktu Dihapus</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {trashDocs.map((doc) => {
                  const badge = getFileTypeBadge(doc.fileType, doc.extension);
                  return (
                    <tr key={doc.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">{doc.title}</div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          {doc.documentCode} · {doc.originalFilename}
                        </div>
                      </td>

                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${badge.bg} ${badge.text}`}>
                          {badge.label}
                        </span>
                      </td>

                      <td className="py-3 px-3 font-mono tabular-nums text-slate-600 whitespace-nowrap">
                        {formatBytes(doc.fileSize)}
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap text-slate-500 font-mono text-[11px]">
                        {formatDateTimeIndo(doc.deletedAt || '')}
                      </td>

                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              onRestore(doc);
                              showToast(`Dokumen "${doc.title}" berhasil dipulihkan.`);
                            }}
                            className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Pulihkan</span>
                          </button>

                          {currentUser.role === 'admin' && (
                            <button
                              onClick={() => handleSingleDelete(doc)}
                              className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Hapus Permanen</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
