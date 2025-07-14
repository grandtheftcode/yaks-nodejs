// routes/themeRoutes.js
const express = require('express');
const router = express.Router();
const themeController = require('../controllers/themeController').themeController;
const multer = require('multer');
const { ROLES } = require('../config/roles');
const path = require('path');
const { ensureAuthenticated, hasRole } = require('../middleware/authMiddleware');
const canManagePages = hasRole([ROLES.ADMIN]);
const fs = require('fs');

const carouselStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = path.join(__dirname, '../themes/'+ file.originalname.split(".yakstil")[0]); // Carousel yükleme klasörü
        fs.mkdirSync(uploadPath, { recursive: true });
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const extension = path.extname(file.originalname.replace(".yakstil",".zip"));
        // Dosya adı: carousel-167888...987.png
        cb(null, file.originalname.replace(".yakstil",".zip"));
    }
});


const uploadCarouselImage = multer({
    storage: carouselStorage,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});



// Kullanıcı Yönetimi Rotaları (/admin/themes altında çalışacak şekilde planlıyoruz)

router.post('/upload',ensureAuthenticated,canManagePages, uploadCarouselImage.single('file'),themeController.uploadThemeZip); // Örnek: POST /api/themes/upload

// GET /admin/themes -> Tüm kullanıcıları listele (Controller: listUsers)
router.get('/',ensureAuthenticated,canManagePages,  themeController.listThemes);


module.exports = router;