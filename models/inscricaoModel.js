/**
 * Model responsável pelo acesso à tabela `inscricoes`.
 */
const pool = require('../config/db');

const InscricaoModel = {
  /**
   * Cria uma nova inscrição.
   * @async
   * @param {number} usuarioId ID do participante.
   * @param {number} eventoId ID do evento.
   * @returns {Promise<number>} ID da inscrição criada.
   * @throws {Error} Caso ocorra falha na query.
   */
  async criar(usuarioId, eventoId) {
    const [result] = await pool.execute(
      'INSERT INTO inscricoes (usuario_id, evento_id) VALUES (?, ?)',
      [usuarioId, eventoId]
    );
    return result.insertId;
  },

  /**
   * Verifica se um usuário já está inscrito em um evento.
   * @async
   * @param {number} usuarioId ID do participante.
   * @param {number} eventoId ID do evento.
   * @returns {Promise<boolean>} true se já existe inscrição.
   * @throws {Error} Caso ocorra falha na query.
   */
  async existeInscricao(usuarioId, eventoId) {
    const [rows] = await pool.execute(
      'SELECT id FROM inscricoes WHERE usuario_id = ? AND evento_id = ?',
      [usuarioId, eventoId]
    );
    return rows.length > 0;
  },

  /**
   * Lista as inscrições de um participante, com dados do evento.
   * @async
   * @param {number} usuarioId ID do participante.
   * @returns {Promise<Array<Object>>} Lista de inscrições.
   * @throws {Error} Caso ocorra falha na query.
   */
  async listarPorUsuario(usuarioId) {
    const [rows] = await pool.execute(
      `SELECT i.*, e.titulo, e.data_evento, e.horario, e.local
       FROM inscricoes i
       JOIN eventos e ON e.id = i.evento_id
       WHERE i.usuario_id = ?
       ORDER BY e.data_evento ASC`,
      [usuarioId]
    );
    return rows;
  },

  /**
   * Lista os inscritos de um evento, com dados do participante.
   * @async
   * @param {number} eventoId ID do evento.
   * @returns {Promise<Array<Object>>} Lista de inscritos.
   * @throws {Error} Caso ocorra falha na query.
   */
  async listarPorEvento(eventoId) {
    const [rows] = await pool.execute(
      `SELECT i.*, u.nome, u.email
       FROM inscricoes i
       JOIN usuarios u ON u.id = i.usuario_id
       WHERE i.evento_id = ?
       ORDER BY i.data_inscricao ASC`,
      [eventoId]
    );
    return rows;
  },

  /**
   * Conta quantas inscrições um evento possui.
   * @async
   * @param {number} eventoId ID do evento.
   * @returns {Promise<number>} Total de inscritos.
   * @throws {Error} Caso ocorra falha na query.
   */
  async contarPorEvento(eventoId) {
    const [rows] = await pool.execute(
      'SELECT COUNT(*) AS total FROM inscricoes WHERE evento_id = ?',
      [eventoId]
    );
    return rows[0].total;
  },

  /**
   * Cancela (exclui) uma inscrição de um usuário em um evento.
   * @async
   * @param {number} usuarioId ID do participante.
   * @param {number} eventoId ID do evento.
   * @returns {Promise<boolean>} true se cancelada com sucesso.
   * @throws {Error} Caso ocorra falha na query.
   */
  async cancelar(usuarioId, eventoId) {
    const [result] = await pool.execute(
      'DELETE FROM inscricoes WHERE usuario_id = ? AND evento_id = ?',
      [usuarioId, eventoId]
    );
    return result.affectedRows > 0;
  },
};

module.exports = InscricaoModel;
