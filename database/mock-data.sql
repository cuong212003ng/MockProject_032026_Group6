-- ============================================================
--  notarial_db mock data seed
--
--  Purpose:
--  - keep existing schema scripts in database/init.sql and database/auth.sql
--  - replace partial sample rows in notarial_db with the full mock dataset
--
--  Run order:
--  1. database/init.sql
--  2. database/auth.sql
--  3. database/crm.sql
--  4. database/mock-data.sql
-- ============================================================

USE notarial_db;
GO

IF COL_LENGTH('notaries', 'work_holiday') IS NULL
BEGIN
    ALTER TABLE notaries ADD work_holiday BIT NOT NULL DEFAULT 0;
END
GO

IF OBJECT_ID('Holidays', 'U') IS NULL
BEGIN
CREATE TABLE Holidays (
    id        INT PRIMARY KEY IDENTITY(1,1),
    name      NVARCHAR(100) NOT NULL,
    type      VARCHAR(20)   NOT NULL CHECK (type IN ('FEDERAL', 'STATE')),
    state_id  INT           NULL REFERENCES States(id),
    date_rule VARCHAR(100)  NOT NULL
);
END
GO

IF COL_LENGTH('notary_availabilities', 'federal_holiday_mode') IS NULL
BEGIN
    ALTER TABLE notary_availabilities ADD
        federal_holiday_mode VARCHAR(20) NOT NULL DEFAULT 'NONE' CHECK (federal_holiday_mode IN ('ALL', 'SELECTED', 'NONE')),
        state_holiday_mode VARCHAR(20) NOT NULL DEFAULT 'NONE' CHECK (state_holiday_mode IN ('ALL', 'SELECTED', 'NONE')),
        state_holiday_state_id INT NULL REFERENCES States(id);
END
GO

IF OBJECT_ID('notary_selected_holidays', 'U') IS NULL
BEGIN
CREATE TABLE notary_selected_holidays (
    notary_id  INT NOT NULL REFERENCES notaries(id) ON DELETE CASCADE,
    holiday_id INT NOT NULL REFERENCES Holidays(id),
    PRIMARY KEY (notary_id, holiday_id)
);
END
GO

IF COL_LENGTH('Notary_insurances', 'effective_date') IS NULL
BEGIN
    ALTER TABLE Notary_insurances ADD effective_date DATE NULL;
END
GO

IF OBJECT_ID('notifications', 'U') IS NOT NULL DELETE FROM notifications;
IF OBJECT_ID('job_status_logs', 'U') IS NOT NULL DELETE FROM job_status_logs;
IF OBJECT_ID('[job assignments]', 'U') IS NOT NULL DELETE FROM [job assignments];
IF OBJECT_ID('Job', 'U') IS NOT NULL DELETE FROM Job;
IF OBJECT_ID('Notary_audit_logs', 'U') IS NOT NULL DELETE FROM Notary_audit_logs;
IF OBJECT_ID('Notary_incidents', 'U') IS NOT NULL DELETE FROM Notary_incidents;
IF OBJECT_ID('Notary_status_history', 'U') IS NOT NULL DELETE FROM Notary_status_history;
IF OBJECT_ID('Authority_scope', 'U') IS NOT NULL DELETE FROM Authority_scope;
IF OBJECT_ID('Ron_technologies', 'U') IS NOT NULL DELETE FROM Ron_technologies;
IF OBJECT_ID('Notary_documents', 'U') IS NOT NULL DELETE FROM Notary_documents;
IF OBJECT_ID('Notary_insurances', 'U') IS NOT NULL DELETE FROM Notary_insurances;
IF OBJECT_ID('Notary_bonds', 'U') IS NOT NULL DELETE FROM Notary_bonds;
IF OBJECT_ID('Notary_commissions', 'U') IS NOT NULL DELETE FROM Notary_commissions;
IF OBJECT_ID('notary_languages', 'U') IS NOT NULL DELETE FROM notary_languages;
IF OBJECT_ID('notary_selected_holidays', 'U') IS NOT NULL DELETE FROM notary_selected_holidays;
IF OBJECT_ID('notary_blackout_dates', 'U') IS NOT NULL DELETE FROM notary_blackout_dates;
IF OBJECT_ID('notary_service_areas', 'U') IS NOT NULL DELETE FROM notary_service_areas;
IF OBJECT_ID('notary_availabilities', 'U') IS NOT NULL DELETE FROM notary_availabilities;
IF OBJECT_ID('notary_capabilities', 'U') IS NOT NULL DELETE FROM notary_capabilities;
IF OBJECT_ID('notaries', 'U') IS NOT NULL DELETE FROM notaries;
IF OBJECT_ID('Holidays', 'U') IS NOT NULL DELETE FROM Holidays;
IF OBJECT_ID('Languages', 'U') IS NOT NULL DELETE FROM Languages;
IF OBJECT_ID('States', 'U') IS NOT NULL DELETE FROM States;
GO

-- Seed: States
IF NOT EXISTS (SELECT 1 FROM States)
BEGIN
SET IDENTITY_INSERT States ON;
INSERT INTO States (id, state_code, state_name) VALUES
    (1, 'AL', N'Alabama'),
    (2, 'AK', N'Alaska'),
    (3, 'AZ', N'Arizona'),
    (4, 'AR', N'Arkansas'),
    (5, 'CA', N'California'),
    (6, 'CO', N'Colorado'),
    (7, 'CT', N'Connecticut'),
    (8, 'DE', N'Delaware'),
    (9, 'FL', N'Florida'),
    (10, 'GA', N'Georgia'),
    (11, 'HI', N'Hawaii'),
    (12, 'ID', N'Idaho'),
    (13, 'IL', N'Illinois'),
    (14, 'IN', N'Indiana'),
    (15, 'IA', N'Iowa'),
    (16, 'KS', N'Kansas'),
    (17, 'KY', N'Kentucky'),
    (18, 'LA', N'Louisiana'),
    (19, 'ME', N'Maine'),
    (20, 'MD', N'Maryland'),
    (21, 'MA', N'Massachusetts'),
    (22, 'MI', N'Michigan'),
    (23, 'MN', N'Minnesota'),
    (24, 'MS', N'Mississippi'),
    (25, 'MO', N'Missouri'),
    (26, 'MT', N'Montana'),
    (27, 'NE', N'Nebraska'),
    (28, 'NV', N'Nevada'),
    (29, 'NH', N'New Hampshire'),
    (30, 'NJ', N'New Jersey'),
    (31, 'NM', N'New Mexico'),
    (32, 'NY', N'New York'),
    (33, 'NC', N'North Carolina'),
    (34, 'ND', N'North Dakota'),
    (35, 'OH', N'Ohio'),
    (36, 'OK', N'Oklahoma'),
    (37, 'OR', N'Oregon'),
    (38, 'PA', N'Pennsylvania'),
    (39, 'RI', N'Rhode Island'),
    (40, 'SC', N'South Carolina'),
    (41, 'SD', N'South Dakota'),
    (42, 'TN', N'Tennessee'),
    (43, 'TX', N'Texas'),
    (44, 'UT', N'Utah'),
    (45, 'VT', N'Vermont'),
    (46, 'VA', N'Virginia'),
    (47, 'WA', N'Washington'),
    (48, 'WV', N'West Virginia'),
    (49, 'WI', N'Wisconsin'),
    (50, 'WY', N'Wyoming');
SET IDENTITY_INSERT States OFF;
END
GO

