-- ============================================================
-- IRMalia — Comprehensive Test Data Seed File
-- Barangay Epifanio Malia Incident Blotter System
-- ============================================================
-- Run AFTER install.php has been executed (tables must exist)
-- Command: mysql -u root irmalia_db < seed_test_data.sql
-- Or visit: http://localhost/IRMalia/api/setup/install.php first
-- ============================================================

USE `irmalia_db`;

-- ============================================================
-- CLEAN SLATE (removes test data only — preserves admin user)
-- ============================================================
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE witnesses;
TRUNCATE TABLE parties;
TRUNCATE TABLE incidents;
TRUNCATE TABLE audit_logs;
DELETE FROM users WHERE username != 'admin';
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- ADDITIONAL OFFICERS / USERS
-- Password for all test users: "password"
-- ============================================================
ALTER TABLE users AUTO_INCREMENT = 2;
INSERT INTO users (employee_id, full_name, role, username, password_hash, is_active) VALUES
('OFF-001', 'Tanod Jose Reyes',     'desk_officer', 'jose.reyes',    '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uIbFjRZ6W', 1),
('OFF-002', 'Tanod Maria Santos',   'desk_officer', 'maria.santos',  '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uIbFjRZ6W', 1),
('OFF-003', 'Tanod Pedro Manalo',   'desk_officer', 'pedro.manalo',  '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uIbFjRZ6W', 1),
('VIW-001', 'Kapitan Rodrigo Luna', 'viewer',       'rodrigo.luna',  '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uIbFjRZ6W', 1),
('OFF-004', 'Tanod Liza Dela Cruz', 'desk_officer', 'liza.delacruz', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uIbFjRZ6W', 1);

-- ============================================================
-- INCIDENTS — 26 varied entries across 14 months
-- Covers: all statuses, all severities, all puroks, all types
-- Date range: Sep 2025 — Oct 2026 for chart coverage
-- ============================================================
INSERT INTO incidents
  (case_id, date_time_of_incident, date_time_filed, incident_type, purok,
   street_address, severity, status, narrative, action_taken,
   referred_to, officer_on_duty, filed_by_user_id)
VALUES

-- ── SEPTEMBER 2025 ────────────────────────────────────────
('BLT-2025-0001','2025-09-03 14:30:00','2025-09-03 15:00:00',
 'Noise Disturbance / Maingay (Ingay)','Purok 2','Sampaguita St.',
 'low','resolved',
 'Nagreklamo si Gng. Flores dahil sa malakas na videoke ng kanyang kapitbahay noong gabi ng Sabado. Ang ingay ay nagtuloy hanggang hating gabi at hindi makatulog ang mga bata sa bahay.',
 'Pinuntahan ng Tanod ang lugar at nakipag-usap sa may-ari ng videoke. Sumang-ayon itong ihinto pagkatapos ng babala.',
 NULL,'Tanod Jose Reyes',2),

('BLT-2025-0002','2025-09-10 09:15:00','2025-09-10 09:45:00',
 'Neighbor Dispute / Away Magkapitbahay','Purok 1','Rizal Ave.',
 'medium','resolved',
 'Nagkaroon ng mainit na pagtatalo sa pagitan ng pamilya Ramos at pamilya Cruz tungkol sa hangganan ng lupa. Naging dahilan ng sigawan at pagbabato ng salita sa harap ng kapitbahay.',
 'Inimbitahan ang magkabilang panig sa Barangay Hall. Pinagkasunduan ang hangganan ng lupa sa tulong ng Lupon Tagapamayapa.',
 'Barangay Lupon / Court','Tanod Maria Santos',3),

('BLT-2025-0003','2025-09-18 20:45:00','2025-09-18 21:10:00',
 'Physical Injury / Pananakit / Sakitan','Purok 3','Mabini St.',
 'high','referred',
 'Nagsumbong si G. Villanueva na sinuntok siya ng kanyang kapit-bahay na si G. Bautista matapos ang pagtatalo tungkol sa nakaharang na sasakyan. Nagtamo siya ng pasa sa mukha at braso.',
 'Dinala ang biktima sa health center para sa medico-legal examination. Inirefer ang kaso sa PNP dahil sa seryosong kalikasan ng pananakit.',
 'PNP (Pulisya)','Tanod Pedro Manalo',4),

('BLT-2025-0004','2025-09-25 11:00:00','2025-09-25 11:30:00',
 'Unpaid Debt / Hindi Pagbabayad ng Utang','Purok 4','Magsaysay Blvd.',
 'low','resolved',
 'Inirereklamo ni Gng. Aquino ang hindi pagbabayad ni G. Tolentino ng halagang PHP 8,500 na inutang noong tatlong buwan na ang nakalipas. Maraming beses na sinisingil ngunit hindi pa rin nagbabayad.',
 'Nagsagawa ng mediation. Pumayag si G. Tolentino na magbayad ng PHP 2,000 bawat buwan. Nilagdaan ang Payment Agreement.',
 NULL,'Tanod Jose Reyes',2),

-- ── OCTOBER 2025 ──────────────────────────────────────────
('BLT-2025-0005','2025-10-08 13:30:00','2025-10-08 14:00:00',
 'Garbage & Sanitation / Pagtatapon ng Basura','Purok 6','Quezon St.',
 'low','resolved',
 'May nagtitapon ng basura sa bakanteng lote malapit sa Purok 6. Nagsimula nang maging tambakan ng basura ang lugar at nagdudulot ng masamang amoy at posibleng sakit.',
 'Naglagay ng karatula na Bawal Magtapon ng Basura. Nakilala ang isang suspek at binigyan ng babala. Nililinis na rin ng barangay ang lugar.',
 NULL,'Tanod Pedro Manalo',4),

('BLT-2025-0006','2025-10-15 19:00:00','2025-10-15 19:30:00',
 'Verbal Abuse / Paninirang Puri / Intriga','Purok 2','Luna St.',
 'medium','active',
 'Nagreklamo si Gng. Pascual na paulit-ulit siyang nilalait at pinag-uusapan ng kanyang kapitbahay na si Gng. Fernandez sa social media, na nagdulot ng kahihiyan sa kanya at sa kanyang pamilya.',
 'Inilabas ang First Notice of Hearing. Itinakda ang hearing sa susunod na linggo.',
 NULL,'Tanod Jose Reyes',2),

('BLT-2025-0007','2025-10-22 10:15:00','2025-10-22 10:45:00',
 'Traffic / Illegal Parking / Harang sa Daan','Purok 1','Arellano St.',
 'low','resolved',
 'Maraming beses na nagreklamo ang mga taga-Arellano Street na may jeepney na regular na humaharang sa daanan tuwing umaga. Hindi makalabas ang mga residente sa kanilang sasakyan.',
 'Kinausap ang driver ng jeepney at binigyan ng opisyal na babala. Tinanggal na ang sasakyan sa harang.',
 NULL,'Tanod Liza Dela Cruz',5),

-- ── NOVEMBER 2025 ─────────────────────────────────────────
('BLT-2025-0008','2025-11-05 14:00:00','2025-11-05 14:30:00',
 'Physical Injury / Pananakit / Sakitan','Purok 3','Kalayaan St.',
 'high','referred',
 'Nagsumbong si G. Miranda na inatake siya ng grupo ng mga kabataan habang umuuwi mula sa trabaho. Nasugatan ang kanyang ulo at braso. Walang saksing nakilala ang mga salarin.',
 'Nagbigay ng first aid sa health center. Inirefer sa PNP para sa imbestigasyon. Nagbigay ng affidavit si biktima.',
 'PNP (Pulisya)','Tanod Pedro Manalo',4),

('BLT-2025-0009','2025-11-12 08:30:00','2025-11-12 09:00:00',
 'Unpaid Debt / Hindi Pagbabayad ng Utang','Purok 4','Malaya St.',
 'low','pending',
 'Lumapit si Gng. Ocampo para magreklamo laban kay G. Rivera na umutang ng PHP 15,000 para sa gastos sa ospital noong nakaraang taon. Hindi pa rin nababayaran kahit na ilang buwan na.',
 'Nakatanggap ng reklamo at nagpadala ng summons kay G. Rivera para sa hearing.',
 NULL,'Tanod Jose Reyes',2),

('BLT-2025-0010','2025-11-28 11:00:00','2025-11-28 11:30:00',
 'Neighbor Dispute / Away Magkapitbahay','Purok 6','Maharlika St.',
 'medium','resolved',
 'Nagkatalo ang magkapit-bahay na sina Gng. Torres at G. Gonzales tungkol sa tubig na dumadagsa mula sa rooftop ng isa patungo sa bakuran ng isa. Nagdulot ito ng pinsala sa mga halaman.',
 'Pinagkasunduan na maglagay ng proper drainage ang may sala. Maayos na naayos ang alitan.',
 NULL,'Tanod Liza Dela Cruz',5),

-- ── DECEMBER 2025 ─────────────────────────────────────────
('BLT-2025-0011','2025-12-10 15:20:00','2025-12-10 15:45:00',
 'Physical Injury / Pananakit / Sakitan','Purok 2','Sampaguita St.',
 'high','referred',
 'Nagsumbong si Gng. Reyes na sinuntok siya ng kanyang asawa pagkatapos ng pagtatalo. Nakita ng mga bata ang nangyari. May pasa siya sa pisngi at braso.',
 'Nagbigay ng emergency referral sa DSWD para sa family intervention. Inirefer din sa PNP para sa protective custody ng biktima.',
 'DSWD','Tanod Maria Santos',3),

('BLT-2025-0012','2025-12-25 22:15:00','2025-12-25 22:40:00',
 'Noise Disturbance / Maingay (Ingay)','Purok 4','Ilang-Ilang St.',
 'low','resolved',
 'Pasko na reklamo: Ang malakas na firecracker at music mula sa isang bahay ay nagdulot ng pangilabot sa mga alagang hayop at takot sa mga bata sa buong purok.',
 'Pinuntahan ng barangay tanod. Nakipag-usap sa mga nagsisimula ng ingay. Pumayag silang magsimula pa ng alas diyes ng gabi.',
 NULL,'Tanod Liza Dela Cruz',5),

-- ── JANUARY 2026 ──────────────────────────────────────────
('BLT-2026-0001','2026-01-05 14:30:00','2026-01-05 15:00:00',
 'Unpaid Debt / Hindi Pagbabayad ng Utang','Purok 5','Gumamela St.',
 'low','active',
 'Lumapit si G. Corpuz para idemanda si Gng. Alcantara na umutang ng PHP 20,000 para sa pagpapatayo ng kamalig. Tatlong buwan nang hindi nagbabayad. Iniiwasan na rin ang nagpautang.',
 'Nagpadala ng summons sa respondent. Nakatakda ang hearing sa loob ng dalawang linggo.',
 NULL,'Tanod Jose Reyes',2),

('BLT-2026-0002','2026-01-20 20:00:00','2026-01-20 20:30:00',
 'Pet Nuisance / Gala o Maingay na Aso','Purok 1','Jasmine St.',
 'low','resolved',
 'Nagsumbong ang tatlong pamilya laban sa aso ng G. Navarro na regular na lumalakad sa kalye at nangangagat ng mga taong dumadaan. Naagaw na ng aso ang isang bata sa kanyang pagkain.',
 'Pinabigyan ng anti-rabies vaccine ang aso. Inatasan ang may-ari na palaging itali ang aso at mag-apply ng proper pet license.',
 NULL,'Tanod Pedro Manalo',4),

-- ── FEBRUARY 2026 ─────────────────────────────────────────
('BLT-2026-0003','2026-02-03 10:15:00','2026-02-03 10:45:00',
 'Verbal Abuse / Paninirang Puri / Intriga','Purok 2','Orchid St.',
 'medium','resolved',
 'Inirereklamo ni G. Dela Torre si Gng. Cabrera dahil sa paulit-ulit na pagmumura at panghahamak sa kanya sa harap ng maraming tao sa palengke. Nagdulot ito ng kahihiyan at emosyonal na distress.',
 'Nagsagawa ng mediation hearing. Humingi ng paumanhin si Gng. Cabrera at pumirma ng kasunduan na hindi na mauulit ang ganitong kilos.',
 NULL,'Tanod Liza Dela Cruz',5),

('BLT-2026-0004','2026-02-14 19:30:00','2026-02-14 20:00:00',
 'Physical Injury / Pananakit / Sakitan','Purok 3','Rose St.',
 'high','active',
 'Nagsumbong si G. Santos na inatake siya ng kanyang dating kasosyo sa negosyo matapos ang hindi pagkakaunawaan sa pera. Ginamit ang bote at nasugatan ang ulo ni biktima.',
 'Dinala sa ospital para sa gamutan. Inirefer ang kaso sa PNP. Kasalukuyang naghihintay ng medico-legal report.',
 'PNP (Pulisya)','Tanod Jose Reyes',2),

-- ── MARCH 2026 ────────────────────────────────────────────
('BLT-2026-0005','2026-03-05 08:45:00','2026-03-05 09:15:00',
 'Traffic / Illegal Parking / Harang sa Daan','Purok 5','Dahlia St.',
 'low','resolved',
 'Ang tatlong mga pedicab ay regular na nakaparada sa harap ng elementary school na nagdudulot ng mapanganib na sitwasyon para sa mga batang lumalabas at pumapasok sa paaralan.',
 'Kinausap ang mga driver ng pedicab at nakahanap ng bagong lugar para sa loading at unloading na hindi sagabal sa trapiko ng paaralan.',
 NULL,'Tanod Pedro Manalo',4),

('BLT-2026-0006','2026-03-15 16:30:00','2026-03-15 17:00:00',
 'Neighbor Dispute / Away Magkapitbahay','Purok 6','Sampaguita Ext.',
 'medium','active',
 'Nagtatalo ang dalawang kapitbahay tungkol sa konstruksyon ng bakod. Sinasabing nilabag ng isang pamilya ang easement line at lumagpas sa lupa ng isa.',
 'Humingi ng opinion sa Municipal Engineer. Kasalukuyang hinihintay ang survey report.',
 NULL,'Tanod Liza Dela Cruz',5),

-- ── APRIL 2026 ────────────────────────────────────────────
('BLT-2026-0007','2026-04-10 14:00:00','2026-04-10 14:30:00',
 'Unpaid Debt / Hindi Pagbabayad ng Utang','Purok 2','Camia St.',
 'low','resolved',
 'Nagsumbong si Gng. Bautista laban kay G. Galang na hindi nagbabayad ng renta ng PHP 5,000 sa loob ng tatlong buwan. Kabuuang utang ay PHP 15,000.',
 'Nagsagawa ng mediation. Pumayag si G. Galang na bayaran ang nakaraang utang at mag-bayad ng regular na renta mula ngayon.',
 NULL,'Tanod Maria Santos',3),

-- ── MAY 2026 ──────────────────────────────────────────────
('BLT-2026-0008','2026-05-08 10:30:00','2026-05-08 11:00:00',
 'Pet Nuisance / Gala o Maingay na Aso','Purok 4','Rosal Ext.',
 'low','resolved',
 'Nagreklamo ang mga residente tungkol sa dalawang nagalagalag na aso sa purok na walang may-ari. Nangangagat na rin ang mga ito ng mga bisita. Isang bata ang nagkaroon ng minor na kagat.',
 'Nakipag-ugnayan sa City Veterinarian para sa animal control. Nahuli at nailagay sa shelter ang mga aso.',
 NULL,'Tanod Liza Dela Cruz',5),

('BLT-2026-0009','2026-05-18 15:45:00','2026-05-18 16:15:00',
 'Physical Injury / Pananakit / Sakitan','Purok 5','Acacia St.',
 'high','referred',
 'Nagsumbong ang magulang ng isang menor de edad na inatake at sinuntok ng mas matandang bata matapos ang pagtatalo sa plarong basketball. Nagkaroon ng namamagang mata ang bata.',
 'Inimbitahan ang magulang ng dalawang bata para sa mediation at usapan. Dahil menor de edad, inirefer sa DSWD para sa child mediation.',
 'DSWD','Tanod Jose Reyes',2),

-- ── JULY 2026 ─────────────────────────────────────────────
('BLT-2026-0010','2026-07-04 14:15:00','2026-07-04 14:45:00',
 'Neighbor Dispute / Away Magkapitbahay','Purok 2','Pag-asa St.',
 'medium','resolved',
 'Nagtatalo ang pamilya Soriano at pamilya Villanueva tungkol sa right of way na ginagamit ng parehong pamilya sa loob ng maraming taon. Gustong isara ng isa ang daan.',
 'Nagpatingin sa tamang talaan ng lupa at napatunayan ang right of way. Pumayag ang parehong partido sa kasunduan.',
 'Barangay Lupon / Court','Tanod Liza Dela Cruz',5),

-- ── AUGUST 2026 ───────────────────────────────────────────
('BLT-2026-0011','2026-08-07 11:30:00','2026-08-07 12:00:00',
 'Physical Injury / Pananakit / Sakitan','Purok 4','Luntiang Bukid St.',
 'high','active',
 'Nagsumbong si Gng. Hernandez na iniatake siya ng kanyang asawa matapos ang matinding pagtatalo. Ginamit ang hawakan ng walis at nagkaroon siya ng sugat sa ulo na nangangailangan ng tahi.',
 'Dinala sa ospital agad. Nagpadala ng emergency notice sa DSWD para sa family protection. Kasalukuyang inimbestigahan.',
 'DSWD','Tanod Maria Santos',3),

('BLT-2026-0012','2026-08-19 16:45:00','2026-08-19 17:15:00',
 'Verbal Abuse / Paninirang Puri / Intriga','Purok 5','Ligaya St.',
 'medium','pending',
 'Nagreklamo si Gng. Castro na ang kanyang kapitbahay na si G. Magno ay paulit-ulit na nanlalait sa kanya at sa kanyang anak sa harap ng ibang mga residente.',
 'Natanggap ang reklamo. Nagpadala na ng summons kay G. Magno.',
 NULL,'Tanod Pedro Manalo',4),

-- ── SEPTEMBER 2026 ────────────────────────────────────────
('BLT-2026-0013','2026-09-12 15:30:00','2026-09-12 16:00:00',
 'Pet Nuisance / Gala o Maingay na Aso','Purok 2','Bagong Pag-asa St.',
 'low','resolved',
 'Nagsumbong si Gng. Villafuerte na ang aso ng kanyang kapitbahay ay madalas nagtatae sa tapat ng kanyang bahay at sa lansangan, at hindi nililinis ng may-ari.',
 'Binigyan ng formal na babala ang may-ari ng aso. Sumunod na at nililinis na niya ang tae ng kanyang aso.',
 NULL,'Tanod Maria Santos',3),

('BLT-2026-0014','2026-09-22 11:00:00','2026-09-22 11:30:00',
 'Neighbor Dispute / Away Magkapitbahay','Purok 3','Masagana St.',
 'medium','active',
 'Nagtatalo ang dalawang kapitbahay tungkol sa tubig na tumatakbo mula sa atip ng bahay ng isa patungo sa lupa ng isa. Nagdulot ito ng baha sa bahay ng nagsumbong tuwing umuulan.',
 'Humingi ng inspection ng Municipal Engineer para sa drainage assessment. Nakatakdang magpulong sa susunod na linggo.',
 NULL,'Tanod Pedro Manalo',4),

-- ── OCTOBER 2026 (RECENT / CURRENT MONTH) ────────────────
('BLT-2026-0015','2026-10-01 08:30:00','2026-10-01 09:00:00',
 'Physical Injury / Pananakit / Sakitan','Purok 4','Bagong Silang St.',
 'high','pending',
 'Nagsumbong si G. Macaraig na pinalo siya ng kanyang kapit-bahay na si G. Ignacio gamit ang kahoy matapos ang pagtatalo tungkol sa ingay. Nagkaroon ng malaking pasa sa likod at braso.',
 'Natanggap ang reklamo. Nagpadala ng immediate summons sa respondent. Inirekomenda ang medicolegal examination.',
 NULL,'Tanod Liza Dela Cruz',5),

('BLT-2026-0016','2026-10-03 14:00:00','2026-10-03 14:30:00',
 'Verbal Abuse / Paninirang Puri / Intriga','Purok 5','Kabalikat St.',
 'medium','pending',
 'Nagreklamo si Gng. Estrada laban sa kanyang dating kaibigan na si Gng. Medina na nagpapalaganap ng maling tsismis tungkol sa kanyang pamilya sa buong purok. Apektado na ang reputasyon nila.',
 'Natanggap ang reklamo. Inihanda ang First Notice of Hearing.',
 NULL,'Tanod Jose Reyes',2),

('BLT-2026-0017','2026-10-05 10:15:00','2026-10-05 10:45:00',
 'Noise Disturbance / Maingay (Ingay)','Purok 6','Mapayapa St.',
 'low','pending',
 'Nagsumbong ang mga residente ng Mapayapa St. tungkol sa isang videoke bar na nagpapatakbo hanggang alas-dos ng madaling araw kahit linggo ng trabaho. Hindi makatulog ang mga bata at matatanda.',
 'Natanggap ang reklamo. Nagpadala ng Notice to Comply sa may-ari ng videoke bar.',
 NULL,'Tanod Maria Santos',3);

-- ============================================================
-- PARTIES — Complainants and Respondents
-- ============================================================
INSERT INTO parties
  (incident_id, party_type, full_name, age, sex, civil_status, address, contact_number)
SELECT id, 'complainant', comp_name, comp_age, comp_sex, comp_civ, comp_addr, comp_phone
FROM (
  SELECT
    i.id,
    v.comp_name, v.comp_age, v.comp_sex, v.comp_civ, v.comp_addr, v.comp_phone
  FROM incidents i
  JOIN (VALUES
    ROW('BLT-2025-0001','Maria Flores',45,'Female','Married','Blk 3 Sampaguita St., Purok 2','0917-234-5678'),
    ROW('BLT-2025-0002','Eduardo Ramos',52,'Male','Married','12 Rizal Ave., Purok 1','0919-456-7890'),
    ROW('BLT-2025-0003','Armando Villanueva',35,'Male','Single','5 Mabini St., Purok 3','0921-678-9012'),
    ROW('BLT-2025-0004','Rosario Aquino',60,'Female','Widowed','23 Magsaysay Blvd., Purok 4','0923-890-1234'),
    ROW('BLT-2025-0005','Barangay Council',NULL,NULL,NULL,'Barangay Hall',NULL),
    ROW('BLT-2025-0006','Corazon Pascual',33,'Female','Single','3 Luna St., Purok 2','0927-234-5678'),
    ROW('BLT-2025-0007','Jose Andrada',55,'Male','Married','18 Arellano St., Purok 1','0929-456-7890'),
    ROW('BLT-2025-0008','Ramon Miranda',28,'Male','Single','6 Kalayaan St., Purok 3','0931-678-9012'),
    ROW('BLT-2025-0009','Teresita Ocampo',63,'Female','Widowed','30 Malaya St., Purok 4','0932-789-0123'),
    ROW('BLT-2025-0010','Soledad Torres',55,'Female','Married','4 Maharlika St., Purok 6','0935-012-3456'),
    ROW('BLT-2025-0011','Maricela Reyes',29,'Female','Married','11 Sampaguita St., Purok 2','0938-345-6789'),
    ROW('BLT-2025-0012','Purok 4 Residents',NULL,NULL,NULL,'Ilang-Ilang St., Purok 4',NULL),
    ROW('BLT-2026-0001','Ernesto Corpuz',62,'Male','Married','14 Gumamela St., Purok 5','0942-789-0123'),
    ROW('BLT-2026-0002','Purok 1 Residents',NULL,NULL,NULL,'Jasmine St., Purok 1',NULL),
    ROW('BLT-2026-0003','Andres Dela Torre',50,'Male','Married','6 Orchid St., Purok 2','0947-234-5678'),
    ROW('BLT-2026-0004','Rodolfo Santos',44,'Male','Married','3 Rose St., Purok 3','0949-456-7890'),
    ROW('BLT-2026-0005','School Principal',NULL,NULL,NULL,'Elementary School, Dahlia St.','0951-678-9012'),
    ROW('BLT-2026-0006','Arsenio Lopez',55,'Male','Married','3 Sampaguita Ext., Purok 6','0952-789-0123'),
    ROW('BLT-2026-0007','Magdalena Bautista',55,'Female','Widowed','7 Camia St., Purok 2','0954-901-2345'),
    ROW('BLT-2026-0008','Purok 4 Residents',NULL,NULL,NULL,'Rosal Ext., Purok 4',NULL),
    ROW('BLT-2026-0009','Delia Mercado',38,'Female','Married','15 Acacia St., Purok 5','0958-345-6789'),
    ROW('BLT-2026-0010','Ricardo Soriano',60,'Male','Married','5 Pag-asa St., Purok 2','0962-789-0123'),
    ROW('BLT-2026-0011','Ligaya Hernandez',31,'Female','Married','8 Luntiang Bukid St., Purok 4','0965-012-3456'),
    ROW('BLT-2026-0012','Virginia Castro',44,'Female','Married','12 Ligaya St., Purok 5','0967-234-5678'),
    ROW('BLT-2026-0013','Josefina Villafuerte',50,'Female','Married','4 Bagong Pag-asa St., Purok 2','0971-678-9012'),
    ROW('BLT-2026-0014','Crisanto Buenaventura',52,'Male','Married','8 Masagana St., Purok 3','0973-890-1234'),
    ROW('BLT-2026-0015','Noel Macaraig',38,'Male','Married','5 Bagong Silang St., Purok 4','0975-012-3456'),
    ROW('BLT-2026-0016','Cynthia Estrada',37,'Female','Married','3 Kabalikat St., Purok 5','0977-234-5678'),
    ROW('BLT-2026-0017','Mapayapa St. HOA',NULL,NULL,NULL,'Mapayapa St., Purok 6',NULL)
  ) AS v(case_id_ref, comp_name, comp_age, comp_sex, comp_civ, comp_addr, comp_phone)
  ON i.case_id = v.case_id_ref
) AS sq;

INSERT INTO parties
  (incident_id, party_type, full_name, age, sex, civil_status, address, contact_number)
SELECT id, 'respondent', resp_name, resp_age, resp_sex, resp_civ, resp_addr, resp_phone
FROM (
  SELECT
    i.id,
    v.resp_name, v.resp_age, v.resp_sex, v.resp_civ, v.resp_addr, v.resp_phone
  FROM incidents i
  JOIN (VALUES
    ROW('BLT-2025-0001','Roberto Sison',38,'Male','Married','Blk 4 Sampaguita St., Purok 2','0918-345-6789'),
    ROW('BLT-2025-0002','Danilo Cruz',48,'Male','Married','14 Rizal Ave., Purok 1','0920-567-8901'),
    ROW('BLT-2025-0003','Felix Bautista',42,'Male','Married','7 Mabini St., Purok 3','0922-789-0123'),
    ROW('BLT-2025-0004','Jesus Tolentino',55,'Male','Married','25 Magsaysay Blvd., Purok 4','0924-901-2345'),
    ROW('BLT-2025-0005','Unknown Resident',NULL,NULL,NULL,'Quezon St., Purok 6',NULL),
    ROW('BLT-2025-0006','Elena Fernandez',36,'Female','Married','5 Luna St., Purok 2','0928-345-6789'),
    ROW('BLT-2025-0007','Jeepney Driver',40,'Male','Married','Route 12, Arellano',NULL),
    ROW('BLT-2025-0008','Unknown Group',NULL,NULL,NULL,'Unknown',NULL),
    ROW('BLT-2025-0009','Rodrigo Rivera',47,'Male','Married','32 Malaya St., Purok 4','0933-890-1234'),
    ROW('BLT-2025-0010','Renato Gonzales',58,'Male','Married','6 Maharlika St., Purok 6','0936-123-4567'),
    ROW('BLT-2025-0011','Ricardo Reyes',34,'Male','Married','11 Sampaguita St., Purok 2','0939-456-7890'),
    ROW('BLT-2025-0012','Party Organizer',25,'Male','Single','20 Ilang-Ilang St., Purok 4','0941-678-9012'),
    ROW('BLT-2026-0001','Leonora Alcantara',55,'Female','Separated','16 Gumamela St., Purok 5','0943-890-1234'),
    ROW('BLT-2026-0002','Danilo Navarro',38,'Male','Married','9 Jasmine St., Purok 1','0946-123-4567'),
    ROW('BLT-2026-0003','Perla Cabrera',46,'Female','Married','8 Orchid St., Purok 2','0948-345-6789'),
    ROW('BLT-2026-0004','Benjamin Reyes',46,'Male','Married','12 Lapu-Lapu St., Purok 3','0950-567-8901'),
    ROW('BLT-2026-0005','Pedicab Drivers',NULL,NULL,NULL,'Dahlia St., Purok 5',NULL),
    ROW('BLT-2026-0006','Nestor Delos Reyes',48,'Male','Married','5 Sampaguita Ext., Purok 6','0953-890-1234'),
    ROW('BLT-2026-0007','Marcelino Galang',50,'Male','Separated','9 Camia St., Purok 2','0955-012-3456'),
    ROW('BLT-2026-0008','Unknown Stray Owner',NULL,NULL,NULL,'Unknown',NULL),
    ROW('BLT-2026-0009','Kevin Soriano',16,'Male','Single','17 Acacia St., Purok 5','0959-456-7890'),
    ROW('BLT-2026-0010','Nelson Villanueva',55,'Male','Married','7 Pag-asa St., Purok 2','0963-890-1234'),
    ROW('BLT-2026-0011','Rodrigo Hernandez',35,'Male','Married','8 Luntiang Bukid St., Purok 4','0966-123-4567'),
    ROW('BLT-2026-0012','Ernesto Magno',46,'Male','Married','14 Ligaya St., Purok 5','0968-345-6789'),
    ROW('BLT-2026-0013','Neighbor Dog Owner',40,'Male','Married','6 Bagong Pag-asa St., Purok 2','0972-789-0123'),
    ROW('BLT-2026-0014','Alberto Tolentino',48,'Male','Married','10 Masagana St., Purok 3','0974-901-2345'),
    ROW('BLT-2026-0015','Domingo Ignacio',42,'Male','Married','7 Bagong Silang St., Purok 4','0976-123-4567'),
    ROW('BLT-2026-0016','Gloria Medina',40,'Female','Married','5 Kabalikat St., Purok 5','0978-345-6789'),
    ROW('BLT-2026-0017','Videoke Bar Owner',45,'Male','Married','10 Mapayapa St., Purok 6','0979-456-7890')
  ) AS v(case_id_ref, resp_name, resp_age, resp_sex, resp_civ, resp_addr, resp_phone)
  ON i.case_id = v.case_id_ref
) AS sq;

-- ============================================================
-- WITNESSES
-- ============================================================
INSERT INTO witnesses (incident_id, full_name, address, contact_number)
SELECT i.id, w.wname, w.waddr, w.wphone
FROM incidents i
JOIN (VALUES
  ROW('BLT-2025-0003','Esperanza Dizon','3 Mabini St., Purok 3','0980-567-8901'),
  ROW('BLT-2025-0003','Arturo Lim','9 Mabini St., Purok 3','0981-678-9012'),
  ROW('BLT-2025-0008','Marife Espiritu','4 Kalayaan St., Purok 3','0982-789-0123'),
  ROW('BLT-2025-0011','Rosario Yap','Neighbor, Sampaguita St.','0983-890-1234'),
  ROW('BLT-2026-0004','Alfredo Navarro','7 Rose St., Purok 3','0984-901-2345'),
  ROW('BLT-2026-0009','Purok Captain','Purok 5 Hall','0985-012-3456'),
  ROW('BLT-2026-0009','Mario Mercado','Father of Complainant','0986-123-4567'),
  ROW('BLT-2026-0011','Neighbor Witness','6 Luntiang Bukid St., Purok 4','0987-234-5678'),
  ROW('BLT-2026-0015','Barangay Tanod Onduty','Barangay Hall',NULL),
  ROW('BLT-2026-0015','Street Vendor','Bagong Silang St.','0988-345-6789')
) AS w(case_id_ref, wname, waddr, wphone)
ON i.case_id = w.case_id_ref;

-- ============================================================
-- AUDIT LOGS
-- ============================================================
INSERT INTO audit_logs (user_id, action, table_name, record_id, old_value, new_value, ip_address, created_at)
VALUES
(1,'LOGIN','users',1,NULL,'{"username":"admin"}','192.168.1.100','2025-09-01 08:00:00'),
(2,'CREATE','incidents',1,NULL,'{"case_id":"BLT-2025-0001"}','192.168.1.101','2025-09-03 15:00:00'),
(3,'CREATE','incidents',3,NULL,'{"case_id":"BLT-2025-0003"}','192.168.1.102','2025-09-18 21:10:00'),
(1,'UPDATE','incidents',1,'{"status":"pending"}','{"status":"resolved"}','192.168.1.100','2025-09-05 10:00:00'),
(2,'UPDATE','incidents',2,'{"status":"pending"}','{"status":"resolved"}','192.168.1.101','2025-09-20 14:00:00'),
(3,'UPDATE','incidents',3,'{"status":"active"}','{"status":"referred"}','192.168.1.102','2025-09-19 09:00:00'),
(4,'LOGIN','users',4,NULL,'{"username":"pedro.manalo"}','192.168.1.103',NOW()),
(5,'CREATE','incidents',NULL,NULL,'{"case_id":"BLT-2026-0015"}','192.168.1.104','2026-10-01 09:00:00'),
(2,'LOGIN','users',2,NULL,'{"username":"jose.reyes"}','192.168.1.101',NOW()),
(1,'CREATE','incidents',NULL,NULL,'{"case_id":"BLT-2026-0017"}','192.168.1.100','2026-10-05 10:45:00');

-- ============================================================
-- VERIFICATION QUERIES
-- ============================================================
SELECT 'SEED COMPLETE' AS result;

SELECT tbl, cnt FROM (
  SELECT 'users'      AS tbl, COUNT(*) AS cnt FROM users      UNION ALL
  SELECT 'incidents'  AS tbl, COUNT(*) AS cnt FROM incidents  UNION ALL
  SELECT 'parties'    AS tbl, COUNT(*) AS cnt FROM parties    UNION ALL
  SELECT 'witnesses'  AS tbl, COUNT(*) AS cnt FROM witnesses  UNION ALL
  SELECT 'audit_logs' AS tbl, COUNT(*) AS cnt FROM audit_logs
) AS summary;

SELECT status, COUNT(*) AS count FROM incidents GROUP BY status ORDER BY count DESC;
SELECT severity, COUNT(*) AS count FROM incidents GROUP BY severity ORDER BY count DESC;
SELECT DATE_FORMAT(date_time_of_incident,'%Y-%m') AS month, COUNT(*) AS incidents
FROM incidents GROUP BY month ORDER BY month;
