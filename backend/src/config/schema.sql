-- ============================================
-- Schema do banco de dados - ONG Pets
-- SQL Server (T-SQL)
-- Execute no SQL Server Management Studio
-- ============================================

-- 1. Criar o banco de dados
CREATE DATABASE ong_pets;
GO

-- 2. Selecionar o banco
USE ong_pets;
GO

-- 3. Tabela de usuarios (admins da ONG)
CREATE TABLE usuarios (
  id         INT IDENTITY(1,1) PRIMARY KEY,
  nome       NVARCHAR(100) NOT NULL,
  email      NVARCHAR(150) NOT NULL UNIQUE,
  senha_hash NVARCHAR(255) NOT NULL,
  role       NVARCHAR(20) DEFAULT 'admin',
  created_at DATETIME2 DEFAULT GETDATE()
);
GO

-- 4. Tabela de pets
CREATE TABLE pets (
  id         INT IDENTITY(1,1) PRIMARY KEY,
  nome       NVARCHAR(100) NOT NULL,
  especie    NVARCHAR(50)  NOT NULL,
  raca       NVARCHAR(100),
  idade_anos INT,
  porte      NVARCHAR(20),
  sexo       NVARCHAR(15),
  descricao  NVARCHAR(MAX),
  foto_url   NVARCHAR(255),
  vacinado   BIT DEFAULT 0,
  castrado   BIT DEFAULT 0,
  status     NVARCHAR(20) DEFAULT 'disponivel',
  usuario_id INT REFERENCES usuarios(id),
  created_at DATETIME2 DEFAULT GETDATE(),
  updated_at DATETIME2 DEFAULT GETDATE()
);
GO

-- 5. Tabela de solicitacoes de adocao
CREATE TABLE adocoes (
  id             INT IDENTITY(1,1) PRIMARY KEY,
  pet_id         INT REFERENCES pets(id) ON DELETE CASCADE,
  nome_adotante  NVARCHAR(100) NOT NULL,
  email_adotante NVARCHAR(150) NOT NULL,
  telefone       NVARCHAR(20),
  mensagem       NVARCHAR(MAX),
  status         NVARCHAR(20) DEFAULT 'pendente',
  created_at     DATETIME2 DEFAULT GETDATE()
);
GO

-- 6. Admin padrao (senha: admin123)
INSERT INTO usuarios (nome, email, senha_hash, role)
VALUES (
  'Administrador',
  'admin@ongpets.com',
  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
  'admin'
);
GO

-- 7. Pets de exemplo
INSERT INTO pets (nome, especie, raca, idade_anos, porte, sexo, descricao, vacinado, castrado, status)
VALUES
  ('Rex',     'cachorro', 'Labrador',  2, 'grande',  'macho', 'Cachorro docil e brincalhao, adora criancas!', 1, 0, 'disponivel'),
  ('Mel',     'gato',     'Siames',    1, 'pequeno', 'femea', 'Gatinha carinhosa e tranquila.', 1, 1, 'disponivel'),
  ('Bolinha', 'cachorro', 'Vira-lata', 3, 'medio',   'macho', 'Muito inteligente e obediente.', 1, 1, 'disponivel');
GO
