// routes/publicRoutes.js

const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../middleware/authMiddleware'); // Giriş kontrolü için
const authController = require('../controllers/authController');
// Ana Sayfa
router.get('/', authController.home);




// --- Login Rotaları ---

// GET /login -> Login sayfasını göster
router.get('/login', authController.showLoginForm);

// POST /login -> Login işlemini gerçekleştir
router.post('/login', authController.loginUser);

// --- Logout Rotası ---

// GET /logout -> Logout işlemini gerçekleştir
router.get('/logout', ensureAuthenticated, authController.logoutUser); // Logout yapmak için giriş yapmış olmak gerekir

// --- Admin Ana Sayfası (Opsiyonel) ---
// GET /admin -> Admin dashboard'unu göster (giriş yapmış olmayı gerektirir)
// Bu route'u admin route'larından önce tanımlamak önemlidir.
router.get('/admin', ensureAuthenticated, authController.adminDashboard);
// Blog Listesi (sayfalama ile)
router.get('/blog', authController.blogList);

// Tekil Blog Yazısı (slug ile)
router.get('/blog/:slug', authController.blogPost);

// Sabit Sayfa (slug ile)
router.get('/:slug', authController.page);



module.exports = router;