<?php
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/db.php';

requireAuth();
$pdo = getDB();

// Monthly incidents — last 12 months
$monthly = $pdo->query(
    "SELECT DATE_FORMAT(date_time_filed,'%b %Y') AS label,
            DATE_FORMAT(date_time_filed,'%Y-%m')  AS ym,
            COUNT(*) AS count
     FROM incidents
     WHERE date_time_filed >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
       AND status != 'archived'
     GROUP BY ym, label
     ORDER BY ym ASC"
)->fetchAll();

// Incident type distribution
$byType = $pdo->query(
    "SELECT incident_type AS name, COUNT(*) AS value
     FROM incidents WHERE status!='archived'
     GROUP BY incident_type ORDER BY value DESC LIMIT 10"
)->fetchAll();

// By Purok
$byPurok = $pdo->query(
    "SELECT purok AS name, COUNT(*) AS count
     FROM incidents WHERE status!='archived'
     GROUP BY purok ORDER BY count DESC"
)->fetchAll();

// Status breakdown by month (last 6 months)
$statusTrend = $pdo->query(
    "SELECT DATE_FORMAT(date_time_filed,'%b %Y') AS label,
            DATE_FORMAT(date_time_filed,'%Y-%m')  AS ym,
            SUM(status='pending')  AS pending,
            SUM(status='active')   AS active,
            SUM(status='resolved') AS resolved,
            SUM(status='referred') AS referred
     FROM incidents
     WHERE date_time_filed >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
       AND status != 'archived'
     GROUP BY ym, label
     ORDER BY ym ASC"
)->fetchAll();

// Severity trend
$severityTrend = $pdo->query(
    "SELECT DATE_FORMAT(date_time_filed,'%b %Y') AS label,
            DATE_FORMAT(date_time_filed,'%Y-%m')  AS ym,
            SUM(severity='low')    AS low,
            SUM(severity='medium') AS medium,
            SUM(severity='high')   AS high
     FROM incidents
     WHERE date_time_filed >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
       AND status != 'archived'
     GROUP BY ym, label
     ORDER BY ym ASC"
)->fetchAll();

jsonOk([
    'monthly'       => $monthly,
    'by_type'       => $byType,
    'by_purok'      => $byPurok,
    'status_trend'  => $statusTrend,
    'severity_trend'=> $severityTrend,
]);
