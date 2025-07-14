// routes/pageRoutes.js
const express = require('express');
const router = express.Router();
const pageController = require('../controllers/pageController');
const { ROLES } = require('../config/roles');
const { ensureAuthenticated, hasRole } = require('../middleware/authMiddleware');

// --- Sabit Sayfa Yönetimi Rotaları (/admin/pages altında çalışacak) ---

// Sabit sayfaları yönetmek için en az Moderatör rolü gerekli olsun.
const canManagePages = hasRole([ROLES.ADMIN, ROLES.MODERATOR]);

// GET /admin/pages -> Sayfaları listele
router.get('/', ensureAuthenticated, canManagePages, pageController.listPages);

// GET /admin/pages/add -> Sayfa ekleme formunu göster
router.get('/add', ensureAuthenticated, canManagePages, pageController.showAddForm);

// POST /admin/pages/add -> Yeni sayfa ekle
router.post('/add', ensureAuthenticated, canManagePages, pageController.addPage);

// GET /admin/pages/edit/:id -> Düzenleme formunu göster
router.get('/edit/:id', ensureAuthenticated, canManagePages, pageController.showEditForm);

// POST /admin/pages/edit/:id -> Sayfayı güncelle
router.post('/edit/:id', ensureAuthenticated, canManagePages, pageController.updatePage);

// POST /admin/pages/delete/:id -> Sayfayı sil (Sadece Admin silebilsin?)
const canDeletePages = hasRole([ROLES.ADMIN]);
router.post('/delete/:id', ensureAuthenticated, canDeletePages, pageController.deletePage);


module.exports = router;