-- Seed: Languages
IF NOT EXISTS (SELECT 1 FROM Languages)
BEGIN
SET IDENTITY_INSERT Languages ON;
INSERT INTO Languages (id, lang_code, lang_name) VALUES
    (1, 'aa', N'Afar'),
    (2, 'ab', N'Abkhazian'),
    (3, 'ae', N'Avestan'),
    (4, 'af', N'Afrikaans'),
    (5, 'ak', N'Akan'),
    (6, 'am', N'Amharic'),
    (7, 'an', N'Aragonese'),
    (8, 'ar', N'Arabic'),
    (9, 'as', N'Assamese'),
    (10, 'av', N'Avaric'),
    (11, 'ay', N'Aymara'),
    (12, 'az', N'Azerbaijani'),
    (13, 'ba', N'Bashkir'),
    (14, 'be', N'Belarusian'),
    (15, 'bg', N'Bulgarian'),
    (16, 'bh', N'Bihari languages'),
    (17, 'bi', N'Bislama'),
    (18, 'bm', N'Bambara'),
    (19, 'bn', N'Bengali'),
    (20, 'bo', N'Tibetan'),
    (21, 'br', N'Breton'),
    (22, 'bs', N'Bosnian'),
    (23, 'ca', N'Catalan'),
    (24, 'ce', N'Chechen'),
    (25, 'ch', N'Chamorro'),
    (26, 'co', N'Corsican'),
    (27, 'cr', N'Cree'),
    (28, 'cs', N'Czech'),
    (29, 'cu', N'Church Slavic'),
    (30, 'cv', N'Chuvash'),
    (31, 'cy', N'Welsh'),
    (32, 'da', N'Danish'),
    (33, 'de', N'German'),
    (34, 'dv', N'Divehi'),
    (35, 'dz', N'Dzongkha'),
    (36, 'ee', N'Ewe'),
    (37, 'el', N'Greek'),
    (38, 'en', N'English'),
    (39, 'eo', N'Esperanto'),
    (40, 'es', N'Spanish'),
    (41, 'et', N'Estonian'),
    (42, 'eu', N'Basque'),
    (43, 'fa', N'Persian'),
    (44, 'ff', N'Fulah'),
    (45, 'fi', N'Finnish'),
    (46, 'fj', N'Fijian'),
    (47, 'fo', N'Faroese'),
    (48, 'fr', N'French'),
    (49, 'fy', N'Western Frisian'),
    (50, 'ga', N'Irish'),
    (51, 'gd', N'Gaelic'),
    (52, 'gl', N'Galician'),
    (53, 'gn', N'Guarani'),
    (54, 'gu', N'Gujarati'),
    (55, 'gv', N'Manx'),
    (56, 'ha', N'Hausa'),
    (57, 'he', N'Hebrew'),
    (58, 'hi', N'Hindi'),
    (59, 'ho', N'Hiri Motu'),
    (60, 'hr', N'Croatian'),
    (61, 'ht', N'Haitian'),
    (62, 'hu', N'Hungarian'),
    (63, 'hy', N'Armenian'),
    (64, 'hz', N'Herero'),
    (65, 'ia', N'Interlingua'),
    (66, 'id', N'Indonesian'),
    (67, 'ie', N'Interlingue'),
    (68, 'ig', N'Igbo'),
    (69, 'ii', N'Sichuan Yi'),
    (70, 'ik', N'Inupiaq'),
    (71, 'io', N'Ido'),
    (72, 'is', N'Icelandic'),
    (73, 'it', N'Italian'),
    (74, 'iu', N'Inuktitut'),
    (75, 'ja', N'Japanese'),
    (76, 'jv', N'Javanese'),
    (77, 'ka', N'Georgian'),
    (78, 'kg', N'Kongo'),
    (79, 'ki', N'Kikuyu'),
    (80, 'kj', N'Kuanyama'),
    (81, 'kk', N'Kazakh'),
    (82, 'kl', N'Kalaallisut'),
    (83, 'km', N'Central Khmer'),
    (84, 'kn', N'Kannada'),
    (85, 'ko', N'Korean'),
    (86, 'kr', N'Kanuri'),
    (87, 'ks', N'Kashmiri'),
    (88, 'ku', N'Kurdish'),
    (89, 'kv', N'Komi'),
    (90, 'kw', N'Cornish'),
    (91, 'ky', N'Kirghiz'),
    (92, 'la', N'Latin'),
    (93, 'lb', N'Luxembourgish'),
    (94, 'lg', N'Ganda'),
    (95, 'li', N'Limburgan'),
    (96, 'ln', N'Lingala'),
    (97, 'lo', N'Lao'),
    (98, 'lt', N'Lithuanian'),
    (99, 'lu', N'Luba-Katanga'),
    (100, 'lv', N'Latvian'),
    (101, 'mg', N'Malagasy'),
    (102, 'mh', N'Marshallese'),
    (103, 'mi', N'Maori'),
    (104, 'mk', N'Macedonian'),
    (105, 'ml', N'Malayalam'),
    (106, 'mn', N'Mongolian'),
    (107, 'mr', N'Marathi'),
    (108, 'ms', N'Malay'),
    (109, 'mt', N'Maltese'),
    (110, 'my', N'Burmese'),
    (111, 'na', N'Nauru'),
    (112, 'nb', N'Norwegian BokmÃ¥l'),
    (113, 'nd', N'North Ndebele'),
    (114, 'ne', N'Nepali'),
    (115, 'ng', N'Ndonga'),
    (116, 'nl', N'Dutch'),
    (117, 'nn', N'Norwegian Nynorsk'),
    (118, 'no', N'Norwegian'),
    (119, 'nr', N'South Ndebele'),
    (120, 'nv', N'Navajo'),
    (121, 'ny', N'Chichewa'),
    (122, 'oc', N'Occitan'),
    (123, 'oj', N'Ojibwa'),
    (124, 'om', N'Oromo'),
    (125, 'or', N'Oriya'),
    (126, 'os', N'Ossetian'),
    (127, 'pa', N'Panjabi'),
    (128, 'pi', N'Pali'),
    (129, 'pl', N'Polish'),
    (130, 'ps', N'Pushto'),
    (131, 'pt', N'Portuguese'),
    (132, 'qu', N'Quechua'),
    (133, 'rm', N'Romansh'),
    (134, 'rn', N'Rundi'),
    (135, 'ro', N'Romanian'),
    (136, 'ru', N'Russian'),
    (137, 'rw', N'Kinyarwanda'),
    (138, 'sa', N'Sanskrit'),
    (139, 'sc', N'Sardinian'),
    (140, 'sd', N'Sindhi'),
    (141, 'se', N'Northern Sami'),
    (142, 'sg', N'Sango'),
    (143, 'si', N'Sinhala'),
    (144, 'sk', N'Slovak'),
    (145, 'sl', N'Slovenian'),
    (146, 'sm', N'Samoan'),
    (147, 'sn', N'Shona'),
    (148, 'so', N'Somali'),
    (149, 'sq', N'Albanian'),
    (150, 'sr', N'Serbian'),
    (151, 'ss', N'Swati'),
    (152, 'st', N'Southern Sotho'),
    (153, 'su', N'Sundanese'),
    (154, 'sv', N'Swedish'),
    (155, 'sw', N'Swahili'),
    (156, 'ta', N'Tamil'),
    (157, 'te', N'Telugu'),
    (158, 'tg', N'Tajik'),
    (159, 'th', N'Thai'),
    (160, 'ti', N'Tigrinya'),
    (161, 'tk', N'Turkmen'),
    (162, 'tl', N'Tagalog'),
    (163, 'tn', N'Tswana'),
    (164, 'to', N'Tonga'),
    (165, 'tr', N'Turkish'),
    (166, 'ts', N'Tsonga'),
    (167, 'tt', N'Tatar'),
    (168, 'tw', N'Twi'),
    (169, 'ty', N'Tahitian'),
    (170, 'ug', N'Uighur'),
    (171, 'uk', N'Ukrainian'),
    (172, 'ur', N'Urdu'),
    (173, 'uz', N'Uzbek'),
    (174, 've', N'Venda'),
    (175, 'vi', N'Vietnamese'),
    (176, 'vo', N'VolapÃ¼k'),
    (177, 'wa', N'Walloon'),
    (178, 'wo', N'Wolof'),
    (179, 'xh', N'Xhosa'),
    (180, 'yi', N'Yiddish'),
    (181, 'yo', N'Yoruba'),
    (182, 'za', N'Zhuang'),
    (183, 'zh', N'Chinese'),
    (184, 'zu', N'Zulu');
SET IDENTITY_INSERT Languages OFF;
END
GO

-- Seed: notaries
IF NOT EXISTS (SELECT 1 FROM notaries)
BEGIN
SET IDENTITY_INSERT notaries ON;
INSERT INTO notaries (id,user_id,ssn,full_name,date_of_birth,photo_url,phone,email,
    employment_type,start_date,internal_notes,status,residential_address,work_holiday)
