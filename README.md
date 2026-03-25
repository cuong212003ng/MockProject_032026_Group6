# Notarial Service – Nhóm 6 (JavaScript + NodeJS)

## Tech Stack

| Thành phần | Phiên bản       |
| ---------- | --------------- |
| Node.js    | LTS             |
| Express.js | v5.2.1          |
| mssql      | v12.2.0         |
| dotenv     | v17.3.1         |
| nodemon    | v3.1.14         |
| Database   | SQL Server 2019 |

## Cấu trúc dự án

```
notarial-service/
├── src/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   └── job.controller.js    # 10 function xử lý request (Planning & Scheduling)
│   ├── middlewares/
│   │   └── auth.middleware.js
│   ├── models/
│   │   └── job.model.js         # SQL query (Planning & Scheduling)
│   ├── routes/
│   │   └── job.route.js
│   ├── utils/
│   │   └── response.helper.js
│   └── index.js
├── .env.example
├── .eslintrc.js
├── .prettierrc
└── package.json
```

## Khởi chạy

```bash
# 1. Cài dependencies
npm install

# 2. Tạo file .env từ mẫu
# Điền thông tin DB vào .env

# 3. Chạy development
npm start
```

## 10 Endpoints

| #   | Method | URL                                                                | Function             |
| --- | ------ | ------------------------------------------------------------------ | -------------------- |
| 1   | GET    | `/api/v1/scheduling/jobs`                                          | Lấy danh sách Job    |
| 2   | GET    | `/api/v1/scheduling/jobs/:id`                                      | Lấy chi tiết Job     |
| 3   | GET    | `/api/v1/scheduling/jobs/:id/notary_availabilities`                | Tìm Notary phù hợp   |
| 4   | POST   | `/api/v1/scheduling/jobs/:id/job_assignments`                      | Assign Job           |
| 5   | PATCH  | `/api/v1/scheduling/jobs/:id/job_assignments/:assignmentId/accept` | Notary Accept Job    |
| 6   | PATCH  | `/api/v1/scheduling/jobs/:id/job_status`                           | Cập nhật trạng thái  |
| 7   | GET    | `/api/v1/scheduling/metrics`                                       | Dashboard Metrics    |
| 8   | GET    | `/api/v1/scheduling/jobs/:id/timeline`                             | Job Timeline         |
| 9   | PUT    | `/api/v1/scheduling/jobs/:id`                                      | Re-assign / Edit Job |
| 10  | GET    | `/api/v1/scheduling/jobs/:id/notifications`                        | Job Notifications    |
