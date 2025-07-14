// knexfile.js
require('dotenv').config(); // .env dosyasındaki değişkenleri yükle

module.exports = {
  development: {
    client: process.env.DB_CLIENT || 'mysql',
    connection: {
      host: process.env.DB_HOST || '127.0.0.1',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'digital_intelegence'
    },
    migrations: {
      tableName: 'knex_migrations', // Migration geçmişini tutan tablo adı
      directory: './db/migrations' // Migration dosyalarının konumu (henüz oluşturmadık)
    },
    seeds: {
      directory: './db/seeds' // Seed (başlangıç verisi) dosyalarının konumu (henüz oluşturmadık)
    }
  },

  // İleride production veya staging ortamları için de benzer yapılandırmalar ekleyebilirsin
  // production: { ... }
};