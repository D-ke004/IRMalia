<?php
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/db.php';

requireAuth();
if ($_SERVER['REQUEST_METHOD'] !== 'PUT') jsonErr('Method not allowed.', 405);

$d   = body();
$id  = (int)($d['id'] ?? 0);
$pdo = getDB();

if (!$id) jsonErr('Missing incident ID.');

$old = $pdo->prepare("SELECT * FROM incidents WHERE id = ?")->execute([$id]) ? null : null;
$oldStmt = $pdo->prepare("SELECT * FROM incidents WHERE id = ?");
$oldStmt->execute([$id]);
$old = $oldStmt->fetch();
if (!$old) jsonErr('Incident not found.', 404);

// Only admin or filing officer can edit
$ses = $_SESSION;
if ($ses['role'] !== 'admin' && $old['filed_by_user_id'] != $ses['user_id']) {
    jsonErr('You can only edit your own incidents.', 403);
}

$pdo->beginTransaction();
try {
    $pdo->prepare(
        "UPDATE incidents SET
         date_time_of_incident=?, incident_type=?, purok=?, street_address=?,
         severity=?, status=?, narrative=?, action_taken=?, referred_to=?, officer_on_duty=?
         WHERE id=?"
    )->execute([
        $d['date_time_of_incident'] ?? $old['date_time_of_incident'],
        $d['incident_type']         ?? $old['incident_type'],
        $d['purok']                 ?? $old['purok'],
        $d['street_address']        ?? $old['street_address'],
        $d['severity']              ?? $old['severity'],
        $d['status']                ?? $old['status'],
        $d['narrative']             ?? $old['narrative'],
        $d['action_taken']          ?? $old['action_taken'],
        $d['referred_to']           ?? $old['referred_to'],
        $d['officer_on_duty']       ?? $old['officer_on_duty'],
        $id
    ]);

    // Re-sync parties
    $pdo->prepare("DELETE FROM parties WHERE incident_id = ?")->execute([$id]);
    // Re-sync complainants (supports array of multiple complainants or single complainant object)
    $compStmt = $pdo->prepare("INSERT INTO parties (incident_id, party_type, full_name, age, sex, civil_status, address, contact_number) VALUES (?,?,?,?,?,?,?,?)");
    if (!empty($d['complainants']) && is_array($d['complainants'])) {
        foreach ($d['complainants'] as $c) {
            if (!empty($c['full_name'])) {
                $compStmt->execute([
                    $id,
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
            $id,
            'complainant',
            trim($c['full_name']),
            !empty($c['age']) ? (int)$c['age'] : null,
            $c['sex'] ?? null,
            $c['civil_status'] ?? null,
            $c['address'] ?? null,
            $c['contact_number'] ?? null
        ]);
    }
    // Re-sync respondents (supports array of multiple respondents or single respondent object)
    $respStmt = $pdo->prepare("INSERT INTO parties (incident_id, party_type, full_name, age, sex, civil_status, address, contact_number) VALUES (?,?,?,?,?,?,?,?)");
    if (!empty($d['respondents']) && is_array($d['respondents'])) {
        foreach ($d['respondents'] as $r) {
            if (!empty($r['full_name'])) {
                $respStmt->execute([
                    $id,
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
            $id,
            'respondent',
            trim($r['full_name']),
            !empty($r['age']) ? (int)$r['age'] : null,
            $r['sex'] ?? null,
            $r['civil_status'] ?? null,
            $r['address'] ?? null,
            $r['contact_number'] ?? null
        ]);
    }

    // Re-sync witnesses
    $pdo->prepare("DELETE FROM witnesses WHERE incident_id = ?")->execute([$id]);
    if (!empty($d['witnesses']) && is_array($d['witnesses'])) {
        $wStmt = $pdo->prepare("INSERT INTO witnesses (incident_id, full_name, address, contact_number) VALUES (?,?,?,?)");
        foreach ($d['witnesses'] as $w) {
            if (!empty($w['full_name'])) {
                $wStmt->execute([$id, $w['full_name'], $w['address']??null, $w['contact_number']??null]);
            }
        }
    }

    logAudit($pdo, 'UPDATE_INCIDENT', 'incidents', $id, $old, $d);
    $pdo->commit();
    jsonOk(['message' => 'Incident updated successfully.']);

} catch (Exception $e) {
    $pdo->rollBack();
    jsonErr('Update failed: ' . $e->getMessage(), 500);
}