VALUES
    (1, 1001, '123-45-6789', N'James Smith', '1985-02-15', '/img/jsmith.jpg', '(555) 123-4567', 'j.smith@mail.com', 'FULL_TIME', '2021-01-06', N'Top performer 2022', 'ACTIVE', N'123 Maple St, Seattle, WA 98101', 1),
    (2, 1002, '234-56-7890', N'Emily Johnson', '1990-08-22', '/img/ejohnson.jpg', '(555) 234-5678', 'emily.j@mail.com', 'FULL_TIME', '2022-01-15', N'Consistently meets targets; strong client satisfaction scores', 'ACTIVE', N'456 Oak Ave, Austin, TX 73301', 0),
    (3, 1003, '345-67-8901', N'Michael Williams', '1988-11-30', '/img/mwilliams.jpg', '(555) 345-6789', 'm.williams@mail.com', 'INDEPENDENT_CONTRACT', '2023-10-03', N'Background check renewed', 'ACTIVE', N'789 Pine Ln, Chicago, IL 60601', 1),
    (4, 1004, '456-78-9012', N'Jessica Brown', '1992-12-04', '/img/jbrown.jpg', '(555) 456-7890', 'jessica.b@mail.com', 'FULL_TIME', '2021-01-09', N'On maternity leave', 'INACTIVE', N'321 Cedar Blvd, Denver, CO 80202', 0),
    (5, 1005, '567-89-0123', N'David Jones', '1986-07-07', '/img/djones.jpg', '(555) 567-8901', 'd.jones@mail.com', 'FULL_TIME', '2020-11-20', N'Reliable performer; 5+ years experience; positive client reviews', 'ACTIVE', N'654 Elm St, Boston, MA 02108', 1),
    (6, 1006, '678-90-1234', N'Sarah Garcia', '1995-09-25', '/img/sgarcia.jpg', '(555) 678-9012', 'sarah.g@mail.com', 'INDEPENDENT_CONTRACT', '2024-05-01', N'Pending state license', 'INACTIVE', N'987 Birch Rd, Miami, FL 33101', 0),
    (7, 1007, '789-01-2345', N'Robert Miller', '1983-12-12', '/img/rmiller.jpg', '(555) 789-0123', 'r.miller@mail.com', 'FULL_TIME', '2019-05-15', N'Policy violation reported', 'BLOCKED', N'159 Walnut Ct, Phoenix, AZ 85001', 0),
    (8, 1008, '890-12-3456', N'Ashley Davis', '1991-08-03', '/img/adavis.jpg', '(555) 890-1234', 'ashley.d@mail.com', 'FULL_TIME', '2022-10-08', N'New hire; smooth onboarding; excels in document review', 'ACTIVE', N'753 Cherry Way, Atlanta, GA 30301', 1),
    (9, 1009, '901-23-4567', N'William Rodriguez', '1989-06-18', '/img/wrodriguez.jpg', '(555) 901-2345', 'w.rodriguez@mail.com', 'INDEPENDENT_CONTRACT', '2023-01-11', N'Bilingual (Spanish)', 'ACTIVE', N'852 Ash Pl, Dallas, TX 75201', 1),
    (10, 1010, '012-34-5678', N'Amanda Martinez', '1994-10-20', '/img/amartinez.jpg', '(555) 012-3456', 'amanda.m@mail.com', 'FULL_TIME', '2021-02-28', N'Senior Notary', 'ACTIVE', N'951 Spruce Dr, San Diego, CA 92101', 1),
    (11, 1011, '111-22-3333', N'Joseph Hernandez', '1987-05-01', '/img/jhernandez.jpg', '(555) 111-2233', 'j.hernandez@mail.com', 'FULL_TIME', '2020-07-15', N'Experienced in loan signing and real estate closings', 'ACTIVE', N'124 King St, Portland, OR 97204', 0),
    (12, 1012, '222-33-4444', N'Melissa Lopez', '1993-05-14', '/img/mlopez.jpg', '(555) 222-3344', 'melissa.l@mail.com', 'INDEPENDENT_CONTRACT', '2024-10-02', N'Mobile notary specialist; flexible scheduling', 'ACTIVE', N'567 Queen Ave, Las Vegas, NV 89101', 1),
    (13, 1013, '333-44-5555', N'Charles Gonzalez', '1984-09-08', '/img/cgonzalez.jpg', '(555) 333-4455', 'c.gonzalez@mail.com', 'FULL_TIME', '2018-04-20', N'Branch Manager', 'ACTIVE', N'890 Prince Rd, Orlando, FL 32801', 0),
    (14, 1014, '444-55-6666', N'Nicole Wilson', '1996-02-12', '/img/nwilson.jpg', '(555) 444-5566', 'nicole.w@mail.com', 'FULL_TIME', '2023-05-09', N'Joined via referral program; bilingual communication skills', 'ACTIVE', N'234 Main St, Columbus, OH 43215', 0),
    (15, 1015, '555-66-7777', N'Thomas Anderson', '1982-11-11', '/img/tanderson.jpg', '(555) 555-6677', 't.anderson@mail.com', 'INDEPENDENT_CONTRACT', '2021-12-12', N'Customer complaints', 'BLOCKED', N'345 Oak Ave, Charlotte, NC 28202', 0),
    (16, 1016, '666-77-8888', N'Samantha Thomas', '1990-02-28', '/img/sthomas.jpg', '(555) 666-7788', 'samantha.t@mail.com', 'FULL_TIME', '2022-05-18', N'Strong RON capability; remote session feedback excellent', 'ACTIVE', N'456 Pine Ln, Detroit, MI 48226', 1),
    (17, 1017, '777-88-9999', N'Christopher Taylor', '1988-07-24', '/img/ctaylor.jpg', '(555) 777-8899', 'c.taylor@mail.com', 'FULL_TIME', '2020-10-10', N'High-volume appointment handler; commended for punctuality', 'ACTIVE', N'567 Maple St, Nashville, TN 37203', 0),
    (18, 1018, '888-99-0000', N'Elizabeth Moore', '1995-04-16', '/img/emoore.jpg', '(555) 888-9900', 'e.moore@mail.com', 'INDEPENDENT_CONTRACT', '2023-06-25', N'Personal leave', 'INACTIVE', N'678 Cedar Blvd, Houston, TX 77002', 0),
    (19, 1019, '999-00-1111', N'Joshua Jackson', '1985-09-09', '/img/jjackson.jpg', '(555) 999-0011', 'j.jackson@mail.com', 'FULL_TIME', '2019-08-08', N'Senior-level experience; cross-state commission history', 'ACTIVE', N'789 Elm St, San Jose, CA 95113', 1),
    (20, 1020, '000-11-2222', N'Lauren Martin', '1992-01-31', '/img/lmartin.jpg', '(555) 000-1122', 'lauren.m@mail.com', 'FULL_TIME', '2021-03-15', N'Cross-trained in multiple document types; consistent accuracy', 'ACTIVE', N'890 Birch Rd, Philadelphia, PA 19104', 1);
SET IDENTITY_INSERT notaries OFF;
END
GO

-- Seed: Notary_commissions
IF NOT EXISTS (SELECT 1 FROM Notary_commissions)
BEGIN
SET IDENTITY_INSERT Notary_commissions ON;
INSERT INTO Notary_commissions (id,notary_id,commission_state_id,commission_number,
    issue_date,expiration_date,status,is_renewal_applied,expected_renewal_date)
VALUES
    (1, 1, 5, '23456789', '2021-01-01 00:00:00', '2025-01-01 00:00:00', 'EXPIRED', 0, '2024-11-01 00:00:00'),
    (2, 2, 43, '87654321', '2022-05-10 00:00:00', '2026-05-10 00:00:00', 'VALID', 1, '2026-04-01 00:00:00'),
    (3, 3, 32, '99887766', '2019-03-15 00:00:00', '2023-03-15 00:00:00', 'EXPIRED', 0, '2023-01-15 00:00:00'),
    (4, 4, 9, 'GG123456', '2023-07-20 00:00:00', '2027-07-20 00:00:00', 'VALID', 0, '2027-05-20 00:00:00'),
    (5, 5, 47, 'WA556677', '2018-09-01 00:00:00', '2022-09-01 00:00:00', 'EXPIRED', 0, '2022-07-01 00:00:00'),
    (6, 6, 28, 'NV334455', '2024-01-10 00:00:00', '2028-01-10 00:00:00', 'VALID', 0, '2027-11-10 00:00:00'),
    (7, 7, 3, 'AZ778899', '2021-11-11 00:00:00', '2025-11-11 00:00:00', 'EXPIRED', 0, '2025-09-11 00:00:00'),
    (8, 8, 13, 'IL223344', '2023-02-02 00:00:00', '2027-02-02 00:00:00', 'VALID', 1, '2027-01-01 00:00:00'),
    (9, 9, 35, 'OH998811', '2022-06-06 00:00:00', '2026-06-06 00:00:00', 'VALID', 0, '2026-04-06 00:00:00'),
    (10, 10, 22, 'MI445566', '2020-08-08 00:00:00', '2024-08-08 00:00:00', 'EXPIRED', 0, '2024-06-08 00:00:00'),
    (11, 11, 10, 'GA112233', '2023-12-12 00:00:00', '2027-12-12 00:00:00', 'VALID', 1, '2027-11-01 00:00:00'),
    (12, 12, 33, 'NC667788', '2018-03-03 00:00:00', '2022-03-03 00:00:00', 'EXPIRED', 0, '2022-01-03 00:00:00'),
    (13, 13, 46, 'VA889900', '2024-04-04 00:00:00', '2028-04-04 00:00:00', 'VALID', 0, '2028-02-04 00:00:00'),
    (14, 14, 30, 'NJ556644', '2020-10-10 00:00:00', '2024-10-10 00:00:00', 'EXPIRED', 0, '2024-08-10 00:00:00'),
    (15, 15, 38, 'PA332211', '2019-07-07 00:00:00', '2023-07-07 00:00:00', 'EXPIRED', 0, '2023-05-07 00:00:00'),
    (16, 16, 21, 'MA909090', '2024-02-02 00:00:00', '2028-02-02 00:00:00', 'VALID', 0, '2027-12-02 00:00:00'),
    (17, 17, 6, 'CO121212', '2023-05-05 00:00:00', '2027-05-05 00:00:00', 'VALID', 0, '2027-03-05 00:00:00'),
    (18, 18, 37, 'OR343434', '2022-09-09 00:00:00', '2026-09-09 00:00:00', 'VALID', 1, '2026-08-01 00:00:00'),
    (19, 19, 23, 'MN565656', '2021-11-11 00:00:00', '2025-11-11 00:00:00', 'NOT_QUALIFIED', 0, '2025-09-11 00:00:00'),
    (20, 20, 44, 'UT787878', '2024-06-06 00:00:00', '2028-06-06 00:00:00', 'VALID', 0, '2028-04-06 00:00:00');
