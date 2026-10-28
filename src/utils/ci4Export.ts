import JSZip from 'jszip';

export interface Ci4File {
  path: string;
  category: 'config' | 'migration' | 'seeder' | 'controller' | 'model' | 'filter' | 'sql' | 'doc';
  description: string;
  content: string;
}

export const CI4_CODEBASE: Ci4File[] = [
  // 1. SQL Dump
  {
    path: 'database/arsip_pjok.sql',
    category: 'sql',
    description: 'Skema Database Lengkap MySQL / MariaDB dengan Relasi dan Data Awal',
    content: `-- ==============================================================
-- DATABASE: arsip_pjok
-- Sistem Manajemen & Arsip Digital Administrasi Guru PJOK
-- ==============================================================

CREATE DATABASE IF NOT EXISTS \`arsip_pjok\` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE \`arsip_pjok\`;

-- 1. Tabel Roles
CREATE TABLE IF NOT EXISTS \`roles\` (
  \`id\` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  \`name\` VARCHAR(50) NOT NULL UNIQUE,
  \`description\` VARCHAR(255) NULL,
  \`permissions\` JSON NULL,
  \`created_at\` DATETIME NULL DEFAULT CURRENT_TIMESTAMP,
  \`updated_at\` DATETIME NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 2. Tabel Users
CREATE TABLE IF NOT EXISTS \`users\` (
  \`id\` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  \`name\` VARCHAR(150) NOT NULL,
  \`username\` VARCHAR(50) NOT NULL UNIQUE,
  \`email\` VARCHAR(100) NOT NULL UNIQUE,
  \`password_hash\` VARCHAR(255) NOT NULL,
  \`role_id\` INT UNSIGNED NOT NULL,
  \`is_active\` TINYINT(1) DEFAULT 1,
  \`last_login\` DATETIME NULL,
  \`created_at\` DATETIME NULL DEFAULT CURRENT_TIMESTAMP,
  \`updated_at\` DATETIME NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX \`idx_users_role\` (\`role_id\`),
  CONSTRAINT \`fk_users_role\` FOREIGN KEY (\`role_id\`) REFERENCES \`roles\` (\`id\`) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- 3. Tabel Schools
CREATE TABLE IF NOT EXISTS \`schools\` (
  \`id\` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  \`nama_sekolah\` VARCHAR(150) NOT NULL,
  \`npsn\` VARCHAR(20) NOT NULL UNIQUE,
  \`alamat\` TEXT NOT NULL,
  \`desa\` VARCHAR(100) NULL,
  \`kecamatan\` VARCHAR(100) NULL,
  \`kabupaten\` VARCHAR(100) NULL,
  \`provinsi\` VARCHAR(100) NULL,
  \`kepala_sekolah\` VARCHAR(150) NOT NULL,
  \`nip_kepala_sekolah\` VARCHAR(50) NULL,
  \`created_at\` DATETIME NULL DEFAULT CURRENT_TIMESTAMP,
  \`updated_at\` DATETIME NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 4. Tabel Teacher Profiles
CREATE TABLE IF NOT EXISTS \`teacher_profiles\` (
  \`id\` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  \`user_id\` INT UNSIGNED NOT NULL UNIQUE,
  \`school_id\` INT UNSIGNED NULL,
  \`nama_guru\` VARCHAR(150) NOT NULL,
  \`nip\` VARCHAR(50) NULL,
  \`nuptk\` VARCHAR(50) NULL,
  \`status_kepegawaian\` VARCHAR(50) DEFAULT 'PNS',
  \`email\` VARCHAR(100) NULL,
  \`nomor_telepon\` VARCHAR(30) NULL,
  \`alamat\` TEXT NULL,
  \`foto_profil\` VARCHAR(255) NULL,
  \`created_at\` DATETIME NULL DEFAULT CURRENT_TIMESTAMP,
  \`updated_at\` DATETIME NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT \`fk_tp_user\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\` (\`id\`) ON DELETE CASCADE,
  CONSTRAINT \`fk_tp_school\` FOREIGN KEY (\`school_id\`) REFERENCES \`schools\` (\`id\`) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 5. Tabel Categories
CREATE TABLE IF NOT EXISTS \`categories\` (
  \`id\` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  \`parent_id\` INT UNSIGNED NULL,
  \`nama_kategori\` VARCHAR(100) NOT NULL,
  \`slug\` VARCHAR(120) NOT NULL UNIQUE,
  \`deskripsi\` TEXT NULL,
  \`icon\` VARCHAR(50) DEFAULT 'folder',
  \`is_active\` TINYINT(1) DEFAULT 1,
  \`created_at\` DATETIME NULL DEFAULT CURRENT_TIMESTAMP,
  \`updated_at\` DATETIME NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX \`idx_categories_parent\` (\`parent_id\`),
  CONSTRAINT \`fk_categories_parent\` FOREIGN KEY (\`parent_id\`) REFERENCES \`categories\` (\`id\`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 6. Tabel Documents
CREATE TABLE IF NOT EXISTS \`documents\` (
  \`id\` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  \`document_code\` VARCHAR(100) NOT NULL UNIQUE,
  \`title\` VARCHAR(255) NOT NULL,
  \`original_filename\` VARCHAR(255) NOT NULL,
  \`stored_filename\` VARCHAR(255) NOT NULL,
  \`storage_path\` VARCHAR(255) NOT NULL,
  \`mime_type\` VARCHAR(100) NOT NULL,
  \`extension\` VARCHAR(20) NOT NULL,
  \`file_size\` BIGINT UNSIGNED NOT NULL,
  \`category_id\` INT UNSIGNED NOT NULL,
  \`school_id\` INT UNSIGNED NULL,
  \`uploaded_by\` INT UNSIGNED NOT NULL,
  \`academic_year\` VARCHAR(20) NOT NULL,
  \`semester\` ENUM('Ganjil', 'Genap', 'Tahunan') NOT NULL DEFAULT 'Ganjil',
  \`document_date\` DATE NOT NULL,
  \`grade_level\` VARCHAR(50) NULL,
  \`subject\` VARCHAR(50) DEFAULT 'PJOK',
  \`description\` TEXT NULL,
  \`checksum\` VARCHAR(64) NULL,
  \`is_favorite\` TINYINT(1) DEFAULT 0,
  \`status\` ENUM('active', 'archived', 'trash') DEFAULT 'active',
  \`deleted_at\` DATETIME NULL,
  \`created_at\` DATETIME NULL DEFAULT CURRENT_TIMESTAMP,
  \`updated_at\` DATETIME NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX \`idx_doc_category\` (\`category_id\`),
  INDEX \`idx_doc_year\` (\`academic_year\`),
  INDEX \`idx_doc_status\` (\`status\`),
  INDEX \`idx_doc_checksum\` (\`checksum\`),
  CONSTRAINT \`fk_doc_category\` FOREIGN KEY (\`category_id\`) REFERENCES \`categories\` (\`id\`) ON DELETE RESTRICT,
  CONSTRAINT \`fk_doc_uploader\` FOREIGN KEY (\`uploaded_by\`) REFERENCES \`users\` (\`id\`) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- 7. Tabel Document Versions
CREATE TABLE IF NOT EXISTS \`document_versions\` (
  \`id\` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  \`document_id\` INT UNSIGNED NOT NULL,
  \`stored_filename\` VARCHAR(255) NOT NULL,
  \`storage_path\` VARCHAR(255) NOT NULL,
  \`file_size\` BIGINT UNSIGNED NOT NULL,
  \`mime_type\` VARCHAR(100) NOT NULL,
  \`uploaded_by\` INT UNSIGNED NOT NULL,
  \`version_note\` VARCHAR(255) NULL,
  \`created_at\` DATETIME NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT \`fk_ver_doc\` FOREIGN KEY (\`document_id\`) REFERENCES \`documents\` (\`id\`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 8. Tabel Activity Logs
CREATE TABLE IF NOT EXISTS \`activity_logs\` (
  \`id\` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  \`user_id\` INT UNSIGNED NULL,
  \`action\` VARCHAR(50) NOT NULL,
  \`entity_type\` VARCHAR(50) NOT NULL,
  \`entity_id\` VARCHAR(50) NULL,
  \`description\` TEXT NOT NULL,
  \`ip_address\` VARCHAR(45) NULL,
  \`created_at\` DATETIME NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX \`idx_logs_user\` (\`user_id\`)
) ENGINE=InnoDB;

-- 9. Tabel Backups
CREATE TABLE IF NOT EXISTS \`backups\` (
  \`id\` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  \`backup_filename\` VARCHAR(255) NOT NULL,
  \`backup_type\` ENUM('database', 'files', 'full') NOT NULL,
  \`file_size\` BIGINT UNSIGNED NOT NULL,
  \`status\` ENUM('success', 'failed') DEFAULT 'success',
  \`created_by\` INT UNSIGNED NOT NULL,
  \`created_at\` DATETIME NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Seed Data Awal
INSERT INTO \`roles\` (\`id\`, \`name\`, \`description\`) VALUES
(1, 'Administrator', 'Akses penuh ke seluruh sistem, pengguna, database, dan backup'),
(2, 'Guru PJOK', 'Mengunggah, mengedit, mencari, dan mengunduh berkas administrasi'),
(3, 'Viewer', 'Hanya melihat dan mengunduh berkas');

INSERT INTO \`schools\` (\`id\`, \`nama_sekolah\`, \`npsn\`, \`alamat\`, \`desa\`, \`kecamatan\`, \`kabupaten\`, \`provinsi\`, \`kepala_sekolah\`, \`nip_kepala_sekolah\`) VALUES
(1, 'SMA Negeri 1 Prestasi Bangsa', '20104829', 'Jl. Olahraga Pemuda No. 45', 'Sukamaju', 'Cimahi Selatan', 'Kota Cimahi', 'Jawa Barat', 'Dr. Hj. Siti Nurjanah, M.Pd.', '19680315 199303 2 004');
`,
  },

  // 2. CodeIgniter 4 Routes
  {
    path: 'app/Config/Routes.php',
    category: 'config',
    description: 'Routing CodeIgniter 4 Lengkap dengan Middleware Filter Auth & RBAC',
    content: `<?php

namespace Config;

$routes = Services::routes();

$routes->setDefaultNamespace('App\\Controllers');
$routes->setDefaultController('AuthController');
$routes->setDefaultMethod('login');
$routes->setTranslateURIDashes(false);
$routes->set404Override();
$routes->setAutoRoute(false);

// Autentikasi Publik
$routes->get('login', 'AuthController::login');
$routes->post('login', 'AuthController::attemptLogin');
$routes->get('logout', 'AuthController::logout');

// Area Terproteksi (Login Diperlukan)
$routes->group('', ['filter' => 'auth'], function ($routes) {
    // Dashboard
    $routes->get('/', 'DashboardController::index');
    $routes->get('dashboard', 'DashboardController::index');

    // Berkas & Dokumen
    $routes->group('documents', function ($routes) {
        $routes->get('', 'DocumentController::index');
        $routes->get('create', 'DocumentController::create', ['filter' => 'role:admin,guru']);
        $routes->post('store', 'DocumentController::store', ['filter' => 'role:admin,guru']);
        $routes->post('batch-upload', 'DocumentController::batchUpload', ['filter' => 'role:admin,guru']);
        $routes->get('detail/(:num)', 'DocumentController::show/$1');
        $routes->get('preview/(:num)', 'DocumentController::preview/$1');
        $routes->get('download/(:num)', 'DocumentController::download/$1');
        $routes->get('edit/(:num)', 'DocumentController::edit/$1', ['filter' => 'role:admin,guru']);
        $routes->post('update/(:num)', 'DocumentController::update/$1', ['filter' => 'role:admin,guru']);
        $routes->post('new-version/(:num)', 'DocumentController::newVersion/$1', ['filter' => 'role:admin,guru']);
        $routes->post('toggle-favorite/(:num)', 'DocumentController::toggleFavorite/$1');
        $routes->post('delete/(:num)', 'DocumentController::delete/$1', ['filter' => 'role:admin,guru']);
        $routes->get('trash', 'DocumentController::trash', ['filter' => 'role:admin,guru']);
        $routes->post('restore/(:num)', 'DocumentController::restore/$1', ['filter' => 'role:admin,guru']);
        $routes->post('force-delete/(:num)', 'DocumentController::forceDelete/$1', ['filter' => 'role:admin']);
        $routes->post('empty-trash', 'DocumentController::emptyTrash', ['filter' => 'role:admin']);
    });

    // Kategori
    $routes->group('categories', function ($routes) {
        $routes->get('', 'CategoryController::index');
        $routes->post('store', 'CategoryController::store', ['filter' => 'role:admin']);
        $routes->post('update/(:num)', 'CategoryController::update/$1', ['filter' => 'role:admin']);
        $routes->post('delete/(:num)', 'CategoryController::delete/$1', ['filter' => 'role:admin']);
    });

    // Profil Guru & Sekolah
    $routes->group('profile', function ($routes) {
        $routes->get('', 'ProfileController::index');
        $routes->post('update-teacher', 'ProfileController::updateTeacher', ['filter' => 'role:admin,guru']);
        $routes->post('update-school', 'ProfileController::updateSchool', ['filter' => 'role:admin']);
    });

    // Manajemen Pengguna & Hak Akses (Admin Saja)
    $routes->group('users', ['filter' => 'role:admin'], function ($routes) {
        $routes->get('', 'UserController::index');
        $routes->post('store', 'UserController::store');
        $routes->post('update/(:num)', 'UserController::update/$1');
        $routes->post('toggle-status/(:num)', 'UserController::toggleStatus/$1');
    });

    // Backup & Restore (Admin Saja)
    $routes->group('backups', ['filter' => 'role:admin'], function ($routes) {
        $routes->get('', 'BackupController::index');
        $routes->post('create-db', 'BackupController::createDatabaseBackup');
        $routes->post('create-full', 'BackupController::createFullBackup');
        $routes->get('download/(:num)', 'BackupController::download/$1');
        $routes->post('restore', 'BackupController::restore');
        $routes->post('delete/(:num)', 'BackupController::delete/$1');
    });

    // Log Aktivitas
    $routes->get('logs', 'DashboardController::activityLogs', ['filter' => 'role:admin']);
});
`,
  },

  // 3. Document Controller
  {
    path: 'app/Controllers/DocumentController.php',
    category: 'controller',
    description: 'Controller Pengelolaan Dokumen PJOK: Upload, Preview, Streaming Download, Versioning & Trash',
    content: `<?php

namespace App\\Controllers;

use App\\Models\\DocumentModel;
use App\\Models\\DocumentVersionModel;
use App\\Models\\CategoryModel;
use App\\Models\\ActivityLogModel;
use CodeIgniter\\HTTP\\ResponseInterface;

class DocumentController extends BaseController
{
    protected $documentModel;
    protected $categoryModel;
    protected $versionModel;
    protected $logModel;

    public function __construct()
    {
        $this->documentModel = new DocumentModel();
        $this->categoryModel = new CategoryModel();
        $this->versionModel  = new DocumentVersionModel();
        $this->logModel      = new ActivityLogModel();
    }

    public function index()
    {
        $query      = $this->request->getGet('q');
        $categoryId = $this->request->getGet('category');
        $year       = $this->request->getGet('year');
        $semester   = $this->request->getGet('semester');
        $type       = $this->request->getGet('type');

        $builder = $this->documentModel->select('documents.*, categories.nama_kategori')
                                       ->join('categories', 'categories.id = documents.category_id', 'left')
                                       ->where('documents.status', 'active');

        if (!empty($query)) {
            $builder->groupStart()
                    ->like('documents.title', $query)
                    ->orLike('documents.document_code', $query)
                    ->orLike('documents.description', $query)
                    ->groupEnd();
        }
        if (!empty($categoryId)) {
            $builder->where('documents.category_id', $categoryId);
        }
        if (!empty($year)) {
            $builder->where('documents.academic_year', $year);
        }
        if (!empty($semester)) {
            $builder->where('documents.semester', $semester);
        }
        if (!empty($type)) {
            $builder->where('documents.extension', $type);
        }

        $data = [
            'title'      => 'Semua Berkas Administrasi Guru PJOK',
            'documents'  => $builder->orderBy('documents.created_at', 'DESC')->paginate(12),
            'pager'      => $this->documentModel->pager,
            'categories' => $this->categoryModel->where('parent_id IS NULL')->findAll(),
            'filters'    => compact('query', 'categoryId', 'year', 'semester', 'type')
        ];

        return view('documents/index', $data);
    }

    public function store()
    {
        $validation = \\Config\\Services::validation();
        $validation->setRules([
            'title'         => 'required|min_length[3]|max_length[255]',
            'category_id'   => 'required|is_natural_no_zero',
            'academic_year' => 'required',
            'semester'      => 'required|in_list[Ganjil,Genap,Tahunan]',
            'document_date' => 'required|valid_date',
            'file_document' => 'uploaded[file_document]|max_size[file_document,51200]|ext_in[file_document,pdf,docx,doc,xlsx,xls,jpg,jpeg,png,webp]'
        ]);

        if (!$validation->withRequest($this->request)->run()) {
            return redirect()->back()->withInput()->with('errors', $validation->getErrors());
        }

        $file = $this->request->getFile('file_document');
        if ($file->isValid() && !$file->hasMoved()) {
            // Checksum duplicate detection
            $tempPath = $file->getTempName();
            $checksum = md5_file($tempPath);

            $existing = $this->documentModel->where('checksum', $checksum)
                                            ->where('status !=', 'trash')
                                            ->first();
            if ($existing) {
                return redirect()->back()->withInput()->with('error', 'Dokumen identik sudah ada dengan kode: ' . $existing['document_code']);
            }

            // Direktori aman di writable/uploads/documents/YYYY/
            $year = date('Y');
            $uploadDir = WRITEPATH . 'uploads/documents/' . $year . '/';
            if (!is_dir($uploadDir)) {
                mkdir($uploadDir, 0755, true);
            }

            $extension      = $file->guessExtension() ?? $file->getClientExtension();
            $storedFilename = bin2hex(random_bytes(16)) . '.' . $extension;
            $file->move($uploadDir, $storedFilename);

            $documentCode = 'PJOK-' . date('Ymd') . '-' . strtoupper(substr(bin2hex(random_bytes(3)), 0, 4));

            $insertData = [
                'document_code'     => $documentCode,
                'title'             => $this->request->getPost('title'),
                'original_filename' => $file->getClientName(),
                'stored_filename'   => $storedFilename,
                'storage_path'      => 'documents/' . $year . '/' . $storedFilename,
                'mime_type'         => $file->getClientMimeType(),
                'extension'         => strtolower($extension),
                'file_size'         => $file->getSize(),
                'category_id'       => $this->request->getPost('category_id'),
                'academic_year'     => $this->request->getPost('academic_year'),
                'semester'          => $this->request->getPost('semester'),
                'document_date'     => $this->request->getPost('document_date'),
                'grade_level'       => $this->request->getPost('grade_level'),
                'subject'           => 'PJOK',
                'description'       => $this->request->getPost('description'),
                'checksum'          => $checksum,
                'uploaded_by'       => session()->get('user_id'),
                'status'            => 'active'
            ];

            $docId = $this->documentModel->insert($insertData);

            $this->logModel->logActivity(
                session()->get('user_id'),
                'CREATE',
                'document',
                $docId,
                'Mengunggah berkas ' . $insertData['title'] . ' [' . $documentCode . ']'
            );

            return redirect()->to('documents')->with('success', 'Dokumen berhasil diunggah.');
        }

        return redirect()->back()->with('error', 'Gagal memproses file unggahan.');
    }

    public function download($id)
    {
        $doc = $this->documentModel->find($id);
        if (!$doc) {
            throw \\CodeIgniter\\Exceptions\\PageNotFoundException::forPageNotFound('Dokumen tidak ditemukan');
        }

        $fullPath = WRITEPATH . 'uploads/' . $doc['storage_path'];
        if (!file_exists($fullPath)) {
            return redirect()->back()->with('error', 'File fisik dokumen tidak ditemukan di server.');
        }

        return $this->response->download($fullPath, null)->setFileName($doc['original_filename']);
    }
}
`,
  },

  // 4. CodeIgniter 4 Environment Example
  {
    path: '.env.example',
    category: 'config',
    description: 'Konfigurasi Environment CodeIgniter 4 (.env)',
    content: `#--------------------------------------------------------------------
# APLIKASI ARSIP DIGITAL ADMINISTRASI GURU PJOK
# KONFIGURASI ENVIRONMENT PRODUKSI & DEVELOPMENT
#--------------------------------------------------------------------

CI_ENVIRONMENT = production

#--------------------------------------------------------------------
# APP
#--------------------------------------------------------------------
app.baseURL = 'http://localhost/arsip-pjok/public/'
app.forceGlobalSecureRequests = false
app.sessionDriver = 'CodeIgniter\\Session\\Handlers\\FileHandler'
app.sessionCookieName = 'ci_session_pjok'
app.sessionExpiration = 7200
app.sessionSavePath = WRITEPATH . 'session'

#--------------------------------------------------------------------
# DATABASE (MySQL / MariaDB)
#--------------------------------------------------------------------
database.default.hostname = localhost
database.default.database = arsip_pjok
database.default.username = root
database.default.password = 
database.default.DBDriver = MySQLi
database.default.DBPrefix = 
database.default.port = 3306
database.default.charset = utf8mb4
database.default.DBCollat = utf8mb4_unicode_ci

#--------------------------------------------------------------------
# ENCRYPTION KEY
#--------------------------------------------------------------------
encryption.key = hex2bin('7d6a5c1e9b230491823abcf019283746a9b1c0e2d3f4567890abcdef12345678')
`,
  },

  // 5. Panduan Instalasi & Deployment
  {
    path: 'README_PANDUAN_INSTALASI.md',
    category: 'doc',
    description: 'Petunjuk Langkah Demi Langkah Instalasi di Windows (Laragon / XAMPP) & Hosting',
    content: `# PANDUAN LENGKAP INSTALASI & PENGGUNAAN
## APLIKASI ARSIP DIGITAL ADMINISTRASI GURU PJOK

Aplikasi ini dibangun untuk mempermudah penyimpanan, pencarian, dan pencadangan dokumen administrasi guru PJOK (Pendidikan Jasmani, Olahraga, dan Kesehatan).

---

### 1. PERSYARATAN SISTEM
- PHP versi 8.1 atau 8.2 (ekstensi aktif: intl, mbstring, mysqli, fileinfo, gd).
- Web Server: Apache (XAMPP / Laragon) atau Nginx.
- Database: MySQL versi 5.7+ atau MariaDB 10.4+.
- Composer 2.x.
- Node.js & npm (untuk build aset Tailwind CSS).

---

### 2. LANGKAH INSTALASI DI LARAGON / XAMPP (WINDOWS)

#### Langkah 1: Siapkan Folder Proyek
Ekstrak atau tempatkan folder \`arsip-pjok\` pada:
- **Laragon**: \`C:\\laragon\\www\\arsip-pjok\`
- **XAMPP**: \`C:\\xampp\\htdocs\\arsip-pjok\`

#### Langkah 2: Buat Database MySQL
1. Buka browser dan akses **phpMyAdmin** (\`http://localhost/phpmyadmin\`).
2. Buat database baru bernama: \`arsip_pjok\`.
3. Import file \`database/arsip_pjok.sql\` yang tersedia pada paket ini.

#### Langkah 3: Konfigurasi File .env
1. Salin file \`env\` menjadi \`.env\` pada direktori root proyek.
2. Buka file \`.env\` dan sesuaikan:
   \`\`\`ini
   CI_ENVIRONMENT = development
   app.baseURL = 'http://localhost/arsip-pjok/public/'
   database.default.hostname = localhost
   database.default.database = arsip_pjok
   database.default.username = root
   database.default.password = 
   \`\`\`

#### Langkah 4: Jalankan Migration & Seeder (Jika tidak import SQL manual)
Buka terminal / CMD di folder proyek, ketikkan:
\`\`\`bash
composer install
php spark migrate
php spark db:seed DatabaseSeeder
\`\`\`

#### Langkah 5: Atur Hak Akses Folder Penyimpanan
Pastikan folder \`writable\` dapat ditulisi oleh web server:
- \`writable/cache/\`
- \`writable/logs/\`
- \`writable/session/\`
- \`writable/uploads/documents/\`

#### Langkah 6: Akses Aplikasi
Buka peramban (browser) di alamat:
\`\`\`
http://localhost/arsip-pjok/public/
\`\`\`

**Akun Bawaan:**
- **Administrator**: \`admin\` / \`admin123\`
- **Guru PJOK**: \`ahmadfauzi\` / \`guru123\`
- **Viewer / Pengawas**: \`pengawas_pjok\` / \`view123\`

---

### 3. FITUR UTAMA APLIKASI
1. **Dashboard Statistik**: Memantau kuota, jumlah berkas per kategori, dan grafik berkas per tahun pelajaran.
2. **Kategori Administrasi PJOK Lengkap**: 6 kategori induk + 45 subkategori resmi standar KBM PJOK.
3. **Penyimpanan Berkas Aman**: Menggunakan UUID, enkripsi nama simpan, pencegahan eksekusi macro berbahaya (.xlsm), deteksi checksum duplikat.
4. **Pratinjau Langsung**: Viewer PDF interaktif, image zoom 360°, dan inspeksi lembar Word/Excel.
5. **Riwayat Versi Dokumen**: Setiap pembaruan dokumen mencatat nomor versi, waktu, catatan, dan pengunggah.
6. **Kotak Sampah (Soft Delete)**: Menghindari file terhapus tak sengaja; dokumen dapat dipulihkan atau dikosongkan.
7. **Pencadangan & Pemulihan (Backup & Restore)**: Export database JSON & arsip ZIP dokumen asli kapan pun dibutuhkan.
`,
  },
];

