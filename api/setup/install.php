<?php
/**
 * IRMALIA — Database Installer
 * Visit: http://localhost/IRMalia/api/setup/install.php
 * Run ONCE to create tables and a default admin account.
 */

$host    = 'localhost';
$user    = 'root';
$pass    = '';
$dbName  = 'irmalia_db';

try {
    // Create DB if not exists
    $pdo = new PDO("mysql:host=$host;charset=utf8mb4", $user, $pass, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
    $pdo->exec("CREATE DATABASE IF NOT EXISTS `$dbName` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
    $pdo->exec("USE `$dbName`");

    // --- USERS ---
    $pdo->exec("CREATE TABLE IF NOT EXISTS users (
        id            INT AUTO_INCREMENT PRIMARY KEY,
        employee_id   VARCHAR(20)  UNIQUE,
        full_name     VARCHAR(150) NOT NULL,
        role          ENUM('admin','desk_officer','viewer') DEFAULT 'desk_officer',
        username      VARCHAR(80)  UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        is_active     TINYINT(1) DEFAULT 1,
        created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB");

    // --- INCIDENTS ---
    $pdo->exec("CREATE TABLE IF NOT EXISTS incidents (
        id                    INT AUTO_INCREMENT PRIMARY KEY,
        case_id               VARCHAR(25) UNIQUE NOT NULL,
        date_time_of_incident DATETIME NOT NULL,
        date_time_filed       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        incident_type         VARCHAR(100) NOT NULL,
        purok                 VARCHAR(60)  NOT NULL,
        street_address        VARCHAR(255),
        severity              ENUM('low','medium','high') DEFAULT 'medium',
        status                ENUM('pending','active','resolved','referred','archived') DEFAULT 'pending',
        narrative             TEXT NOT NULL,
        action_taken          TEXT,
        referred_to           VARCHAR(150),
        officer_on_duty       VARCHAR(150),
        filed_by_user_id      INT,
        FOREIGN KEY (filed_by_user_id) REFERENCES users(id) ON DELETE SET NULL
    ) ENGINE=InnoDB");

    // --- PARTIES (complainant / respondent) ---
    $pdo->exec("CREATE TABLE IF NOT EXISTS parties (
        id              INT AUTO_INCREMENT PRIMARY KEY,
        incident_id     INT NOT NULL,
        party_type      ENUM('complainant','respondent') NOT NULL,
        full_name       VARCHAR(150) NOT NULL,
        age             INT,
        sex             ENUM('Male','Female','Other'),
        civil_status    VARCHAR(30),
        address         TEXT,
        contact_number  VARCHAR(30),
        FOREIGN KEY (incident_id) REFERENCES incidents(id) ON DELETE CASCADE
    ) ENGINE=InnoDB");

    // --- WITNESSES ---
    $pdo->exec("CREATE TABLE IF NOT EXISTS witnesses (
        id              INT AUTO_INCREMENT PRIMARY KEY,
        incident_id     INT NOT NULL,
        full_name       VARCHAR(150) NOT NULL,
        address         TEXT,
        contact_number  VARCHAR(30),
        FOREIGN KEY (incident_id) REFERENCES incidents(id) ON DELETE CASCADE
    ) ENGINE=InnoDB");

    // --- AUDIT LOGS ---
    $pdo->exec("CREATE TABLE IF NOT EXISTS audit_logs (
        id          INT AUTO_INCREMENT PRIMARY KEY,
        user_id     INT,
        action      VARCHAR(60) NOT NULL,
        table_name  VARCHAR(60),
        record_id   INT,
        old_value   TEXT,
        new_value   TEXT,
        ip_address  VARCHAR(45),
        created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    ) ENGINE=InnoDB");

    // --- DEFAULT ADMIN (if not exists) ---
    $check = $pdo->query("SELECT COUNT(*) FROM users WHERE username='admin'")->fetchColumn();
    if ($check == 0) {
        $hash = password_hash('Admin@1234', PASSWORD_DEFAULT);
        $pdo->prepare("INSERT INTO users (employee_id, full_name, role, username, password_hash) VALUES (?,?,?,?,?)")
            ->execute(['ADM-001', 'System Administrator', 'admin', 'admin', $hash]);
        echo "<p>✅ Default admin created — username: <b>admin</b> / password: <b>Admin@1234</b></p>";
    } else {
        echo "<p>ℹ️ Admin account already exists.</p>";
    }

    echo "<p>✅ All tables created successfully in <b>$dbName</b>.</p>";
    echo "<p>🔒 <b>Delete or restrict access to this file after setup!</b></p>";

} catch (PDOException $e) {
    echo "<p style='color:red'>❌ Error: " . htmlspecialchars($e->getMessage()) . "</p>";
}
