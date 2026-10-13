<?php
require_once __DIR__ . '/../config/cors.php';

if (empty($_SESSION['user_id'])) jsonErr('Not authenticated.', 401);

jsonOk([
    'id'        => $_SESSION['user_id'],
    'username'  => $_SESSION['username'],
    'full_name' => $_SESSION['full_name'],
    'role'      => $_SESSION['role'],
]);
