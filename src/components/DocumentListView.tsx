import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Grid,
  List,
  Eye,
  Download,
  MoreVertical,
  Star,
  Trash2,
  Edit3,
  History,
  FileText,
  FileSpreadsheet,
  FileCheck,
  Image as ImageIcon,
  File,
  RotateCcw,
  CheckSquare,
  Square,
  Package,
  Calendar,
  Layers,
  Info,
} from 'lucide-react';
import { DocumentItem, Category, User, FileType } from '../types';
import { formatBytes, formatDateIndo, getFileTypeBadge } from '../utils/formatters';
import JSZip from 'jszip';

interface DocumentListViewProps {
  documents: DocumentItem[];
  categories: Category[];
  currentUser: User;
  initialFilterCategory?: string;
  initialFilterYear?: string;
  initialFilterType?: string;
  onPreviewDocument: (doc: DocumentItem) => void;
  onDownloadDocument: (doc: DocumentItem) => void;
  onEditDocument: (doc: DocumentItem) => void;
  onViewVersions: (doc: DocumentItem) => void;
  onViewDetail: (doc: DocumentItem) => void;
  onDeleteDocument: (doc: DocumentItem) => void;
  onToggleFavorite: (doc: DocumentItem) => void;
  onOpenUpload: () => void;
  showToast: (msg: string, type?: 'success' | 'error') => void;
}

