<?php
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') jsonErr('Method not allowed', 405);

$data     = body();
$username = trim($data['username'] ?? '');
$password = $data['password'] ?? '';

if (!$username || !$password) jsonErr('Username and password are required.');

$pdo  = getDB();
$stmt = $pdo->prepare("SELECT * FROM users WHERE username = ? AND is_active = 1");
$stmt->execute([$username]);
$user = $stmt->fetch();

if (!$user || !password_verify($password, $user['password_hash'])) {
    jsonErr('Invalid username or password.', 401);
}

$_SESSION['user_id']   = $user['id'];
$_SESSION['username']  = $user['username'];
$_SESSION['full_name'] = $user['full_name'];
$_SESSION['role']      = $user['role'];

logAudit($pdo, 'LOGIN');

jsonOk([
    'id'        => $user['id'],
    'username'  => $user['username'],
    'full_name' => $user['full_name'],
    'role'      => $user['role'],
]);
