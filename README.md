# ⚓ QuimiPort — Gestão de Cargas Químicas Portuárias

> **Tech Challenge | Pós-Tech em Full Stack Development (Fase 2)**  
> API backend robusta em Node.js com NestJS, TypeORM, PostgreSQL e Docker para controle de conformidade, rastreabilidade e governança de cargas perigosas no ambiente portuário (Porto de Santos).

[![CI Pipeline](https://github.com/gabrixlzdev/QuimiPort/actions/workflows/ci.yml/badge.svg)](https://github.com/gabrixlzdev/QuimiPort/actions/workflows/ci.yml)
[![Node Version](https://img.shields.io/badge/node-%3E%3D24.15-brightgreen.svg)](https://nodejs.org/)
[![NestJS](https://img.shields.io/badge/framework-NestJS%2012-red.svg)](https://nestjs.com/)
[![PostgreSQL](https://img.shields.io/badge/database-PostgreSQL%2016-blue.svg)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/docker-compose-2496ED.svg)](https://www.docker.com/)

---

## 📌 1. Sobre o Projeto e Contexto do Problema

O **QuimiPort** é uma solução backend de alta confiabilidade desenvolvida para gerenciar o ciclo de vida e garantir a segurança operacional e regulatória no recebimento, análise, inspeção e movimentação de cargas químicas perigosas em terminais portuários.

A movimentação portuária de produtos químicos exige rígida observância a normas nacionais e internacionais (Código IMDG/ONU, FISPQ, normas da ANVISA e Receita Federal). Um erro de liberação documental ou alocação incompatível no pátio pode gerar contaminações graves, incêndios ou desastres ambientais.

A aplicação atua como um **motor determinístico de conformidade**, impedindo que cargas com pendências documentais, produtos inativos ou inspeções reprovadas entrem em trânsito no terminal.

---

## 🏗️ 2. Arquitetura e Decisões Técnicas

O projeto foi construído seguindo os princípios de **Clean Architecture** e **Domain-Driven Design (DDD)**, com segregação estrita de responsabilidades em camadas concêntricas (dependências apontando sempre de fora para dentro):

```
backend/src/
├── domain/            # Camada mais interna: Entidades, Value Objects, Agregado e Erros de Domínio (SEM dependências externas)
├── application/       # Casos de uso (Use Cases puros), DTOs de aplicação e Mappers
├── infrastructure/    # Adaptadores externos: Repositórios TypeORM, Entidades ORM e Banco PostgreSQL
├── presentation/      # Controladores HTTP (NestJS), DTOs Swagger, Interceptors de Log e Mappers de Erro HTTP
└── shared/            # Estruturas compartilhadas (Pattern Either/Result)
```

### Principais Decisões Arquiteturais:
- **NestJS 12 (Express):** Framework modular com injeção de dependência nativa, facilitando a testabilidade e isolamento dos casos de uso.
- **Padrão Funcional Either/Result (`Either<Error, Value>`):** Regras de negócio esperadas **não lançam exceções (`throw`)**. Retornam estruturas previsíveis `left(error)` ou `right(value)`, convertidas na camada de apresentação para os códigos HTTP adequados (400, 404, 409 ou 422).
- **Máquina de Estados Finita (FSM) no Agregado:** Transições de status da carga são estritamente governadas dentro do agregado `CargaQuimicaAggregate`, impedindo alterações arbitrárias e mantendo uma trilha de auditoria completa em `HistoricoStatusCarga`.
- **Logs de Observabilidade via Interceptor:** O `HttpLoggingInterceptor` global monitora requisições recebidas, tempo de resposta em milissegundos e categoriza semanticamente:
  - `LOG` (verde) para respostas 2xx bem-sucedidas;
  - `WARN` (amarelo) para bloqueios de validação ou regras de negócio (4xx);
  - `ERROR` (vermelho) para falhas internas inesperadas (5xx).

---

## 🛠️ 3. Tecnologias Utilizadas

- **Linguagem & Runtime:** Node.js `>=24.15 <25` (ESM puro, `"type": "module"`) com TypeScript estrito.
- **Framework Web:** NestJS 12.
- **Banco de Dados:** PostgreSQL 16 Alpine com TypeORM 0.3.
- **Documentação Interativa:** Swagger / OpenAPI (`@nestjs/swagger`).
- **Conteinerização:** Docker Engine com *Multi-Stage Build* e Docker Compose.
- **Qualidade & Testes:** Vitest (unitários e integração rápida), Supertest, Oxlint e Prettier.
- **Automação (CI/CD):** GitHub Actions.

---

## ⚙️ 4. Variáveis de Ambiente (`.env`)

A aplicação lê as variáveis de ambiente a partir do arquivo `.env` localizado na raiz do projeto. Um modelo pré-configurado está disponível em `.env.example`.

Para configurar o seu ambiente, copie o modelo:

```bash
cp .env.example .env
```

### Variáveis Configuradas:

| Variável | Descrição | Valor Padrão no `.env.example` |
| :--- | :--- | :---: |
| `PORT` | Porta HTTP em que a API NestJS escuta | `3000` |
| `POSTGRES_HOST` | Host do banco (no Docker use `db`, localmente `localhost`) | `localhost` |
| `POSTGRES_PORT` | Porta exposta do PostgreSQL | `5432` |
| `POSTGRES_USER` | Usuário administrador do banco de dados | `postgres` |
| `POSTGRES_PASSWORD` | Senha de acesso ao banco | `postgres` |
| `POSTGRES_DB` | Nome do banco de dados da aplicação | `quimiport` |

---

## 🐳 5. Como Executar com Docker (Recomendado)

O método mais rápido e padronizado para executar o ecossistema completo (API + PostgreSQL conectado) é utilizando o **Docker Compose**.

### 1. Construir e subir os containers em segundo plano:
```bash
docker compose up -d --build
```

O Docker Compose inicializa:
1. O serviço **`quimiport-db`** (PostgreSQL 16) com *healthcheck* ativo (`pg_isready`).
2. O serviço **`quimiport-api`** (NestJS), que aguarda o banco estar 100% pronto antes de iniciar.

### 2. Acompanhar os logs da aplicação em tempo real:
```bash
docker compose logs -f api
```

### 3. Verificar o status dos containers:
```bash
docker compose ps
```

### 4. Parar os containers (mantendo os dados do banco preservados no volume):
```bash
docker compose down
```

---

## 💻 6. Como Executar Localmente (Ambiente de Desenvolvimento)

Caso queira executar a API fora do Docker para desenvolvimento com *Hot Reload*:

### 1. Suba apenas o banco de dados via Docker:
```bash
docker compose up -d db
```

### 2. Instale as dependências dentro da pasta `backend/`:
```bash
cd backend
npm install
```

### 3. Inicie a API em modo de desenvolvimento:
```bash
npm run start:dev
```
A API estará acessível em: `http://localhost:3000`

---

## 📖 7. Documentação Interativa da API (Swagger UI)

Com a aplicação em execução, acesse a documentação interativa completa pelo navegador:

👉 **[http://localhost:3000/api/docs](http://localhost:3000/api/docs)**

A interface visual do Swagger permite testar todos os endpoints, inspecionar esquemas de entrada e saída (JSON), visualizar exemplos práticos e conferir os possíveis códigos de retorno HTTP (200, 201, 400, 404, 409 e 422).

---

## 🛣️ 8. Principais Endpoints da API

### Produtos Químicos (`/produtos-quimicos`)
- `POST /produtos-quimicos` — Cadastra um novo produto químico perigoso (valida nome, número ONU e classe de risco).
- `GET /produtos-quimicos` — Lista todos os produtos químicos cadastrados.
- `GET /produtos-quimicos/:id` — Consulta os detalhes de um produto químico específico por ID.
- `PUT /produtos-quimicos/:id` — Atualiza dados cadastrais de um produto.
- `PATCH /produtos-quimicos/:id/inativar` — Realiza a inativação lógica do produto (impede novas cargas).

### Cargas Químicas (`/cargas`)
- `POST /cargas` — Registra uma nova carga química (associa obrigatoriamente a um produto ativo e responsável técnico).
- `GET /cargas` — Lista todas as cargas com seus respectivos status, dados e datas de auditoria.
- `GET /cargas/:id` — Busca os dados completos de uma carga química por identificador.
- `PATCH /cargas/:id/status` — Altera o status da carga conforme a máquina de estados.
- `POST /cargas/:id/documentos` — Anexa documentos obrigatórios (FISPQ, Licença, etc.).
- `PATCH /cargas/:id/documentos/:documentoId/validar` — Homologa ou rejeita um documento anexado.
- `POST /cargas/:id/inspecoes` — Registra laudo de vistoria técnica presencial com parecer aprovado/reprovado.
- `POST /cargas/:id/liberar` — Libera a carga para movimentação (exige 100% de documentos válidos e vistoria aprovada).
- `POST /cargas/:id/bloquear` — Bloqueia imediatamente a carga por motivos de inconformidade ou perigo.
- `POST /cargas/:id/iniciar-movimentacao` — Transiciona a carga liberada para `EM_MOVIMENTACAO`.
- `POST /cargas/:id/concluir-movimentacao` — Conclui o transporte até o destino final (`FINALIZADA`).
- `POST /cargas/:id/cancelar` — Cancela administrativamente o lote de carga química (`CANCELADA`).

### Responsáveis Técnicos (`/responsaveis-tecnicos`)
- `POST /responsaveis-tecnicos` — Cadastra um profissional responsável habilitado com CPF e CRQ/CREA.

---

## 🗄️ 9. Banco de Dados e Modelagem Relacional

A persistência utiliza o PostgreSQL 16 com mapeamento objeto-relacional via TypeORM. 

- **Chaves Estrangeiras Fortes:** A tabela `carga_quimica` possui relacionamentos `@ManyToOne` com `produto_quimico` e `responsavel_tecnico` com política `ON DELETE RESTRICT`, garantindo integridade referencial.
- **Trilha de Auditoria:** Cada mudança de status alimenta a tabela `historico_status_carga`, armazenando a sequência cronológica, o responsável e a justificativa operacional.
- **Campos de Auditoria:** As cargas possuem `dataCriacao` e `dataAtualizacao` persistidas e expostas na API.
- **Nota sobre `synchronize: true`:** No `app.module.ts`, a sincronização automática de esquema do TypeORM está habilitada para agilidade de desenvolvimento e execução acadêmica. Em ambiente de produção empresarial, recomenda-se a desativação da flag e o uso de migrações versionadas (`TypeORM Migrations`).

> 📄 **Documento Completo de Modelagem:** Consulte o arquivo **[docs/8_modelagem_dados.md](docs/8_modelagem_dados.md)** para visualizar o Diagrama Entidade-Relacionamento (DER), o Dicionário de Dados de todas as tabelas e o diagrama da Máquina de Estados da carga.

---

## 🧪 10. Testes Automatizados e Qualidade

O projeto conta com **135 testes automatizados** rodando com Vitest, cobrindo todos os 12 cenários obrigatórios do enunciado da Fase 2 (entidades, agregados, objetos de valor, casos de uso e repositórios).

### Comandos de Teste (dentro da pasta `backend/`):

```bash
# Executar todos os testes unitários e de integração
npm test

# Executar os testes em modo contínuo (Watch Mode)
npm run test:watch

# Gerar relatório de cobertura de código
npm run test:cov

# Executar a suíte de testes de ponta a ponta (E2E)
npm run test:e2e

# Executar o linter de código estático (Oxlint)
npm run lint
```

---

## 🧭 11. Como Navegar pela Documentação

Esta documentação técnica está organizada seguindo a jornada de entendimento do negócio até a arquitetura e banco de dados. Recomendamos a leitura na seguinte ordem:

1. **[Domínio e Contexto](docs/1_dominio.md)** — Comece aqui para entender o problema portuário, os usuários envolvidos e a linguagem ubíqua do negócio.
2. **[Modelagem com DDD](docs/2_modelagem_DDD.md)** — Veja como o domínio foi modelado em entidades, objetos de valor e agregados.
3. **[Casos de Uso e Fluxos](docs/3_casos_de_uso.md)** — Especificação detalhada dos fluxos de operação (UC-001 ao UC-008).
4. **[Regras de Negócio](docs/4_regras_de_negocio.md)** — Levantamento de todas as validações e restrições que protegem a consistência do domínio (RN-001 a RN-015).
5. **[Arquitetura e Design Técnico](docs/5_arquitetura.md)** — Clean Architecture, estrutura de pastas e padrões técnicos.
6. **[Decisões Arquiteturais (ADRs)](docs/7_decisoes_arquiteturais.md)** — O "porquê" por trás de cada escolha técnica da equipe.
7. **[Plano de Qualidade e Testes](docs/6_estrutura_de_testes.md)** — Pirâmide de testes e matriz de cobertura.
8. **[Modelagem de Dados e Máquina de Estados](docs/8_modelagem_dados.md)** — Diagrama DER do PostgreSQL, dicionário de dados completo e fluxo de transições da carga química (Fase 2).

> 💡 **Dica para avaliação rápida:** Se você tem pouco tempo, priorize os itens **1, 3, 4 e 8** — eles concentram o entendimento do negócio, as regras críticas de conformidade e a modelagem de dados da Fase 2.

---

## 👥 12. Autores e Equipe

- **Instituição:** FIAP  
- **Curso:** Pós-Tech em Full Stack Development  
- **Integrantes do Grupo:**

1. **rm376907** - Andreia Alencar Carvalho da Silva
2. **rm376913** - Gabriel Xavier Luz
3. **rm374397** - Ivo Shiguenobu Sacagami
4. **rm376888** - Jaina Braga Barreto
5. **rm375380** - Stefany Beacides Messias dos Santos
