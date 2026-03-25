-- ============================================================
--  notarial_db – SQL Server 2019
--  Nhóm 6 - Javascript & NodeJS
-- ============================================================

USE master;
GO

CREATE DATABASE notarial_db;
GO

USE notarial_db;
GO

-- ── 1. notaries ──
IF OBJECT_ID ('notaries', 'U') IS NULL
BEGIN
CREATE TABLE notaries (
    id INT PRIMARY KEY IDENTITY (1, 1),
    user_id INT NOT NULL,
    ssn VARCHAR(20) NULL,
    full_name NVARCHAR (100) NOT NULL,
    date_of_birth DATE NULL,
    photo_url VARCHAR(255) NULL,
    phone VARCHAR(20) NULL,
    email VARCHAR(100) NULL,
    employment_type VARCHAR(30) NULL,
    start_date DATE NULL,
    internal_notes NVARCHAR (500) NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    residential_address NVARCHAR (255) NULL
);

END

-- ── 2. notary_capabilities ──
IF OBJECT_ID ('notary_capabilities', 'U') IS NULL
BEGIN
CREATE TABLE notary_capabilities (
    id INT PRIMARY KEY IDENTITY (1, 1),
    notary_id INT NOT NULL REFERENCES notaries (id),
    mobile BIT NOT NULL DEFAULT 0,
    RON BIT NOT NULL DEFAULT 0,
    loan_signing BIT NOT NULL DEFAULT 0,
    apostille_related_support BIT NOT NULL DEFAULT 0,
    max_distance INT NULL -- km
);

END

-- ── 3. notary_availabilities ──
IF OBJECT_ID ('notary_availabilities', 'U') IS NULL
BEGIN
CREATE TABLE notary_availabilities (
    id INT PRIMARY KEY IDENTITY (1, 1),
    notary_id INT NOT NULL REFERENCES notaries (id),
    working_days_per_week INT NULL,
    start_time TIME NULL,
    end_time TIME NULL,
    fixed_days_off VARCHAR(50) NULL
);

END

-- ── 4. notary_service_areas ──
IF OBJECT_ID ('notary_service_areas', 'U') IS NULL
BEGIN
CREATE TABLE notary_service_areas (
    id INT PRIMARY KEY IDENTITY (1, 1),
    state_id INT NULL,
    county_name NVARCHAR (100) NULL,
    notary_id INT NOT NULL REFERENCES notaries (id)
);

END

-- ── 5. Job ──
IF OBJECT_ID ('Job', 'U') IS NULL
BEGIN
CREATE TABLE Job (
    id INT PRIMARY KEY IDENTITY (1, 1),
    Client_ID INT NOT NULL,
    Service_Type NVARCHAR (50) NOT NULL,
    Location_Type NVARCHAR (20) NOT NULL,
    Location_Details NVARCHAR (255) NULL,
    Requested_Start_Time DATETIME NOT NULL,
    Requested_End_Time DATETIME NULL,
    Signer_Count INT NOT NULL DEFAULT 1,
    Status NVARCHAR (20) NOT NULL DEFAULT 'Pending' CONSTRAINT CK_Job_Status CHECK (
        Status IN (
            'Pending',
            'Assigned',
            'Completed',
            'Cancelled'
        )
    )
);

CREATE INDEX IX_Job_RequestedStartTime ON Job (Requested_Start_Time);

CREATE INDEX IX_Job_Status ON Job (Status);

END

-- ── 6. job assignments ──
IF OBJECT_ID ('[job assignments]', 'U') IS NULL
BEGIN
CREATE TABLE [job assignments] (
    id INT PRIMARY KEY IDENTITY (1, 1),
    job_id INT NOT NULL REFERENCES Job (id),
    notary_id INT NOT NULL REFERENCES notaries (id),
    assigned_at DATETIME NOT NULL,
    accepted_at DATETIME NULL
);

END

-- ── 7. job_status_logs ──
IF OBJECT_ID ('job_status_logs', 'U') IS NULL
BEGIN
CREATE TABLE job_status_logs (
    job_status_id VARCHAR(50) PRIMARY KEY DEFAULT NEWID (),
    job_id INT NOT NULL REFERENCES Job (id),
    status NVARCHAR (20) NOT NULL,
    time_stamps DATETIME NOT NULL DEFAULT GETDATE (),
    delay VARCHAR(20) NULL,
    exception_flags NVARCHAR (100) NULL,
    note NVARCHAR (500) NULL
);

CREATE INDEX IX_JobStatusLogs_JobId ON job_status_logs (job_id);

END

