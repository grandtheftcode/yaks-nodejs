// routes/carouselRoutes.js
const express = require('express');
const router = express.Router();
const carouselController = require('../controllers/carouselController');
const { ROLES } = require('../config/roles');
const { ensureAuthenticated, hasRole } = require('../middleware/authMiddleware');

// --- Multer Yapılandırması (Dosya Yükleme İçin) ---
// Controller'daki config'i buraya kopyalayalım veya ayrı bir config dosyasından import edelim.
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const carouselStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = path.join(__dirname, '../public/uploads/carousel');
        fs.mkdirSync(uploadPath, { recursive: true });
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const extension = path.extname(file.originalname);
        cb(null, 'carousel-' + uniqueSuffix + extension);
    }
});
const carouselFileFilter = (req, file, cb) => { if (file.mimetype.startsWith('image/')) { cb(null, true); } else { cb(new Error('Only image files are allowed for carousel!'), false); } };
const uploadCarouselImage = multer({ storage: carouselStorage, fileFilter: carouselFileFilter, limits: { fileSize: 5 * 1024 * 1024 } });
// --- /Multer Yapılandırması ---


// --- Carousel Yönetimi Rotaları (/admin/carousel altında çalışacak) ---

// Carousel'i yönetmek için en az Moderatör rolü gerekli olsun.
const canManageCarousel = hasRole([ROLES.ADMIN, ROLES.MODERATOR]);

// GET /admin/carousel -> Carousel yönetim sayfasını göster
router.get('/', ensureAuthenticated, canManageCarousel, carouselController.manageSlides);

// POST /admin/carousel/add -> Yeni slayt ekle (Dosya yükleme ile)
// uploadCarouselImage.single('image_path') middleware'i burada kullanılır.
// 'image_path' formdaki dosya input'unun name attribute'u olmalı.
router.post('/add',
    ensureAuthenticated,
    canManageCarousel,
    uploadCarouselImage.single('image_path'), // Tek dosya yükle
    carouselController.addSlide
);

// GET /admin/carousel/edit/:id -> Düzenleme formunu göster
router.get('/edit/:id', ensureAuthenticated, canManageCarousel, carouselController.showEditForm);

// POST /admin/carousel/edit/:id -> Slaytı güncelle (Dosya yükleme dahil)
// Güncellemede de yeni dosya yüklenebilir, bu yüzden multer burada da gerekli.
router.post('/edit/:id',
    ensureAuthenticated,
    canManageCarousel,
    uploadCarouselImage.single('image_path'), // Tek dosya yükle (aynı input name)
    carouselController.updateSlide
);

// POST /admin/carousel/update-order -> Slaytların sırasını güncelle (AJAX)
router.post('/update-order', ensureAuthenticated, canManageCarousel, carouselController.updateOrder);

// POST /admin/carousel/delete/:id -> Slaytı sil (Sadece Admin?)
const canDeleteCarousel = hasRole([ROLES.ADMIN]); // Silme yetkisini sadece Admin'e verelim
router.post('/delete/:id', ensureAuthenticated, canDeleteCarousel, carouselController.deleteSlide);


module.exports = router;