SET IDENTITY_INSERT Notary_commissions OFF;
END
GO

-- Seed: Authority_scope
IF NOT EXISTS (SELECT 1 FROM Authority_scope)
BEGIN
SET IDENTITY_INSERT Authority_scope ON;
INSERT INTO Authority_scope (id,commission_id,authority_type) VALUES
    (1, 1, N'ACKNOWLEDGMENT'),
    (2, 1, N'JURAT'),
    (3, 2, N'ACKNOWLEDGMENT'),
    (4, 2, N'JURAT'),
    (5, 2, N'RON'),
    (6, 2, N'LOAN_SIGNING'),
    (7, 3, N'ACKNOWLEDGMENT'),
    (8, 3, N'JURAT'),
    (9, 4, N'ACKNOWLEDGMENT'),
    (10, 4, N'JURAT'),
    (11, 4, N'RON'),
    (12, 5, N'ACKNOWLEDGMENT'),
    (13, 5, N'JURAT'),
    (14, 6, N'ACKNOWLEDGMENT'),
    (15, 6, N'JURAT'),
    (16, 6, N'LOAN_SIGNING'),
    (17, 7, N'ACKNOWLEDGMENT'),
    (18, 7, N'JURAT'),
    (19, 8, N'ACKNOWLEDGMENT'),
    (20, 8, N'JURAT'),
    (21, 9, N'ACKNOWLEDGMENT'),
    (22, 9, N'JURAT'),
    (23, 10, N'ACKNOWLEDGMENT'),
    (24, 10, N'JURAT'),
    (25, 11, N'ACKNOWLEDGMENT'),
    (26, 11, N'JURAT'),
    (27, 12, N'ACKNOWLEDGMENT'),
    (28, 12, N'JURAT'),
    (29, 13, N'ACKNOWLEDGMENT'),
    (30, 13, N'JURAT'),
    (31, 13, N'RON'),
    (32, 14, N'ACKNOWLEDGMENT'),
    (33, 14, N'JURAT'),
    (34, 15, N'ACKNOWLEDGMENT'),
    (35, 15, N'JURAT'),
    (36, 16, N'ACKNOWLEDGMENT'),
    (37, 16, N'JURAT'),
    (38, 17, N'ACKNOWLEDGMENT'),
    (39, 17, N'JURAT'),
    (40, 18, N'ACKNOWLEDGMENT'),
    (41, 18, N'JURAT'),
    (42, 19, N'ACKNOWLEDGMENT'),
    (43, 19, N'JURAT'),
    (44, 20, N'ACKNOWLEDGMENT'),
    (45, 20, N'JURAT'),
    (46, 20, N'LOAN_SIGNING');
SET IDENTITY_INSERT Authority_scope OFF;
END
GO

-- Seed: notary_capabilities
IF NOT EXISTS (SELECT 1 FROM notary_capabilities)
BEGIN
SET IDENTITY_INSERT notary_capabilities ON;
INSERT INTO notary_capabilities (id,notary_id,mobile,RON,loan_signing,apostille_related_support,max_distance)
VALUES
    (1, 1, 1, 1, 1, 0, 30),
    (2, 2, 1, 0, 1, 1, 25),
    (3, 3, 0, 1, 0, 0, 50),
    (4, 4, 1, 1, 1, 1, 40),
    (5, 5, 1, 0, 0, 1, 20),
    (6, 6, 0, 1, 1, 0, 60),
    (7, 7, 1, 1, 0, 0, 35),
    (8, 8, 1, 0, 1, 0, 15),
    (9, 9, 0, 1, 1, 1, 45),
    (10, 10, 1, 1, 0, 1, 30),
    (11, 11, 1, 0, 1, 0, 20),
    (12, 12, 0, 1, 0, 1, 55),
    (13, 13, 1, 1, 1, 0, 40),
    (14, 14, 1, 0, 0, 0, 10),
    (15, 15, 0, 1, 1, 1, 50),
    (16, 16, 1, 1, 0, 0, 25),
    (17, 17, 1, 0, 1, 1, 30),
    (18, 18, 0, 1, 0, 0, 60),
    (19, 19, 1, 1, 1, 1, 45),
    (20, 20, 1, 0, 0, 1, 20);
SET IDENTITY_INSERT notary_capabilities OFF;
END
GO

-- Seed: Ron_technologies
IF NOT EXISTS (SELECT 1 FROM Ron_technologies)
BEGIN
SET IDENTITY_INSERT Ron_technologies ON;
INSERT INTO Ron_technologies (id,capability_id,ron_camera_ready,ron_internet_ready,digital_status)
VALUES
    (1, 1, 1, 1, 'ACTIVE'),
    (2, 3, 1, 0, 'INACTIVE'),
    (3, 4, 1, 1, 'ACTIVE'),
    (4, 6, 0, 1, 'ACTIVE'),
    (5, 7, 1, 1, 'ACTIVE'),
    (6, 9, 1, 1, 'ACTIVE'),
    (7, 10, 1, 0, 'INACTIVE'),
    (8, 12, 1, 1, 'ACTIVE'),
    (9, 13, 1, 1, 'ACTIVE'),
    (10, 15, 0, 1, 'INACTIVE'),
    (11, 16, 1, 1, 'ACTIVE'),
    (12, 18, 1, 0, 'INACTIVE'),
    (13, 19, 1, 1, 'ACTIVE');
SET IDENTITY_INSERT Ron_technologies OFF;
END
GO

-- Seed: notary_availabilities
IF NOT EXISTS (SELECT 1 FROM notary_availabilities)
BEGIN
SET IDENTITY_INSERT notary_availabilities ON;
INSERT INTO notary_availabilities (
    id,notary_id,working_days_per_week,start_time,end_time,fixed_days_off,
    federal_holiday_mode,state_holiday_mode,state_holiday_state_id
)
VALUES
    (1, 1, 5, '08:00:00', '17:00:00', 'sat,sun', 'SELECTED', 'NONE', NULL),
    (2, 2, 6, '09:00:00', '18:00:00', 'sun', 'NONE', 'ALL', 43),
    (3, 3, 5, '08:30:00', '17:30:00', 'sat', 'ALL', 'NONE', NULL),
    (4, 4, 6, '10:00:00', '19:00:00', 'sun', 'NONE', 'SELECTED', 5),
    (5, 5, 5, '08:00:00', '16:00:00', 'sat,sun', 'SELECTED', 'ALL', 43),
    (6, 6, 6, '09:00:00', '15:00:00', 'sun', 'NONE', 'ALL', 43),
    (7, 7, 5, '07:00:00', '15:00:00', 'sat,sun', 'NONE', 'NONE', NULL),
    (8, 8, 6, '08:00:00', '16:00:00', 'sun', 'ALL', 'NONE', NULL),
    (9, 9, 5, '10:00:00', '18:00:00', 'sat', 'SELECTED', 'ALL', 9),
    (10, 10, 6, '08:00:00', '17:00:00', 'sun', 'ALL', 'SELECTED', 5),
    (11, 11, 5, '09:00:00', '18:00:00', 'sat,sun', 'NONE', 'NONE', NULL),
    (12, 12, 6, '08:00:00', '14:00:00', 'sun', 'SELECTED', 'NONE', NULL),
    (13, 13, 5, '10:00:00', '18:00:00', 'sat', 'NONE', 'ALL', 9),
    (14, 14, 6, '07:00:00', '15:00:00', 'sun', 'NONE', 'NONE', NULL),
    (15, 15, 5, '08:30:00', '17:30:00', 'sat,sun', 'NONE', 'NONE', NULL),
    (16, 16, 6, '09:00:00', '18:00:00', 'sun', 'ALL', 'NONE', NULL),
    (17, 17, 5, '07:00:00', '15:00:00', 'sat', 'SELECTED', 'NONE', NULL),
    (18, 18, 6, '10:00:00', '16:00:00', 'sun', 'NONE', 'ALL', 47),
    (19, 19, 5, '08:00:00', '17:00:00', 'sat,sun', 'ALL', 'SELECTED', 47),
    (20, 20, 6, '09:00:00', '18:00:00', 'sun', 'SELECTED', 'NONE', NULL);
