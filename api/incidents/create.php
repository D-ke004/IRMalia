<?php
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/db.php';

requireAuth();
if ($_SERVER['REQUEST_METHOD'] !== 'POST') jsonErr('Method not allowed.', 405);

$d   = body();
$pdo = getDB();
$ses = $_SESSION;

// Required fields
$required = ['date_time_of_incident','incident_type','purok','narrative'];
foreach ($required as $f) {
    if (empty($d[$f])) jsonErr("Field '$f' is required.");
}

// Generate Case ID: EM-YYYY-XXXX
$year   = date('Y');
$prefix = "EM-$year-";
$last   = $pdo->query("SELECT case_id FROM incidents WHERE case_id LIKE '$prefix%' ORDER BY id DESC LIMIT 1")->fetchColumn();
$seq    = $last ? ((int) substr($last, -4)) + 1 : 1;
$caseId = $prefix . str_pad($seq, 4, '0', STR_PAD_LEFT);

$pdo->beginTransaction();
try {
    // Insert incident
    $stmt = $pdo->prepare(
        "INSERT INTO incidents
         (case_id, date_time_of_incident, incident_type, purok, street_address,
          severity, status, narrative, action_taken, referred_to, officer_on_duty, filed_by_user_id)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?)"
    );
    $stmt->execute([
        $caseId,
        $d['date_time_of_incident'],
        $d['incident_type'],
        $d['purok'],
        $d['street_address']   ?? null,
        $d['severity']         ?? 'medium',
        $d['status']           ?? 'pending',
        $d['narrative'],
        $d['action_taken']     ?? null,
        $d['referred_to']      ?? null,
        $d['officer_on_duty']  ?? $ses['full_name'],
        $ses['user_id'],
    ]);
    $incidentId = $pdo->lastInsertId();

    // Complainants (supports array of multiple complainants or single complainant object)
    $compStmt = $pdo->prepare("INSERT INTO parties (incident_id, party_type, full_name, age, sex, civil_status, address, contact_number) VALUES (?,?,?,?,?,?,?,?)");
    if (!empty($d['complainants']) && is_array($d['complainants'])) {
        foreach ($d['complainants'] as $c) {
            if (!empty($c['full_name'])) {
                $compStmt->execute([
                    $incidentId,
                    'complainant',
                    trim($c['full_name']),
                    !empty($c['age']) ? (int)$c['age'] : null,
                    $c['sex'] ?? null,
                    $c['civil_status'] ?? null,
                    $c['address'] ?? null,
                    $c['contact_number'] ?? null
                ]);
            }
        }
    } elseif (!empty($d['complainant']['full_name'])) {
        $c = $d['complainant'];
        $compStmt->execute([
            $incidentId,
            'complainant',
            trim($c['full_name']),
            !empty($c['age']) ? (int)$c['age'] : null,
            $c['sex'] ?? null,
            $c['civil_status'] ?? null,
            $c['address'] ?? null,
            $c['contact_number'] ?? null
        ]);
    }

    // Respondents (supports array of multiple respondents or single respondent object)
    $respStmt = $pdo->prepare("INSERT INTO parties (incident_id, party_type, full_name, age, sex, civil_status, address, contact_number) VALUES (?,?,?,?,?,?,?,?)");
    if (!empty($d['respondents']) && is_array($d['respondents'])) {
        foreach ($d['respondents'] as $r) {
            if (!empty($r['full_name'])) {
                $respStmt->execute([
                    $incidentId,
                    'respondent',
                    trim($r['full_name']),
                    !empty($r['age']) ? (int)$r['age'] : null,
                    $r['sex'] ?? null,
                    $r['civil_status'] ?? null,
                    $r['address'] ?? null,
                    $r['contact_number'] ?? null
                ]);
            }
        }
    } elseif (!empty($d['respondent']['full_name'])) {
        $r = $d['respondent'];
        $respStmt->execute([
            $incidentId,
            'respondent',
            trim($r['full_name']),
            !empty($r['age']) ? (int)$r['age'] : null,
            $r['sex'] ?? null,
            $r['civil_status'] ?? null,
            $r['address'] ?? null,
            $r['contact_number'] ?? null
        ]);
    }

    // Witnesses
    if (!empty($d['witnesses']) && is_array($d['witnesses'])) {
        $wStmt = $pdo->prepare("INSERT INTO witnesses (incident_id, full_name, address, contact_number) VALUES (?,?,?,?)");
        foreach ($d['witnesses'] as $w) {
            if (!empty($w['full_name'])) {
                $wStmt->execute([$incidentId, $w['full_name'], $w['address']??null, $w['contact_number']??null]);
            }
        }
    }

    logAudit($pdo, 'CREATE_INCIDENT', 'incidents', $incidentId, null, ['case_id' => $caseId]);
    $pdo->commit();

    jsonOk(['message' => 'Incident created.', 'case_id' => $caseId, 'id' => $incidentId], 201);

} catch (Exception $e) {
    $pdo->rollBack();
    jsonErr('Failed to create incident: ' . $e->getMessage(), 500);
}
