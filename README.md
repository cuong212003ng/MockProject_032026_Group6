Quy trình làm việc (GIT)

1. Vào `main` mới nhất  
   - `git checkout main`  
   - `git pull origin main`

1.1. Cấu hình thông tin Git (làm 1 lần trên máy)  
   - `git config --global user.name "Họ Tên"`  
   - `git config --global user.email "email@example.com"`  
   → Để khi push/PR nhìn vào commit sẽ biết ai là người thực hiện.

2. Tạo branch theo task  
   - `git checkout -b feature/<ten-task>`

3. Cài & chạy dự án  
   - `npm install` (lần đầu)  
   - `npm start`

4. Code đúng phạm vi  
   - Chỉ sửa file liên quan task  
   - Không đụng code người khác nếu không cần

5. Commit nhỏ, rõ nghĩa  
   - `git add .`  
   - `git commit -m "feat: mo-ta-ngan-task"`

6. Hạn chế conflict trước khi push  
   - Đang ở branch task:  
   - `git pull --rebase origin main`  
   - Sửa conflict (nếu có) → chạy lại app OK

7. Push & tạo PR  
   - `git push -u origin feature/<ten-task>`  
   - Lên Git tạo Pull Request vào `main`  
   - Gắn reviewer, chờ review → fix comment nếu có

8. Nguyên tắc tránh conflict  
   - Mỗi task 1 branch riêng  
   - Luôn `git pull --rebase origin main` trước khi push cuối  
   - Không commit trực tiếp lên `main`

---

Hiểu nhanh flow code

1. Đọc theo thứ tự file  
   - `index.js` → `src/server.js` → `src/app.js`  
   - `src/routes/index.route.js` → `src/routes/student.route.js`  
   - `src/controllers/student.controller.js`  
   - `src/services/student.service.js`  
   - `src/models/student.model.js`

2. Flow 1 request cơ bản  
   - Client gọi: `GET /api/students`  
   - `app.js` map `/api` → `index.route.js`  
   - `index.route.js` map `/students` → `student.route.js`  
   - `student.route.js` gọi `studentController.getAllStudents`  
   - Controller gọi xuống `studentService.getAllStudents`  
   - Service gọi xuống `studentModel.findAll` (DB/thao tác dữ liệu)

3. Quy tắc khi code thêm chức năng  
   - Thêm route mới trong `student.route.js`  
   - Thêm hàm tương ứng trong `student.controller.js`  
   - Gọi sang hàm service trong `student.service.js`  
   - Service gọi các hàm model trong `student.model.js`  
   - Không viết logic DB trực tiếp trong controller.

4. Ví dụ: chức năng liệt kê danh sách sinh viên  
   - B1: Xác định URL: `GET /api/students`  
   - B2: Đảm bảo `student.route.js` có `router.get('/', studentController.getAllStudents)`  
   - B3: Trong `student.controller.js`: nhận request, gọi `studentService.getAllStudents`, trả `res.json(students)`  
   - B4: Trong `student.service.js`: hàm `getAllStudents` gọi `studentModel.findAll()`  
   - B5: Trong `student.model.js`: hiện thực `findAll` lấy dữ liệu từ DB / mock data  
   - B6: Chạy server và test với Postman/Thunder Client.

5. Cách test API (đơn giản)  
   - B1: `npm start` (PORT lấy từ `.env`)  
   - B2: Dùng Postman/Thunder Client  
     - Test: `GET http://localhost:<PORT>/api/students`  
   - B3: Khi code xong 1 chức năng (ví dụ liệt kê danh sách):  
     - Viết đủ các case chính: success, not found, validate lỗi input, lỗi server.  
     - Test lại nhanh sau mỗi lần sửa

Quy ước message khi commit

- `feat`: thêm **chức năng mới**  
  - Ví dụ: `feat: add list students endpoint`
- `fix`: **sửa bug**  
  - Ví dụ: `fix: validate missing student name`
- `refactor`: chỉnh **cấu trúc / tách hàm** nhưng **không đổi behavior**  
  - Ví dụ: `refactor: extract student service`
- `docs`: sửa / thêm **tài liệu, README**  
  - Ví dụ: `docs: update student API usage`
- `style`: chỉnh **format, spacing, rename biến nhỏ**, không ảnh hưởng logic  
  - Ví dụ: `style: rename studentId to id`
- `test`: thêm / sửa **test**  
  - Ví dụ: `test: add student service tests`
- `chore`: các việc lặt vặt, **không ảnh hưởng code chạy** (config, script, bump version, …)  
  - Ví dụ: `chore: update nodemon config`
- `build`: thay đổi liên quan **build, dependencies**  
  - Ví dụ: `build: add express dependency`
- `ci`: thay đổi file **CI** (GitHub Actions, GitLab CI, …)  
  - Ví dụ: `ci: add node 20 to pipeline`
- `revert`: **đảo ngược** một commit trước đó  
  - Ví dụ: `revert: "feat: add delete student"`