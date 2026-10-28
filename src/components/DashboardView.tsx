import React from 'react';
import {
  FileText,
  FileSpreadsheet,
  FileCheck,
  Image as ImageIcon,
  FolderTree,
  HardDrive,
  Calendar,
  Upload,
  Files,
  ArrowUpRight,
  Clock,
  Download,
  Eye,
  Star,
  Activity,
  Layers,
} from 'lucide-react';
import { DocumentItem, Category, ActivityLog, User } from '../types';
import { formatBytes, formatDateIndo, formatDateTimeIndo, getFileTypeBadge } from '../utils/formatters';

interface DashboardViewProps {
  documents: DocumentItem[];
  categories: Category[];
  activityLogs: ActivityLog[];
  currentUser: User;
  onOpenUpload: () => void;
  onNavigate: (viewId: string, filterParams?: Record<string, string>) => void;
  onPreviewDocument: (doc: DocumentItem) => void;
  onDownloadDocument: (doc: DocumentItem) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  documents,
  categories,
  activityLogs,
  currentUser,
  onOpenUpload,
  onNavigate,
  onPreviewDocument,
  onDownloadDocument,
}) => {
  // Calculations
  const totalDocs = documents.length;
  const wordDocs = documents.filter((d) => d.fileType === 'word').length;
  const excelDocs = documents.filter((d) => d.fileType === 'excel').length;
  const pdfDocs = documents.filter((d) => d.fileType === 'pdf').length;
  const imageDocs = documents.filter((d) => d.fileType === 'image').length;
  const totalCategories = categories.length;
  const totalStorageBytes = documents.reduce((acc, curr) => acc + (curr.fileSize || 0), 0);

  // Added this month
  const currentYearMonth = new Date().toISOString().substring(0, 7);
  const addedThisMonth = documents.filter((d) => d.createdAt && d.createdAt.startsWith(currentYearMonth)).length;

  // Documents per Category calculation
  const categoryCounts: Record<string, number> = {};
  categories.filter((c) => !c.parentId).forEach((cat) => {
    // Count docs with this categoryId or subcategories belonging to this cat
    const subIds = categories.filter((c) => c.parentId === cat.id).map((c) => c.id);
    const count = documents.filter((d) => d.categoryId === cat.id || (d.subcategoryId && subIds.includes(d.subcategoryId))).length;
    categoryCounts[cat.namaKategori] = count;
  });

  // Documents per Academic Year
  const yearCounts: Record<string, number> = {};
  documents.forEach((d) => {
    const yr = d.academicYear || 'Lainnya';
    yearCounts[yr] = (yearCounts[yr] || 0) + 1;
  });

  const recentDocuments = [...documents]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 6);

  const recentLogs = activityLogs.slice(0, 6);

  // Storage limit simulation (1 GB total)
  const maxStorageLimitBytes = 1024 * 1024 * 1024;
  const storagePercentage = Math.min(100, Math.round((totalStorageBytes / maxStorageLimitBytes) * 100));

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white rounded-xl p-6 border border-slate-800 shadow-xs">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="text-xs font-semibold text-blue-300 tracking-wider">
              SISTEM INFORMASI ARSIP GURU PJOK
            </div>
            <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white">
              Selamat Datang, {currentUser.name}
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              Kelola seluruh dokumen administrasi pembelajaran, program olahraga, tes kebugaran siswa, dan dokumen kepegawaian dalam satu arsip digital terpadu.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            {currentUser.role !== 'viewer' && (
              <button
                onClick={onOpenUpload}
                className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors shadow-sm"
              >
                <Upload className="w-4 h-4" />
                <span>Unggah Berkas Baru</span>
              </button>
            )}
            <button
              onClick={() => onNavigate('berkas-semua')}
              className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors"
            >
              <Files className="w-4 h-4" />
              <span>Jelajahi Berkas</span>
            </button>
          </div>
        </div>
      </div>

      {/* 8 Metric Statistics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Card 1: Total Docs */}
        <div
          onClick={() => onNavigate('berkas-semua')}
          className="bg-white p-4 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors cursor-pointer group shadow-2xs"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Total Seluruh Berkas</span>
            <Files className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-slate-900">
            {totalDocs}
          </div>
          <div className="mt-1 text-[11px] text-slate-500">
            Dokumen aktif terarsip
          </div>
        </div>

        {/* Card 2: Word */}
        <div
          onClick={() => onNavigate('berkas-semua', { type: 'docx' })}
          className="bg-white p-4 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors cursor-pointer group shadow-2xs"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Dokumen Word</span>
            <FileText className="w-4 h-4 text-blue-500 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-blue-700">
            {wordDocs}
          </div>
          <div className="mt-1 text-[11px] text-slate-500">
            Modul, RPP, Prota (.docx)
          </div>
        </div>

        {/* Card 3: Excel */}
        <div
          onClick={() => onNavigate('berkas-semua', { type: 'xlsx' })}
          className="bg-white p-4 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors cursor-pointer group shadow-2xs"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Dokumen Excel</span>
            <FileSpreadsheet className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-emerald-700">
            {excelDocs}
          </div>
          <div className="mt-1 text-[11px] text-slate-500">
            Nilai, TKJI, Promes (.xlsx)
          </div>
        </div>

        {/* Card 4: PDF */}
        <div
          onClick={() => onNavigate('berkas-semua', { type: 'pdf' })}
          className="bg-white p-4 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors cursor-pointer group shadow-2xs"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Dokumen PDF</span>
            <FileCheck className="w-4 h-4 text-rose-600 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-rose-700">
            {pdfDocs}
          </div>
          <div className="mt-1 text-[11px] text-slate-500">
            SK, Rubrik, Juknis (.pdf)
          </div>
        </div>

        {/* Card 5: Image */}
        <div
          onClick={() => onNavigate('berkas-dokumentasi')}
          className="bg-white p-4 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors cursor-pointer group shadow-2xs"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Foto & Dokumentasi</span>
            <ImageIcon className="w-4 h-4 text-purple-600 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-purple-700">
            {imageDocs}
          </div>
          <div className="mt-1 text-[11px] text-slate-500">
            Foto KBM, Lomba, Lapangan
          </div>
        </div>

        {/* Card 6: Categories */}
        <div
          onClick={() => onNavigate('kategori')}
          className="bg-white p-4 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors cursor-pointer group shadow-2xs"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Total Kategori</span>
            <FolderTree className="w-4 h-4 text-amber-600 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-amber-700">
            {totalCategories}
          </div>
          <div className="mt-1 text-[11px] text-slate-500">
            6 Induk + 45 Subkategori
          </div>
        </div>

        {/* Card 7: Total Storage */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Ukuran Penyimpanan</span>
            <HardDrive className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-slate-900">
            {formatBytes(totalStorageBytes)}
          </div>
          <div className="mt-2 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-teal-600 h-1.5 rounded-full transition-all"
              style={{ width: `${Math.max(4, storagePercentage)}%` }}
            />
          </div>
        </div>

        {/* Card 8: Added This Month */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Penambahan Bulan Ini</span>
            <Calendar className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-indigo-700">
            {addedThisMonth}
          </div>
          <div className="mt-1 text-[11px] text-slate-500">
            Dokumen baru terverifikasi
          </div>
        </div>
      </div>

      {/* Middle Row: Distribution & Academic Years */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category Breakdown (2 Cols) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Distribusi Dokumen Berdasarkan Kategori
              </h3>
              <p className="text-xs text-slate-500">
                Porsi kelengkapan berkas administrasi guru PJOK
              </p>
            </div>
            <button
              onClick={() => onNavigate('kategori')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              <span>Kelola Kategori</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {Object.entries(categoryCounts).map(([catName, count]) => {
              const pct = totalDocs > 0 ? Math.round((count / totalDocs) * 100) : 0;
              return (
                <div key={catName} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-700 truncate max-w-xs">{catName}</span>
                    <span className="font-mono tabular-nums text-slate-500">
                      {count} berkas ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Academic Year Archives (1 Col) */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Arsip Tahun Pelajaran
                </h3>
                <p className="text-xs text-slate-500">
                  Rekapitulasi berkas lintas periode
                </p>
              </div>
              <button
                onClick={() => onNavigate('arsip-tahun')}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800"
              >
                Lihat Semua
              </button>
            </div>

            <div className="space-y-2.5">
              {Object.entries(yearCounts).map(([yr, count]) => (
                <div
                  key={yr}
                  onClick={() => onNavigate('berkas-semua', { year: yr })}
                  className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 hover:border-slate-300 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <span className="text-xs font-semibold text-slate-800">
                      Tahun Pelajaran {yr}
                    </span>
                  </div>
                  <span className="text-xs font-mono tabular-nums text-blue-700 font-semibold bg-blue-50 px-2 py-0.5 rounded">
                    {count} berkas
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Standar Kurikulum Merdeka PJOK</span>
            <span className="font-mono">Fase E & F</span>
          </div>
        </div>
      </div>

      {/* Bottom Row: Recent Documents & Activity Log */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Documents Table (2 Cols) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Dokumen Terbaru Ditambahkan
              </h3>
              <p className="text-xs text-slate-500">
                Berkas administrasi dan asesmen teranyar
              </p>
            </div>
            <button
              onClick={() => onNavigate('berkas-semua')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              <span>Buka Semua</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-y border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Nama Dokumen</th>
                  <th className="py-2.5 px-2">Tipe</th>
                  <th className="py-2.5 px-2">Tahun / Smt</th>
                  <th className="py-2.5 px-2">Ukuran</th>
                  <th className="py-2.5 px-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentDocuments.map((doc) => {
                  const badge = getFileTypeBadge(doc.fileType, doc.extension);
                  return (
                    <tr key={doc.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2.5 px-3">
                        <div className="font-semibold text-slate-900 line-clamp-1">
                          {doc.title}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          {doc.documentCode} · {formatDateIndo(doc.documentDate)}
                        </div>
                      </td>
                      <td className="py-2.5 px-2 whitespace-nowrap">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${badge.bg} ${badge.text}`}>
                          {badge.label}
                        </span>
                      </td>
                      <td className="py-2.5 px-2 whitespace-nowrap text-slate-600">
                        {doc.academicYear} · {doc.semester}
                      </td>
                      <td className="py-2.5 px-2 whitespace-nowrap font-mono tabular-nums text-slate-500">
                        {formatBytes(doc.fileSize)}
                      </td>
                      <td className="py-2.5 px-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onPreviewDocument(doc)}
                            className="p-1 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded"
                            title="Pratinjau"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDownloadDocument(doc)}
                            className="p-1 text-slate-500 hover:text-emerald-600 hover:bg-slate-100 rounded"
                            title="Unduh Berkas"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Activity Logs Timeline (1 Col) */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Aktivitas Pengguna Terbaru
              </h3>
              <p className="text-xs text-slate-500">
                Log audit operasi berkas & backup
              </p>
            </div>
            <Activity className="w-4 h-4 text-slate-400" />
          </div>

          <div className="space-y-3.5">
            {recentLogs.map((log) => (
              <div key={log.id} className="flex items-start gap-2.5 text-xs">
                <div className="w-2 h-2 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="text-slate-800 font-medium leading-snug">
                    {log.description}
                  </div>
                  <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                    <span>{log.userName}</span>
                    <span>·</span>
                    <span className="font-mono tabular-nums">{formatDateTimeIndo(log.createdAt)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
