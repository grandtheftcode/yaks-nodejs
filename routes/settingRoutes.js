// routes/settingRoutes.js
const express = require('express');
const router = express.Router();
const settingController = require('../controllers/settingController.js');
const { ROLES } = require('../config/roles');
const { ensureAuthenticated, hasRole } = require('../middleware/authMiddleware');

// --- Multer Yapılandırması (Dosya Yükleme İçin) ---
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = path.join(__dirname, '../public/uploads/settings');
        fs.mkdirSync(uploadPath, { recursive: true }); // Klasör yoksa oluştur
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        const settingKey = file.fieldname; // form input name = setting_key
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const extension = path.extname(file.originalname);
        cb(null, settingKey + '-' + uniqueSuffix + extension);
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) { // Sadece resim kabul et
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed!'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});
// --- /Multer Yapılandırması ---


// --- Ayar Yönetimi Rotaları (/admin/settings altında çalışacak) ---

// Ayarları yönetmek için sadece Admin rolü gerekli olsun.
const canManageSettings = hasRole([ROLES.ADMIN]);

// GET /admin/settings -> Ayarlar formunu göster
router.get('/', ensureAuthenticated, canManageSettings, settingController.showSettingsForm);

// POST /admin/settings -> Ayarları güncelle (Dosya yükleme dahil)
router.post('/',
    ensureAuthenticated,
    canManageSettings,
    // Multer middleware'ini buraya ekle:
    // input_type='file' olan ayarların key'lerini buraya yazın.
    upload.fields([
        { name: 'site_logo', maxCount: 1 },
        // { name: 'site_favicon', maxCount: 1 }, // Örnek
        // Diğer dosya ayarları buraya eklenebilir...
    ]),
    settingController.updateSettings // Multer'dan sonra controller çalışır
);

module.exports = router;