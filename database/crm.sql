-- ============================================================
--  crm_db – SQL Server 2019
--  Seed for Dashboard + Customer List screens
-- ============================================================

USE master;
GO

IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'crm_db')
    CREATE DATABASE crm_db;
GO

USE crm_db;
GO

-- 1) Customers
IF OBJECT_ID('customers', 'U') IS NULL
BEGIN
CREATE TABLE customers (
    id                 INT PRIMARY KEY IDENTITY(1,1),
    customer_code      VARCHAR(20)   NOT NULL UNIQUE,
    customer_name      NVARCHAR(200) NOT NULL,
    customer_type      VARCHAR(20)   NOT NULL,  -- B2B, B2C
    industry           NVARCHAR(100) NULL,
    status             VARCHAR(20)   NOT NULL DEFAULT 'Active', -- Active, InProgress, Inactive
    annual_revenue_usd DECIMAL(18,2) NOT NULL DEFAULT 0,
    created_at         DATETIME      NOT NULL DEFAULT GETDATE(),
    updated_at         DATETIME      NOT NULL DEFAULT GETDATE()
);
END
GO

-- 2) Customer Contacts
IF OBJECT_ID('customer_contacts', 'U') IS NULL
BEGIN
CREATE TABLE customer_contacts (
    id            INT PRIMARY KEY IDENTITY(1,1),
    customer_id   INT          NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    full_name     NVARCHAR(150) NOT NULL,
    email         VARCHAR(150) NULL,
    phone         VARCHAR(30)  NULL,
    is_primary    BIT          NOT NULL DEFAULT 0
);
END
GO

-- 3) Customer Tags
IF OBJECT_ID('customer_tags', 'U') IS NULL
BEGIN
CREATE TABLE customer_tags (
    id          INT PRIMARY KEY IDENTITY(1,1),
    customer_id INT          NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    tag_name    VARCHAR(50)  NOT NULL
);
END
GO

-- 4) CRM Jobs
IF OBJECT_ID('crm_jobs', 'U') IS NULL
BEGIN
CREATE TABLE crm_jobs (
    id            INT PRIMARY KEY IDENTITY(1,1),
    customer_id   INT          NOT NULL REFERENCES customers(id),
    title         NVARCHAR(200) NOT NULL,
    amount_usd    DECIMAL(18,2) NOT NULL DEFAULT 0,
    status        VARCHAR(20)   NOT NULL DEFAULT 'Pending', -- Pending, InProgress, Completed, Cancelled
    created_at    DATETIME      NOT NULL DEFAULT GETDATE(),
    closed_at     DATETIME      NULL
);
END
GO

-- 5) Invoices
IF OBJECT_ID('invoices', 'U') IS NULL
BEGIN
CREATE TABLE invoices (
    id             INT PRIMARY KEY IDENTITY(1,1),
    customer_id    INT           NOT NULL REFERENCES customers(id),
    invoice_no     VARCHAR(30)   NOT NULL UNIQUE,
    amount_usd     DECIMAL(18,2) NOT NULL,
    due_date       DATE          NOT NULL,
    paid_date      DATE          NULL,
    status         VARCHAR(20)   NOT NULL DEFAULT 'Unpaid' -- Unpaid, Paid, Overdue
);
END
GO

-- 6) Contracts
IF OBJECT_ID('contracts', 'U') IS NULL
BEGIN
CREATE TABLE contracts (
    id               INT PRIMARY KEY IDENTITY(1,1),
    customer_id      INT           NOT NULL REFERENCES customers(id),
    contract_name    NVARCHAR(200) NOT NULL,
    contract_value   DECIMAL(18,2) NOT NULL DEFAULT 0,
    start_date       DATE          NOT NULL,
    expiration_date  DATE          NOT NULL,
    status           VARCHAR(20)   NOT NULL DEFAULT 'Active' -- Active, ExpiringSoon, Expired
);
END
GO

