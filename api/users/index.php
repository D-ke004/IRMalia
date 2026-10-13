<?php
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/db.php';

requireAdmin();
$pdo = getDB();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $rows = $pdo->query("SELECT id, employee_id, full_name, role, username, is_active, created_at FROM users ORDER BY id ASC")->fetchAll();
    jsonOk($rows);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $d = body();
    foreach (['full_name','username','password','role'] as $f) {
        if (empty($d[$f])) jsonErr("Field '$f' is required.");
    }
    $check = $pdo->prepare("SELECT id FROM users WHERE username = ?");
    $check->execute([$d['username']]);
    if ($check->fetch()) jsonErr('Username already taken.');

    $pdo->prepare("INSERT INTO users (employee_id, full_name, role, username, password_hash) VALUES (?,?,?,?,?)")
        ->execute([$d['employee_id']??null, $d['full_name'], $d['role'], $d['username'], password_hash($d['password'], PASSWORD_DEFAULT)]);

    logAudit($pdo, 'CREATE_USER', 'users', $pdo->lastInsertId(), null, ['username'=>$d['username']]);
    jsonOk(['message' => 'User created successfully.'], 201);
}

if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    $d  = body();
    $id = (int)($d['id'] ?? 0);
    if (!$id) jsonErr('Missing user ID.');

    $fields = [];
    $vals   = [];

    if (!empty($d['full_name']))   { $fields[] = 'full_name=?';  $vals[] = $d['full_name']; }
    if (!empty($d['role']))        { $fields[] = 'role=?';       $vals[] = $d['role']; }
    if (isset($d['is_active']))    { $fields[] = 'is_active=?';  $vals[] = (int)$d['is_active']; }
    if (!empty($d['employee_id'])) { $fields[] = 'employee_id=?';$vals[] = $d['employee_id']; }
    if (!empty($d['password']))    { $fields[] = 'password_hash=?'; $vals[] = password_hash($d['password'], PASSWORD_DEFAULT); }

    if (empty($fields)) jsonErr('Nothing to update.');
    $vals[] = $id;

    $pdo->prepare("UPDATE users SET " . implode(',', $fields) . " WHERE id=?")->execute($vals);
    logAudit($pdo, 'UPDATE_USER', 'users', $id, null, $d);
    jsonOk(['message' => 'User updated.']);
}

jsonErr('Method not allowed.', 405);
