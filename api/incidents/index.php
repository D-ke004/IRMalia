<?php
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/db.php';

requireAuth();
$pdo = getDB();

$status  = trim($_GET['status']  ?? '');
$search  = trim($_GET['search']  ?? '');
$purok   = trim($_GET['purok']   ?? '');
$page    = max(1, (int)($_GET['page'] ?? 1));
$perPage = (int)($_GET['per_page'] ?? 50);
$offset  = ($page - 1) * $perPage;

$where  = ['1=1'];
$params = [];

if ($status && $status !== 'all') {
    if (strpos($status, ',') !== false) {
        $parts = array_filter(array_map('trim', explode(',', $status)));
        if (!empty($parts)) {
            $inPlaceholders = implode(',', array_fill(0, count($parts), '?'));
            $where[]  = "i.status IN ($inPlaceholders)";
            $params   = array_merge($params, $parts);
        }
    } else {
        $where[]  = 'i.status = ?';
        $params[] = $status;
    }
}
if ($purok) {
    $where[]  = 'i.purok = ?';
    $params[] = $purok;
}
if ($search !== '') {
    $like     = "%$search%";
    $where[]  = '(i.case_id LIKE ? OR i.incident_type LIKE ? OR i.narrative LIKE ? OR EXISTS (
        SELECT 1 FROM parties p 
        WHERE p.incident_id = i.id 
          AND p.party_type IN (\'complainant\', \'respondent\') 
          AND p.full_name LIKE ?
    ))';
    $params   = array_merge($params, [$like, $like, $like, $like]);
}

$whereStr = implode(' AND ', $where);

// Total count (counts unique incidents without duplicate rows)
$countSql = "SELECT COUNT(DISTINCT i.id) FROM incidents i WHERE $whereStr";
$countStmt = $pdo->prepare($countSql);
$countStmt->execute($params);
$total = (int) $countStmt->fetchColumn();

$sortRulesParam = $_GET['sort_rules'] ?? '';
$orderClauses = [];

if ($sortRulesParam) {
    $rules = is_array($sortRulesParam) ? $sortRulesParam : explode(',', $sortRulesParam);
    foreach ($rules as $r) {
        $parts = explode(':', trim($r));
        $col = $parts[0] ?? '';
        $dir = strtolower($parts[1] ?? 'desc') === 'asc' ? 'ASC' : 'DESC';
        if ($col === 'date') {
            $orderClauses[] = "COALESCE(i.date_time_of_incident, i.date_time_filed) $dir";
        } elseif ($col === 'severity') {
            if ($dir === 'DESC') {
                $orderClauses[] = "FIELD(i.severity, 'high', 'medium', 'low') ASC";
            } else {
                $orderClauses[] = "FIELD(i.severity, 'low', 'medium', 'high') ASC";
            }
        } elseif ($col === 'status') {
            if ($dir === 'ASC') {
                $orderClauses[] = "FIELD(i.status, 'pending', 'active', 'referred', 'resolved', 'archived') ASC";
            } else {
                $orderClauses[] = "FIELD(i.status, 'resolved', 'referred', 'active', 'pending', 'archived') ASC";
            }
        }
    }
}

if (empty($orderClauses)) {
    $sortBy  = $_GET['sort_by'] ?? 'date';
    $sortDir = strtolower($_GET['sort_dir'] ?? 'desc') === 'asc' ? 'ASC' : 'DESC';
    if ($sortBy === 'date') {
        $orderClauses[] = "COALESCE(i.date_time_of_incident, i.date_time_filed) $sortDir";
    } elseif ($sortBy === 'severity') {
        $orderClauses[] = $sortDir === 'DESC'
            ? "FIELD(i.severity, 'high', 'medium', 'low') ASC"
            : "FIELD(i.severity, 'low', 'medium', 'high') ASC";
    } elseif ($sortBy === 'status') {
        $orderClauses[] = $sortDir === 'ASC'
            ? "FIELD(i.status, 'pending', 'active', 'referred', 'resolved', 'archived') ASC"
            : "FIELD(i.status, 'resolved', 'referred', 'active', 'pending', 'archived') ASC";
    }
}

$orderClauses[] = 'i.date_time_filed DESC';
$orderClause = implode(', ', array_unique($orderClauses));

// Main query
$sql = "SELECT i.*, 
               MAX(u.full_name) AS filed_by_name,
               GROUP_CONCAT(DISTINCT c.full_name ORDER BY c.id SEPARATOR ', ') AS complainant_names,
               SUBSTRING_INDEX(GROUP_CONCAT(DISTINCT c.full_name ORDER BY c.id SEPARATOR ', '), ', ', 1) AS complainant_name,
               MAX(c.contact_number) AS complainant_contact,
               GROUP_CONCAT(DISTINCT r.full_name ORDER BY r.id SEPARATOR ', ') AS respondent_names,
               SUBSTRING_INDEX(GROUP_CONCAT(DISTINCT r.full_name ORDER BY r.id SEPARATOR ', '), ', ', 1) AS respondent_name
        FROM incidents i
        LEFT JOIN users u   ON u.id = i.filed_by_user_id
        LEFT JOIN parties c ON c.incident_id = i.id AND c.party_type = 'complainant'
        LEFT JOIN parties r ON r.incident_id = i.id AND r.party_type = 'respondent'
        WHERE $whereStr
        GROUP BY i.id
        ORDER BY $orderClause
        LIMIT $perPage OFFSET $offset";

$stmt = $pdo->prepare($sql);
$stmt->execute($params);
$rows = $stmt->fetchAll();

jsonOk([
    'data'       => $rows,
    'total'      => $total,
    'page'       => $page,
    'per_page'   => $perPage,
    'last_page'  => (int) ceil($total / $perPage),
]);
