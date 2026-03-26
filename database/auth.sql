-- ============================================================
--  Auth Tables: users + refresh_tokens
--  Run once against notarial_db to set up authentication
-- ============================================================

USE notarial_db;
GO

-- ── users ──────────────────────────────────────────────────
IF OBJECT_ID('users', 'U') IS NULL
BEGIN
CREATE TABLE users (
    id            INT PRIMARY KEY IDENTITY(1,1),
    username      VARCHAR(100)  NOT NULL UNIQUE,
    email         VARCHAR(150)  NOT NULL UNIQUE,
    password_hash VARCHAR(255)  NOT NULL,
    role          VARCHAR(20)   NOT NULL DEFAULT 'USER'
                                CONSTRAINT CK_users_role CHECK (role IN ('ADMIN', 'USER')),
    is_active     BIT           NOT NULL DEFAULT 1,
    created_at    DATETIME      NOT NULL DEFAULT GETDATE(),
    updated_at    DATETIME      NOT NULL DEFAULT GETDATE()
);
END
GO

-- ── refresh_tokens ─────────────────────────────────────────
IF OBJECT_ID('refresh_tokens', 'U') IS NULL
BEGIN
CREATE TABLE refresh_tokens (
    id         INT PRIMARY KEY IDENTITY(1,1),
    user_id    INT          NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token      VARCHAR(500) NOT NULL UNIQUE,
    expires_at DATETIME     NOT NULL,
    created_at DATETIME     NOT NULL DEFAULT GETDATE()
);
END
GO

-- ── Seed: default admin account (password: Admin@123) ──────
-- bcrypt hash of 'Admin@123' with salt rounds = 10
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> 30a0d89 (feat(notary-profile): implement SC_007 SC_008 and security authorization)
IF EXISTS (SELECT 1 FROM users WHERE username = 'admin')
BEGIN
UPDATE users
SET
    email = 'admin@notarial.com',
    password_hash = '$2b$10$X95LrlWAhDTssSzt08jmtOIqYgQyaPCYw9DMmSQMGWHrOy/o2c4xm',
    role = 'ADMIN',
    is_active = 1
WHERE username = 'admin';
END
ELSE
<<<<<<< HEAD
=======
IF NOT EXISTS (SELECT 1 FROM users WHERE username = 'admin')
>>>>>>> dabfe06 (feat/init databse and code base (#52))
=======
>>>>>>> 30a0d89 (feat(notary-profile): implement SC_007 SC_008 and security authorization)
BEGIN
INSERT INTO users (username, email, password_hash, role)
VALUES (
    'admin',
    'admin@notarial.com',
<<<<<<< HEAD
<<<<<<< HEAD
    '$2b$10$X95LrlWAhDTssSzt08jmtOIqYgQyaPCYw9DMmSQMGWHrOy/o2c4xm',
=======
    '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- password: password (replace in production!)
>>>>>>> dabfe06 (feat/init databse and code base (#52))
=======
    '$2b$10$X95LrlWAhDTssSzt08jmtOIqYgQyaPCYw9DMmSQMGWHrOy/o2c4xm',
>>>>>>> 30a0d89 (feat(notary-profile): implement SC_007 SC_008 and security authorization)
    'ADMIN'
);
END
GO

PRINT 'Auth tables created successfully';
GO
