# ONG Pets na Nuvem — Backend v2

API multi-ONG em Node.js/Express sobre PostgreSQL gerenciado (Supabase), publicada no Render.

---

## O que mudou em relação à v1

| v1 (local) | v2 (nuvem) |
|---|---|
| SQL Server + pacote `mssql` | PostgreSQL + pacote `pg` |
| `pool.request().input()` | parâmetros posicionais `$1, $2` |
| `OUTPUT INSERTED.*` | `RETURNING *` |
| `GETDATE()` / `BIT` / `NVARCHAR` | `NOW()` / `BOOLEAN` / `VARCHAR` |
| fotos em `uploads/` no disco | Supabase Storage (o disco do Render é efêmero) |
| uma única ONG | `ong_id` em usuários, pets e adoções |
| CORS fixo em `localhost:3000` | lista de origens via `CORS_ORIGINS` |
| — | importação CSV em massa |
| — | integração ViaCEP |
| — | painel de indicadores |

O token JWT agora carrega `ong_id`. É ele que garante o isolamento: toda query
administrativa filtra por `ong_id`, então uma ONG nunca enxerga os dados da outra.

---

## Passo a passo

### 1. Banco no Supabase

1. Crie um projeto em supabase.com (região South America / São Paulo).
2. Abra **SQL Editor** e cole o conteúdo de `src/config/schema_postgres.sql`. Execute.
3. Confirme em **Table Editor** que existem 4 tabelas: `ongs`, `usuarios`, `pets`, `adocoes`.

### 2. Storage das fotos

1. **Storage → New bucket**, nome `pets`.
2. Marque o bucket como **Public** (as fotos aparecem no catálogo público).

### 3. Variáveis de ambiente

Copie `.env.example` para `.env` e preencha:

| Variável | Onde encontrar |
|---|---|
| `DATABASE_URL` | Project Settings → Database → Connection string → Node.js |
| `SUPABASE_URL` | Project Settings → API → Project URL |
| `SUPABASE_SERVICE_KEY` | Project Settings → API → `service_role` |
| `JWT_SECRET` | invente uma string longa e aleatória |
| `CORS_ORIGINS` | `http://localhost:3000` em dev; adicione a URL da Vercel depois |

A `service_role` key ignora as regras de acesso do Supabase. Ela só pode existir no
backend. Nunca coloque no frontend nem comite no Git.

### 4. Rodar local

```bash
npm install
npm run dev
```

Teste: `curl localhost:5000/pets` deve retornar os 6 pets de demonstração.

Logins de demonstração (senha `admin123` nos três):
`admin@patasdovale.org`, `admin@amigofiel.org`, `admin@recantoanimal.org`

### 5. Publicar no Render

1. **New → Web Service**, conecte o repositório.
2. Root Directory: `backend` · Build: `npm install` · Start: `npm start`
3. Em **Environment**, cadastre todas as variáveis do `.env` (menos `PORT`, que o Render define).
4. Depois do deploy, acrescente a URL da Vercel em `CORS_ORIGINS`.

O plano gratuito hiberna após 15 min sem tráfego. Configure um monitor gratuito
(UptimeRobot) apontando para `/health` a cada 5 minutos. Isso também impede que o
projeto do Supabase seja pausado por inatividade.

---

## Endpoints

### Públicos

| Método | Rota | Descrição |
|---|---|---|
| GET | `/pets` | Catálogo unificado. Filtros: `especie`, `porte`, `sexo`, `status`, `cidade`, `ong_id` |
| GET | `/pets/:id` | Detalhe do pet com os dados de contato da ONG |
| GET | `/ongs` | ONGs ativas com contagem de pets disponíveis |
| GET | `/ongs/cidades` | Cidades com ONG cadastrada (para o filtro) |
| GET | `/ongs/cep/:cep` | Consulta ViaCEP |
| POST | `/ongs` | Cadastra ONG + primeiro administrador |
| POST | `/adocoes` | Solicitação de adoção |
| GET | `/importacao/modelo` | Baixa o CSV modelo |
| GET | `/health` | Usado pelo monitor |

### Autenticados (escopo da ONG do token)

| Método | Rota | Descrição |
|---|---|---|
| POST | `/auth/login` | Retorna token com `ong_id` |
| POST | `/auth/cadastro` | Novo admin dentro da mesma ONG |
| GET | `/pets/meus` | Pets da ONG logada |
| POST/PUT/DELETE | `/pets` `/pets/:id` | CRUD restrito à ONG |
| POST | `/importacao/csv` | Importação em massa (campo `arquivo`) |
| GET | `/adocoes` | Solicitações da ONG |
| PATCH | `/adocoes/:id` | `aprovado` ou `recusado` |
| GET | `/ongs/indicadores` | Painel da ONG |

---

## Ajustes necessários no frontend

1. `.env` → `REACT_APP_API_URL` apontando para a URL do Render.
2. `PetCard.jsx` e `PetDetalhe.jsx`: `foto_url` agora é URL completa do Supabase.
   Remova a concatenação `${API_URL}${pet.foto_url}` e use `pet.foto_url` direto.
3. `GerenciarPets.jsx`: trocar `GET /pets` por `GET /pets/meus`.
4. `Adocoes.jsx`: aprovar/recusar agora é `PATCH /adocoes/:id` (antes era PUT).
5. `AuthContext.jsx`: guardar também `ong_id` e `ong_nome` do login.
6. Telas novas: cadastro de ONG, importação de CSV, filtro por cidade no catálogo,
   e o painel de indicadores no Dashboard.

---

## Formato do CSV

Cabeçalho obrigatório na primeira linha. Aceita vírgula ou ponto-e-vírgula
(o Excel brasileiro exporta com ponto-e-vírgula). `nome` e `especie` são obrigatórios;
o resto é opcional. Campos `vacinado` e `castrado` aceitam `sim`, `s`, `true`, `1` ou `x`.

```
nome,especie,raca,idade_anos,porte,sexo,descricao,vacinado,castrado
Rex,cachorro,Labrador,2,grande,macho,Docil e brincalhao,sim,nao
```

Linhas inválidas são ignoradas e reportadas na resposta com o número da linha.
Se ocorrer erro de banco, a transação inteira sofre rollback e nada é gravado.
