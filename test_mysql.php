<?php
try {
    $pdo = new PDO('mysql:host=localhost;charset=utf8mb4', 'root', '');
    echo 'MySQL OK: ' . $pdo->query('SELECT VERSION()')->fetchColumn() . PHP_EOL;
} catch(Exception $e) {
    // Try 127.0.0.1 instead
    try {
        $pdo2 = new PDO('mysql:host=127.0.0.1;charset=utf8mb4', 'root', '');
        echo 'MySQL OK via 127.0.0.1: ' . $pdo2->query('SELECT VERSION()')->fetchColumn() . PHP_EOL;
    } catch(Exception $e2) {
        echo 'FAIL localhost: ' . $e->getMessage() . PHP_EOL;
        echo 'FAIL 127.0.0.1: ' . $e2->getMessage() . PHP_EOL;
    }
}
