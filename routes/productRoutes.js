// routes/admin/products.js
const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { ROLES } = require('../config/roles');
const { ensureAuthenticated, hasRole } = require('../middleware/authMiddleware');
const canManageCategories = hasRole([ROLES.ADMIN, ROLES.MODERATOR]);

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


// Tüm admin/products altındaki rotalar için yetkilendirme (örnek)
// router.use(isAdmin);

// Ürünleri Listele
router.get('/',ensureAuthenticated,canManageCategories, productController.listProducts);

// Yeni Ürün Ekleme Formu
router.get('/add',ensureAuthenticated,canManageCategories, productController.showCreateForm);

// Yeni Ürün Oluşturma İşlemi
// Resim yükleme varsa upload middleware'i araya eklenir:
// router.post('/', upload.single('featured_image'), productController.createProduct);
router.post('/add',ensureAuthenticated,canManageCategories, productController.createProduct);

// Ürün Düzenleme Formu
router.get('/edit/:id',ensureAuthenticated,canManageCategories, productController.showEditForm);

// Ürün Güncelleme İşlemi
// Resim yükleme varsa:
// router.put('/:id', upload.single('featured_image'), productController.updateProduct);
// Not: HTML formları PUT desteklemez, method-override veya POST kullanın.
router.post('/edit/:id',ensureAuthenticated,canManageCategories, productController.updateProduct); // method-override ile
// VEYA
// router.post('/:id/update', productController.updateProduct); // Ayrı bir POST rotası ile

// Ürün Silme İşlemi
router.post('/delete/:id', ensureAuthenticated,canManageCategories, productController.deleteProduct);

// VEYA
// router.post('/:id/delete', productController.deleteProduct); // Ayrı bir POST rotası ile


module.exports = router;