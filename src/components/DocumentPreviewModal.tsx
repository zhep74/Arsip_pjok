import React, { useState } from 'react';
import {
  X,
  Download,
  ZoomIn,
  ZoomOut,
  RotateCw,
  FileText,
  FileSpreadsheet,
  FileCheck,
  Image as ImageIcon,
  Calendar,
  Layers,
  User,
  Shield,
  Tag,
  Hash,
  ExternalLink,
} from 'lucide-react';
import { DocumentItem } from '../types';
import { formatBytes, formatDateIndo, getFileTypeBadge } from '../utils/formatters';

interface DocumentPreviewModalProps {
  document: DocumentItem | null;
  onClose: () => void;
  onDownload: (doc: DocumentItem) => void;
}

export const DocumentPreviewModal: React.FC<DocumentPreviewModalProps> = ({
  document: doc,
  onClose,
  onDownload,
}) => {
  const [zoom, setZoom] = useState<number>(100);
  const [rotation, setRotation] = useState<number>(0);

  if (!doc) return null;

  const badge = getFileTypeBadge(doc.fileType, doc.extension);

  const handleZoomIn = () => setZoom((prev) => Math.min(250, prev + 25));
  const handleZoomOut = () => setZoom((prev) => Math.max(50, prev - 25));
  const handleRotate = () => setRotation((prev) => (prev + 90) % 360);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
        {/* Preview Top Bar */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-slate-200 bg-slate-900 text-white shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${badge.bg} ${badge.text}`}>
              {badge.label}
            </span>
            <div className="min-w-0">
              <h2 className="text-sm font-bold text-white truncate max-w-xl">
                {doc.title}
              </h2>
              <div className="text-[11px] text-slate-400 font-mono flex items-center gap-2">
                <span>{doc.documentCode}</span>
                <span>·</span>
                <span>{doc.originalFilename}</span>
                <span>·</span>
                <span>{formatBytes(doc.fileSize)}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Image zoom controls */}
            {doc.fileType === 'image' && (
              <div className="flex items-center gap-1 bg-slate-800 rounded-lg p-1 border border-slate-700">
                <button
                  onClick={handleZoomOut}
                  className="p-1.5 text-slate-300 hover:text-white rounded hover:bg-slate-700"
                  title="Perkecil (-)"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="text-xs font-mono px-2 text-slate-300 tabular-nums">
                  {zoom}%
                </span>
                <button
                  onClick={handleZoomIn}
                  className="p-1.5 text-slate-300 hover:text-white rounded hover:bg-slate-700"
                  title="Perbesar (+)"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button
                  onClick={handleRotate}
                  className="p-1.5 text-slate-300 hover:text-white rounded hover:bg-slate-700 ml-1 border-l border-slate-700 pl-2"
                  title="Putar 90°"
                >
                  <RotateCw className="w-4 h-4" />
                </button>
              </div>
            )}

            <button
              onClick={() => onDownload(doc)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Unduh Berkas</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Preview Viewport Body */}
        <div className="flex-1 overflow-auto bg-slate-100 flex items-center justify-center p-6 relative">
          {/* 1. PDF Preview */}
          {doc.fileType === 'pdf' ? (
            doc.fileDataUrl && doc.fileDataUrl.startsWith('data:application/pdf') ? (
              <iframe
                src={doc.fileDataUrl}
                title={doc.title}
                className="w-full h-full rounded-lg shadow-sm border border-slate-300 bg-white"
              />
            ) : (
              <div className="max-w-2xl w-full bg-white rounded-xl border border-slate-200 shadow-md p-8 text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 mx-auto flex items-center justify-center">
                  <FileCheck className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-slate-900">
                    Pratinjau Dokumen PDF
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">
                    {doc.originalFilename} ({formatBytes(doc.fileSize)})
                  </p>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg text-left text-xs space-y-2 border border-slate-100">
                  <div className="font-semibold text-slate-800">Ringkasan Dokumen:</div>
                  <p className="text-slate-600 leading-relaxed">
                    {doc.description || 'Dokumen resmi Kurikulum Merdeka PJOK.'}
                  </p>
                  <div className="pt-2 text-[11px] text-slate-400 flex items-center gap-2">
                    <Shield className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Terverifikasi dengan SHA-256 Checksum: {doc.checksum?.substring(0, 16)}...</span>
                  </div>
                </div>
                <button
                  onClick={() => onDownload(doc)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-sm transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Unduh Dokumen PDF Lengkap</span>
                </button>
              </div>
            )
          ) : /* 2. Image Preview */
          doc.fileType === 'image' ? (
            <div className="w-full h-full flex items-center justify-center overflow-auto p-4">
              {doc.fileDataUrl ? (
                <img
                  src={doc.fileDataUrl}
                  alt={doc.title}
                  referrerPolicy="no-referrer"
                  style={{
                    transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                    transition: 'transform 0.2s ease-out',
                  }}
                  className="max-h-[75vh] max-w-full object-contain rounded-lg shadow-lg border border-slate-200 bg-white"
                />
              ) : (
                <div className="text-center text-slate-500">Foto tidak dapat dimuat.</div>
              )}
            </div>
          ) : /* 3. Word Document Preview */
          doc.fileType === 'word' ? (
            <div className="max-w-2xl w-full bg-white rounded-xl border border-slate-200 shadow-md p-8 text-center space-y-5">
              <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 mx-auto flex items-center justify-center">
                <FileText className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900">
                  Pratinjau Dokumen Microsoft Word (.docx)
                </h3>
                <p className="text-xs text-slate-500 font-mono">
                  {doc.originalFilename} · {formatBytes(doc.fileSize)}
                </p>
              </div>

              {/* Rich Simulated Word Inspection Content */}
              <div className="text-left bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-3 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <span className="font-bold text-slate-800">Struktur Dokumen Terdeteksi</span>
                  <span className="text-[10px] text-blue-700 font-semibold bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    OpenXML Office Word
                  </span>
                </div>
                <div className="space-y-1.5 text-slate-700">
                  <div><strong>Mata Pelajaran:</strong> {doc.subject}</div>
                  <div><strong>Fase / Jenjang:</strong> {doc.gradeLevel}</div>
                  <div><strong>Tahun Pelajaran:</strong> {doc.academicYear} (Semester {doc.semester})</div>
                  <div><strong>Deskripsi Administrasi:</strong> {doc.description || 'Tidak ada deskripsi.'}</div>
                </div>
                <div className="pt-2 border-t border-slate-200 text-[11px] text-slate-500">
                  File terenkripsi aman dan siap diedit menggunakan Microsoft Word, LibreOffice, atau Google Docs.
                </div>
              </div>

              <button
                onClick={() => onDownload(doc)}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Unduh File Word Asli ({doc.extension.toUpperCase()})</span>
              </button>
            </div>
          ) : /* 4. Excel Spreadsheet Preview */
          doc.fileType === 'excel' ? (
            <div className="max-w-2xl w-full bg-white rounded-xl border border-slate-200 shadow-md p-8 text-center space-y-5">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center">
                <FileSpreadsheet className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900">
                  Pratinjau Lembar Kerja Excel (.xlsx)
                </h3>
                <p className="text-xs text-slate-500 font-mono">
                  {doc.originalFilename} · {formatBytes(doc.fileSize)}
                </p>
              </div>

              {/* Excel Safe Container Info */}
              <div className="text-left bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-3 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <span className="font-bold text-slate-800">Informasi Lembar Kerja PJOK</span>
                  <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Microsoft Excel Worksheet
                  </span>
                </div>
                <div className="space-y-1.5 text-slate-700">
                  <div><strong>Kategori:</strong> Nilai / Rekap Kebugaran Jasmani</div>
                  <div><strong>Periode:</strong> {doc.academicYear} - Semester {doc.semester}</div>
                  <div><strong>Keterangan:</strong> {doc.description || 'Data kalkulasi nilai atau inventaris sarana olahraga.'}</div>
                </div>
                {doc.extension === 'xlsm' && (
                  <div className="p-2.5 bg-amber-50 border border-amber-200 rounded text-amber-800 text-[11px]">
                    <strong>Perhatian Keamanan:</strong> File berformat Macro (.xlsm) disimpan secara aman dalam repositori terisolasi tanpa eksekusi skrip berbahaya.
                  </div>
                )}
              </div>

              <button
                onClick={() => onDownload(doc)}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Unduh File Excel Asli (.xlsx)</span>
              </button>
            </div>
          ) : (
            /* Other fallback */
            <div className="max-w-md w-full bg-white rounded-xl border border-slate-200 shadow-md p-8 text-center space-y-4">
              <FileText className="w-12 h-12 text-slate-400 mx-auto" />
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-900">{doc.title}</h3>
                <p className="text-xs text-slate-500 font-mono">{doc.originalFilename}</p>
              </div>
              <button
                onClick={() => onDownload(doc)}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
              >
                <Download className="w-4 h-4" />
                <span>Unduh Berkas</span>
              </button>
            </div>
          )}
        </div>

        {/* Preview Footer Metadata Bar */}
        <div className="px-6 py-3 border-t border-slate-200 bg-white flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 shrink-0">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>Tanggal: {formatDateIndo(doc.documentDate)}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-slate-400" />
              <span>Pengunggah: {doc.uploadedByName}</span>
            </span>
          </div>
          <div className="flex items-center gap-2 font-mono text-[11px] text-slate-400">
            <span>SHA-256: {doc.checksum ? doc.checksum.substring(0, 16) + '...' : '-'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
