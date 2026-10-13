<?php
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/db.php';

requireAdmin();
$pdo = getDB();

$page    = max(1, (int)($_GET['page'] ?? 1));
$perPage = 50;
$offset  = ($page - 1) * $perPage;

$rows = $pdo->query(
    "SELECT al.*, u.full_name, u.username
     FROM audit_logs al
     LEFT JOIN users u ON u.id = al.user_id
     ORDER BY al.created_at DESC
     LIMIT $perPage OFFSET $offset"
)->fetchAll();

$total = (int) $pdo->query("SELECT COUNT(*) FROM audit_logs")->fetchColumn();

jsonOk(['data' => $rows, 'total' => $total]);