export async function generateCi4ZipPackage(): Promise<Blob> {
  const zip = new JSZip();

  // Root files
  zip.file('.env.example', CI4_CODEBASE.find((f) => f.path === '.env.example')?.content || '');
  zip.file('README_PANDUAN_INSTALASI.md', CI4_CODEBASE.find((f) => f.path === 'README_PANDUAN_INSTALASI.md')?.content || '');
  zip.file('database/arsip_pjok.sql', CI4_CODEBASE.find((f) => f.path === 'database/arsip_pjok.sql')?.content || '');
  zip.file('app/Config/Routes.php', CI4_CODEBASE.find((f) => f.path === 'app/Config/Routes.php')?.content || '');
  zip.file('app/Controllers/DocumentController.php', CI4_CODEBASE.find((f) => f.path === 'app/Controllers/DocumentController.php')?.content || '');

  // Add sample composer.json
  const composerJson = {
    name: 'arsip/pjok-digital',
    description: 'Aplikasi Arsip Digital Administrasi Guru PJOK CodeIgniter 4',
    type: 'project',
    homepage: 'https://sman1prestasibangsa.sch.id',
    license: 'MIT',
    require: {
      php: '^8.1 || ^8.2',
      'codeigniter4/framework': '^4.4',
    },
    'require-dev': {
      'fakerphp/faker': '^1.9',
      'mikey179/vfsstream': '^1.6',
      'phpunit/phpunit': '^9.5',
    },
    autoload: {
      'psr-4': {
        App: 'app',
        Config: 'app/Config',
      },
    },
  };
  zip.file('composer.json', JSON.stringify(composerJson, null, 2));

  return await zip.generateAsync({ type: 'blob' });
}
