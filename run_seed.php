<?php
require_once __DIR__ . '/api/config/db.php';

$sql = file_get_contents(__DIR__ . '/seed_test_data.sql');

if (!$sql) {
    die("Error: Could not read seed_test_data.sql\n");
}

try {
    $pdo = getDB();
    $pdo->exec($sql);
    echo "Seed data successfully injected into database.\n";
} catch (PDOException $e) {
    die("Database error: " . $e->getMessage() . "\n");
}