SET IDENTITY_INSERT notary_availabilities OFF;
END
GO

-- Seed: notary_service_areas
IF NOT EXISTS (SELECT 1 FROM notary_service_areas)
BEGIN
SET IDENTITY_INSERT notary_service_areas ON;
INSERT INTO notary_service_areas (id,notary_id,state_id,county_name)
VALUES
    (1, 1, 5, N'Los Angeles'),
    (2, 2, 5, N'Orange'),
    (3, 3, 5, N'San Diego'),
    (4, 4, 5, N'Santa Clara'),
    (5, 5, 43, N'Harris'),
    (6, 6, 43, N'Dallas'),
    (7, 7, 43, N'Tarrant'),
    (8, 8, 43, N'Travis'),
    (9, 9, 9, N'Miami-Dade'),
    (10, 10, 9, N'Broward'),
    (11, 11, 9, N'Orange'),
    (12, 12, 9, N'Palm Beach'),
    (13, 13, 32, N'Kings'),
    (14, 14, 32, N'Queens'),
    (15, 15, 32, N'New York'),
    (16, 16, 32, N'Bronx'),
    (17, 17, 47, N'King'),
    (18, 18, 47, N'Pierce'),
    (19, 19, 47, N'Snohomish'),
    (20, 20, 13, N'Cook');
SET IDENTITY_INSERT notary_service_areas OFF;
END
GO

-- Seed: Notary_documents
IF NOT EXISTS (SELECT 1 FROM Notary_documents)
BEGIN
SET IDENTITY_INSERT Notary_documents ON;
INSERT INTO Notary_documents (id,notary_id,doc_category,file_name,upload_date,verified_status,version,is_current_version,file_url)
VALUES
    (1, 1, N'COMMISSION_CER', N'commission_cert_2023.pdf', '2023-01-10 09:15:00', N'APPROVED', 1, 1, N'/uploads/docs/1/comm_2023.pdf'),
    (2, 1, N'TRAINING_CER', N'state_exam_passed.pdf', '2022-12-20 14:30:00', N'APPROVED', 1, 1, N'/uploads/docs/1/exam_passed.pdf'),
    (3, 1, N'IDENTITY_VERIFICATION', N'driver_license_wa.png', '2022-12-15 10:00:00', N'APPROVED', 1, 1, N'/uploads/docs/1/dl_wa.png'),
    (4, 2, N'COMMISSION_CER', N'old_commission_tx.pdf', '2018-05-10 11:20:00', N'APPROVED', 1, 0, N'/uploads/docs/2/comm_v1.pdf'),
    (5, 2, N'COMMISSION_CER', N'renewed_commission_tx.pdf', '2022-05-12 08:45:00', N'APPROVED', 2, 1, N'/uploads/docs/2/comm_v2.pdf'),
    (6, 2, N'FINGERSPRINT', N'livescan_background.pdf', '2022-04-30 16:10:00', N'APPROVED', 1, 1, N'/uploads/docs/2/livescan.pdf'),
    (7, 3, N'IDENTITY_VERIFICATION', N'us_passport_scan.jpg', '2023-03-05 09:30:00', N'APPROVED', 1, 1, N'/uploads/docs/3/passport.jpg'),
    (8, 3, N'COMMISSION_CER', N'il_notary_commission.pdf', '2023-03-10 13:15:00', N'PENDING', 1, 1, N'/uploads/docs/3/comm_il.pdf'),
    (9, 4, N'TRAINING_CER', N'nna_training_cert.pdf', '2021-08-20 10:05:00', N'APPROVED', 1, 1, N'/uploads/docs/4/nna_cert.pdf'),
    (10, 4, N'IDENTITY_VERIFICATION', N'id_card_front.png', '2021-08-22 15:40:00', N'APPROVED', 1, 1, N'/uploads/docs/4/id_front.png'),
    (11, 4, N'FINGERSPRINT', N'fbi_background_check.pdf', '2021-08-25 11:00:00', N'APPROVED', 1, 1, N'/uploads/docs/4/fbi_bg.pdf'),
    (12, 5, N'COMMISSION_CER', N'ma_commission_2020.pdf', '2020-11-10 09:50:00', N'APPROVED', 1, 1, N'/uploads/docs/5/comm_ma.pdf'),
    (13, 5, N'IDENTITY_VERIFICATION', N'dl_expired.jpg', '2020-10-15 14:20:00', N'REJECTED', 1, 0, N'/uploads/docs/5/dl_old.jpg'),
    (14, 5, N'IDENTITY_VERIFICATION', N'dl_renewed.jpg', '2020-10-20 08:30:00', N'APPROVED', 2, 1, N'/uploads/docs/5/dl_new.jpg'),
    (15, 6, N'TRAINING_CER', N'fl_state_course.pdf', '2024-01-02 10:15:00', N'PENDING', 1, 1, N'/uploads/docs/6/course_fl.pdf'),
    (16, 6, N'FINGERSPRINT', N'livescan_receipt.png', '2024-01-05 13:45:00', N'PENDING', 1, 1, N'/uploads/docs/6/livescan_rcpt.png'),
    (17, 7, N'COMMISSION_CER', N'az_commission_cert.pdf', '2019-05-10 11:10:00', N'APPROVED', 1, 1, N'/uploads/docs/7/comm_az.pdf'),
    (18, 8, N'IDENTITY_VERIFICATION', N'ga_driver_license.jpg', '2022-08-01 09:25:00', N'APPROVED', 1, 1, N'/uploads/docs/8/dl_ga.jpg'),
    (19, 8, N'TRAINING_CER', N'online_notary_course.pdf', '2022-08-05 16:50:00', N'APPROVED', 1, 1, N'/uploads/docs/8/online_course.pdf'),
    (20, 9, N'COMMISSION_CER', N'tx_commission_wrong.pdf', '2023-10-25 14:00:00', N'REJECTED', 1, 0, N'/uploads/docs/9/comm_wrong.pdf');
SET IDENTITY_INSERT Notary_documents OFF;
END
GO

