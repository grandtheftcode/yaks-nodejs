// routes/blogRoutes.js
const express = require('express');
const router = express.Router();
const blogPostController = require('../controllers/blogPostController');
const { ROLES } = require('../config/roles');
const { ensureAuthenticated, hasRole } = require('../middleware/authMiddleware');

// --- Blog Yönetimi Rotaları (/admin/blog altında çalışacak) ---

// Blog yazılarını görmek için en az Editör rolü gerekli olsun.
const canViewPosts = hasRole([ROLES.ADMIN, ROLES.MODERATOR, ROLES.EDITOR]);
// Yazı eklemek/düzenlemek/silmek için de en az Editör rolü gerekli olsun.
// (Daha detaylı yetkilendirme Controller içinde yapılabilir - örn: sadece kendi yazısını düzenleme)
const canManagePosts = hasRole([ROLES.ADMIN, ROLES.MODERATOR, ROLES.EDITOR]);

// GET /admin/blog -> Blog yazılarını listele (sayfalama query string ile, örn: ?page=2)
router.get('/', ensureAuthenticated, canViewPosts, blogPostController.listPosts);

// GET /admin/blog/add -> Yazı ekleme formunu göster
router.get('/add', ensureAuthenticated, canManagePosts, blogPostController.showAddForm);

// POST /admin/blog/add -> Yeni yazı ekle
router.post('/add', ensureAuthenticated, canManagePosts, blogPostController.addPost);

// GET /admin/blog/edit/:id -> Düzenleme formunu göster
router.get('/edit/:id', ensureAuthenticated, canManagePosts, blogPostController.showEditForm);
// Not: Controller içinde ek yetki kontrolü (kendi yazısı mı?) yapılmalı!

// POST /admin/blog/edit/:id -> Yazıyı güncelle
router.post('/edit/:id', ensureAuthenticated, canManagePosts, blogPostController.updatePost);
// Not: Controller içinde ek yetki kontrolü (kendi yazısı mı?) yapılmalı!

// POST /admin/blog/delete/:id -> Yazıyı sil
router.post('/delete/:id', ensureAuthenticated, canManagePosts, blogPostController.deletePost);
// Not: Controller içinde ek yetki kontrolü (kendi yazısı mı? veya sadece Admin/Mod?) yapılmalı!

module.exports = router;