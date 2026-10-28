import React, { useState, useEffect } from 'react';
import {
  DocumentItem,
  Category,
  User,
  ActivityLog,
} from './types';
import { StorageService } from './services/storageService';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { DocumentListView } from './components/DocumentListView';
import { DocumentUploadModal } from './components/DocumentUploadModal';
import { DocumentPreviewModal } from './components/DocumentPreviewModal';
import { DocumentDetailModal } from './components/DocumentDetailModal';
import { DocumentVersionModal } from './components/DocumentVersionModal';
import { DocumentEditModal } from './components/DocumentEditModal';
import { CategoryManagementView } from './components/CategoryManagementView';
import { AcademicYearArchiveView } from './components/AcademicYearArchiveView';
import { TeacherSchoolProfileView } from './components/TeacherSchoolProfileView';
import { UserManagementView } from './components/UserManagementView';
import { TrashView } from './components/TrashView';
import { BackupRestoreView } from './components/BackupRestoreView';
import { Ci4CodeExportView } from './components/Ci4CodeExportView';
import { SettingsView } from './components/SettingsView';

interface ToastState {
  id: number;
  message: string;
  type: 'success' | 'error';
}

export default function App() {
  // Core reactive data state
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [currentUser, setCurrentUser] = useState<User>(StorageService.getActiveUser());
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);

  // Navigation & View state
  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [filterParams, setFilterParams] = useState<Record<string, string>>({});
  const [globalSearch, setGlobalSearch] = useState<string>('');

  // Modals state
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<DocumentItem | null>(null);
  const [detailDoc, setDetailDoc] = useState<DocumentItem | null>(null);
  const [versionDoc, setVersionDoc] = useState<DocumentItem | null>(null);
  const [editDoc, setEditDoc] = useState<DocumentItem | null>(null);

  // Toast notifications
  const [toasts, setToasts] = useState<ToastState[]>([]);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  // Reload data from persistence
  const refreshAllData = () => {
    setDocuments(StorageService.getDocuments(true));
    setCategories(StorageService.getCategories());
    setActivityLogs(StorageService.getActivityLogs());
    setCurrentUser(StorageService.getActiveUser());
  };

  useEffect(() => {
    refreshAllData();
  }, []);

  // View title helper
  const getViewTitle = () => {
    switch (currentView) {
      case 'dashboard':
        return 'Dashboard & Statistik';
      case 'berkas-semua':
        return 'Semua Berkas Administrasi';
      case 'berkas-umum':
        return 'Administrasi Umum Guru';
      case 'berkas-perangkat':
        return 'Perangkat Pembelajaran PJOK';
      case 'berkas-asesmen':
        return 'Asesmen & Penilaian';
      case 'berkas-siswa':
        return 'Administrasi Peserta Didik';
      case 'berkas-olahraga':
        return 'Program & Kegiatan Olahraga';
      case 'berkas-kepegawaian':
        return 'Administrasi Kepegawaian';
      case 'berkas-dokumentasi':
        return 'Dokumentasi Foto & Video';
      case 'arsip-tahun':
        return 'Arsip Berdasarkan Tahun Pelajaran';
      case 'kategori':
        return 'Pengelolaan Kategori Berkas';
      case 'profil':
        return 'Profil Guru & Sekolah';
      case 'pengguna':
        return 'Pengguna & Hak Akses (RBAC)';
      case 'backup':
        return 'Pencadangan & Pemulihan (Backup/Restore)';
      case 'ci4-export':
        return 'Source Code CodeIgniter 4 & Migrasi';
      case 'pengaturan':
        return 'Pengaturan Sistem';
      case 'trash':
        return 'Kotak Sampah';
      default:
        return 'Berkas Administrasi PJOK';
    }
  };

  // Switch view with optional filter parameters
  const handleSelectView = (view: string, params: Record<string, string> = {}) => {
    setCurrentView(view);
    setFilterParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle global search
  const handleSearchChange = (query: string) => {
    setGlobalSearch(query);
    if (query && !currentView.startsWith('berkas-')) {
      setCurrentView('berkas-semua');
    }
  };

  // Switch active user session
  const handleUserSwitch = (user: User) => {
    StorageService.setActiveUser(user);
    setCurrentUser(user);
    showToast(`Beralih peran sebagai: ${user.name} (${user.role.toUpperCase()})`);
  };

  // Real file download handler
  const handleDownloadDocument = (doc: DocumentItem) => {
    if (doc.fileDataUrl && doc.fileDataUrl.startsWith('data:')) {
      const a = document.createElement('a');
      a.href = doc.fileDataUrl;
      a.download = doc.originalFilename;
      a.click();
    } else {
      // Download generated representation
      const sampleText = `====================================================\nAPLIKASI ARSIP DIGITAL ADMINISTRASI GURU PJOK\nSMA NEGERI 1 PRESTASI BANGSA\n====================================================\n\nKODE DOKUMEN   : ${doc.documentCode}\nJUDUL BERKAS   : ${doc.title}\nNAMA ASLI      : ${doc.originalFilename}\nTANGGAL        : ${doc.documentDate}\nTAHUN AJARAN   : ${doc.academicYear} (Semester ${doc.semester})\nFASE / TINGKAT : ${doc.gradeLevel}\nPENGUNGGAH     : ${doc.uploadedByName}\nSHA-256 HASH   : ${doc.checksum}\n\nKETERANGAN / DESKRIPSI:\n${doc.description || 'Tidak ada deskripsi.'}\n\nTAGS: ${(doc.tags || []).join(', ')}\n\n[Berkas resmi tersimpan dalam sistem arsip digital PJOK]\n`;
      const blob = new Blob([sampleText], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = doc.originalFilename;
      a.click();
      URL.revokeObjectURL(url);
    }

    StorageService.addLog({
      action: 'DOWNLOAD',
      entityType: 'document',
      entityId: doc.id,
      description: `Mengunduh berkas "${doc.title}" [${doc.documentCode}]`,
    });
    setActivityLogs(StorageService.getActivityLogs());
    showToast(`Mengunduh berkas "${doc.originalFilename}".`);
  };

  // Favorite toggle
  const handleToggleFavorite = (doc: DocumentItem) => {
    const isFav = StorageService.toggleFavorite(doc.id);
    refreshAllData();
    showToast(isFav ? `"${doc.title}" ditambahkan ke favorit.` : `"${doc.title}" dihapus dari favorit.`);
  };

  // Soft delete
  const handleDeleteDocument = (doc: DocumentItem) => {
    StorageService.softDeleteDocument(doc.id);
    refreshAllData();
    showToast(`Dokumen "${doc.title}" dipindahkan ke kotak sampah.`);
  };

  // Restore document from trash
  const handleRestoreDocument = (doc: DocumentItem) => {
    StorageService.restoreDocument(doc.id);
    refreshAllData();
  };

  // Force delete document permanently
  const handleForceDeleteDocument = (doc: DocumentItem) => {
    StorageService.permanentDeleteDocument(doc.id);
    refreshAllData();
  };

  // Empty trash
  const handleEmptyTrash = () => {
    StorageService.emptyTrash();
    refreshAllData();
  };

  // Active documents vs Trash documents
  const activeDocuments = documents.filter((d) => d.status !== 'trash');
  const trashCount = documents.filter((d) => d.status === 'trash').length;

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden text-slate-900">
      {/* Sidebar Navigation */}
      <Sidebar
        currentView={currentView}
        onSelectView={handleSelectView}
        trashCount={trashCount}
        currentUser={currentUser}
      />

      {/* Main Layout Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <Header
          currentViewTitle={getViewTitle()}
          searchQuery={globalSearch}
          onSearchChange={handleSearchChange}
          currentUser={currentUser}
          onUserSwitch={handleUserSwitch}
          onOpenUpload={() => setIsUploadOpen(true)}
          onNavigate={handleSelectView}
        />

        {/* Dynamic Main Body Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* 1. Dashboard View */}
            {currentView === 'dashboard' && (
              <DashboardView
                documents={activeDocuments}
                categories={categories}
                activityLogs={activityLogs}
                currentUser={currentUser}
                onOpenUpload={() => setIsUploadOpen(true)}
                onNavigate={handleSelectView}
                onPreviewDocument={(doc) => setPreviewDoc(doc)}
                onDownloadDocument={handleDownloadDocument}
              />
            )}

            {/* 2. Documents List View (All or Filtered by Category) */}
            {(currentView === 'berkas-semua' ||
              currentView.startsWith('berkas-')) && (
              <DocumentListView
                documents={activeDocuments}
                categories={categories}
                currentUser={currentUser}
                initialFilterCategory={filterParams.category}
                initialFilterYear={filterParams.year}
                initialFilterType={filterParams.type}
                onPreviewDocument={(doc) => setPreviewDoc(doc)}
                onDownloadDocument={handleDownloadDocument}
                onEditDocument={(doc) => setEditDoc(doc)}
                onViewVersions={(doc) => setVersionDoc(doc)}
                onViewDetail={(doc) => setDetailDoc(doc)}
                onDeleteDocument={handleDeleteDocument}
                onToggleFavorite={handleToggleFavorite}
                onOpenUpload={() => setIsUploadOpen(true)}
                showToast={showToast}
              />
            )}

            {/* 3. Academic Year Archive View */}
            {currentView === 'arsip-tahun' && (
              <AcademicYearArchiveView
                documents={activeDocuments}
                onSelectYearSemester={(year, semester) => {
                  handleSelectView('berkas-semua', {
                    year,
                    ...(semester ? { semester } : {}),
                  });
                }}
                showToast={showToast}
              />
            )}

            {/* 4. Category Management View */}
            {currentView === 'kategori' && (
              <CategoryManagementView
                categories={categories}
                documents={activeDocuments}
                currentUser={currentUser}
                onCategoriesUpdated={(updated) => setCategories(updated)}
                showToast={showToast}
              />
            )}

            {/* 5. Teacher and School Profile View */}
            {currentView === 'profil' && (
              <TeacherSchoolProfileView
                currentUser={currentUser}
                showToast={showToast}
              />
            )}

            {/* 6. User and RBAC View */}
            {currentView === 'pengguna' && (
              <UserManagementView
                currentUser={currentUser}
                onUserSwitch={handleUserSwitch}
                showToast={showToast}
              />
            )}

            {/* 7. Backup and Restore View */}
            {currentView === 'backup' && (
              <BackupRestoreView
                currentUser={currentUser}
                showToast={showToast}
                onDatabaseRestored={refreshAllData}
              />
            )}

            {/* 8. CodeIgniter 4 Export and Source Code View */}
            {currentView === 'ci4-export' && (
              <Ci4CodeExportView showToast={showToast} />
            )}

            {/* 9. Settings View */}
            {currentView === 'pengaturan' && (
              <SettingsView
                currentUser={currentUser}
                showToast={showToast}
                onResetData={refreshAllData}
              />
            )}

            {/* 10. Trash View */}
            {currentView === 'trash' && (
              <TrashView
                documents={documents}
                currentUser={currentUser}
                onRestore={handleRestoreDocument}
                onForceDelete={handleForceDeleteDocument}
                onEmptyTrash={handleEmptyTrash}
                showToast={showToast}
              />
            )}
          </div>
        </main>
      </div>

      {/* Modals */}
      <DocumentUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        categories={categories}
        currentUser={currentUser}
        onDocumentAdded={() => {
          refreshAllData();
        }}
        showToast={showToast}
      />

      <DocumentPreviewModal
        document={previewDoc}
        onClose={() => setPreviewDoc(null)}
        onDownload={handleDownloadDocument}
      />

      <DocumentDetailModal
        document={detailDoc}
        categories={categories}
        onClose={() => setDetailDoc(null)}
        onPreview={(doc) => setPreviewDoc(doc)}
        onDownload={handleDownloadDocument}
        onViewVersions={(doc) => setVersionDoc(doc)}
      />

      <DocumentVersionModal
        document={versionDoc}
        onClose={() => setVersionDoc(null)}
        onVersionUploaded={() => {
          refreshAllData();
        }}
        showToast={showToast}
      />

      <DocumentEditModal
        document={editDoc}
        categories={categories}
        onClose={() => setEditDoc(null)}
        onDocumentUpdated={() => {
          refreshAllData();
        }}
        showToast={showToast}
      />

      {/* Toast Notification Container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`px-4 py-2.5 rounded-xl shadow-lg border text-xs font-semibold flex items-center gap-2 pointer-events-auto animate-in slide-in-from-bottom-2 ${
              t.type === 'error'
                ? 'bg-rose-50 text-rose-800 border-rose-200'
                : 'bg-slate-900 text-white border-slate-800'
            }`}
          >
            <div
              className={`w-2 h-2 rounded-full ${
                t.type === 'error' ? 'bg-rose-500' : 'bg-emerald-400'
              }`}
            />
            <span>{t.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
