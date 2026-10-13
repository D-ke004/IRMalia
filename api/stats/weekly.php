<?php
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/db.php';

requireAuth();
$pdo = getDB();

// Last 30 days — daily counts by severity (expanded from 7 so more data is visible)
$daily = $pdo->query(
    "SELECT
        DATE(date_time_filed)              AS day,
        DATE_FORMAT(date_time_filed,'%a %d')  AS label,
        SUM(severity = 'high')             AS high,
        SUM(severity = 'medium')           AS medium,
        SUM(severity = 'low')              AS low,
        COUNT(*)                           AS total
     FROM incidents
     WHERE date_time_filed >= DATE_SUB(CURDATE(), INTERVAL 29 DAY)
       AND status != 'archived'
     GROUP BY day, label
     ORDER BY day ASC"
)->fetchAll();

// Current status snapshot for donut
$status = $pdo->query(
    "SELECT
        SUM(status = 'pending')  AS pending,
        SUM(status = 'active')   AS active,
        SUM(status = 'resolved') AS resolved,
        SUM(status = 'referred') AS referred
     FROM incidents
     WHERE status != 'archived'"
)->fetch();

// Avg resolution time — approximate using date_time_of_incident vs date_time_filed
// (since no updated_at column exists, we use a sensible fallback)
$avgRes = $pdo->query(
    "SELECT ROUND(
        AVG(
            CASE
              WHEN TIMESTAMPDIFF(HOUR, date_time_filed, date_time_of_incident) > 0
              THEN TIMESTAMPDIFF(HOUR, date_time_filed, date_time_of_incident) / 24.0
              ELSE NULL
            END
        ), 1
     ) AS avg_days
     FROM incidents
     WHERE status = 'resolved'"
)->fetchColumn();

// Monthly breakdown last 6 months (for trend chart)
$monthly = $pdo->query(
    "SELECT
        DATE_FORMAT(date_time_filed,'%b %Y') AS label,
        DATE_FORMAT(date_time_filed,'%Y-%m') AS ym,
        COUNT(*) AS total,
        SUM(severity='high') AS high,
        SUM(severity='medium') AS medium,
        SUM(severity='low') AS low,
        SUM(status='pending') AS pending,
        SUM(status='active') AS active,
        SUM(status='resolved') AS resolved,
        SUM(status='referred') AS referred
     FROM incidents
     WHERE date_time_filed >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
       AND status != 'archived'
     GROUP BY ym, label
     ORDER BY ym ASC"
)->fetchAll();

// Incident type distribution
$byType = $pdo->query(
    "SELECT incident_type AS name, COUNT(*) AS value
     FROM incidents WHERE status != 'archived'
     GROUP BY incident_type ORDER BY value DESC LIMIT 10"
)->fetchAll();

// By Purok hotspot
$byPurok = $pdo->query(
    "SELECT purok AS name, COUNT(*) AS count
     FROM incidents WHERE status != 'archived'
     GROUP BY purok ORDER BY count DESC LIMIT 8"
)->fetchAll();

jsonOk([
    'daily'               => $daily,
    'status_now'          => $status,
    'avg_resolution_days' => $avgRes ?? 0,
    'monthly'             => $monthly,
    'by_type'             => $byType,
    'by_purok'            => $byPurok,
]);
