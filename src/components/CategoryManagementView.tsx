import React, { useState } from 'react';
import {
  FolderTree,
  FolderPlus,
  Edit2,
  Trash2,
  Check,
  X,
  ChevronRight,
  ChevronDown,
  Layers,
  FileText,
  AlertTriangle,
  Folder,
} from 'lucide-react';
import { Category, DocumentItem, User } from '../types';
import { StorageService } from '../services/storageService';

interface CategoryManagementViewProps {
  categories: Category[];
  documents: DocumentItem[];
  currentUser: User;
  onCategoriesUpdated: (categories: Category[]) => void;
  showToast: (msg: string, type?: 'success' | 'error') => void;
}

export const CategoryManagementView: React.FC<CategoryManagementViewProps> = ({
  categories,
  documents,
  currentUser,
  onCategoriesUpdated,
  showToast,
}) => {
  const [expandedParents, setExpandedParents] = useState<string[]>(['cat-umum', 'cat-perangkat', 'cat-asesmen']);
  const [modalMode, setModalMode] = useState<'add_parent' | 'add_sub' | 'edit' | null>(null);
  const [targetCategory, setTargetCategory] = useState<Category | null>(null);
  const [parentTargetId, setParentTargetId] = useState<string | null>(null);

  // Form fields
  const [namaKategori, setNamaKategori] = useState('');
  const [slug, setSlug] = useState('');
  const [deskripsi, setDeskripsi] = useState('');
  const [isActive, setIsActive] = useState(true);

  const toggleExpand = (id: string) => {
    setExpandedParents((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const openAddParent = () => {
    setModalMode('add_parent');
    setNamaKategori('');
    setSlug('');
    setDeskripsi('');
    setIsActive(true);
  };

  const openAddSub = (parentId: string) => {
    setModalMode('add_sub');
    setParentTargetId(parentId);
    setNamaKategori('');
    setSlug('');
    setDeskripsi('');
    setIsActive(true);
  };

  const openEdit = (cat: Category) => {
    setModalMode('edit');
    setTargetCategory(cat);
    setNamaKategori(cat.namaKategori);
    setSlug(cat.slug);
    setDeskripsi(cat.deskripsi || '');
    setIsActive(cat.isActive);
  };

  const handleSaveModal = () => {
    if (!namaKategori.trim()) {
      showToast('Nama kategori wajib diisi.', 'error');
      return;
    }

    const generatedSlug = slug.trim()
      ? slug.trim().toLowerCase().replace(/[^a-z0-9]/g, '-')
      : namaKategori.toLowerCase().replace(/[^a-z0-9]/g, '-');

    if (modalMode === 'add_parent') {
      StorageService.addCategory({
        parentId: null,
        namaKategori,
        slug: generatedSlug,
        deskripsi,
        iconName: 'Folder',
        isActive,
        order: categories.filter((c) => !c.parentId).length + 1,
      });
      showToast(`Kategori utama "${namaKategori}" berhasil ditambahkan.`);
    } else if (modalMode === 'add_sub' && parentTargetId) {
      StorageService.addCategory({
        parentId: parentTargetId,
        namaKategori,
        slug: generatedSlug,
        deskripsi,
        iconName: 'FileText',
        isActive,
        order: categories.filter((c) => c.parentId === parentTargetId).length + 1,
      });
      showToast(`Subkategori "${namaKategori}" berhasil ditambahkan.`);
    } else if (modalMode === 'edit' && targetCategory) {
      StorageService.updateCategory(targetCategory.id, {
        namaKategori,
        slug: generatedSlug,
        deskripsi,
        isActive,
      });
      showToast(`Kategori "${namaKategori}" berhasil diperbarui.`);
    }

    onCategoriesUpdated(StorageService.getCategories());
    setModalMode(null);
  };

  const handleDelete = (cat: Category) => {
    if (confirm(`Apakah Anda yakin ingin menghapus kategori "${cat.namaKategori}"?`)) {
      const res = StorageService.deleteCategory(cat.id);
      if (res.success) {
        showToast(res.message);
        onCategoriesUpdated(StorageService.getCategories());
      } else {
        showToast(res.message, 'error');
      }
    }
  };

  const handleToggleActive = (cat: Category) => {
    StorageService.updateCategory(cat.id, { isActive: !cat.isActive });
    showToast(`Status kategori "${cat.namaKategori}" diubah ke ${!cat.isActive ? 'Aktif' : 'Nonaktif'}.`);
    onCategoriesUpdated(StorageService.getCategories());
  };

  const parentCategories = categories.filter((c) => !c.parentId);

  // Helper count docs in category
  const countDocs = (catId: string) => {
    return documents.filter((d) => d.categoryId === catId || d.subcategoryId === catId).length;
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            Pengelolaan Kategori Administrasi Guru PJOK
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Kelola struktur kategori dan subkategori resmi standar KBM PJOK. Kategori yang sedang digunakan dokumen terlindungi dari penghapusan tak sengaja.
          </p>
        </div>
        {currentUser.role === 'admin' && (
          <button
            onClick={openAddParent}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-xs transition-colors shrink-0"
          >
            <FolderPlus className="w-4 h-4" />
            <span>Tambah Kategori Utama</span>
          </button>
        )}
      </div>

      {/* Category Tree List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs divide-y divide-slate-100 overflow-hidden">
        {parentCategories.map((parent) => {
          const isExpanded = expandedParents.includes(parent.id);
          const subCats = categories.filter((c) => c.parentId === parent.id);
          const parentDocCount = countDocs(parent.id);
          const totalChildDocs = subCats.reduce((acc, sub) => acc + countDocs(sub.id), 0);

          return (
            <div key={parent.id} className="transition-colors">
              {/* Parent Row */}
              <div className="flex items-center justify-between p-4 bg-slate-50/70 hover:bg-slate-100/70 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <button
                    onClick={() => toggleExpand(parent.id)}
                    className="p-1 text-slate-400 hover:text-slate-700 rounded transition-colors"
                  >
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </button>
                  <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                    <Folder className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">
                        {parent.namaKategori}
                      </span>
                      {!parent.isActive && (
                        <span className="text-[10px] font-semibold bg-rose-100 text-rose-700 px-1.5 py-0.2 rounded">
                          Nonaktif
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-500 truncate max-w-xl">
                      {parent.deskripsi || 'Kategori induk administrasi PJOK'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <span className="text-xs font-mono tabular-nums text-slate-500 bg-white border border-slate-200 px-2.5 py-1 rounded-md">
                    {parentDocCount + totalChildDocs} berkas · {subCats.length} subkategori
                  </span>

                  {currentUser.role === 'admin' && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openAddSub(parent.id)}
                        className="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-white rounded transition-colors"
                        title="Tambah Subkategori"
                      >
                        <FolderPlus className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openEdit(parent)}
                        className="p-1.5 text-slate-500 hover:text-amber-700 hover:bg-white rounded transition-colors"
                        title="Edit Kategori"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleToggleActive(parent)}
                        className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-white rounded transition-colors"
                        title={parent.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                      >
                        {parent.isActive ? <Check className="w-4 h-4 text-emerald-600" /> : <X className="w-4 h-4 text-rose-600" />}
                      </button>
                      <button
                        onClick={() => handleDelete(parent)}
                        className="p-1.5 text-slate-500 hover:text-rose-700 hover:bg-white rounded transition-colors"
                        title="Hapus Kategori"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Subcategories (if expanded) */}
              {isExpanded && (
                <div className="divide-y divide-slate-100 bg-white pl-12 pr-4 py-1">
                  {subCats.length === 0 ? (
                    <div className="py-3 text-xs text-slate-400 italic">
                      Belum ada subkategori dalam kelompok ini.
                    </div>
                  ) : (
                    subCats.map((sub) => {
                      const docCount = countDocs(sub.id);
                      return (
                        <div
                          key={sub.id}
                          className="flex items-center justify-between py-2.5 hover:bg-slate-50/80 transition-colors pr-2"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                            <div className="min-w-0">
                              <span className="text-xs font-semibold text-slate-800">
                                {sub.namaKategori}
                              </span>
                              {sub.deskripsi && (
                                <span className="text-[11px] text-slate-400 ml-2 hidden sm:inline">
                                  — {sub.deskripsi}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-3 shrink-0">
                            <span className="text-[11px] font-mono tabular-nums text-slate-500">
                              {docCount} berkas
                            </span>

                            {currentUser.role === 'admin' && (
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => openEdit(sub)}
                                  className="p-1 text-slate-400 hover:text-amber-600 rounded transition-colors"
                                  title="Edit Subkategori"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDelete(sub)}
                                  className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                                  title="Hapus Subkategori"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal for Add / Edit Category */}
      {modalMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <h3 className="text-sm font-bold text-slate-900">
                {modalMode === 'add_parent'
                  ? 'Tambah Kategori Utama PJOK'
                  : modalMode === 'add_sub'
                  ? 'Tambah Subkategori'
                  : 'Edit Kategori'}
              </h3>
              <button
                onClick={() => setModalMode(null)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 mb-1">
                  Nama Kategori
                </label>
                <input
                  type="text"
                  value={namaKategori}
                  onChange={(e) => setNamaKategori(e.target.value)}
                  placeholder="Contoh: Modul Ajar PJOK"
                  className="w-full text-xs py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-500 mb-1">
                  Slug URL (Opsional)
                </label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="modul-ajar-pjok"
                  className="w-full text-xs py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg font-mono focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-500 mb-1">
                  Deskripsi Kategori
                </label>
                <textarea
                  rows={3}
                  value={deskripsi}
                  onChange={(e) => setDeskripsi(e.target.value)}
                  placeholder="Keterangan cakupan berkas dalam kategori ini..."
                  className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="activeCat"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-0 cursor-pointer"
                />
                <label htmlFor="activeCat" className="font-semibold text-slate-800 cursor-pointer">
                  Kategori Aktif & Ditampilkan di Menu
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 bg-slate-50">
              <button
                onClick={() => setModalMode(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
              >
                Batal
              </button>
              <button
                onClick={handleSaveModal}
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-xs"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
