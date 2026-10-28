export type UserRole = 'admin' | 'guru' | 'viewer';

export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  lastLogin: string;
  avatarUrl?: string;
}

export interface Category {
  id: string;
  parentId: string | null;
  namaKategori: string;
  slug: string;
  deskripsi: string;
  iconName: string;
  isActive: boolean;
  order: number;
}

export type FileType = 'word' | 'excel' | 'pdf' | 'image' | 'other';

export interface DocumentVersion {
  id: string;
  documentId: string;
  versionNumber: number;
  storedFilename: string;
  fileSize: number;
  mimeType: string;
  fileDataUrl?: string;
  uploadedBy: string;
  versionNote: string;
  createdAt: string;
}

export interface DocumentItem {
  id: string;
  documentCode: string;
  title: string;
  originalFilename: string;
  storedFilename: string;
  mimeType: string;
  extension: string;
  fileSize: number; // in bytes
  fileType: FileType;
  fileDataUrl?: string; // base64 or object URL for real preview & download
  categoryId: string;
  subcategoryId?: string;
  academicYear: string; // e.g. "2025/2026"
  semester: 'Ganjil' | 'Genap' | 'Tahunan';
  documentDate: string; // YYYY-MM-DD
  gradeLevel: string; // e.g. "Fase E (Kelas X)"
  subject: string; // e.g. "PJOK"
  description: string;
  tags: string[];
  checksum: string;
  isFavorite: boolean;
  status: 'active' | 'archived' | 'trash';
  uploadedBy: string;
  uploadedByName: string;
  deletedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  versionsCount: number;
}

export interface SchoolProfile {
  namaSekolah: string;
  npsn: string;
  alamat: string;
  desa: string;
  kecamatan: string;
  kabupaten: string;
  provinsi: string;
  kodePos: string;
  kepalaSekolah: string;
  nipKepalaSekolah: string;
  akreditasi: string;
  telepon: string;
  email: string;
  website: string;
  logoUrl?: string;
}

export interface TeacherProfile {
  namaGuru: string;
  nip: string;
  nuptk: string;
  statusKepegawaian: 'PNS' | 'PPPK' | 'GTT' | 'Guru Tetap Yayasan';
  pangkatGolongan: string;
  jabatan: string;
  email: string;
  nomorTelepon: string;
  alamat: string;
  tempatLahir: string;
  tanggalLahir: string;
  pendidikanTerakhir: string;
  jurusan: string;
  fotoProfil?: string;
  mataPelajaran: string;
  tugasTambahan: string;
}

export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'RESTORE' | 'DOWNLOAD' | 'LOGIN' | 'BACKUP';
  entityType: 'document' | 'category' | 'user' | 'profile' | 'backup' | 'system';
  entityId?: string;
  description: string;
  ipAddress: string;
  createdAt: string;
}

export interface BackupRecord {
  id: string;
  backupFilename: string;
  backupType: 'database' | 'files' | 'full';
  fileSize: number;
  status: 'success' | 'failed';
  createdBy: string;
  createdAt: string;
  documentsCount: number;
  dataPayload?: string;
}

export interface AppSettings {
  appName: string;
  maxUploadSizeMb: number;
  allowedExtensions: string[];
  defaultAcademicYear: string;
  defaultSemester: 'Ganjil' | 'Genap';
  autoBackup: boolean;
  enableDuplicateDetection: boolean;
}
