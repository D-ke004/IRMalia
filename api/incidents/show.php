<?php
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/db.php';

requireAuth();
$pdo = getDB();

$id = (int)($_GET['id'] ?? 0);
if (!$id) jsonErr('Missing incident ID.');

$stmt = $pdo->prepare("SELECT i.*, u.full_name AS filed_by_name FROM incidents i
                        LEFT JOIN users u ON u.id = i.filed_by_user_id
                        WHERE i.id = ?");
$stmt->execute([$id]);
$incident = $stmt->fetch();
if (!$incident) jsonErr('Incident not found.', 404);

$parties = $pdo->prepare("SELECT * FROM parties WHERE incident_id = ?");
$parties->execute([$id]);

$witnesses = $pdo->prepare("SELECT * FROM witnesses WHERE incident_id = ?");
$witnesses->execute([$id]);

$incident['parties']   = $parties->fetchAll();
$incident['witnesses'] = $witnesses->fetchAll();

jsonOk($incident);
