# Notary Profile Module - Group 6 (JavaScript + NodeJS)

## Overview

`Notary Profile` is the backend API module owned by the JavaScript/NodeJS team for this sprint. It covers the full notary profile management flow, from notary listing and personal profile details to compliance, service capability, documents, and audit trail.

## Tech Stack

| Component  | Version         |
| ---------- | --------------- |
| Node.js    | LTS             |
| Express.js | v5.2.1          |
| mssql      | v12.2.0         |
| dotenv     | v17.3.1         |
| nodemon    | v3.1.14         |
| Database   | SQL Server 2019 |

## Module Scope by Sprint Plan

The `Notary Profile` module in this sprint includes the following scopes:

- `SC_001_Notary_list`
- `SC_002_Overview`
- `SC_003_Personal_Infor`
- `SC_004_Legal&Commission`
- `SC_005_Bond&Insurance`
- `SC_006_Service_Capability`
- `SC_007_Document`
- `SC_008_Audit`

In addition, the module includes shared cross-cutting concerns:

- `Security & Authorization`
- `API Docs / Swagger`
- `Global API Response Wrapper`

## Task Ownership by Sprint Plan

- `Nguyen Van Cuong`
  - `SC_001_Notary_list`
  - `SC_002_Overview`
  - review / merge / code conflict handling
- `Dang Thanh Mai`
  - `SC_003_Personal_Infor`
  - `SC_004_Legal&Commission`
- `Nguyen Viet Lam Phong`
  - `SC_005_Bond&Insurance`
  - `SC_006_Service_Capability`
- `Vu Trong Tuan`
  - `SC_007_Document`
  - API Docs / Swagger / response wrapper
- `Ngo Van Duong`
  - `SC_008_Audit`
  - `Security & Authorization`

## Project Structure

```text
src/
|-- config/
|   |-- env.js
|   |-- db.js
|   |-- initDb.js
|   \-- swagger.js
|-- controllers/
|   \-- notary.controller.js
|-- middlewares/
|   |-- auth.middleware.js
|   |-- validate.middleware.js
|   |-- upload.middleware.js
|   \-- audit-context.middleware.js
|-- models/
|   \-- notary.model.js
|-- routes/
|   \-- notary.route.js
|-- services/
|   |-- notary-profile.service.js
|   |-- document.service.js
|   |-- audit.service.js
|   \-- audit-log.service.js
|-- utils/
|   |-- response.helper.js
|   |-- app-error.js
|   \-- pagination.helper.js
\-- index.js

database/
\-- init.sql
```

## Responsibility by Layer

- `config/`: manages environment variables, database connection, database initialization, and Swagger configuration.
- `routes/notary.route.js`: defines the HTTP endpoints of the Notary Profile module.
- `middlewares/`: handles JWT authentication, RBAC, request validation, file upload, and audit context.
- `controllers/notary.controller.js`: receives requests, calls the service layer, and returns a standardized response.
- `services/`: contains business logic for profile, document, and audit-related flows.
- `models/notary.model.js`: executes SQL queries and database access logic against SQL Server.
- `utils/`: provides shared helpers for response wrapping, error handling, and pagination.
- `database/init.sql`: contains schema creation and seed data relevant to the Notary Profile module.

## Processing Flow

Main processing flow of the module:

`route -> middleware -> controller -> service -> model -> SQL Server`

## Main APIs by Sprint Scope

### SC_001_Notary_list

- `GET /api/v1/notaries`
- `PATCH /api/v1/notaries/:id/status`

### SC_002_Overview

- `GET /api/v1/notaries/:id/overview`
- `GET /api/v1/notaries/:id/status-history`

### SC_003_Personal_Infor

- `GET /api/v1/notaries/:id`
- `PATCH /api/v1/notaries/:id/bio`

### SC_004_Legal&Commission

- `GET /api/v1/notaries/:id/commissions`
- `POST /api/v1/notaries/:id/commissions`
- `PATCH /api/v1/notaries/:id/commissions/:cid`

### SC_005_Bond&Insurance

<<<<<<< HEAD
<<<<<<< HEAD

=======

> > > > > > > 5a52a59 (docs(readme): update notary profile module structure)

=======
>>>>>>> c33394b (fix: update to charge requirement s006)
- `GET /api/v1/notaries/:id/compliance`
- `PUT /api/v1/notaries/:id/compliance`

### SC_006_Service_Capability

- `GET /api/v1/notaries/:id/capabilities`
- `PATCH /api/v1/notaries/:id/capabilities`
- `GET /api/v1/notaries/:id/availability`
- `POST /api/v1/notaries/:id/availability` (Supports Federal/State holiday modes: ALL, SELECTED, NONE)

### SC_007_Document

- `GET /api/v1/notaries/:id/documents`
- `POST /api/v1/notaries/:id/documents`
- `PATCH /api/v1/notaries/:id/documents/:docId/verify`

### SC_008_Audit

- `GET /api/v1/notaries/:id/audit-logs`
- `GET /api/v1/notaries/:id/incidents`
- `POST /api/v1/notaries/:id/incidents`

## Security and Common Conventions

### Authentication and Authorization

- JWT authentication with access token and refresh token
- RBAC with `ADMIN` and `USER`
- owner-based access control for user-level document APIs

### Validation

- validation for params, query, and body
- validation for pagination, date range, and enum status
- validation for document file uploads

### Response Wrapper

All APIs follow a unified response format:

```json
{
  "status": "success|error",
  "message": "string",
  "data": {}
}
```

### API Documentation

- Swagger/OpenAPI is available for API review and testing
- Swagger endpoint: `/api-docs`

## Database Touchpoints

Main tables related to the `Notary Profile` module:

- `notaries`
- `Notary_documents`
- `Notary_incidents`
- `Notary_audit_logs`

In addition, the module also works with tables related to commission, compliance, capability, availability, and other notary profile extensions.

## Run Locally

```bash
# 1. Install dependencies
npm install

# 2. Create .env from .env.example
# Fill in database and JWT configuration

#For Tester / Running Production environment:
npm start

# 3. Available Scripts
npm run dev     # Run development server (nodemon)
npm start       # Run production server (node)
npm run debug   # Run development server with V8 inspector
npm test        # Run unit tests
<<<<<<< HEAD

## Verification

- `npm run lint`
- `npm test`
```
=======
>>>>>>> c33394b (fix: update to charge requirement s006)

## Verification

- `npm run lint`
- `npm test`
<<<<<<< HEAD
=======
```
>>>>>>> c33394b (fix: update to charge requirement s006)
