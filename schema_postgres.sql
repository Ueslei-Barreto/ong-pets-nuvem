-- ============================================================
-- ONG Pets na Nuvem - Schema PostgreSQL (Supabase)
-- Execute no SQL Editor do Supabase, de uma vez.
-- ============================================================

-- ------------------------------------------------------------
-- 1. ONGs  (tabela nova - o coracao da mudanca multi-organizacao)
-- ------------------------------------------------------------
CREATE TABLE ongs (
  id            SERIAL PRIMARY KEY,
  nome          VARCHAR(150) NOT NULL,
  cnpj          VARCHAR(18) UNIQUE,
  email_contato VARCHAR(150),
  telefone      VARCHAR(20),
  cep           VARCHAR(9),
  logradouro    VARCHAR(200),
  bairro        VARCHAR(100),
  cidade        VARCHAR(100),
  uf            CHAR(2),
  descricao     TEXT,
  ativa         BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------
-- 2. Usuarios  (cada admin pertence a UMA ong)
-- ------------------------------------------------------------
CREATE TABLE usuarios (
  id         SERIAL PRIMARY KEY,
  ong_id     INT NOT NULL REFERENCES ongs(id) ON DELETE CASCADE,
  nome       VARCHAR(100) NOT NULL,
  email      VARCHAR(150) NOT NULL UNIQUE,
  senha_hash VARCHAR(255) NOT NULL,
  role       VARCHAR(20) DEFAULT 'admin',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------
-- 3. Pets  (ganha ong_id e adotado_em)
-- ------------------------------------------------------------
CREATE TABLE pets (
  id         SERIAL PRIMARY KEY,
  ong_id     INT NOT NULL REFERENCES ongs(id) ON DELETE CASCADE,
  nome       VARCHAR(100) NOT NULL,
  especie    VARCHAR(50)  NOT NULL,
  raca       VARCHAR(100),
  idade_anos INT,
  porte      VARCHAR(20),
  sexo       VARCHAR(15),
  descricao  TEXT,
  foto_url   VARCHAR(500),
  vacinado   BOOLEAN DEFAULT FALSE,
  castrado   BOOLEAN DEFAULT FALSE,
  status     VARCHAR(20) DEFAULT 'disponivel',
  usuario_id INT REFERENCES usuarios(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  adotado_em TIMESTAMPTZ          -- usado no indicador de tempo medio ate a adocao
);

CREATE INDEX idx_pets_ong    ON pets(ong_id);
CREATE INDEX idx_pets_status ON pets(status);

-- ------------------------------------------------------------
-- 4. Adocoes  (ong_id redundante de proposito: evita join no filtro)
-- ------------------------------------------------------------
CREATE TABLE adocoes (
  id             SERIAL PRIMARY KEY,
  pet_id         INT NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  ong_id         INT NOT NULL REFERENCES ongs(id) ON DELETE CASCADE,
  nome_adotante  VARCHAR(100) NOT NULL,
  email_adotante VARCHAR(150) NOT NULL,
  telefone       VARCHAR(20),
  mensagem       TEXT,
  status         VARCHAR(20) DEFAULT 'pendente',
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_adocoes_ong ON adocoes(ong_id);

-- ------------------------------------------------------------
-- 5. Dados de demonstracao: 3 ONGs, 3 admins, 6 pets
--    Senha de todos os admins: admin123
-- ------------------------------------------------------------
INSERT INTO ongs (nome, cnpj, email_contato, telefone, cep, logradouro, bairro, cidade, uf, descricao) VALUES
  ('Patas do Vale',    '11.111.111/0001-11', 'contato@patasdovale.org',  '(12) 3921-0001', '12244-000', 'Av. Shishima Hifumi', 'Urbanova',  'Sao Jose dos Campos', 'SP', 'Resgate e reabilitacao de caes e gatos em situacao de rua.'),
  ('Amigo Fiel',       '22.222.222/0001-22', 'contato@amigofiel.org',    '(12) 3653-0002', '12308-000', 'Rua Barao de Jacareí', 'Centro',   'Jacarei',             'SP', 'Lar temporario e feiras de adocao mensais.'),
  ('Recanto Animal',   '33.333.333/0001-33', 'contato@recantoanimal.org','(12) 3132-0003', '12516-000', 'Rua Coronel Moreira', 'Centro',    'Guaratingueta',       'SP', 'Castracao solidaria e adocao responsavel.');

INSERT INTO usuarios (ong_id, nome, email, senha_hash, role) VALUES
  (1, 'Admin Patas do Vale',  'admin@patasdovale.org',   '$2a$10$awf05Qi1FK4HGVEb0hq7e.gsbsM8ZbAgRaIs/mmwevSUt8YYL8.uG', 'admin'),
  (2, 'Admin Amigo Fiel',     'admin@amigofiel.org',     '$2a$10$awf05Qi1FK4HGVEb0hq7e.gsbsM8ZbAgRaIs/mmwevSUt8YYL8.uG', 'admin'),
  (3, 'Admin Recanto Animal', 'admin@recantoanimal.org', '$2a$10$awf05Qi1FK4HGVEb0hq7e.gsbsM8ZbAgRaIs/mmwevSUt8YYL8.uG', 'admin');

INSERT INTO pets (ong_id, nome, especie, raca, idade_anos, porte, sexo, descricao, vacinado, castrado, status, usuario_id) VALUES
  (1, 'Rex',     'cachorro', 'Labrador',   2, 'grande',  'macho', 'Docil e brincalhao, adora criancas.',        TRUE,  FALSE, 'disponivel', 1),
  (1, 'Mel',     'gato',     'Siames',     1, 'pequeno', 'femea', 'Carinhosa e tranquila.',                     TRUE,  TRUE,  'disponivel', 1),
  (2, 'Bolinha', 'cachorro', 'Vira-lata',  3, 'medio',   'macho', 'Muito inteligente e obediente.',             TRUE,  TRUE,  'disponivel', 2),
  (2, 'Nina',    'gato',     'SRD',        2, 'pequeno', 'femea', 'Convive bem com outros gatos.',              TRUE,  TRUE,  'disponivel', 2),
  (3, 'Thor',    'cachorro', 'Pastor',     4, 'grande',  'macho', 'Precisa de espaco e caminhadas diarias.',    TRUE,  TRUE,  'disponivel', 3),
  (3, 'Luna',    'cachorro', 'Vira-lata',  1, 'pequeno', 'femea', 'Filhote resgatada, muito sociavel.',         FALSE, FALSE, 'disponivel', 3);

-- ------------------------------------------------------------
-- 6. Conferencia rapida do isolamento por ONG
-- ------------------------------------------------------------
-- SELECT o.nome AS ong, COUNT(p.id) AS pets
-- FROM ongs o LEFT JOIN pets p ON p.ong_id = o.id
-- GROUP BY o.nome ORDER BY o.nome;
