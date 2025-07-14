// routes/categoryRoutes.js
const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { ROLES } = require('../config/roles'); // Rol sabitleri
const { ensureAuthenticated, hasRole } = require('../middleware/authMiddleware'); // Auth middleware

// --- Kategori Yönetimi Rotaları (/admin/categories altında çalışacak) ---

// Tüm kategori işlemlerine erişim için en azından Editör rolü gerekli olsun.
// Önce giriş yapılmış mı diye kontrol et (şimdilik formalite), sonra rolü kontrol et.
// !!! ensureAuthenticated şimdilik bir şey yapmıyor, login sistemi eklenince aktifleşecek !!!
const canManageCategories = hasRole([ROLES.ADMIN, ROLES.MODERATOR, ROLES.EDITOR]);

// GET /admin/categories -> Kategorileri listele
router.get('/', ensureAuthenticated, canManageCategories, categoryController.listCategories);

// GET /admin/categories/add -> Kategori ekleme formunu göster
router.get('/add', ensureAuthenticated, canManageCategories, categoryController.showAddForm);

// POST /admin/categories/add -> Yeni kategori ekle
router.post('/add', ensureAuthenticated, canManageCategories, categoryController.addCategory);

// GET /admin/categories/edit/:id -> Düzenleme formunu göster
router.get('/edit/:id', ensureAuthenticated, canManageCategories, categoryController.showEditForm);

// POST /admin/categories/edit/:id -> Kategoriyi güncelle
router.post('/edit/:id', ensureAuthenticated, canManageCategories, categoryController.updateCategory);

// POST /admin/categories/delete/:id -> Kategoriyi sil
// Silme işlemini belki sadece Admin ve Moderatör yapabilsin?
const canDeleteCategories = hasRole([ROLES.ADMIN, ROLES.MODERATOR]);
router.post('/delete/:id', ensureAuthenticated, canDeleteCategories, categoryController.deleteCategory);

module.exports = router;