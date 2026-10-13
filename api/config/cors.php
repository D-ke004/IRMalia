<?php
$allowed = ['http://localhost:5173', 'http://localhost:3000', 'http://irmalia.test', 'http://localhost', 'http://localhost:8000'];
$origin  = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, $allowed)) {
    header("Access-Control-Allow-Origin: $origin");
}
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

function jsonOk($data, $code = 200) {
    http_response_code($code);
    echo json_encode($data);
    exit;
}

function jsonErr($msg, $code = 400) {
    http_response_code($code);
    echo json_encode(['error' => $msg]);
    exit;
}

function requireAuth() {
    if (empty($_SESSION['user_id'])) jsonErr('Unauthorized. Please log in.', 401);
    return $_SESSION;
}

function requireAdmin() {
    $s = requireAuth();
    if ($s['role'] !== 'admin') jsonErr('Admin access required.', 403);
    return $s;
}

function logAudit($pdo, $action, $table = null, $recordId = null, $old = null, $new = null) {
    if (empty($_SESSION['user_id'])) return;
    $stmt = $pdo->prepare(
        "INSERT INTO audit_logs (user_id, action, table_name, record_id, old_value, new_value, ip_address)
         VALUES (?, ?, ?, ?, ?, ?, ?)"
    );
    $stmt->execute([
        $_SESSION['user_id'], $action, $table, $recordId,
        $old ? json_encode($old) : null,
        $new ? json_encode($new) : null,
        $_SERVER['REMOTE_ADDR'] ?? null
    ]);
}

function body() {
    return json_decode(file_get_contents('php://input'), true) ?? [];
}