-- Seed customers
IF NOT EXISTS (SELECT 1 FROM customers)
BEGIN
INSERT INTO customers (customer_code, customer_name, customer_type, industry, status, annual_revenue_usd)
VALUES
('AXE-9021', 'NexGen Ventures', 'B2B', 'Financial Services', 'Active', 1240500),
('AXE-8842', 'Skyline Logistics', 'B2B', 'Logistics', 'InProgress', 642000),
('AXE-7719', 'Blue Chip Media', 'B2C', 'Media', 'Inactive', 320150),
('AXE-5521', 'Apex Manufacturing', 'B2B', 'Manufacturing', 'Active', 2890000);
END
GO

-- Seed contacts
IF NOT EXISTS (SELECT 1 FROM customer_contacts)
BEGIN
INSERT INTO customer_contacts (customer_id, full_name, email, phone, is_primary)
VALUES
(1, 'Sarah Jenkins', 's.jenkins@nexgen.com', '(555) 111-0001', 1),
(2, 'Marcus Thorne', 'm.thorne@skyline.io', '(555) 111-0002', 1),
(3, 'Elena Rodriguez', 'elena@bluechip.com', '(555) 111-0003', 1),
(4, 'David Wu', 'd.wu@apexmfg.com', '(555) 111-0004', 1);
END
GO

-- Seed tags
IF NOT EXISTS (SELECT 1 FROM customer_tags)
BEGIN
INSERT INTO customer_tags (customer_id, tag_name)
VALUES
(1, 'VIP'),
(2, 'HIGH-VOLUME'),
(4, 'VIP');
END
GO

-- Seed jobs
IF NOT EXISTS (SELECT 1 FROM crm_jobs)
BEGIN
INSERT INTO crm_jobs (customer_id, title, amount_usd, status, created_at, closed_at)
VALUES
(1, 'Onboarding package', 120000, 'Completed', '2026-01-10', '2026-01-20'),
(1, 'Compliance renewal', 85000, 'InProgress', '2026-02-05', NULL),
(2, 'Regional contract notarization', 64000, 'Completed', '2026-02-11', '2026-02-20'),
(3, 'Campaign legal docs', 32000, 'Cancelled', '2026-03-01', '2026-03-05'),
(4, 'Annual supplier contracts', 210000, 'InProgress', '2026-03-10', NULL);
END
GO

-- Seed invoices (for Overdue section)
IF NOT EXISTS (SELECT 1 FROM invoices)
BEGIN
INSERT INTO invoices (customer_id, invoice_no, amount_usd, due_date, paid_date, status)
VALUES
(1, 'INV-2026-001', 12400, '2026-03-10', NULL, 'Overdue'),
(2, 'INV-2026-002', 8900, '2026-03-18', NULL, 'Overdue'),
(3, 'INV-2026-003', 3250, '2026-03-20', NULL, 'Overdue'),
(4, 'INV-2026-004', 5600, '2026-03-25', NULL, 'Unpaid');
END
GO

-- Seed contracts (for Contract expiring section)
IF NOT EXISTS (SELECT 1 FROM contracts)
BEGIN
INSERT INTO contracts (customer_id, contract_name, contract_value, start_date, expiration_date, status)
VALUES
(1, 'SaaS Renewal - Adobe', 120000, '2025-10-24', '2026-10-24', 'Active'),
(2, 'Cloud Infra - AWS', 95000, '2025-11-02', '2026-11-02', 'Active'),
(3, 'Security - CrowdStrike', 78000, '2025-11-15', '2026-11-15', 'Active');
END
GO

SELECT 'customers' AS [Table], COUNT(*) AS [Rows] FROM customers
UNION ALL SELECT 'customer_contacts', COUNT(*) FROM customer_contacts
UNION ALL SELECT 'customer_tags', COUNT(*) FROM customer_tags
UNION ALL SELECT 'crm_jobs', COUNT(*) FROM crm_jobs
UNION ALL SELECT 'invoices', COUNT(*) FROM invoices
UNION ALL SELECT 'contracts', COUNT(*) FROM contracts;
GO

PRINT 'crm_db initialized successfully!';
GO
