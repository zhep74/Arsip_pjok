import {
  DocumentItem,
  DocumentVersion,
  Category,
  SchoolProfile,
  TeacherProfile,
  User,
  ActivityLog,
  BackupRecord,
  AppSettings,
  UserRole,
} from '../types';
import {
  INITIAL_CATEGORIES,
  INITIAL_DOCUMENTS,
  INITIAL_SCHOOL,
  INITIAL_TEACHER,
  INITIAL_USERS,
  INITIAL_ACTIVITY_LOGS,
  INITIAL_SETTINGS,
} from '../data/initialData';

const STORAGE_KEYS = {
  DOCUMENTS: 'arsip_pjok_documents',
  VERSIONS: 'arsip_pjok_versions',
  CATEGORIES: 'arsip_pjok_categories',
  SCHOOL: 'arsip_pjok_school',
  TEACHER: 'arsip_pjok_teacher',
  USERS: 'arsip_pjok_users',
  LOGS: 'arsip_pjok_logs',
  BACKUPS: 'arsip_pjok_backups',
  SETTINGS: 'arsip_pjok_settings',
  ACTIVE_USER: 'arsip_pjok_active_user',
};

// Simple fast client-side checksum generator
export async function calculateChecksum(content: string | ArrayBuffer): Promise<string> {
  try {
    let buffer: Uint8Array;
    if (typeof content === 'string') {
      const encoder = new TextEncoder();
      buffer = encoder.encode(content);
    } else {
      buffer = new Uint8Array(content);
    }
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer as unknown as ArrayBufferView<ArrayBuffer>);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('').substring(0, 32);
  } catch {
    // Fallback simple checksum
    let hash = 0;
    const str = typeof content === 'string' ? content : 'file_buffer_hash';
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash).toString(16).padStart(32, '0');
  }
}

export class StorageService {
  // Helper for safe localStorage access
  private static getItem<T>(key: string, defaultValue: T): T {
    try {
      const data = localStorage.getItem(key);
      return data ? (JSON.parse(data) as T) : defaultValue;
    } catch (e) {
      console.warn(`Error reading key ${key} from storage:`, e);
      return defaultValue;
    }
  }

