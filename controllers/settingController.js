// controllers/settingController.js
const Setting = require('../models/Setting');
// Dosya yükleme için gerekli modülleri aktif et:
const multer = require('multer');
const path = require('path');
const fs = require('fs'); // Dosya sistemi işlemleri için (dosya var mı, silme vb.)
tc = require('../controllers/themeController.js');






// --- Dosya Yükleme Ayarları ---
// Multer yapılandırmasını aktif et:
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Yüklemelerin yapılacağı klasör (public altında olması önerilir)
        const uploadPath = path.join(__dirname, '../public/uploads/settings');
        // Klasör yoksa oluştur (recursive: true iç içe klasörleri de oluşturur)
        fs.mkdirSync(uploadPath, { recursive: true }); // mkdirSync kullanmak basitlik sağlar ama async daha iyi olabilir
        cb(null, uploadPath); // Hedef klasörü Multer'a bildir
    },
    filename: function (req, file, cb) {
        // Dosya adının çakışmasını önlemek için benzersiz bir isim oluştur.
        // fieldname: formdaki input'un name'i (bizim durumumuzda setting_key olacak)
        const settingKey = file.fieldname;
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const extension = path.extname(file.originalname); // Orijinal dosya uzantısını al
        cb(null, settingKey + '-' + uniqueSuffix + extension); // Yeni dosya adı: site_logo-1678886...987.png
    }
});

// Dosya filtresi: Sadece belirli türdeki dosyaları kabul et
const fileFilter = (req, file, cb) => {
    // Sadece resim dosyalarına izin verelim (mime type kontrolü)
    if (file.mimetype.startsWith('image/')) {
        cb(null, true); // Kabul et
    } else {
        // Kabul etme ve bir hata mesajı gönder (bu hata Multer tarafından yakalanabilir)
        cb(new Error('Only image files (JPEG, PNG, GIF, SVG, WebP) are allowed!'), false);
    }
};

// Multer'ı yapılandırılmış storage ve filtre ile başlat
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // Maksimum dosya boyutu: 5MB
});
// -------------------------------------------------------------

const settingController = {


    showSettingsForm: async (req, res, next) => {
        // ... (bu fonksiyon aynı kalır) ...
        try {
            const settings = await Setting.getAllAsArray();
            res.render('admin/settings/form', {
                title: 'Site Ayarları',
                settings: settings,
                layout: '../views/layouts/admin-layout',
            });
        } catch (error) {
            console.error("Error fetching settings:", error);
            next(error);
        }
    },

    /**
     * Ayarları günceller (Dosya yükleme dahil).
     */
    updateSettings: async (req, res, next) => {
        const settingsData = { ...req.body };
        // Yüklenen dosyalar req.files içinde olacak (upload middleware'i tarafından eklenir)
        const files = req.files;

        try {
            // --- Dosya Yükleme İşlemlerini Aktif Et ---
            if (files) {
                // files nesnesi şöyle görünebilir: { site_logo: [ fileObject ], another_file_input: [ fileObject ] }
                for (const key in files) {
                     if (Object.hasOwnProperty.call(files, key)) {
                         const fileArray = files[key]; // Multer dosyaları dizi içinde gönderir
                         if (fileArray && fileArray.length > 0) {
                             const file = fileArray[0]; // Genellikle tek dosya yüklenir
                             const settingKey = key; // input name'i setting_key varsayıyoruz

                             // 1. Eski dosyayı bul ve sil
                             const oldSetting = await Setting.findByKey(settingKey);
                             if (oldSetting && oldSetting.setting_value && typeof oldSetting.setting_value === 'string') {
                                 // setting_value'nun bir dosya yolu olduğunu varsayalım (örn: /uploads/...)
                                 const oldFilePath = path.join(__dirname, '../public', oldSetting.setting_value);

                                 // Güvenlik: Sadece belirlediğimiz yükleme klasöründeki dosyaları silelim
                                 const uploadDirRelative = '/uploads/settings/'; // Silinebilecek base path
                                 if (oldSetting.setting_value.startsWith(uploadDirRelative) && fs.existsSync(oldFilePath)) {
                                     try {
                                         fs.unlinkSync(oldFilePath); // Eski dosyayı senkron olarak sil
                                         console.log(`Deleted old file: ${oldFilePath}`);
                                     } catch (err) {
                                         console.error(`Could not delete old file ${oldFilePath}:`, err);
                                         // Hata olsa bile devam et, veritabanındaki yolu güncelleyeceğiz.
                                     }
                                 } else if(oldSetting.setting_value.startsWith(uploadDirRelative)) {
                                      console.warn(`Old file path found in DB but file not found on disk: ${oldFilePath}`);
                                 }
                             }

                             // 2. Yeni dosya yolunu veritabanına kaydetmek üzere hazırla
                             // Multer'ın file.path'i tam sistem yoludur, onu public'e göreceli hale getirmeliyiz
                             // Örnek: C:\...\mvc-admin-panel\public\uploads\settings\site_logo-123.png
                             //       -> /uploads/settings/site_logo-123.png
                             const publicDir = path.join(__dirname, '../public');
                             const relativePath = '/' + path.relative(publicDir, file.path).replace(/\\/g, '/'); // Windows için \ karakterini / yap
                             settingsData[settingKey] = relativePath; // Veritabanına kaydedilecek değer
                             console.log(`New file path for ${settingKey}: ${relativePath}`);
                         }
                     }
                }
            }
            // -------------------------------------------

            // Ayarları toplu olarak güncelle
            await Setting.updateBulk(settingsData);

            // Başarı mesajı ve yönlendirme (aynı)
            res.redirect('/admin/settings');

        } catch (error) {
            // Hata yönetimi (aynı)
            console.error("Error updating settings:", error);
            try {
                 const settings = await Setting.getAllAsArray();
                 res.status(500).render('admin/settings/form', {
                     title: 'Site Ayarları',
                     settings: settings,
                     error: 'Failed to update settings. ' + error.message,
                     layout: '../views/layouts/admin-layout'
                 });
             } catch (fetchError) {
                 next(fetchError);
             }
        }


        
        strink = await Setting.getCurrentTemplate()
        tc.applyThemeFile(strink)
    }
};

module.exports = settingController;