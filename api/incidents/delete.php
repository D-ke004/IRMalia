<?php
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/db.php';

requireAdmin(); // Only admin can delete
if ($_SERVER['REQUEST_METHOD'] !== 'DELETE') jsonErr('Method not allowed.', 405);

$d   = body();
$id  = (int)($d['id'] ?? 0);
$pdo = getDB();

if (!$id) jsonErr('Missing incident ID.');

$stmt = $pdo->prepare("SELECT case_id FROM incidents WHERE id = ?");
$stmt->execute([$id]);
$inc = $stmt->fetch();
if (!$inc) jsonErr('Incident not found.', 404);

// Soft delete — archive
$pdo->prepare("UPDATE incidents SET status='archived' WHERE id=?")->execute([$id]);
logAudit($pdo, 'ARCHIVE_INCIDENT', 'incidents', $id, $inc, ['status' => 'archived']);

jsonOk(['message' => "Case {$inc['case_id']} archived successfully."]);