-- Seed: Notary_insurances
IF NOT EXISTS (SELECT 1 FROM Notary_insurances)
BEGIN
SET IDENTITY_INSERT Notary_insurances ON;
INSERT INTO Notary_insurances (id,notary_id,policy_number,provider_name,coverage_amount,effective_date,expiration_date,file_url)
VALUES
    (1, 1, 'POL1001', N'StateFarm', 100000, '2024-01-01 00:00:00', '2025-01-01 00:00:00', N'https://files.com/ins_1.pdf'),
    (2, 2, 'POL1002', N'Allianz', 150000, '2024-02-01 00:00:00', '2025-02-01 00:00:00', N'https://files.com/ins_2.pdf'),
    (3, 3, 'POL1003', N'Geico', 120000, '2024-03-01 00:00:00', '2025-03-01 00:00:00', N'https://files.com/ins_3.pdf'),
    (4, 4, 'POL1004', N'StateFarm', 200000, '2024-01-15 00:00:00', '2025-01-15 00:00:00', N'https://files.com/ins_4.pdf'),
    (5, 5, 'POL1005', N'Allianz', 80000, '2024-04-01 00:00:00', '2025-04-01 00:00:00', N'https://files.com/ins_5.pdf'),
    (6, 6, 'POL1006', N'Geico', 130000, '2024-02-10 00:00:00', '2025-02-10 00:00:00', N'https://files.com/ins_6.pdf'),
    (7, 7, 'POL1007', N'StateFarm', 110000, '2024-05-01 00:00:00', '2025-05-01 00:00:00', N'https://files.com/ins_7.pdf'),
    (8, 8, 'POL1008', N'Allianz', 90000, '2024-06-01 00:00:00', '2025-06-01 00:00:00', N'https://files.com/ins_8.pdf'),
    (9, 9, 'POL1009', N'Geico', 140000, '2024-03-15 00:00:00', '2025-03-15 00:00:00', N'https://files.com/ins_9.pdf'),
    (10, 10, 'POL1010', N'StateFarm', 160000, '2024-01-20 00:00:00', '2025-01-20 00:00:00', N'https://files.com/ins_10.pdf'),
    (11, 11, 'POL1011', N'Allianz', 100000, '2024-02-25 00:00:00', '2025-02-25 00:00:00', N'https://files.com/ins_11.pdf'),
    (12, 12, 'POL1012', N'Geico', 180000, '2024-03-10 00:00:00', '2025-03-10 00:00:00', N'https://files.com/ins_12.pdf'),
    (13, 13, 'POL1013', N'StateFarm', 170000, '2024-04-05 00:00:00', '2025-04-05 00:00:00', N'https://files.com/ins_13.pdf'),
    (14, 14, 'POL1014', N'Allianz', 95000, '2024-05-15 00:00:00', '2025-05-15 00:00:00', N'https://files.com/ins_14.pdf'),
    (15, 15, 'POL1015', N'Geico', 200000, '2024-06-10 00:00:00', '2025-06-10 00:00:00', N'https://files.com/ins_15.pdf'),
    (16, 16, 'POL1016', N'StateFarm', 125000, '2024-01-30 00:00:00', '2025-01-30 00:00:00', N'https://files.com/ins_16.pdf'),
    (17, 17, 'POL1017', N'Allianz', 135000, '2024-02-18 00:00:00', '2025-02-18 00:00:00', N'https://files.com/ins_17.pdf'),
    (18, 18, 'POL1018', N'Geico', 155000, '2024-03-22 00:00:00', '2025-03-22 00:00:00', N'https://files.com/ins_18.pdf'),
    (19, 19, 'POL1019', N'StateFarm', 145000, '2024-04-12 00:00:00', '2025-04-12 00:00:00', N'https://files.com/ins_19.pdf'),
    (20, 20, 'POL1020', N'Allianz', 115000, '2024-05-20 00:00:00', '2025-05-20 00:00:00', N'https://files.com/ins_20.pdf');
SET IDENTITY_INSERT Notary_insurances OFF;
END
GO

-- Seed: Notary_bonds
IF NOT EXISTS (SELECT 1 FROM Notary_bonds)
BEGIN
SET IDENTITY_INSERT Notary_bonds ON;
INSERT INTO Notary_bonds (id,notary_id,provider_name,bond_amount,effective_date,expiration_date,file_url)
VALUES
    (1, 1, N'NNA', 15000, '2024-01-01 00:00:00', '2028-01-01 00:00:00', N'https://files.com/bond_1.pdf'),
    (2, 2, N'Liberty', 20000, '2024-02-01 00:00:00', '2028-02-01 00:00:00', N'https://files.com/bond_2.pdf'),
    (3, 3, N'NNA', 10000, '2024-03-01 00:00:00', '2028-03-01 00:00:00', N'https://files.com/bond_3.pdf'),
    (4, 4, N'Liberty', 25000, '2024-01-15 00:00:00', '2028-01-15 00:00:00', N'https://files.com/bond_4.pdf'),
    (5, 5, N'NNA', 12000, '2024-04-01 00:00:00', '2028-04-01 00:00:00', N'https://files.com/bond_5.pdf'),
    (6, 6, N'Liberty', 18000, '2024-02-10 00:00:00', '2028-02-10 00:00:00', N'https://files.com/bond_6.pdf'),
    (7, 7, N'NNA', 14000, '2024-05-01 00:00:00', '2028-05-01 00:00:00', N'https://files.com/bond_7.pdf'),
    (8, 8, N'Liberty', 16000, '2024-06-01 00:00:00', '2028-06-01 00:00:00', N'https://files.com/bond_8.pdf'),
    (9, 9, N'NNA', 20000, '2024-03-15 00:00:00', '2028-03-15 00:00:00', N'https://files.com/bond_9.pdf'),
    (10, 10, N'Liberty', 22000, '2024-01-20 00:00:00', '2028-01-20 00:00:00', N'https://files.com/bond_10.pdf'),
    (11, 11, N'NNA', 15000, '2024-02-25 00:00:00', '2028-02-25 00:00:00', N'https://files.com/bond_11.pdf'),
    (12, 12, N'Liberty', 24000, '2024-03-10 00:00:00', '2028-03-10 00:00:00', N'https://files.com/bond_12.pdf'),
    (13, 13, N'NNA', 21000, '2024-04-05 00:00:00', '2028-04-05 00:00:00', N'https://files.com/bond_13.pdf'),
    (14, 14, N'Liberty', 17000, '2024-05-15 00:00:00', '2028-05-15 00:00:00', N'https://files.com/bond_14.pdf'),
    (15, 15, N'NNA', 25000, '2024-06-10 00:00:00', '2028-06-10 00:00:00', N'https://files.com/bond_15.pdf'),
    (16, 16, N'Liberty', 19000, '2024-01-30 00:00:00', '2028-01-30 00:00:00', N'https://files.com/bond_16.pdf'),
    (17, 17, N'NNA', 18000, '2024-02-18 00:00:00', '2028-02-18 00:00:00', N'https://files.com/bond_17.pdf'),
    (18, 18, N'Liberty', 23000, '2024-03-22 00:00:00', '2028-03-22 00:00:00', N'https://files.com/bond_18.pdf'),
    (19, 19, N'NNA', 20000, '2024-04-12 00:00:00', '2028-04-12 00:00:00', N'https://files.com/bond_19.pdf'),
    (20, 20, N'Liberty', 16000, '2024-05-20 00:00:00', '2028-05-20 00:00:00', N'https://files.com/bond_20.pdf');
SET IDENTITY_INSERT Notary_bonds OFF;
END
GO

