<?php
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/db.php';

requireAuth();
$pdo = getDB();

$total    = (int) $pdo->query("SELECT COUNT(*) FROM incidents WHERE status != 'archived'")->fetchColumn();
$pending  = (int) $pdo->query("SELECT COUNT(*) FROM incidents WHERE status='pending'")->fetchColumn();
$active   = (int) $pdo->query("SELECT COUNT(*) FROM incidents WHERE status='active'")->fetchColumn();
$resolved = (int) $pdo->query("SELECT COUNT(*) FROM incidents WHERE status='resolved'")->fetchColumn();
$referred = (int) $pdo->query("SELECT COUNT(*) FROM incidents WHERE status='referred'")->fetchColumn();
$high     = (int) $pdo->query("SELECT COUNT(*) FROM incidents WHERE severity='high' AND status NOT IN('resolved','archived')")->fetchColumn();

// This month vs last month
$thisMonth = (int) $pdo->query("SELECT COUNT(*) FROM incidents WHERE MONTH(date_time_filed)=MONTH(NOW()) AND YEAR(date_time_filed)=YEAR(NOW())")->fetchColumn();
$lastMonth = (int) $pdo->query("SELECT COUNT(*) FROM incidents WHERE MONTH(date_time_filed)=MONTH(NOW()-INTERVAL 1 MONTH) AND YEAR(date_time_filed)=YEAR(NOW()-INTERVAL 1 MONTH)")->fetchColumn();

// Top Purok
$topPurok = $pdo->query("SELECT purok, COUNT(*) AS cnt FROM incidents WHERE status!='archived' GROUP BY purok ORDER BY cnt DESC LIMIT 1")->fetch();

// Resolution rate
$resRate = $total > 0 ? round(($resolved / $total) * 100) : 0;

jsonOk([
    'total'        => $total,
    'pending'      => $pending,
    'active'       => $active,
    'resolved'     => $resolved,
    'referred'     => $referred,
    'high_open'    => $high,
    'this_month'   => $thisMonth,
    'last_month'   => $lastMonth,
    'top_purok'    => $topPurok ?: null,
    'res_rate'     => $resRate,
]);
