/**
 * Model responsável pelo acesso à tabela `eventos`.
 */
const pool = require('../config/db');

const EventoModel = {
  /**
   * Cria um novo evento.
   * @async
   * @param {Object} dados Dados do evento.
   * @returns {Promise<number>} ID do evento criado.
   * @throws {Error} Caso ocorra falha na query.
   */
  async criar({ titulo, descricao, dataEvento, horario, local, capacidade, usuarioId }) {
    const [result] = await pool.execute(
      `INSERT INTO eventos (titulo, descricao, data_evento, horario, local, capacidade, usuario_id)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [titulo, descricao, dataEvento, horario, local, capacidade, usuarioId]
    );
    return result.insertId;
  },

  /**
   * Lista todos os eventos, do mais recente (por data) para o mais antigo,
   * incluindo o total de inscritos.
   * @async
   * @returns {Promise<Array<Object>>} Lista de eventos.
   * @throws {Error} Caso ocorra falha na query.
   */
  async listarTodos() {
    const [rows] = await pool.execute(
      `SELECT e.*, u.nome AS organizador_nome,
              (SELECT COUNT(*) FROM inscricoes i WHERE i.evento_id = e.id) AS total_inscritos
       FROM eventos e
       JOIN usuarios u ON u.id = e.usuario_id
       ORDER BY e.data_evento ASC`
    );
    return rows;
  },

  /**
   * Lista eventos criados por um organizador específico.
   * @async
   * @param {number} usuarioId ID do organizador.
   * @returns {Promise<Array<Object>>} Lista de eventos.
   * @throws {Error} Caso ocorra falha na query.
   */
  async listarPorOrganizador(usuarioId) {
    const [rows] = await pool.execute(
      `SELECT e.*,
              (SELECT COUNT(*) FROM inscricoes i WHERE i.evento_id = e.id) AS total_inscritos
       FROM eventos e
       WHERE e.usuario_id = ?
       ORDER BY e.data_evento ASC`,
      [usuarioId]
    );
    return rows;
  },

  /**
   * Busca um evento pelo ID.
   * @async
   * @param {number} id ID do evento.
   * @returns {Promise<Object|null>} Evento encontrado ou null.
   * @throws {Error} Caso ocorra falha na query.
   */
  async buscarPorId(id) {
    const [rows] = await pool.execute(
      `SELECT e.*, u.nome AS organizador_nome,
              (SELECT COUNT(*) FROM inscricoes i WHERE i.evento_id = e.id) AS total_inscritos
       FROM eventos e
       JOIN usuarios u ON u.id = e.usuario_id
       WHERE e.id = ?`,
      [id]
    );
    return rows.length ? rows[0] : null;
  },

  /**
   * Atualiza os dados de um evento.
   * @async
   * @param {number} id ID do evento.
   * @param {Object} dados Novos dados do evento.
   * @returns {Promise<boolean>} true se atualizado com sucesso.
   * @throws {Error} Caso ocorra falha na query.
   */
  async atualizar(id, { titulo, descricao, dataEvento, horario, local, capacidade }) {
    const [result] = await pool.execute(
      `UPDATE eventos
       SET titulo = ?, descricao = ?, data_evento = ?, horario = ?, local = ?, capacidade = ?
       WHERE id = ?`,
      [titulo, descricao, dataEvento, horario, local, capacidade, id]
    );
    return result.affectedRows > 0;
  },

  /**
   * Exclui um evento pelo ID.
   * @async
   * @param {number} id ID do evento.
   * @returns {Promise<boolean>} true se excluído com sucesso.
   * @throws {Error} Caso ocorra falha na query.
   */
  async excluir(id) {
    const [result] = await pool.execute('DELETE FROM eventos WHERE id = ?', [id]);
    return result.affectedRows > 0;
  },
};

module.exports = EventoModel;
