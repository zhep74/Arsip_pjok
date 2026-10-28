import React, { useState } from 'react';
import {
  CalendarRange,
  FolderArchive,
  ArrowRight,
  Download,
  Calendar,
  Layers,
  FileText,
  Plus,
} from 'lucide-react';
import { DocumentItem } from '../types';
import { formatBytes } from '../utils/formatters';

interface AcademicYearArchiveViewProps {
  documents: DocumentItem[];
  onSelectYearSemester: (year: string, semester?: string) => void;
  showToast: (msg: string, type?: 'success' | 'error') => void;
}

export const AcademicYearArchiveView: React.FC<AcademicYearArchiveViewProps> = ({
  documents,
  onSelectYearSemester,
  showToast,
}) => {
  const [customYear, setCustomYear] = useState('');
  const [yearsList, setYearsList] = useState<string[]>(['2026/2027', '2025/2026', '2024/2025', '2023/2024']);

  const handleAddYear = () => {
    if (!customYear.trim() || !customYear.includes('/')) {
      showToast('Format tahun pelajaran harus sesuai standar, contoh: 2027/2028', 'error');
      return;
    }
    if (yearsList.includes(customYear.trim())) {
      showToast('Tahun pelajaran sudah ada dalam daftar.', 'error');
      return;
    }
    setYearsList([customYear.trim(), ...yearsList]);
    setCustomYear('');
    showToast(`Tahun pelajaran ${customYear.trim()} berhasil ditambahkan.`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            Arsip Berkas Berdasarkan Tahun Pelajaran
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Dokumen administrasi tersimpan rapi per tahun ajaran dan semester. Perpindahan tahun pelajaran menjaga riwayat dokumen sebelumnya tetap utuh.
          </p>
        </div>

        {/* Add Year Input */}
        <div className="flex items-center gap-2 shrink-0">
          <input
            type="text"
            value={customYear}
            onChange={(e) => setCustomYear(e.target.value)}
            placeholder="Tambah tahun (contoh: 2027/2028)"
            className="text-xs py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600 font-mono w-56"
          />
          <button
            onClick={handleAddYear}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-xs transition-colors shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah</span>
          </button>
        </div>
      </div>

      {/* Year Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {yearsList.map((year) => {
          const yearDocs = documents.filter((d) => d.academicYear === year && d.status !== 'trash');
          const ganjilDocs = yearDocs.filter((d) => d.semester === 'Ganjil');
          const genapDocs = yearDocs.filter((d) => d.semester === 'Genap');
          const tahunanDocs = yearDocs.filter((d) => d.semester === 'Tahunan');
          const totalSize = yearDocs.reduce((acc, d) => acc + d.fileSize, 0);

          return (
            <div
              key={year}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs hover:border-slate-300 transition-colors space-y-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                    <FolderArchive className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Tahun Pelajaran {year}
                    </h3>
                    <div className="text-[11px] text-slate-500 font-mono">
                      {yearDocs.length} dokumen · {formatBytes(totalSize)}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => onSelectYearSemester(year)}
                  className="flex items-center gap-1 text-xs font-semibold text-blue-700 hover:text-blue-900 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200 transition-colors"
                >
                  <span>Buka Semua</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Semester Breakdown Strip */}
              <div className="grid grid-cols-3 gap-2.5 pt-2 border-t border-slate-100 text-xs">
                {/* Ganjil */}
                <button
                  onClick={() => onSelectYearSemester(year, 'Ganjil')}
                  className="p-3 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-100 text-left transition-colors group"
                >
                  <div className="text-[10px] font-bold text-slate-400">SEMESTER 1</div>
                  <div className="font-bold text-slate-800 text-xs">Ganjil</div>
                  <div className="text-[11px] font-mono text-blue-600 mt-1 font-semibold">
                    {ganjilDocs.length} berkas
                  </div>
                </button>

                {/* Genap */}
                <button
                  onClick={() => onSelectYearSemester(year, 'Genap')}
                  className="p-3 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-100 text-left transition-colors group"
                >
                  <div className="text-[10px] font-bold text-slate-400">SEMESTER 2</div>
                  <div className="font-bold text-slate-800 text-xs">Genap</div>
                  <div className="text-[11px] font-mono text-emerald-600 mt-1 font-semibold">
                    {genapDocs.length} berkas
                  </div>
                </button>

                {/* Tahunan / SK */}
                <button
                  onClick={() => onSelectYearSemester(year, 'Tahunan')}
                  className="p-3 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-100 text-left transition-colors group"
                >
                  <div className="text-[10px] font-bold text-slate-400">SK & PROTA</div>
                  <div className="font-bold text-slate-800 text-xs">Tahunan</div>
                  <div className="text-[11px] font-mono text-purple-600 mt-1 font-semibold">
                    {tahunanDocs.length} berkas
                  </div>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
