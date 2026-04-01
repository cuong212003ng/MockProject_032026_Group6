-- ============================================================
--  notarial_db – SQL Server 2019
--  Nhóm 6 - Javascript & NodeJS
-- ============================================================

USE master;
GO

IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'notarial_db')
    CREATE DATABASE notarial_db;
GO

USE notarial_db;
GO

-- ── 0a. States ──
IF OBJECT_ID ('States', 'U') IS NULL
BEGIN
CREATE TABLE States (
    id         INT PRIMARY KEY IDENTITY (1, 1),
    state_code VARCHAR(10)    NOT NULL,
    state_name NVARCHAR(100)  NOT NULL
);
END
GO

-- ── 0b. Languages ──
IF OBJECT_ID ('Languages', 'U') IS NULL
BEGIN
CREATE TABLE Languages (
    id        INT PRIMARY KEY IDENTITY (1, 1),
    lang_code VARCHAR(10)   NULL,
    lang_name NVARCHAR(100) NULL
);
END
GO

-- ── 1. notaries ──
IF OBJECT_ID ('notaries', 'U') IS NULL
BEGIN
CREATE TABLE notaries (
    id                  INT PRIMARY KEY IDENTITY (1, 1),
    user_id             INT           NOT NULL,
    ssn                 VARCHAR(20)   NULL,
    full_name           NVARCHAR(200) NOT NULL,
    date_of_birth       DATE          NULL,
    photo_url           NVARCHAR(500) NULL,
    phone               VARCHAR(20)   NULL,
    email               VARCHAR(100)  NULL,
    employment_type     NVARCHAR(50)  NULL,   -- FULL_TIME, INDEPENDENT_CONTRACT
    start_date          DATE          NULL,
    internal_notes      NVARCHAR(MAX) NULL,
    status              NVARCHAR(20)  NOT NULL DEFAULT 'ACTIVE',  -- ACTIVE, INACTIVE, BLOCKED
    residential_address NVARCHAR(500) NULL
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
    id          INT PRIMARY KEY IDENTITY (1, 1),
    notary_id   INT NOT NULL REFERENCES notaries (id),
    state_id    INT NOT NULL REFERENCES States (id),
    county_name NVARCHAR(100) NULL   -- NULL nếu phục vụ cả bang
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

-- ── 10. Notary_commissions ──
IF OBJECT_ID ('Notary_commissions', 'U') IS NULL
BEGIN
CREATE TABLE Notary_commissions (
    id                    INT PRIMARY KEY IDENTITY (1, 1),
    notary_id             INT NOT NULL REFERENCES notaries (id),
    commission_state_id   INT NULL     REFERENCES States (id),
    commission_number     VARCHAR(50)  NULL,
    issue_date            DATE         NULL,
    expiration_date       DATE         NULL,
    status                NVARCHAR(20) NULL,   -- VALID, EXPIRED, NOT_QUALIFIED
    is_renewal_applied    BIT          NOT NULL DEFAULT 0,
    expected_renewal_date DATE         NULL
);
END
GO

-- ── 11. Authority_scope ──
IF OBJECT_ID ('Authority_scope', 'U') IS NULL
BEGIN
CREATE TABLE Authority_scope (
    id             INT PRIMARY KEY IDENTITY (1, 1),
    commission_id  INT          NOT NULL REFERENCES Notary_commissions (id),
    authority_type NVARCHAR(50) NULL   -- ACKNOWLEDGMENT, JURAT, RON, LOAN_SIGNING
);
END
GO

-- ── 12. Notary_documents ──
IF OBJECT_ID ('Notary_documents', 'U') IS NULL
BEGIN
CREATE TABLE Notary_documents (
    id                 INT PRIMARY KEY IDENTITY (1, 1),
    notary_id          INT           NOT NULL REFERENCES notaries (id),
    doc_category       NVARCHAR(50)  NULL,   -- COMMISSION_CER, TRAINING_CER, FINGERPRINT...
    file_name          NVARCHAR(255) NULL,
    upload_date        DATETIME      NOT NULL DEFAULT GETDATE(),
    verified_status    NVARCHAR(20)  NULL,   -- PENDING, APPROVED
    version            INT           NOT NULL DEFAULT 1,
    is_current_version BIT           NOT NULL DEFAULT 1,
    file_url           NVARCHAR(500) NULL
);
END
GO

-- ── 13. Notary_insurances ──
IF OBJECT_ID ('Notary_insurances', 'U') IS NULL
BEGIN
CREATE TABLE Notary_insurances (
    id              INT PRIMARY KEY IDENTITY (1, 1),
    notary_id       INT            NOT NULL REFERENCES notaries (id),
    policy_number   VARCHAR(50)    NULL,
    provider_name   NVARCHAR(200)  NULL,
    coverage_amount DECIMAL(18, 2) NULL,
    expiration_date DATE           NULL,
    file_url        NVARCHAR(500)  NULL
);
END
GO

-- ── 14. Notary_bonds ──
IF OBJECT_ID ('Notary_bonds', 'U') IS NULL
BEGIN
CREATE TABLE Notary_bonds (
    id              INT PRIMARY KEY IDENTITY (1, 1),
    notary_id       INT            NOT NULL REFERENCES notaries (id),
    provider_name   NVARCHAR(200)  NULL,
    bond_amount     DECIMAL(18, 2) NULL,
    effective_date  DATE           NULL,
    expiration_date DATE           NULL,
    file_url        NVARCHAR(500)  NULL
);
END
GO

-- ── 15. Ron_technologies ──
IF OBJECT_ID ('Ron_technologies', 'U') IS NULL
BEGIN
CREATE TABLE Ron_technologies (
    id               INT PRIMARY KEY IDENTITY (1, 1),
    capability_id    INT          NOT NULL REFERENCES notary_capabilities (id),
    ron_camera_ready BIT          NOT NULL DEFAULT 0,
    ron_internet_ready BIT        NOT NULL DEFAULT 0,
    digital_status   NVARCHAR(50) NULL
);
END
GO

-- ── 16. Notary_status_history ──
IF OBJECT_ID ('Notary_status_history', 'U') IS NULL
BEGIN
CREATE TABLE Notary_status_history (
    id             INT PRIMARY KEY IDENTITY (1, 1),
    notary_id      INT          NOT NULL REFERENCES notaries (id),
    status         NVARCHAR(20) NULL,
    reason         NVARCHAR(MAX) NULL,
    effective_date DATETIME     NOT NULL DEFAULT GETDATE(),
    created_by     INT          NULL
);
END
GO

-- ── 17. Notary_incidents ──
IF OBJECT_ID ('Notary_incidents', 'U') IS NULL
BEGIN
CREATE TABLE Notary_incidents (
    id            INT PRIMARY KEY IDENTITY (1, 1),
    notary_id     INT           NOT NULL REFERENCES notaries (id),
    incident_type NVARCHAR(100) NULL,
    description   NVARCHAR(MAX) NULL,
    severity      NVARCHAR(20)  NULL,   -- LOW, MEDIUM, HIGH, CRITICAL
    status        NVARCHAR(20)  NULL,   -- OPEN, UNDER_REVIEW, RESOLVED
    resolved_at   DATETIME      NULL,
    created_at    DATETIME      NOT NULL DEFAULT GETDATE()
);
END
GO

IF COL_LENGTH('Notary_incidents', 'created_at') IS NULL
BEGIN
ALTER TABLE Notary_incidents
ADD created_at DATETIME NOT NULL CONSTRAINT DF_Notary_incidents_created_at DEFAULT GETDATE();
END
GO

-- ── 18. Notary_audit_logs ──
IF OBJECT_ID ('Notary_audit_logs', 'U') IS NULL
BEGIN
CREATE TABLE Notary_audit_logs (
    id         INT PRIMARY KEY IDENTITY (1, 1),
    notary_id  INT           NULL,
    table_name VARCHAR(100)  NULL,
    record_id  INT           NULL,
    action     VARCHAR(20)   NULL,   -- INSERT, UPDATE, DELETE
    old_value  NVARCHAR(MAX) NULL,
    new_value  NVARCHAR(MAX) NULL,
    change_by  INT           NULL,
    created_at DATETIME      NOT NULL DEFAULT GETDATE()
);
END
GO

-- ── Seed: States ──
IF NOT EXISTS (SELECT 1 FROM States)
BEGIN
SET IDENTITY_INSERT States ON;
INSERT INTO States (id, state_code, state_name) VALUES
    (1,  'AL', 'Alabama'),
    (2,  'AK', 'Alaska'),
    (3,  'AZ', 'Arizona'),
    (4,  'AR', 'Arkansas'),
    (5,  'CA', 'California'),
    (6,  'CO', 'Colorado'),
    (7,  'CT', 'Connecticut'),
    (8,  'DE', 'Delaware'),
    (9,  'FL', 'Florida'),
    (10, 'GA', 'Georgia'),
    (11, 'HI', 'Hawaii'),
    (12, 'ID', 'Idaho'),
    (13, 'IL', 'Illinois'),
    (14, 'IN', 'Indiana'),
    (15, 'IA', 'Iowa'),
    (16, 'KS', 'Kansas'),
    (17, 'KY', 'Kentucky'),
    (18, 'LA', 'Louisiana'),
    (19, 'ME', 'Maine'),
    (20, 'MD', 'Maryland'),
    (21, 'MA', 'Massachusetts'),
    (22, 'MI', 'Michigan'),
    (23, 'MN', 'Minnesota'),
    (24, 'MS', 'Mississippi'),
    (25, 'MO', 'Missouri'),
    (26, 'MT', 'Montana'),
    (27, 'NE', 'Nebraska'),
    (28, 'NV', 'Nevada'),
    (29, 'NH', 'New Hampshire'),
    (30, 'NJ', 'New Jersey'),
    (31, 'NM', 'New Mexico'),
    (32, 'NY', 'New York'),
    (33, 'NC', 'North Carolina'),
    (34, 'ND', 'North Dakota'),
    (35, 'OH', 'Ohio'),
    (36, 'OK', 'Oklahoma'),
    (37, 'OR', 'Oregon'),
    (38, 'PA', 'Pennsylvania'),
    (39, 'RI', 'Rhode Island'),
    (40, 'SC', 'South Carolina'),
    (41, 'SD', 'South Dakota'),
    (42, 'TN', 'Tennessee'),
    (43, 'TX', 'Texas'),
    (44, 'UT', 'Utah'),
    (45, 'VT', 'Vermont'),
    (46, 'VA', 'Virginia'),
    (47, 'WA', 'Washington'),
    (48, 'WV', 'West Virginia'),
    (49, 'WI', 'Wisconsin'),
    (50, 'WY', 'Wyoming');
SET IDENTITY_INSERT States OFF;
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

SELECT 'States'                AS [Table], COUNT(*) AS [Rows] FROM States
UNION ALL SELECT 'Languages',               COUNT(*) FROM Languages
UNION ALL SELECT 'notaries',                COUNT(*) FROM notaries
UNION ALL SELECT 'Notary_commissions',      COUNT(*) FROM Notary_commissions
UNION ALL SELECT 'Authority_scope',         COUNT(*) FROM Authority_scope
UNION ALL SELECT 'Notary_documents',        COUNT(*) FROM Notary_documents
UNION ALL SELECT 'Notary_insurances',       COUNT(*) FROM Notary_insurances
UNION ALL SELECT 'Notary_bonds',            COUNT(*) FROM Notary_bonds
UNION ALL SELECT 'notary_capabilities',     COUNT(*) FROM notary_capabilities
UNION ALL SELECT 'Ron_technologies',        COUNT(*) FROM Ron_technologies
UNION ALL SELECT 'notary_service_areas',    COUNT(*) FROM notary_service_areas
UNION ALL SELECT 'notary_availabilities',   COUNT(*) FROM notary_availabilities
UNION ALL SELECT 'Notary_status_history',   COUNT(*) FROM Notary_status_history
UNION ALL SELECT 'Notary_incidents',        COUNT(*) FROM Notary_incidents
UNION ALL SELECT 'Notary_audit_logs',       COUNT(*) FROM Notary_audit_logs
UNION ALL SELECT 'Job',                     COUNT(*) FROM Job
UNION ALL SELECT 'job assignments',         COUNT(*) FROM [job assignments]
UNION ALL SELECT 'job_status_logs',         COUNT(*) FROM job_status_logs
UNION ALL SELECT 'events',                  COUNT(*) FROM events
UNION ALL SELECT 'notifications',           COUNT(*) FROM notifications;
GO

ALTER TABLE Notary_insurances
ADD effective_date DATE NULL;

PRINT 'notarial_db khởi tạo thành công!';
GO
