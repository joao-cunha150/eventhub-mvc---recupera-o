/**
 * Model responsável pelo acesso à tabela `usuarios`.
 * Todas as queries utilizam Prepared Statements (mysql2) para evitar SQL Injection.
 */
const pool = require('../config/db');

const UsuarioModel = {
  /**
   * Cria um novo usuário no banco de dados.
   * @async
   * @param {{nome: string, email: string, senhaHash: string, tipoUsuario: string}} dados Dados do usuário.
   * @returns {Promise<number>} ID do usuário criado.
   * @throws {Error} Caso ocorra falha na query.
   */
  async criar({ nome, email, senhaHash, tipoUsuario }) {
    const [result] = await pool.execute(
      'INSERT INTO usuarios (nome, email, senha, tipo_usuario) VALUES (?, ?, ?, ?)',
      [nome, email, senhaHash, tipoUsuario]
    );
    return result.insertId;
  },

  /**
   * Busca um usuário pelo e-mail.
   * @async
   * @param {string} email E-mail do usuário.
   * @returns {Promise<Object|null>} Usuário encontrado ou null.
   * @throws {Error} Caso ocorra falha na query.
   */
  async buscarPorEmail(email) {
    const [rows] = await pool.execute(
      'SELECT * FROM usuarios WHERE email = ?',
      [email]
    );
    return rows.length ? rows[0] : null;
  },

  /**
   * Busca um usuário pelo ID.
   * @async
   * @param {number} id ID do usuário.
   * @returns {Promise<Object|null>} Usuário encontrado ou null.
   * @throws {Error} Caso ocorra falha na query.
   */
  async buscarPorId(id) {
    const [rows] = await pool.execute(
      'SELECT id, nome, email, tipo_usuario, created_at FROM usuarios WHERE id = ?',
      [id]
    );
    return rows.length ? rows[0] : null;
  },
};

module.exports = UsuarioModel;
