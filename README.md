# Rinha Backend 2025

Este projeto é uma API de pagamentos desenvolvida para a competição Rinha de Backend 2025, utilizando [Bun](https://bun.sh/) e [Elysia](https://elysiajs.com/) para máxima performance, escalabilidade e simplicidade. O sistema é preparado para alta concorrência, balanceamento entre processadores e métricas de consistência.

## ✨ Tecnologias Utilizadas
- [Bun](https://bun.sh/) — runtime ultrarrápido para JavaScript/TypeScript
- [Elysia](https://elysiajs.com/) — framework web minimalista e performático
- [PostgreSQL](https://www.postgresql.org/) — banco de dados relacional
- [Redis](https://redis.io/) — mensageria e pub/sub
- [k6](https://k6.io/) — ferramenta de teste de carga
- Docker e Docker Compose

## 📦 Estrutura do Projeto
```
├── src/
│   ├── api.ts                # Bootstrap da API HTTP
│   ├── worker.ts             # Worker para processar pagamentos
│   ├── core/                 # Domínio e casos de uso
│   ├── infrastructure/       # Providers, controllers, repositórios
│   └── ...
├── db/
│   ├── conf/                 # Configuração do PostgreSQL
│   └── init/                 # Scripts de inicialização do banco
├── nginx/                    # Configuração do Nginx
├── rinha-test/               # Scripts de teste k6
├── docker-compose.yml        # Orquestração dos serviços
├── Dockerfile                # Build da aplicação
└── package.json
```

## 🚀 Como Rodar Localmente

### 1. Pré-requisitos
- [Bun](https://bun.sh/) instalado
- [Docker](https://www.docker.com/) e [Docker Compose](https://docs.docker.com/compose/)

### 2. Subindo o ambiente com Docker Compose

```bash
docker compose up --build
```
A API estará disponível em: [http://localhost:9999](http://localhost:9999)

### 3. Variáveis de Ambiente
Crie um arquivo `.env` na raiz com as variáveis necessárias:
```
DB_HOST=db
DB_USER=postgres
DB_PASS=postgres
DB_NAME=payments
PAYMENT_PROCESSOR_URL_DEFAULT=http://payment-processor-default:8080
PAYMENT_PROCESSOR_URL_FALLBACK=http://payment-processor-fallback:8080
REDIS_URL=redis://redis:6379
```

## 🛣️ Rotas da API

### POST `/payments`
- **Descrição:** Publica um pagamento para processamento assíncrono.
- **Body:**
  ```json
  {
    "amount": 100.50,
    "correlationId": "uuid"
  }
  ```
- **Response:** `202 Accepted` (processamento iniciado)

### GET `/payments-summary?from=...&to=...`
- **Descrição:** Retorna o resumo de pagamentos por processador (default/fallback) em um intervalo de datas.
- **Query Params:**
  - `from` (opcional, ISO string)
  - `to` (opcional, ISO string)
- **Response:**
  ```json
  {
    "default": { "totalRequests": 123, "totalAmount": 456.78 },
    "fallback": { "totalRequests": 45, "totalAmount": 67.89 }
  }
  ```

## 🧪 Testes de Carga com k6

### 1. Pré-requisito
- [k6](https://k6.io/) instalado localmente

### 2. Rodando os testes

```bash
bun run k6
```

- O comando acima executa o script de teste localizado em `rinha-test/rinha.js` e gera um relatório HTML (`html-report.html`).
- Para visualizar o relatório, abra o arquivo `html-report.html` no seu navegador.

## 🛠️ Scripts Úteis

- `bun run dev-api` — roda a API em modo desenvolvimento
- `bun run dev-worker` — roda o worker em modo desenvolvimento
- `docker:up` — sobe todos os serviços com Docker Compose
- `docker:down` — derruba todos os serviços e remove volumes
- `docker:rs` — reinicia o ambiente Docker
- `bun run k6` — executa o teste de carga k6

## 📝 Observações
- O sistema utiliza Redis para pub/sub entre API e worker.
- O banco de dados é inicializado automaticamente com os scripts em `db/init/`.
- O Nginx faz o balanceamento entre múltiplas instâncias da API.

---

Feito para a Rinha de Backend 2025 🏆