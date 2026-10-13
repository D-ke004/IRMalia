<?php
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/db.php';

requireAuth();
logAudit(getDB(), 'LOGOUT');
session_destroy();
jsonOk(['message' => 'Logged out successfully.']);
