// config/database.js
const knex = require('knex');
const knexfile = require('../knexfile'); // Ana dizindeki knexfile.js'yi kullan

// Ortam değişkenine göre uygun yapılandırmayı seç
// NODE_ENV ayarlanmamışsa 'development' varsayalım
const environment = process.env.NODE_ENV || 'development';
const config = knexfile[environment];

// Knex instance'ını oluştur ve export et
module.exports = knex(config);