-- Seed: Notary_audit_logs
IF NOT EXISTS (SELECT 1 FROM Notary_audit_logs)
BEGIN
SET IDENTITY_INSERT Notary_audit_logs ON;
INSERT INTO Notary_audit_logs (id,notary_id,table_name,record_id,action,old_value,new_value,change_by,created_at)
VALUES
    (1, 7, 'Notaries', 7, 'UPDATE', N'{"status": "ACTIVE"}', N'{"status": "BLOCKED", "internal_notes": "Policy violation reported"}', 999, '2025-10-12 09:00:00'),
    (2, 15, 'Notaries', 15, 'UPDATE', N'{"status": "ACTIVE"}', N'{"status": "BLOCKED", "internal_notes": "Customer complaints"}', 999, '2025-11-05 14:30:00'),
    (3, 4, 'Notaries', 4, 'UPDATE', N'{"status": "ACTIVE"}', N'{"status": "INACTIVE", "internal_notes": "On maternity leave"}', 998, '2025-12-01 10:15:00'),
    (4, 6, 'Notaries', 6, 'UPDATE', N'{"status": "ACTIVE"}', N'{"status": "INACTIVE", "internal_notes": "Pending state license"}', 999, '2024-02-01 08:45:00'),
    (5, 18, 'Notaries', 18, 'UPDATE', N'{"status": "ACTIVE"}', N'{"status": "INACTIVE", "internal_notes": "Personal leave"}', 998, '2023-07-01 11:20:00'),
    (6, 1, 'Notaries', 1, 'UPDATE', N'{"internal_notes": null}', N'{"internal_notes": "Top performer 2022"}', 999, '2023-01-15 16:00:00'),
    (7, 3, 'Notaries', 3, 'UPDATE', N'{"internal_notes": "Background check pending"}', N'{"internal_notes": "Background check renewed"}', 998, '2024-03-10 09:10:00'),
    (8, 9, 'Notaries', 9, 'UPDATE', N'{"internal_notes": null}', N'{"internal_notes": "Bilingual (Spanish)"}', 999, '2023-11-15 14:00:00'),
    (9, 10, 'Notaries', 10, 'UPDATE', N'{"internal_notes": null}', N'{"internal_notes": "Senior Notary"}', 999, '2024-05-20 10:30:00'),
    (10, 13, 'Notaries', 13, 'UPDATE', N'{"internal_notes": null}', N'{"internal_notes": "Branch Manager"}', 998, '2021-06-10 15:45:00'),
    (11, 2, 'Notaries', 2, 'INSERT', N'null', N'{"status": "ACTIVE", "employment_type": "FULL_TIME"}', 999, '2022-01-15 08:00:00'),
    (12, 12, 'Notaries', 12, 'INSERT', N'null', N'{"status": "ACTIVE", "employment_type": "INDEPENDENT_CONTRACT"}', 998, '2024-02-10 09:30:00'),
    (13, 7, 'Notary_incidents', 1, 'INSERT', N'null', N'{"status": "UNDER_REVIEW", "incident_type": "POLICY_VIOLATION"}', 999, '2025-10-10 11:00:00'),
    (14, 15, 'Notary_incidents', 2, 'INSERT', N'null', N'{"status": "OPEN", "incident_type": "CUSTOMER_COMPLAINT"}', 998, '2025-11-01 13:15:00'),
    (15, 1, 'Notary_incidents', 3, 'UPDATE', N'{"status": "OPEN"}', N'{"status": "DISMISSED", "resolved_at": "2022-08-15 10:30:00"}', 999, '2022-08-15 10:30:00'),
    (16, 3, 'Notary_incidents', 4, 'UPDATE', N'{"status": "UNDER_REVIEW"}', N'{"status": "RESOLVED", "resolved_at": "2023-05-20 14:00:00"}', 998, '2023-05-20 14:00:00'),
    (17, 10, 'Notaries', 10, 'UPDATE', N'{"residential_address": "123 Old St"}', N'{"residential_address": "951 Spruce Dr, San Diego, CA 92101"}', 1010, '2023-09-12 09:25:00'),
    (18, 14, 'Notaries', 14, 'UPDATE', N'{"phone": "(555) 000-0000"}', N'{"phone": "(555) 444-5566"}', 1014, '2023-10-05 14:10:00'),
    (19, 8, 'Notary_incidents', 6, 'UPDATE', N'{"status": "OPEN"}', N'{"status": "RESOLVED", "resolved_at": "2023-01-10 16:45:00"}', 999, '2023-01-10 16:45:00'),
    (20, 18, 'Notary_incidents', 9, 'UPDATE', N'{"status": "UNDER_REVIEW"}', N'{"status": "DISMISSED", "resolved_at": "2023-08-20 11:00:00"}', 998, '2023-08-20 11:00:00');
SET IDENTITY_INSERT Notary_audit_logs OFF;
END
GO

-- Seed: Notary_incidents
IF NOT EXISTS (SELECT 1 FROM Notary_incidents)
BEGIN
SET IDENTITY_INSERT Notary_incidents ON;
INSERT INTO Notary_incidents (id,notary_id,incident_type,description,severity,status,resolved_at)
VALUES
    (1, 7, N'POLICY_VIOLATION', N'Customer reports regarding unauthorized fee charges.', N'CRITICAL', N'UNDER_REVIEW', NULL),
    (2, 15, N'CUSTOMER_COMPLAINT', N'Customers complain about unprofessional service.', N'HIGH', N'OPEN', NULL),
    (3, 1, N'LATE_ARRIVAL', N'I arrived 15 minutes late due to traffic, but I had notified them in advance.', N'LOW', N'DISMISSED', '2022-08-15 10:30:00'),
    (4, 3, N'DOCUMENT_ERROR', N'Missing signature on page 4 of the power of attorney agreement.', N'MEDIUM', N'RESOLVED', '2023-05-20 14:00:00'),
    (5, 15, N'NO_SHOW', N'Do not show up at the notary office without prior notice.', N'CRITICAL', N'UNDER_REVIEW', NULL),
    (6, 8, N'COMPLIANCE_ISSUE', N'The notarized stamp is unclear and needs to be redone.', N'MEDIUM', N'RESOLVED', '2023-01-10 16:45:00'),
    (7, 10, N'SYSTEM_ISSUE', N'System error: Unable to load e-Notary documents.', N'LOW', N'RESOLVED', '2022-11-05 09:15:00'),
    (8, 7, N'POLICY_VIOLATION', N'Failing to carefully check the ID of the signatory.', N'CRITICAL', N'OPEN', NULL),
    (9, 18, N'CUSTOMER_COMPLAINT', N'The client was dissatisfied with the notary''s attire.', N'LOW', N'DISMISSED', '2023-08-20 11:00:00'),
    (10, 12, N'DOCUMENT_ERROR', N'Incorrect date entered on the certificate', N'MEDIUM', N'RESOLVED', '2024-03-05 15:30:00'),
    (11, 4, N'LATE_ARRIVAL', N'Arriving 30 minutes late for the appointment', N'LOW', N'RESOLVED', '2022-04-12 10:00:00'),
    (12, 6, N'COMPLIANCE_ISSUE', N'State license renewal delayed', N'HIGH', N'OPEN', NULL),
    (13, 13, N'SYSTEM_ISSUE', N'Forgot the portal login password', N'LOW', N'RESOLVED', '2020-05-18 08:30:00'),
    (14, 9, N'CUSTOMER_COMPLAINT', N'Client complains about overly complicated explanation process', N'LOW', N'DISMISSED', '2024-01-20 14:20:00'),
    (15, 2, N'DOCUMENT_ERROR', N'Forgot to bring the embosser', N'MEDIUM', N'RESOLVED', '2022-07-11 09:45:00'),
    (16, 11, N'LATE_ARRIVAL', N'Traffic jam due to a highway accident', N'LOW', N'RESOLVED', '2021-09-15 11:10:00'),
    (17, 19, N'COMPLIANCE_ISSUE', N'Notary journal lacks detail in entries', N'MEDIUM', N'RESOLVED', '2020-10-05 16:00:00'),
    (18, 5, N'CUSTOMER_COMPLAINT', N'Incorrectly calculated travel service fee', N'MEDIUM', N'RESOLVED', '2021-12-02 13:30:00'),
    (19, 16, N'DOCUMENT_ERROR', N'Mixed documents between two clients', N'HIGH', N'UNDER_REVIEW', NULL),
    (20, 14, N'SYSTEM_ISSUE', N'Tablet runs out of battery during the signing session', N'LOW', N'DISMISSED', '2024-02-15 10:05:00');
SET IDENTITY_INSERT Notary_incidents OFF;
END
GO

-- Seed: Notary_status_history
IF NOT EXISTS (SELECT 1 FROM Notary_status_history)
BEGIN
SET IDENTITY_INSERT Notary_status_history ON;
INSERT INTO Notary_status_history (id,notary_id,status,reason,effective_date,created_by)
VALUES
    (1, 1, N'ACTIVE', N'Initial profile activation', '2023-01-15 08:30:00', 1),
    (2, 2, N'ACTIVE', N'Initial profile activation', '2023-02-10 09:15:00', 2),
    (3, 3, N'ACTIVE', N'Initial profile activation', '2023-03-05 10:00:00', 1),
    (4, 4, N'INACTIVE', N'insurance has expired.', '2023-03-12 11:45:00', 1),
    (5, 5, N'ACTIVE', N'Initial profile activation', '2023-04-01 14:20:00', 1),
    (6, 6, N'INACTIVE', N'license outdate.', '2023-05-18 08:00:00', 1),
    (7, 7, N'BLOCKED', N'banned by Department of Justice', '2023-06-10 16:30:00', 2),
    (8, 8, N'ACTIVE', N'Initial profile activation', '2023-06-15 09:10:00', 1),
    (9, 9, N'ACTIVE', N'Initial profile activation', '2023-07-02 11:25:00', 1),
    (10, 10, N'ACTIVE', N'Initial profile activation', '2023-07-20 13:40:00', 1),
    (11, 11, N'ACTIVE', N'Initial profile activation', '2023-08-05 15:55:00', 1),
    (12, 12, N'ACTIVE', N'Initial profile activation', '2023-08-22 10:15:00', 2),
    (13, 13, N'ACTIVE', N'Initial profile activation', '2023-09-11 14:05:00', 1),
    (14, 14, N'ACTIVE', N'Initial profile activation', '2023-09-30 08:50:00', 1),
    (15, 15, N'BLOCKED', N'banned by Department of Justice', '2023-10-14 12:30:00', 1),
    (16, 16, N'ACTIVE', N'Initial profile activation', '2023-11-02 16:10:00', 1),
    (17, 17, N'ACTIVE', N'Initial profile activation', '2023-11-25 09:45:00', 2),
    (18, 18, N'INACTIVE', N'insurance has expired.', '2023-12-10 11:20:00', 1),
    (19, 19, N'ACTIVE', N'Initial profile activation', '2024-01-05 15:00:00', 1),
    (20, 20, N'ACTIVE', N'Initial profile activation', '2024-01-20 10:35:00', 1);
