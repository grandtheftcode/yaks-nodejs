// routes/menuRoutes.js
const express = require('express');
const router = express.Router();
const menuController = require('../controllers/menuController');
const { ROLES } = require('../config/roles');
const { ensureAuthenticated, hasRole } = require('../middleware/authMiddleware');

// --- Menü Yönetimi Rotaları (/admin/menus altında çalışacak) ---

// Menüleri yönetmek için sadece Admin rolü gerekli olsun.
const canManageMenus = hasRole([ROLES.ADMIN]);

// --- Menü Konumları ---
// GET /admin/menus -> Menü konumlarını listele
router.get('/', ensureAuthenticated, canManageMenus, menuController.listMenus);

// GET /admin/menus/add -> Menü konumu ekleme formunu göster
router.get('/add', ensureAuthenticated, canManageMenus, menuController.showAddMenuForm);

// POST /admin/menus/add -> Yeni menü konumu ekle
router.post('/add', ensureAuthenticated, canManageMenus, menuController.addMenu);

// (Menü konumu düzenleme/silme rotaları buraya eklenebilir)
// router.get('/:menuId/edit', ensureAuthenticated, canManageMenus, menuController.showEditMenuForm);
// router.post('/:menuId/edit', ensureAuthenticated, canManageMenus, menuController.updateMenu);
// router.post('/:menuId/delete', ensureAuthenticated, canManageMenus, menuController.deleteMenu);


// --- Belirli Bir Menünün Öğeleri ---
// GET /admin/menus/:menuId/items -> Menü öğesi yönetim arayüzünü göster
router.get('/items/:menuId', ensureAuthenticated, canManageMenus, menuController.manageMenuItems);

// POST /admin/menus/:menuId/items/add -> Yeni menü öğesi ekle
router.post('/items/:menuId/add', ensureAuthenticated, canManageMenus, menuController.addMenuItem);

// POST /admin/menus/:menuId/items/update-order -> Öğelerin sırasını/hiyerarşisini güncelle (AJAX)
router.post('/items/:menuId/update-order', ensureAuthenticated, canManageMenus, menuController.updateItemsOrder);


// --- Tekil Menü Öğesi İşlemleri (Ayrı düzenleme sayfası kullanılıyorsa) ---
// GET /admin/menus/items/:itemId/edit -> Menü öğesi düzenleme formunu göster
router.get('/items/:itemId/edit', ensureAuthenticated, canManageMenus, menuController.showEditMenuItemForm);

// POST /admin/menus/items/:itemId/edit -> Menü öğesini güncelle
router.post('/items/:itemId/edit', ensureAuthenticated, canManageMenus, menuController.updateMenuItem);

// POST /admin/menus/items/:itemId/delete -> Menü öğesini sil
router.post('/items/:itemId/delete', ensureAuthenticated, canManageMenus, menuController.deleteMenuItem);


module.exports = router;