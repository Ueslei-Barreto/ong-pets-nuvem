# Frontend — arquivos da versão em nuvem

Copie os arquivos por cima do seu `frontend/src/`, respeitando os caminhos.
Nenhuma dependência nova: continua React + react-router-dom + axios.

---

## Arquivos NOVOS (2)

| Arquivo | O que é |
|---|---|
| `src/pages/CadastroOng.jsx` | Cadastro público de ONG com o primeiro administrador. Consulta o ViaCEP ao sair do campo CEP e mostra o endereço encontrado. |
| `src/pages/Admin/ImportarCsv.jsx` | Upload da planilha, instruções de formato, link do modelo e tabela com as linhas rejeitadas. |

## Arquivos SUBSTITUÍDOS (9)

| Arquivo | O que mudou |
|---|---|
| `src/App.jsx` | Rotas `/cadastro-ong` e `/admin/importar` |
| `src/components/Navbar.jsx` | Link "Cadastre sua ONG" para visitantes |
| `src/components/AdminSidebar.jsx` | Mostra o nome da ONG logada; item "Importar CSV" |
| `src/components/PetCard.jsx` | `foto_url` direta; selo com o nome e a cidade da ONG |
| `src/pages/Home.jsx` | Filtros por cidade e por ONG, alimentados por `/ongs/cidades` e `/ongs` |
| `src/pages/PetDetalhe.jsx` | `foto_url` direta; bloco com os dados de contato da ONG responsável |
| `src/pages/Admin/Dashboard.jsx` | Consome `/ongs/indicadores`: tempo médio até a adoção, barras por espécie e resumo das solicitações |
| `src/pages/Admin/GerenciarPets.jsx` | `GET /pets/meus` em vez de `/pets`; estado vazio com atalhos |
| `src/pages/Admin/FormPet.jsx` | Preview da foto usa `foto_url` direta |
| `src/pages/Admin/Adocoes.jsx` | `PATCH /adocoes/:id` em vez de `PUT`; foto direta |

## Arquivos que NÃO mudam

`src/services/api.js`, `src/contexts/AuthContext.jsx`, `src/pages/Admin/Login.jsx`, `src/index.css`, `src/index.js`.

O `AuthContext` já salva o objeto `usuario` inteiro no localStorage, e o backend
agora inclui `ong_id`, `ong_nome` e `ong_cidade` na resposta do login. Funciona sem alteração.

---

## Configuração

`.env` na raiz do frontend:

```
REACT_APP_API_URL=http://localhost:5000
```

Na Vercel, cadastre a mesma variável apontando para a URL do Render,
em Settings → Environment Variables. Depois adicione a URL da Vercel
no `CORS_ORIGINS` do backend no Render.

---

## Atenção: quem já estava logado precisa sair e entrar de novo

O token JWT agora carrega `ong_id`. Tokens antigos não têm esse campo e o backend
os rejeita com "Sessão desatualizada". Se durante os testes aparecer erro 403 em
todas as rotas administrativas, limpe o localStorage ou clique em Sair.

---

## Roteiro de teste

1. **Catálogo unificado** — abra `/`. Devem aparecer animais das 3 ONGs, cada card com o selo da organização.
2. **Filtro por cidade** — escolha uma cidade. Só devem sobrar animais de ONGs daquela cidade.
3. **Cadastro de ONG** — em `/cadastro-ong`, digite um CEP válido e saia do campo. O endereço deve aparecer em verde.
4. **Isolamento** — faça login como `admin@patasdovale.org`, veja quais pets aparecem em Pets. Saia, entre como `admin@amigofiel.org`. A lista deve ser completamente diferente.
5. **Importação** — baixe o modelo, acrescente duas linhas, suba. Confirme a contagem. Depois suba uma planilha com uma linha sem nome e veja o relatório de erro.
6. **Indicadores** — aprove uma solicitação de adoção e volte ao Dashboard. O contador de adotados sobe e o tempo médio passa a exibir um valor.

O item 4 é o que prova a mudança central do projeto. Vale um print para o relatório final.
