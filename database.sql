-- 1. Tạo Database (nếu chưa có)
CREATE DATABASE StudentManagement;
GO
USE StudentManagement;
GO

-- 2. Khởi tạo bảng students
CREATE TABLE students (
    id INT IDENTITY(1,1) PRIMARY KEY,
    full_name NVARCHAR(100) NOT NULL,
    class_name NVARCHAR(50) NOT NULL,
    major NVARCHAR(100) NOT NULL,
    created_at DATETIME DEFAULT GETDATE()
);
GO

--3. Insert dữ liệu
INSERT INTO students (full_name, class_name, major) VALUES 
(N'Nguyễn Văn An', N'CNTT1', N'Công nghệ thông tin'),
(N'Trần Thị Bình', N'KT02', N'Kế toán'),
(N'Lê Hoàng Nam', N'CNTT1', N'Công nghệ thông tin'),
(N'Phạm Minh Thư', N'MK01', N'Marketing'),
(N'Vũ Đức Anh', N'QTKD2', N'Quản trị kinh doanh'),
(N'Hoàng Thanh Trúc', N'KT02', N'Kế toán'),
(N'Đặng Văn Hùng', N'CNTT2', N'An toàn thông tin'),
(N'Bùi Minh Tuyết', N'MK01', N'Marketing'),
(N'Ngô Quốc Bảo', N'QTKD1', N'Quản trị kinh doanh'),
(N'Đỗ Kim Ngân', N'CNTT1', N'Công nghệ thông tin');
GO