export const DocumentListView: React.FC<DocumentListViewProps> = ({
  documents,
  categories,
  currentUser,
  initialFilterCategory,
  initialFilterYear,
  initialFilterType,
  onPreviewDocument,
  onDownloadDocument,
  onEditDocument,
  onViewVersions,
  onViewDetail,
  onDeleteDocument,
  onToggleFavorite,
  onOpenUpload,
  showToast,
}) => {
  // State
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>(initialFilterCategory || 'all');
  const [selectedYear, setSelectedYear] = useState<string>(initialFilterYear || 'all');
  const [selectedSemester, setSelectedSemester] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>(initialFilterType || 'all');
  const [favoriteOnly, setFavoriteOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'date_desc' | 'date_asc' | 'title_asc' | 'size_desc'>('date_desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedDocIds, setSelectedDocIds] = useState<string[]>([]);
  const itemsPerPage = 10;

  // Sync props if changed
  React.useEffect(() => {
    if (initialFilterCategory) setSelectedCategory(initialFilterCategory);
  }, [initialFilterCategory]);

  React.useEffect(() => {
    if (initialFilterYear) setSelectedYear(initialFilterYear);
  }, [initialFilterYear]);

  React.useEffect(() => {
    if (initialFilterType) setSelectedType(initialFilterType);
  }, [initialFilterType]);

  // Filter & Search Logic
  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) => {
      // Status active check (or archived)
      if (doc.status === 'trash') return false;

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = doc.title.toLowerCase().includes(q);
        const matchesCode = doc.documentCode.toLowerCase().includes(q);
        const matchesFilename = doc.originalFilename.toLowerCase().includes(q);
        const matchesDesc = doc.description.toLowerCase().includes(q);
        const matchesTags = doc.tags.some((t) => t.toLowerCase().includes(q));
        if (!matchesTitle && !matchesCode && !matchesFilename && !matchesDesc && !matchesTags) {
          return false;
        }
      }

      // Category filter
      if (selectedCategory !== 'all') {
        const isDirectCat = doc.categoryId === selectedCategory;
        const isSubCat = doc.subcategoryId === selectedCategory;
        // Check if selectedCategory is parent
        const childSubIds = categories.filter((c) => c.parentId === selectedCategory).map((c) => c.id);
        const isChildOfSelected = doc.subcategoryId && childSubIds.includes(doc.subcategoryId);
        if (!isDirectCat && !isSubCat && !isChildOfSelected) {
          return false;
        }
      }

      // Year filter
      if (selectedYear !== 'all' && doc.academicYear !== selectedYear) {
        return false;
      }

      // Semester filter
      if (selectedSemester !== 'all' && doc.semester !== selectedSemester) {
        return false;
      }

      // Type filter
      if (selectedType !== 'all') {
        if (selectedType === 'word' && doc.fileType !== 'word') return false;
        if (selectedType === 'excel' && doc.fileType !== 'excel') return false;
        if (selectedType === 'pdf' && doc.fileType !== 'pdf') return false;
        if (selectedType === 'image' && doc.fileType !== 'image') return false;
        if (['docx', 'xlsx', 'pdf', 'jpg'].includes(selectedType) && doc.extension !== selectedType) return false;
      }

      // Favorite only
      if (favoriteOnly && !doc.isFavorite) {
        return false;
      }

      return true;
    });
  }, [documents, categories, searchQuery, selectedCategory, selectedYear, selectedSemester, selectedType, favoriteOnly]);

  // Sorting
  const sortedDocuments = useMemo(() => {
    const list = [...filteredDocuments];
    list.sort((a, b) => {
      if (sortBy === 'date_desc') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === 'date_asc') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (sortBy === 'title_asc') return a.title.localeCompare(b.title);
      if (sortBy === 'size_desc') return b.fileSize - a.fileSize;
      return 0;
    });
    return list;
  }, [filteredDocuments, sortBy]);

  // Pagination
  const totalPages = Math.ceil(sortedDocuments.length / itemsPerPage) || 1;
  const paginatedDocs = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedDocuments.slice(start, start + itemsPerPage);
  }, [sortedDocuments, currentPage]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedYear('all');
    setSelectedSemester('all');
    setSelectedType('all');
    setFavoriteOnly(false);
    setCurrentPage(1);
  };

  // Selection toggle
  const toggleSelectDoc = (id: string) => {
    setSelectedDocIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAllPage = () => {
    const pageIds = paginatedDocs.map((d) => d.id);
    const allSelected = pageIds.every((id) => selectedDocIds.includes(id));
    if (allSelected) {
      setSelectedDocIds((prev) => prev.filter((id) => !pageIds.includes(id)));
    } else {
      setSelectedDocIds((prev) => Array.from(new Set([...prev, ...pageIds])));
    }
  };

  // Bulk Download as ZIP
  const handleBulkDownloadZip = async () => {
    if (selectedDocIds.length === 0) return;
    try {
      const zip = new JSZip();
      const docsToDownload = documents.filter((d) => selectedDocIds.includes(d.id));
      for (const d of docsToDownload) {
        // If real fileDataUrl exists and is base64
        if (d.fileDataUrl && d.fileDataUrl.startsWith('data:')) {
          const base64Data = d.fileDataUrl.split(',')[1];
          zip.file(d.originalFilename, base64Data, { base64: true });
        } else {
          // Dummy text representation of the document
          zip.file(
            d.originalFilename,
            `DOKUMEN ARSIP PJOK\nKode: ${d.documentCode}\nJudul: ${d.title}\nTahun: ${d.academicYear}\nDeskripsi: ${d.description}`
          );
        }
      }
      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `arsip_pjok_batch_${Date.now()}.zip`;
      a.click();
      URL.revokeObjectURL(url);
      showToast(`Berhasil mengunduh ${docsToDownload.length} berkas dalam format ZIP.`);
    } catch {
      showToast('Gagal membuat paket ZIP unduhan.', 'error');
    }
  };

  // Bulk delete to trash
  const handleBulkDelete = () => {
    if (selectedDocIds.length === 0) return;
    if (confirm(`Pindahkan ${selectedDocIds.length} berkas terpilih ke Kotak Sampah?`)) {
      selectedDocIds.forEach((id) => {
        const doc = documents.find((d) => d.id === id);
        if (doc) onDeleteDocument(doc);
      });
      setSelectedDocIds([]);
      showToast(`${selectedDocIds.length} berkas dipindahkan ke kotak sampah.`);
    }
  };

  // Helper for file type icons
  const renderFileIcon = (fileType: FileType) => {
    switch (fileType) {
      case 'word':
        return <FileText className="w-5 h-5 text-blue-600" />;
      case 'excel':
        return <FileSpreadsheet className="w-5 h-5 text-emerald-600" />;
      case 'pdf':
        return <FileCheck className="w-5 h-5 text-rose-600" />;
      case 'image':
        return <ImageIcon className="w-5 h-5 text-purple-600" />;
      default:
        return <File className="w-5 h-5 text-slate-500" />;
    }
  };

  // Extract unique academic years
  const availableYears = useMemo(() => {
    const set = new Set<string>();
    documents.forEach((d) => {
      if (d.academicYear) set.add(d.academicYear);
    });
    return Array.from(set).sort().reverse();
  }, [documents]);

  return (
    <div className="space-y-4">
      {/* Search & Multi-Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Cari berdasarkan judul, nomor/kode berkas, deskripsi, tag..."
              className="w-full pl-9 pr-4 py-2 text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
            />
          </div>

          {/* Controls: Table/Grid switch, Favorite filter, Reset */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setFavoriteOnly(!favoriteOnly)}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border transition-colors ${
                favoriteOnly
                  ? 'bg-amber-50 text-amber-800 border-amber-300'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
              title="Filter hanya dokumen favorit bertanda bintang"
            >
              <Star className={`w-3.5 h-3.5 ${favoriteOnly ? 'fill-amber-500 text-amber-500' : 'text-slate-400'}`} />
              <span>Favorit</span>
            </button>

            <div className="flex items-center p-0.5 bg-slate-100 rounded-lg border border-slate-200">
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-md transition-colors ${
                  viewMode === 'table' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Tampilan Tabel"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-md transition-colors ${
                  viewMode === 'grid' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Tampilan Grid Kartu"
              >
                <Grid className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={handleResetFilters}
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg border border-slate-200"
              title="Reset seluruh filter"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter Dropdown Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-2 pt-1 border-t border-slate-100">
          {/* Category Filter */}
          <div>
            <label className="block text-[10px] font-semibold text-slate-500 mb-1">
              Kategori PJOK
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full text-xs py-1.5 px-2 bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600 truncate"
            >
              <option value="all">Semua Kategori</option>
              {categories
                .filter((c) => !c.parentId)
                .map((parent) => (
                  <optgroup key={parent.id} label={parent.namaKategori}>
                    <option value={parent.id}>{parent.namaKategori} (Semua)</option>
                    {categories
                      .filter((sub) => sub.parentId === parent.id)
                      .map((sub) => (
                        <option key={sub.id} value={sub.id}>
                          -- {sub.namaKategori}
                        </option>
                      ))}
                  </optgroup>
                ))}
            </select>
          </div>

          {/* Academic Year Filter */}
          <div>
            <label className="block text-[10px] font-semibold text-slate-500 mb-1">
              Tahun Pelajaran
            </label>
            <select
              value={selectedYear}
              onChange={(e) => {
                setSelectedYear(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full text-xs py-1.5 px-2 bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600"
            >
              <option value="all">Semua Tahun</option>
              {availableYears.map((yr) => (
                <option key={yr} value={yr}>
                  {yr}
                </option>
              ))}
            </select>
          </div>

          {/* Semester Filter */}
          <div>
            <label className="block text-[10px] font-semibold text-slate-500 mb-1">
              Semester
            </label>
            <select
              value={selectedSemester}
              onChange={(e) => {
                setSelectedSemester(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full text-xs py-1.5 px-2 bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600"
            >
              <option value="all">Semua Semester</option>
              <option value="Ganjil">Semester Ganjil</option>
              <option value="Genap">Semester Genap</option>
              <option value="Tahunan">Tahunan</option>
            </select>
          </div>

          {/* File Type Filter */}
          <div>
            <label className="block text-[10px] font-semibold text-slate-500 mb-1">
              Jenis Berkas
            </label>
            <select
              value={selectedType}
              onChange={(e) => {
                setSelectedType(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full text-xs py-1.5 px-2 bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600"
            >
              <option value="all">Semua Jenis (.doc, .xls, .pdf, dll)</option>
              <option value="word">Dokumen Word (.docx, .doc)</option>
              <option value="excel">Dokumen Excel (.xlsx, .xls)</option>
              <option value="pdf">Dokumen PDF (.pdf)</option>
              <option value="image">Foto & Gambar (.jpg, .png)</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="col-span-2 sm:col-span-1">
            <label className="block text-[10px] font-semibold text-slate-500 mb-1">
              Urutan
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full text-xs py-1.5 px-2 bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600"
            >
              <option value="date_desc">Tanggal Unggah (Terbaru)</option>
              <option value="date_asc">Tanggal Unggah (Terlama)</option>
              <option value="title_asc">Judul Dokumen (A-Z)</option>
              <option value="size_desc">Ukuran Berkas (Terbesar)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bulk Action Strip (appears when items selected) */}
      {selectedDocIds.length > 0 && (
        <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-900 animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-blue-600" />
            <span className="font-semibold">
              {selectedDocIds.length} berkas dipilih
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleBulkDownloadZip}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md shadow-xs transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Unduh Paket ZIP</span>
            </button>
            {currentUser.role !== 'viewer' && (
              <button
                onClick={handleBulkDelete}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-medium rounded-md shadow-xs transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Pindahkan ke Sampah</span>
              </button>
            )}
            <button
              onClick={() => setSelectedDocIds([])}
              className="px-2.5 py-1.5 text-blue-700 hover:bg-blue-100 rounded-md font-medium"
            >
              Batal
            </button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {sortedDocuments.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
            <File className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-slate-800">
              Tidak ada dokumen yang sesuai kriteria pencarian
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Cobalah ubah kata kunci pencarian, sesuaikan filter kategori, atau unggah dokumen baru ke dalam arsip.
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={handleResetFilters}
              className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Reset Semua Filter
            </button>
            {currentUser.role !== 'viewer' && (
              <button
                onClick={onOpenUpload}
                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                Unggah Berkas Baru
              </button>
            )}
          </div>
        </div>
      ) : viewMode === 'table' ? (
        /* TABLE MODE */
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-3 w-8">
                    <input
                      type="checkbox"
                      checked={
                        paginatedDocs.length > 0 &&
                        paginatedDocs.every((d) => selectedDocIds.includes(d.id))
                      }
                      onChange={toggleSelectAllPage}
                      className="rounded text-blue-600 focus:ring-0 cursor-pointer"
                    />
                  </th>
                  <th className="py-3 px-1 w-6"></th>
                  <th className="py-3 px-3">Nama Dokumen & Kode</th>
                  <th className="py-3 px-3">Kategori</th>
                  <th className="py-3 px-2">Tahun / Smt</th>
                  <th className="py-3 px-2">Tipe</th>
                  <th className="py-3 px-2">Ukuran</th>
                  <th className="py-3 px-3">Tanggal Unggah</th>
                  <th className="py-3 px-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedDocs.map((doc) => {
                  const badge = getFileTypeBadge(doc.fileType, doc.extension);
                  const isSelected = selectedDocIds.includes(doc.id);
                  const cat = categories.find((c) => c.id === doc.categoryId);
                  const subCat = doc.subcategoryId ? categories.find((c) => c.id === doc.subcategoryId) : null;

                  return (
                    <tr
                      key={doc.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isSelected ? 'bg-blue-50/40' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-3 px-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectDoc(doc.id)}
                          className="rounded text-blue-600 focus:ring-0 cursor-pointer"
                        />
                      </td>

                      {/* Favorite star */}
                      <td className="py-3 px-1">
                        <button
                          onClick={() => onToggleFavorite(doc)}
                          className="text-slate-300 hover:text-amber-500 transition-colors"
                          title={doc.isFavorite ? 'Hapus dari favorit' : 'Tandai sebagai favorit'}
                        >
                          <Star
                            className={`w-4 h-4 ${
                              doc.isFavorite ? 'fill-amber-400 text-amber-500' : ''
                            }`}
                          />
                        </button>
                      </td>

                      {/* Title & Code */}
                      <td className="py-3 px-3">
                        <div className="flex items-start gap-2.5">
                          <div className="mt-0.5 shrink-0">{renderFileIcon(doc.fileType)}</div>
                          <div className="min-w-0">
                            <button
                              onClick={() => onPreviewDocument(doc)}
                              className="font-semibold text-slate-900 hover:text-blue-700 text-left line-clamp-1 transition-colors"
                            >
                              {doc.title}
                            </button>
                            <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                              <span className="font-mono text-slate-600">{doc.documentCode}</span>
                              <span>·</span>
                              <span className="truncate">{doc.originalFilename}</span>
                              {doc.versionsCount > 1 && (
                                <>
                                  <span>·</span>
                                  <span className="text-blue-600 font-semibold font-mono">
                                    v{doc.versionsCount}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-3">
                        <div className="font-medium text-slate-800 truncate max-w-[160px]">
                          {cat?.namaKategori || 'PJOK'}
                        </div>
                        {subCat && (
                          <div className="text-[11px] text-slate-500 truncate max-w-[160px]">
                            {subCat.namaKategori}
                          </div>
                        )}
                      </td>

                      {/* Year & Semester */}
                      <td className="py-3 px-2 whitespace-nowrap text-slate-700">
                        <div>{doc.academicYear}</div>
                        <div className="text-[11px] text-slate-500">{doc.semester}</div>
                      </td>

                      {/* File Type Badge */}
                      <td className="py-3 px-2 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${badge.bg} ${badge.text}`}>
                          {badge.label}
                        </span>
                      </td>

                      {/* Size */}
                      <td className="py-3 px-2 whitespace-nowrap font-mono tabular-nums text-slate-600">
                        {formatBytes(doc.fileSize)}
                      </td>

                      {/* Date */}
                      <td className="py-3 px-3 whitespace-nowrap text-slate-500">
                        <div>{formatDateIndo(doc.documentDate)}</div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {doc.uploadedByName.split(',')[0]}
                        </div>
                      </td>

                      {/* Action buttons */}
                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => onPreviewDocument(doc)}
                            className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded"
                            title="Pratinjau Dokumen"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onDownloadDocument(doc)}
                            className="p-1.5 text-slate-600 hover:text-emerald-600 hover:bg-slate-100 rounded"
                            title="Unduh Berkas Asli"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onViewDetail(doc)}
                            className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded"
                            title="Detail Dokumen"
                          >
                            <Info className="w-4 h-4" />
                          </button>
                          {currentUser.role !== 'viewer' && (
                            <>
                              <button
                                onClick={() => onViewVersions(doc)}
                                className="p-1.5 text-slate-600 hover:text-purple-600 hover:bg-slate-100 rounded"
                                title="Riwayat Versi"
                              >
                                <History className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => onEditDocument(doc)}
                                className="p-1.5 text-slate-600 hover:text-amber-600 hover:bg-slate-100 rounded"
                                title="Edit Metadata"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => onDeleteDocument(doc)}
                                className="p-1.5 text-slate-600 hover:text-rose-600 hover:bg-slate-100 rounded"
                                title="Pindahkan ke Kotak Sampah"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
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
      ) : (
        /* GRID CARD MODE */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {paginatedDocs.map((doc) => {
            const badge = getFileTypeBadge(doc.fileType, doc.extension);
            const isSelected = selectedDocIds.includes(doc.id);
            const cat = categories.find((c) => c.id === doc.categoryId);

            return (
              <div
                key={doc.id}
                className={`bg-white rounded-xl border transition-all p-4 flex flex-col justify-between shadow-2xs ${
                  isSelected ? 'border-blue-400 ring-1 ring-blue-400 bg-blue-50/20' : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectDoc(doc.id)}
                        className="rounded text-blue-600 focus:ring-0 cursor-pointer"
                      />
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${badge.bg} ${badge.text}`}>
                        {badge.label}
                      </span>
                      {doc.versionsCount > 1 && (
                        <span className="text-[10px] font-mono font-semibold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">
                          v{doc.versionsCount}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => onToggleFavorite(doc)}
                      className="text-slate-300 hover:text-amber-500 transition-colors"
                    >
                      <Star
                        className={`w-4 h-4 ${
                          doc.isFavorite ? 'fill-amber-400 text-amber-500' : ''
                        }`}
                      />
                    </button>
                  </div>

                  {/* Document Thumbnail / Icon */}
                  {doc.fileType === 'image' && doc.fileDataUrl ? (
                    <div
                      onClick={() => onPreviewDocument(doc)}
                      className="w-full h-32 mb-3 rounded-lg overflow-hidden border border-slate-100 bg-slate-100 cursor-pointer group"
                    >
                      <img
                        src={doc.fileDataUrl}
                        alt={doc.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                  ) : (
                    <div
                      onClick={() => onPreviewDocument(doc)}
                      className="w-full h-24 mb-3 rounded-lg bg-slate-50 border border-slate-100 flex flex-col items-center justify-center gap-1.5 cursor-pointer hover:bg-slate-100/80 transition-colors"
                    >
                      {renderFileIcon(doc.fileType)}
                      <span className="text-[10px] font-mono text-slate-500 truncate max-w-[200px]">
                        {doc.originalFilename}
                      </span>
                    </div>
                  )}

                  {/* Title & Metadata */}
                  <div className="space-y-1">
                    <button
                      onClick={() => onPreviewDocument(doc)}
                      className="font-semibold text-slate-900 hover:text-blue-700 text-left line-clamp-2 transition-colors text-xs"
                    >
                      {doc.title}
                    </button>
                    <p className="text-[11px] text-slate-500 line-clamp-2">
                      {doc.description || 'Tidak ada deskripsi tambahan.'}
                    </p>
                  </div>

                  {/* Category & Tags */}
                  <div className="mt-2.5 pt-2 border-t border-slate-100 text-[11px] text-slate-500 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-700 font-medium truncate">{cat?.namaKategori}</span>
                      <span className="font-mono tabular-nums">{formatBytes(doc.fileSize)}</span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span>{doc.academicYear} · {doc.semester}</span>
                      <span className="font-mono">{formatDateIndo(doc.documentDate)}</span>
                    </div>
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onPreviewDocument(doc)}
                      className="px-2.5 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-50 rounded transition-colors"
                    >
                      Pratinjau
                    </button>
                    <button
                      onClick={() => onDownloadDocument(doc)}
                      className="px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded transition-colors"
                    >
                      Unduh
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onViewDetail(doc)}
                      className="p-1 text-slate-400 hover:text-slate-700 rounded"
                      title="Detail Dokumen"
                    >
                      <Info className="w-3.5 h-3.5" />
                    </button>
                    {currentUser.role !== 'viewer' && (
                      <>
                        <button
                          onClick={() => onEditDocument(doc)}
                          className="p-1 text-slate-400 hover:text-amber-600 rounded"
                          title="Edit"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteDocument(doc)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded"
                          title="Hapus"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Bar */}
      {sortedDocuments.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 bg-white rounded-xl border border-slate-200 text-xs text-slate-600">
          <div>
            Menampilkan{' '}
            <span className="font-semibold font-mono tabular-nums">
              {(currentPage - 1) * itemsPerPage + 1}
            </span>{' '}
            sampai{' '}
            <span className="font-semibold font-mono tabular-nums">
              {Math.min(currentPage * itemsPerPage, sortedDocuments.length)}
            </span>{' '}
            dari total{' '}
            <span className="font-semibold font-mono tabular-nums">
              {sortedDocuments.length}
            </span>{' '}
            dokumen
          </div>

          <div className="flex items-center gap-1.5">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed font-medium"
            >
              Sebelumnya
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
              <button
                key={pg}
                onClick={() => setCurrentPage(pg)}
                className={`w-7 h-7 rounded-lg text-xs font-semibold font-mono tabular-nums transition-colors ${
                  currentPage === pg
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                {pg}
              </button>
            ))}
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed font-medium"
            >
              Selanjutnya
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
