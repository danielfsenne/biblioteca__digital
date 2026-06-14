# Biblioteca Digital

Sistema de gerenciamento de biblioteca com controle de acervo, empréstimos e usuários.

## Tecnologias

**Backend**
- Java 21 + Spring Boot 3.3
- Spring Security com JWT
- Spring Data JPA + Hibernate
- PostgreSQL
- SpringDoc OpenAPI (Swagger)

**Frontend**
- React 18 + Vite
- Tailwind CSS
- Axios
- React Router DOM

**Infraestrutura**
- Docker + Docker Compose
- Deploy: Railway

## Funcionalidades

- Autenticação com JWT (registro e login)
- CRUD de livros com paginação e busca por título
- CRUD de categorias
- Controle de empréstimos e devoluções com status de vencimento
- Gestão de usuários
- Interface responsiva (mobile e desktop)

## Rodando localmente

### Pré-requisitos

- Docker e Docker Compose instalados

### Subindo o ambiente

```bash
docker compose up --build
```

Aguarde os três serviços iniciarem. Acesse:

| Serviço   | URL                          |
|-----------|------------------------------|
| Frontend  | http://localhost:5173        |
| API REST  | http://localhost:8080        |
| Swagger   | http://localhost:8080/swagger-ui.html |

### Desenvolvimento do frontend sem Docker

```bash
cd frontend
npm install
npm run dev
```

O Vite proxy redireciona `/api` para `http://localhost:8080` automaticamente.

### Desenvolvimento da API sem Docker

Suba apenas o banco de dados:

```bash
docker compose up postgres
```

Execute a aplicação Spring Boot:

```bash
./mvnw spring-boot:run
```

## Variáveis de ambiente

### API

| Variável                  | Padrão                              | Descrição                  |
|---------------------------|-------------------------------------|----------------------------|
| `PORT`                    | `8080`                              | Porta do servidor          |
| `SPRING_DATASOURCE_URL`   | `jdbc:postgresql://localhost:5432/biblioteca` | URL do banco de dados |
| `SPRING_DATASOURCE_USERNAME` | `postgres`                       | Usuário do banco           |
| `SPRING_DATASOURCE_PASSWORD` | `postgres`                       | Senha do banco             |
| `APP_JWT_SECRET`          | *(valor padrão no application.properties)* | Chave secreta JWT  |
| `APP_JWT_EXPIRATION`      | `86400000`                          | Expiração do token em ms (24h) |

### Frontend

| Variável       | Descrição                          |
|----------------|------------------------------------|
| `VITE_API_URL` | URL base da API (build de produção)|

## Estrutura do projeto

```
biblioteca-digital/
├── src/                        # Código-fonte Spring Boot
│   └── main/java/com/biblioteca/digital/
│       ├── controller/         # Endpoints REST
│       ├── service/            # Regras de negócio
│       ├── repository/         # Acesso ao banco
│       ├── entity/             # Entidades JPA
│       ├── dto/                # Data Transfer Objects
│       ├── security/           # Configuração JWT e Spring Security
│       └── exception/          # Tratamento de erros
├── frontend/                   # Aplicação React
│   ├── src/
│   │   ├── api/                # Clientes HTTP (Axios)
│   │   ├── components/         # Componentes reutilizáveis
│   │   ├── context/            # Contexto de autenticação
│   │   └── pages/              # Páginas da aplicação
│   └── Dockerfile
├── Dockerfile                  # Build da API
├── docker-compose.yml
└── railway.toml
```

## Endpoints da API

A documentação completa está disponível no Swagger UI em `/swagger-ui.html`.

| Método | Rota                    | Auth | Descrição                    |
|--------|-------------------------|------|------------------------------|
| POST   | `/auth/register`        | —    | Criar conta                  |
| POST   | `/auth/login`           | —    | Autenticar e obter token JWT |
| GET    | `/books`                | ✓    | Listar livros (paginado)     |
| POST   | `/books`                | ✓    | Criar livro                  |
| PUT    | `/books/{id}`           | ✓    | Atualizar livro              |
| DELETE | `/books/{id}`           | ✓    | Remover livro                |
| GET    | `/books/search`         | ✓    | Buscar livros por título     |
| GET    | `/categories`           | ✓    | Listar categorias            |
| POST   | `/categories`           | ✓    | Criar categoria              |
| PUT    | `/categories/{id}`      | ✓    | Atualizar categoria          |
| DELETE | `/categories/{id}`      | ✓    | Remover categoria            |
| GET    | `/loans`                | ✓    | Listar empréstimos           |
| POST   | `/loans`                | ✓    | Registrar empréstimo         |
| POST   | `/loans/{id}/return`    | ✓    | Registrar devolução          |
| GET    | `/users`                | ✓    | Listar usuários              |
| DELETE | `/users/{id}`           | ✓    | Remover usuário              |

Rotas com ✓ requerem header `Authorization: Bearer <token>`.

## Deploy (Railway)

O projeto possui dois serviços no Railway:

- **API** — Spring Boot, porta 8080, conectado ao PostgreSQL via plugin
- **Frontend** — nginx servindo o build estático do React, porta 80

Cada serviço tem seu próprio `railway.toml` apontando para o Dockerfile correspondente. O deploy é automático a cada push na branch `master`.
