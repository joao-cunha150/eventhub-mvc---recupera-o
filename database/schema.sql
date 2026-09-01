-- =========================================================
-- EventHub - Script completo de criação do banco de dados
-- =========================================================

SET NAMES utf8mb4;

CREATE DATABASE IF NOT EXISTS eventhub
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE eventhub;

-- ---------------------------------------------------------
-- Tabela: usuarios
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(150) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  senha VARCHAR(255) NOT NULL,
  tipo_usuario ENUM('organizador', 'participante') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- Tabela: eventos
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS eventos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  titulo VARCHAR(150) NOT NULL,
  descricao TEXT NOT NULL,
  data_evento DATE NOT NULL,
  horario VARCHAR(10) NOT NULL,
  local VARCHAR(200) NOT NULL,
  capacidade INT DEFAULT NULL,
  usuario_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_eventos_usuario
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
    ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- Tabela: inscricoes
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS inscricoes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  evento_id INT NOT NULL,
  data_inscricao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_inscricoes_usuario
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_inscricoes_evento
    FOREIGN KEY (evento_id) REFERENCES eventos(id)
    ON DELETE CASCADE,
  CONSTRAINT uq_inscricao_unica UNIQUE (usuario_id, evento_id)
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- Índices auxiliares
-- ---------------------------------------------------------
CREATE INDEX idx_eventos_usuario ON eventos(usuario_id);
CREATE INDEX idx_inscricoes_evento ON inscricoes(evento_id);
CREATE INDEX idx_inscricoes_usuario ON inscricoes(usuario_id);
