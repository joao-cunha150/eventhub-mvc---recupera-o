/**
 * Configuração e criação do pool de conexões MySQL.
 * Utiliza variáveis de ambiente para nunca expor credenciais no código.
 */
require('dotenv').config();
const mysql = require('mysql2/promise');

const sslConfig = process.env.DB_SSL === 'true'
  ? { rejectUnauthorized: false }
  : undefined;

/**
 * Pool de conexões reutilizável com o banco MySQL.
 * @type {import('mysql2/promise').Pool}
 */
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4',
  ssl: sslConfig,
});

module.exports = pool;