-- ── 8. events ──
IF OBJECT_ID ('events', 'U') IS NULL
BEGIN
CREATE TABLE events (
    event_id VARCHAR(10) PRIMARY KEY,
    event_name NVARCHAR (100) NOT NULL
);

END

-- ── 9. notifications ──
IF OBJECT_ID ('notifications', 'U') IS NULL
BEGIN
CREATE TABLE notifications (
    notification_id VARCHAR(50) PRIMARY KEY DEFAULT NEWID (),
    event_id VARCHAR(10) NOT NULL REFERENCES events (event_id),
    job_id INT NOT NULL REFERENCES Job (id),
    sms BIT NOT NULL DEFAULT 0,
    email BIT NOT NULL DEFAULT 0,
    app BIT NOT NULL DEFAULT 0,
    delay INT NOT NULL DEFAULT 0,
    time_stamp DATETIME NOT NULL DEFAULT GETDATE ()
);

CREATE INDEX IX_Notifications_JobId ON notifications (job_id);

END

-- ── Seed: notaries ──
IF NOT EXISTS (
    SELECT 1
    FROM notaries
)
BEGIN
SET
    IDENTITY_INSERT notaries ON;

INSERT INTO
    notaries (
        id,
        user_id,
        ssn,
        full_name,
        date_of_birth,
        photo_url,
        phone,
        email,
        employment_type,
        start_date,
        internal_notes,
        status,
        residential_address
    )
VALUES (
        1,
        1001,
        '123-45-6789',
        'James Smith',
        '1985-02-15',
        '/img/jsmith.jpg',
        '(555) 123-4567',
        'j.smith@mail.com',
        'FULL_TIME',
        '2021-01-06',
        'Top performer 2022',
        'ACTIVE',
        '123 Maple St, Seattle, WA 98101'
    ),
    (
        2,
        1002,
        '234-56-7890',
        'Emily Johnson',
        '1990-08-22',
        '/img/ejohnson.jpg',
        '(555) 234-5678',
        'emily.j@mail.com',
        'FULL_TIME',
        '2022-01-15',
        NULL,
        'ACTIVE',
        '456 Oak Ave, Austin, TX 73301'
    ),
    (
        3,
        1003,
        '345-67-8901',
        'Michael Williams',
        '1988-11-30',
        '/img/mwilliams.jpg',
        '(555) 345-6789',
        'm.williams@mail.com',
        'INDEPENDENT_CONTRACT',
        '2023-10-03',
        'Background check renewed',
        'ACTIVE',
        '789 Pine Ln, Chicago, IL 60601'
    );

SET IDENTITY_INSERT notaries OFF;

END

-- ── Seed: notary_capabilities ──
IF NOT EXISTS (
    SELECT 1
    FROM notary_capabilities
)
BEGIN
INSERT INTO
    notary_capabilities (
        notary_id,
        mobile,
        RON,
        loan_signing,
        apostille_related_support,
        max_distance
    )
VALUES (1, 1, 1, 1, 0, 30),
    (2, 1, 0, 1, 1, 25),
    (3, 0, 1, 0, 0, 50);

END

-- ── Seed: notary_availabilities ──
IF NOT EXISTS (
    SELECT 1
    FROM notary_availabilities
)
BEGIN
INSERT INTO
    notary_availabilities (
        notary_id,
        working_days_per_week,
        start_time,
        end_time,
        fixed_days_off
    )
VALUES (
        1,
        5,
        '08:00',
        '17:00',
        'sat,sun'
    ),
    (2, 6, '09:00', '18:00', 'sun'),
    (3, 5, '08:30', '17:30', 'sat');

END

-- ── Seed: notary_service_areas ──
IF NOT EXISTS (
    SELECT 1
    FROM notary_service_areas
)
BEGIN
INSERT INTO
    notary_service_areas (
        state_id,
        county_name,
        notary_id
    )
VALUES (5, 'Los Angeles', 1),
    (5, 'Orange', 2),
    (5, 'San Diego', 3);

END

-- ── Seed: Job ──
IF NOT EXISTS ( SELECT 1 FROM Job ) BEGIN SET IDENTITY_INSERT Job ON;

INSERT INTO
    Job (
        id,
        Client_ID,
        Service_Type,
        Location_Type,
        Location_Details,
        Requested_Start_Time,
        Requested_End_Time,
        Signer_Count,
        Status
    )