  private static setItem<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error(`Error saving key ${key} to storage:`, e);
    }
  }

  // Active User / Session
  static getActiveUser(): User {
    const defaultUser = INITIAL_USERS[0]; // Guru PJOK Ahmad Fauzi
    return this.getItem<User>(STORAGE_KEYS.ACTIVE_USER, defaultUser);
  }

  static setActiveUser(user: User): void {
    this.setItem(STORAGE_KEYS.ACTIVE_USER, user);
    this.addLog({
      action: 'LOGIN',
      entityType: 'user',
      entityId: user.id,
      description: `Beralih sesi login sebagai ${user.name} (${user.role.toUpperCase()})`,
    });
  }

  // Documents
  static getDocuments(includeTrash = false): DocumentItem[] {
    const docs = this.getItem<DocumentItem[]>(STORAGE_KEYS.DOCUMENTS, INITIAL_DOCUMENTS);
    if (includeTrash) {
      return docs;
    }
    return docs.filter((d) => d.status !== 'trash');
  }

  static getTrashDocuments(): DocumentItem[] {
    const docs = this.getItem<DocumentItem[]>(STORAGE_KEYS.DOCUMENTS, INITIAL_DOCUMENTS);
    return docs.filter((d) => d.status === 'trash');
  }

  static getDocumentById(id: string): DocumentItem | undefined {
    const docs = this.getItem<DocumentItem[]>(STORAGE_KEYS.DOCUMENTS, INITIAL_DOCUMENTS);
    return docs.find((d) => d.id === id);
  }

  static addDocument(doc: DocumentItem): { success: boolean; isDuplicate?: boolean; message: string; doc?: DocumentItem } {
    const docs = this.getItem<DocumentItem[]>(STORAGE_KEYS.DOCUMENTS, INITIAL_DOCUMENTS);
    const settings = this.getSettings();

    // Duplicate detection by checksum
    if (settings.enableDuplicateDetection && doc.checksum) {
      const existing = docs.find((d) => d.status !== 'trash' && d.checksum === doc.checksum);
      if (existing) {
        return {
          success: false,
          isDuplicate: true,
          message: `Berkas serupa telah ditemukan dalam arsip dengan judul: "${existing.title}" (${existing.documentCode}).`,
          doc: existing,
        };
      }
    }

    const updated = [doc, ...docs];
    this.setItem(STORAGE_KEYS.DOCUMENTS, updated);

    // Save initial version
    this.saveVersion({
      id: `ver-${Date.now()}`,
      documentId: doc.id,
      versionNumber: 1,
      storedFilename: doc.storedFilename,
      fileSize: doc.fileSize,
      mimeType: doc.mimeType,
      fileDataUrl: doc.fileDataUrl,
      uploadedBy: doc.uploadedByName,
      versionNote: 'Versi perdana dokumen diunggah',
      createdAt: doc.createdAt,
    });

    this.addLog({
      action: 'CREATE',
      entityType: 'document',
      entityId: doc.id,
      description: `Menambahkan dokumen "${doc.title}" [${doc.documentCode}] (${doc.extension.toUpperCase()})`,
    });

    return { success: true, message: 'Dokumen berhasil disimpan ke arsip digital.', doc };
  }

  static updateDocument(id: string, updates: Partial<DocumentItem>): DocumentItem | null {
    const docs = this.getItem<DocumentItem[]>(STORAGE_KEYS.DOCUMENTS, INITIAL_DOCUMENTS);
    const idx = docs.findIndex((d) => d.id === id);
    if (idx === -1) return null;

    const updatedDoc: DocumentItem = {
      ...docs[idx],
      ...updates,
      updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };

    docs[idx] = updatedDoc;
    this.setItem(STORAGE_KEYS.DOCUMENTS, docs);

    this.addLog({
      action: 'UPDATE',
      entityType: 'document',
      entityId: id,
      description: `Memperbarui metadata dokumen "${updatedDoc.title}"`,
    });

    return updatedDoc;
  }

  static uploadNewVersion(
    docId: string,
    fileDataUrl: string,
    originalFilename: string,
    fileSize: number,
    mimeType: string,
    extension: string,
    versionNote: string
  ): DocumentItem | null {
    const docs = this.getItem<DocumentItem[]>(STORAGE_KEYS.DOCUMENTS, INITIAL_DOCUMENTS);
    const doc = docs.find((d) => d.id === docId);
    if (!doc) return null;

    const activeUser = this.getActiveUser();
    const newVersionNum = (doc.versionsCount || 1) + 1;
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);

    const versionRecord: DocumentVersion = {
      id: `ver-${Date.now()}`,
      documentId: docId,
      versionNumber: newVersionNum,
      storedFilename: `v${newVersionNum}_${doc.storedFilename}`,
      fileSize,
      mimeType,
      fileDataUrl,
      uploadedBy: activeUser.name,
      versionNote: versionNote || `Pembaruan file versi ${newVersionNum}`,
      createdAt: now,
    };

    this.saveVersion(versionRecord);

    const updated = this.updateDocument(docId, {
      fileDataUrl,
      originalFilename,
      fileSize,
      mimeType,
      extension,
      versionsCount: newVersionNum,
      updatedAt: now,
    });

    this.addLog({
      action: 'UPDATE',
      entityType: 'document',
      entityId: docId,
      description: `Memperbarui berkas ke Versi ${newVersionNum} untuk "${doc.title}": ${versionNote}`,
    });

    return updated;
  }

  static softDeleteDocument(id: string): boolean {
    const docs = this.getItem<DocumentItem[]>(STORAGE_KEYS.DOCUMENTS, INITIAL_DOCUMENTS);
    const doc = docs.find((d) => d.id === id);
    if (!doc) return false;

    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
    doc.status = 'trash';
    doc.deletedAt = now;
    this.setItem(STORAGE_KEYS.DOCUMENTS, docs);

    this.addLog({
      action: 'DELETE',
      entityType: 'document',
      entityId: id,
      description: `Memindahkan dokumen "${doc.title}" ke Kotak Sampah`,
    });

    return true;
  }

  static restoreDocument(id: string): boolean {
    const docs = this.getItem<DocumentItem[]>(STORAGE_KEYS.DOCUMENTS, INITIAL_DOCUMENTS);
    const doc = docs.find((d) => d.id === id);
    if (!doc) return false;

    doc.status = 'active';
    doc.deletedAt = null;
    this.setItem(STORAGE_KEYS.DOCUMENTS, docs);

    this.addLog({
      action: 'RESTORE',
      entityType: 'document',
      entityId: id,
      description: `Memulihkan dokumen "${doc.title}" dari Kotak Sampah`,
    });

    return true;
  }

  static permanentDeleteDocument(id: string): boolean {
    let docs = this.getItem<DocumentItem[]>(STORAGE_KEYS.DOCUMENTS, INITIAL_DOCUMENTS);
    const doc = docs.find((d) => d.id === id);
    if (!doc) return false;

    docs = docs.filter((d) => d.id !== id);
    this.setItem(STORAGE_KEYS.DOCUMENTS, docs);

    // Also remove versions
    let versions = this.getItem<DocumentVersion[]>(STORAGE_KEYS.VERSIONS, []);
    versions = versions.filter((v) => v.documentId !== id);
    this.setItem(STORAGE_KEYS.VERSIONS, versions);

    this.addLog({
      action: 'DELETE',
      entityType: 'document',
      entityId: id,
      description: `Menghapus dokumen "${doc.title}" secara permanen`,
    });

    return true;
  }

  static emptyTrash(): number {
    let docs = this.getItem<DocumentItem[]>(STORAGE_KEYS.DOCUMENTS, INITIAL_DOCUMENTS);
    const trashCount = docs.filter((d) => d.status === 'trash').length;
    docs = docs.filter((d) => d.status !== 'trash');
    this.setItem(STORAGE_KEYS.DOCUMENTS, docs);

    this.addLog({
      action: 'DELETE',
      entityType: 'system',
      description: `Mengosongkan kotak sampah (${trashCount} dokumen dihapus permanen)`,
    });

    return trashCount;
  }

  static toggleFavorite(id: string): boolean {
    const docs = this.getItem<DocumentItem[]>(STORAGE_KEYS.DOCUMENTS, INITIAL_DOCUMENTS);
    const doc = docs.find((d) => d.id === id);
    if (!doc) return false;

    doc.isFavorite = !doc.isFavorite;
    this.setItem(STORAGE_KEYS.DOCUMENTS, docs);
    return doc.isFavorite;
  }

  // Document Versions
  static getDocumentVersions(documentId: string): DocumentVersion[] {
    const versions = this.getItem<DocumentVersion[]>(STORAGE_KEYS.VERSIONS, []);
    return versions
      .filter((v) => v.documentId === documentId)
      .sort((a, b) => b.versionNumber - a.versionNumber);
  }

  private static saveVersion(version: DocumentVersion): void {
    const versions = this.getItem<DocumentVersion[]>(STORAGE_KEYS.VERSIONS, []);
    this.setItem(STORAGE_KEYS.VERSIONS, [version, ...versions]);
  }

  // Categories
  static getCategories(): Category[] {
    return this.getItem<Category[]>(STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES);
  }

  static addCategory(cat: Omit<Category, 'id'>): Category {
    const categories = this.getCategories();
    const newCat: Category = {
      ...cat,
      id: `cat-${Date.now()}`,
    };
    const updated = [...categories, newCat];
    this.setItem(STORAGE_KEYS.CATEGORIES, updated);

    this.addLog({
      action: 'CREATE',
      entityType: 'category',
      entityId: newCat.id,
      description: `Menambahkan kategori "${newCat.namaKategori}"`,
    });

    return newCat;
  }

  static updateCategory(id: string, updates: Partial<Category>): Category | null {
    const categories = this.getCategories();
    const idx = categories.findIndex((c) => c.id === id);
    if (idx === -1) return null;

    categories[idx] = { ...categories[idx], ...updates };
    this.setItem(STORAGE_KEYS.CATEGORIES, categories);

    this.addLog({
      action: 'UPDATE',
      entityType: 'category',
      entityId: id,
      description: `Memperbarui kategori "${categories[idx].namaKategori}"`,
    });

    return categories[idx];
  }

  static deleteCategory(id: string): { success: boolean; message: string } {
    const docs = this.getDocuments(true);
    // Check if used by any document
    const isUsed = docs.some((d) => d.categoryId === id || d.subcategoryId === id);
    if (isUsed) {
      return {
        success: false,
        message: 'Kategori tidak dapat dihapus karena masih digunakan oleh satu atau beberapa dokumen arsip.',
      };
    }

    const categories = this.getCategories();
    const target = categories.find((c) => c.id === id);
    // Also check if it has children subcategories
    const hasChildren = categories.some((c) => c.parentId === id);
    if (hasChildren) {
      return {
        success: false,
        message: 'Kategori induk tidak dapat dihapus selama memiliki subkategori.',
      };
    }

    const updated = categories.filter((c) => c.id !== id);
    this.setItem(STORAGE_KEYS.CATEGORIES, updated);

    if (target) {
      this.addLog({
        action: 'DELETE',
        entityType: 'category',
        entityId: id,
        description: `Menghapus kategori "${target.namaKategori}"`,
      });
    }

    return { success: true, message: 'Kategori berhasil dihapus.' };
  }

  // Profiles
  static getSchoolProfile(): SchoolProfile {
    return this.getItem<SchoolProfile>(STORAGE_KEYS.SCHOOL, INITIAL_SCHOOL);
  }

  static updateSchoolProfile(profile: Partial<SchoolProfile>): SchoolProfile {
    const current = this.getSchoolProfile();
    const updated = { ...current, ...profile };
    this.setItem(STORAGE_KEYS.SCHOOL, updated);

    this.addLog({
      action: 'UPDATE',
      entityType: 'profile',
      description: 'Memperbarui data profil identitas sekolah',
    });

    return updated;
  }

  static getTeacherProfile(): TeacherProfile {
    return this.getItem<TeacherProfile>(STORAGE_KEYS.TEACHER, INITIAL_TEACHER);
  }

  static updateTeacherProfile(profile: Partial<TeacherProfile>): TeacherProfile {
    const current = this.getTeacherProfile();
    const updated = { ...current, ...profile };
    this.setItem(STORAGE_KEYS.TEACHER, updated);

    this.addLog({
      action: 'UPDATE',
      entityType: 'profile',
      description: 'Memperbarui data profil dan biodata guru PJOK',
    });

    return updated;
  }

  // Users & Roles
  static getUsers(): User[] {
    return this.getItem<User[]>(STORAGE_KEYS.USERS, INITIAL_USERS);
  }

  static addUser(user: Omit<User, 'id'>): User {
    const users = this.getUsers();
    const newUser: User = {
      ...user,
      id: `user-${Date.now()}`,
    };
    this.setItem(STORAGE_KEYS.USERS, [...users, newUser]);

    this.addLog({
      action: 'CREATE',
      entityType: 'user',
      entityId: newUser.id,
      description: `Menambahkan pengguna baru: ${newUser.name} (${newUser.role})`,
    });

    return newUser;
  }

  static updateUser(id: string, updates: Partial<User>): User | null {
    const users = this.getUsers();
    const idx = users.findIndex((u) => u.id === id);
    if (idx === -1) return null;

    users[idx] = { ...users[idx], ...updates };
    this.setItem(STORAGE_KEYS.USERS, users);

    this.addLog({
      action: 'UPDATE',
      entityType: 'user',
      entityId: id,
      description: `Memperbarui hak akses/data pengguna ${users[idx].name}`,
    });

    return users[idx];
  }

  // Activity Logs
  static getActivityLogs(): ActivityLog[] {
    return this.getItem<ActivityLog[]>(STORAGE_KEYS.LOGS, INITIAL_ACTIVITY_LOGS);
  }

  static addLog(params: {
    action: ActivityLog['action'];
    entityType: ActivityLog['entityType'];
    entityId?: string;
    description: string;
  }): void {
    const logs = this.getActivityLogs();
    const user = this.getActiveUser();
    const newLog: ActivityLog = {
      id: `log-${Date.now()}`,
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      action: params.action,
      entityType: params.entityType,
      entityId: params.entityId,
      description: params.description,
      ipAddress: '192.168.1.10',
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };

    const updated = [newLog, ...logs].slice(0, 200); // keep last 200 logs
    this.setItem(STORAGE_KEYS.LOGS, updated);
  }

  // Settings
  static getSettings(): AppSettings {
    return this.getItem<AppSettings>(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS);
  }

  static updateSettings(settings: Partial<AppSettings>): AppSettings {
    const current = this.getSettings();
    const updated = { ...current, ...settings };
    this.setItem(STORAGE_KEYS.SETTINGS, updated);

    this.addLog({
      action: 'UPDATE',
      entityType: 'system',
      description: 'Memperbarui konfigurasi sistem arsip',
    });

    return updated;
  }

  // Backups
  static getBackups(): BackupRecord[] {
    return this.getItem<BackupRecord[]>(STORAGE_KEYS.BACKUPS, [
      {
        id: 'bcp-01',
        backupFilename: 'arsip_pjok_db_20250801_020000.json',
        backupType: 'database',
        fileSize: 452000,
        status: 'success',
        createdBy: 'Administrator SI-PJOK',
        createdAt: '2025-08-01 02:00:00',
        documentsCount: 10,
      },
    ]);
  }

  static createBackupRecord(record: BackupRecord): void {
    const backups = this.getBackups();
    this.setItem(STORAGE_KEYS.BACKUPS, [record, ...backups]);
    this.addLog({
      action: 'BACKUP',
      entityType: 'backup',
      entityId: record.id,
      description: `Pencadangan data "${record.backupFilename}" berhasil (${record.backupType})`,
    });
  }

  static deleteBackup(id: string): boolean {
    const backups = this.getBackups();
    const filtered = backups.filter((b) => b.id !== id);
    this.setItem(STORAGE_KEYS.BACKUPS, filtered);
    return true;
  }

  // Complete Database Snapshot for Backup / Restore
  static getDatabaseSnapshot(): Record<string, unknown> {
    return {
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      documents: this.getItem(STORAGE_KEYS.DOCUMENTS, INITIAL_DOCUMENTS),
      versions: this.getItem(STORAGE_KEYS.VERSIONS, []),
      categories: this.getItem(STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES),
      school: this.getItem(STORAGE_KEYS.SCHOOL, INITIAL_SCHOOL),
      teacher: this.getItem(STORAGE_KEYS.TEACHER, INITIAL_TEACHER),
      users: this.getItem(STORAGE_KEYS.USERS, INITIAL_USERS),
      settings: this.getItem(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS),
      logs: this.getItem(STORAGE_KEYS.LOGS, INITIAL_ACTIVITY_LOGS),
    };
  }

  static restoreDatabaseSnapshot(data: Record<string, unknown>): { success: boolean; message: string } {
    try {
      if (!data.documents || !data.categories) {
        return { success: false, message: 'Format berkas backup tidak valid atau tidak memiliki data arsip_pjok.' };
      }

      if (data.documents) this.setItem(STORAGE_KEYS.DOCUMENTS, data.documents);
      if (data.versions) this.setItem(STORAGE_KEYS.VERSIONS, data.versions);
      if (data.categories) this.setItem(STORAGE_KEYS.CATEGORIES, data.categories);
      if (data.school) this.setItem(STORAGE_KEYS.SCHOOL, data.school);
      if (data.teacher) this.setItem(STORAGE_KEYS.TEACHER, data.teacher);
      if (data.users) this.setItem(STORAGE_KEYS.USERS, data.users);
      if (data.settings) this.setItem(STORAGE_KEYS.SETTINGS, data.settings);

      this.addLog({
        action: 'RESTORE',
        entityType: 'system',
        description: 'Pemulihan database dari berkas backup berhasil diselesaikan',
      });

      return { success: true, message: 'Database dan seluruh berkas berhasil dipulihkan!' };
    } catch (e) {
      return { success: false, message: `Gagal memulihkan database: ${(e as Error).message}` };
    }
  }

  static resetToDefault(): void {
    localStorage.removeItem(STORAGE_KEYS.DOCUMENTS);
    localStorage.removeItem(STORAGE_KEYS.VERSIONS);
    localStorage.removeItem(STORAGE_KEYS.CATEGORIES);
    localStorage.removeItem(STORAGE_KEYS.SCHOOL);
    localStorage.removeItem(STORAGE_KEYS.TEACHER);
    localStorage.removeItem(STORAGE_KEYS.USERS);
    localStorage.removeItem(STORAGE_KEYS.LOGS);
    localStorage.removeItem(STORAGE_KEYS.BACKUPS);
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
    this.addLog({
      action: 'UPDATE',
      entityType: 'system',
      description: 'Reset seluruh data arsip ke pengaturan bawaan awal',
    });
  }
}