SET IDENTITY_INSERT Notary_status_history OFF;
END
GO

-- Seed: Holidays
IF NOT EXISTS (SELECT 1 FROM Holidays)
BEGIN
SET IDENTITY_INSERT Holidays ON;
INSERT INTO Holidays (id, name, type, state_id, date_rule) VALUES
    (1,  N'New Year''s Day',               'FEDERAL', NULL, '01-01'),
    (2,  N'Martin Luther King Jr. Day',    'FEDERAL', NULL, '3rd-Monday-01'),
    (3,  N'Washington''s Birthday',        'FEDERAL', NULL, '3rd-Monday-02'),
    (4,  N'Memorial Day',                  'FEDERAL', NULL, 'Last-Monday-05'),
    (5,  N'Independence Day',              'FEDERAL', NULL, '07-04'),
    (6,  N'Labor Day',                     'FEDERAL', NULL, '1st-Monday-09'),
    (7,  N'Columbus Day',                  'FEDERAL', NULL, '2nd-Monday-10'),
    (8,  N'Veterans Day',                  'FEDERAL', NULL, '11-11'),
    (9,  N'Thanksgiving Day',              'FEDERAL', NULL, '4th-Thursday-11'),
    (10, N'Christmas Day',                 'FEDERAL', NULL, '12-25'),
    (11, N'Texas Independence Day',        'STATE',   43,   '03-02'),
    (12, N'Confederate Heroes Day',        'STATE',   43,   '4th-Monday-01'),
    (13, N'Emancipation Day',              'STATE',   43,   '4th-Monday-06'),
    (14, N'Lyndon B. Johnson''s Birthday', 'STATE',   43,   '08-27'),
    (15, N'Texas State Fair',              'STATE',   43,   '1st-Friday-10');
SET IDENTITY_INSERT Holidays OFF;
END
GO

-- Seed: notary_selected_holidays
IF NOT EXISTS (SELECT 1 FROM notary_selected_holidays)
BEGIN
INSERT INTO notary_selected_holidays (notary_id, holiday_id)
VALUES
    (1, 1),
    (1, 10),
    (4, 5),
    (4, 10),
    (5, 4),
    (5, 9),
    (9, 5),
    (9, 8),
    (10, 5),
    (10, 10),
    (12, 1),
    (12, 9),
    (17, 6),
    (17, 10),
    (19, 11),
    (19, 14),
    (20, 4),
    (20, 10);
END
GO

-- Seed: Job
IF NOT EXISTS (SELECT 1 FROM Job)
BEGIN
SET IDENTITY_INSERT Job ON;
INSERT INTO Job (id,Client_ID,Service_Type,Location_Type,Location_Details,Requested_Start_Time,Requested_End_Time,Signer_Count,Status)
VALUES
    (1, 101, 'Notarization', 'Office', N'123 Nguyen Van Linh, Da Nang', '2026-03-21 08:00:00', '2026-03-21 09:00:00', 2, 'Pending'),
    (2, 102, 'Translation',  'Home',   N'45 Le Duan, Da Nang',          '2026-03-21 09:30:00', '2026-03-21 10:30:00', 1, 'Assigned'),
    (3, 103, 'Certification','Office', N'78 Tran Phu, Da Nang',         '2026-03-21 10:00:00', '2026-03-21 11:00:00', 3, 'Completed'),
    (4, 104, 'Notarization', 'Home',   N'12 Hoang Dieu, Da Nang',       '2026-03-22 08:00:00', '2026-03-22 09:00:00', 1, 'Pending'),
    (5, 105, 'Certification','Office', N'99 Bach Dang, Da Nang',        '2026-03-22 14:00:00', '2026-03-22 15:30:00', 2, 'Cancelled');
SET IDENTITY_INSERT Job OFF;
END
GO

-- Seed: job assignments
IF NOT EXISTS (SELECT 1 FROM [job assignments])
BEGIN
SET IDENTITY_INSERT [job assignments] ON;
INSERT INTO [job assignments] (id,job_id,notary_id,assigned_at,accepted_at)
VALUES
    (1, 2, 1, '2026-03-20 07:30:00', '2026-03-20 08:10:00'),
    (2, 3, 2, '2026-03-20 08:00:00', '2026-03-20 08:40:00');
SET IDENTITY_INSERT [job assignments] OFF;
END
GO

-- Seed: job_status_logs
IF NOT EXISTS (SELECT 1 FROM job_status_logs)
BEGIN
INSERT INTO job_status_logs (job_id,status,time_stamps,delay,exception_flags,note)
VALUES
    (2, 'Pending',   '2026-03-20 07:00:00', NULL,  NULL,           N'Job created'),
    (2, 'Assigned',  '2026-03-20 07:30:00', NULL,  NULL,           N'Assigned to notary James Smith'),
    (3, 'Pending',   '2026-03-20 07:00:00', NULL,  NULL,           N'Job created'),
    (3, 'Assigned',  '2026-03-20 08:00:00', NULL,  NULL,           N'Assigned to notary Emily Johnson'),
    (3, 'Completed', '2026-03-21 11:00:00', '2h',  NULL,           N'Signer come later'),
    (5, 'Pending',   '2026-03-20 09:00:00', NULL,  NULL,           N'Job created'),
    (5, 'Cancelled', '2026-03-21 07:00:00', NULL,  'CLIENT_NO_SHOW', N'Client cancelled via phone');
END
GO

-- Seed: events
IF NOT EXISTS (SELECT 1 FROM events)
BEGIN
INSERT INTO events (event_id, event_name)
VALUES
    ('ne001', N'job assigned to notary'),
    ('ne002', N'remind before event'),
    ('ne003', N'completed job');
END
GO

-- Seed: notifications
IF NOT EXISTS (SELECT 1 FROM notifications)
BEGIN
INSERT INTO notifications (event_id,job_id,sms,email,app,delay,time_stamp)
VALUES
    ('ne001', 2, 1, 1, 1,  0,  '2026-03-20 07:30:00'),
    ('ne002', 2, 1, 0, 1,  30, '2026-03-20 09:00:00'),
    ('ne001', 3, 1, 1, 1,  0,  '2026-03-20 08:00:00'),
    ('ne003', 3, 1, 1, 1,  0,  '2026-03-21 11:00:00');
END
GO

SELECT 'States' AS [Table], COUNT(*) AS [Rows] FROM States
UNION ALL SELECT 'Languages', COUNT(*) FROM Languages
UNION ALL SELECT 'notaries', COUNT(*) FROM notaries
UNION ALL SELECT 'notary_capabilities', COUNT(*) FROM notary_capabilities
UNION ALL SELECT 'notary_availabilities', COUNT(*) FROM notary_availabilities
UNION ALL SELECT 'notary_service_areas', COUNT(*) FROM notary_service_areas
UNION ALL SELECT 'Notary_commissions', COUNT(*) FROM Notary_commissions
UNION ALL SELECT 'Authority_scope', COUNT(*) FROM Authority_scope
UNION ALL SELECT 'Notary_documents', COUNT(*) FROM Notary_documents
UNION ALL SELECT 'Notary_insurances', COUNT(*) FROM Notary_insurances
UNION ALL SELECT 'Notary_bonds', COUNT(*) FROM Notary_bonds
UNION ALL SELECT 'Ron_technologies', COUNT(*) FROM Ron_technologies
UNION ALL SELECT 'Notary_status_history', COUNT(*) FROM Notary_status_history
UNION ALL SELECT 'Notary_incidents', COUNT(*) FROM Notary_incidents
UNION ALL SELECT 'Notary_audit_logs', COUNT(*) FROM Notary_audit_logs
UNION ALL SELECT 'Holidays', COUNT(*) FROM Holidays
UNION ALL SELECT 'Job', COUNT(*) FROM Job
UNION ALL SELECT 'job assignments', COUNT(*) FROM [job assignments]
UNION ALL SELECT 'job_status_logs', COUNT(*) FROM job_status_logs
UNION ALL SELECT 'events', COUNT(*) FROM events
UNION ALL SELECT 'notifications', COUNT(*) FROM notifications;
GO

PRINT 'notarial_db mock data seeded successfully!';
GO

