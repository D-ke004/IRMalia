<?php
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/db.php';

requireAuth();
$pdo = getDB();

$year   = date('Y');
$prefix = "EM-$year-";
$last   = $pdo->query("SELECT case_id FROM incidents WHERE case_id LIKE '$prefix%' ORDER BY id DESC LIMIT 1")->fetchColumn();
$seq    = $last ? ((int) substr($last, -4)) + 1 : 1;
$nextCaseId = $prefix . str_pad($seq, 4, '0', STR_PAD_LEFT);

jsonOk([
    'next_case_id' => $nextCaseId,
    'seq'          => $seq,
    'year'         => $year,
]);