VALUES (
        1,
        101,
        'Notarization',
        'Office',
        '123 Nguyen Van Linh, Da Nang',
        '2026-03-21 08:00',
        '2026-03-21 09:00',
        2,
        'Pending'
    ),
    (
        2,
        102,
        'Translation',
        'Home',
        '45 Le Duan, Da Nang',
        '2026-03-21 09:30',
        '2026-03-21 10:30',
        1,
        'Assigned'
    ),
    (
        3,
        103,
        'Certification',
        'Office',
        '78 Tran Phu, Da Nang',
        '2026-03-21 10:00',
        '2026-03-21 11:00',
        3,
        'Completed'
    ),
    (
        4,
        104,
        'Notarization',
        'Home',
        '12 Hoang Dieu, Da Nang',
        '2026-03-22 08:00',
        '2026-03-22 09:00',
        1,
        'Pending'
    ),
    (
        5,
        105,
        'Certification',
        'Office',
        '99 Bach Dang, Da Nang',
        '2026-03-22 14:00',
        '2026-03-22 15:30',
        2,
        'Cancelled'
    );

SET IDENTITY_INSERT Job OFF;

END

-- ── Seed: job assignments ──
IF NOT EXISTS (
    SELECT 1
    FROM [job assignments]
)
BEGIN
SET
    IDENTITY_INSERT[job assignments] ON;

INSERT INTO
    [job assignments] (
        id,
        job_id,
        notary_id,
        assigned_at,
        accepted_at
    )
VALUES (
        1,
        2,
        1,
        '2026-03-20 07:30',
        '2026-03-20 08:10'
    ),
    (
        2,
        3,
        2,
        '2026-03-20 08:00',
        '2026-03-20 08:40'
    );

SET IDENTITY_INSERT[job assignments] OFF;

END

-- ── Seed: job_status_logs ──
IF NOT EXISTS (
    SELECT 1
    FROM job_status_logs
)
BEGIN
INSERT INTO
    job_status_logs (
        job_id,
        status,
        time_stamps,
        delay,
        exception_flags,
        note
    )
VALUES (
        2,
        'Pending',
        '2026-03-20 07:00',
        NULL,
        NULL,
        'Job created'
    ),
    (
        2,
        'Assigned',
        '2026-03-20 07:30',
        NULL,
        NULL,
        'Assigned to notary James Smith'
    ),
    (
        3,
        'Pending',
        '2026-03-20 07:00',
        NULL,
        NULL,
        'Job created'
    ),
    (
        3,
        'Assigned',
        '2026-03-20 08:00',
        NULL,
        NULL,
        'Assigned to notary Emily Johnson'
    ),
    (
        3,
        'Completed',
        '2026-03-21 11:00',
        '2h',
        NULL,
        'Signer come later'
    ),
    (
        5,
        'Pending',
        '2026-03-20 09:00',
        NULL,
        NULL,
        'Job created'
    ),
    (
        5,
        'Cancelled',
        '2026-03-21 07:00',
        NULL,
        'CLIENT_NO_SHOW',
        'Client cancelled via phone'
    );

END

-- ── Seed: events ──
IF NOT EXISTS (
    SELECT 1
    FROM events
)
BEGIN
INSERT INTO
    events (event_id, event_name)
VALUES (
        'ne001',
        'job assigned to notary'
    ),
    (
        'ne002',
        'remind before event'
    ),
    ('ne003', 'completed job');

END

-- ── Seed: notifications ──
IF NOT EXISTS (
    SELECT 1
    FROM notifications
)
BEGIN
INSERT INTO
    notifications (
        event_id,
        job_id,
        sms,
        email,
        app,
        delay,
        time_stamp
    )
VALUES (
        'ne001',
        2,
        1,
        1,
        1,
        0,
        '2026-03-20 07:30'
    ),
    (
        'ne002',
        2,
        1,
        0,
        1,
        30,
        '2026-03-20 09:00'
    ), -- remind
    (
        'ne001',
        3,
        1,
        1,
        1,
        0,
        '2026-03-20 08:00'
    ), -- assigned
    (
        'ne003',
        3,
        1,
        1,
        1,
        0,
        '2026-03-21 11:00'
    );
-- completed
END

SELECT 'notaries' AS [Table], COUNT(*) AS [Rows]
FROM notaries
UNION ALL
SELECT 'notary_capabilities', COUNT(*)
FROM notary_capabilities
UNION ALL
SELECT 'notary_availabilities', COUNT(*)
FROM notary_availabilities
UNION ALL
SELECT 'notary_service_areas', COUNT(*)
FROM notary_service_areas
UNION ALL
SELECT 'Job', COUNT(*)
FROM Job
UNION ALL
SELECT 'job assignments', COUNT(*)
FROM [job assignments]
UNION ALL
SELECT 'job_status_logs', COUNT(*)
FROM job_status_logs
UNION ALL
SELECT 'events', COUNT(*)
FROM events
UNION ALL
SELECT 'notifications', COUNT(*)
FROM notifications;
GO

PRINT 'notarial_db khởi tạo thành công!';
GO