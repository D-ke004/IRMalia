<?php
/**
 * PHP Built-in Server Router for IRMalia
 * Usage: php -S localhost:8000 router.php (from project root)
 */
$uri = $_SERVER['REQUEST_URI'];
$path = parse_url($uri, PHP_URL_PATH);

// Strip leading slash
$file = __DIR__ . $path;

// Serve static files if they exist
if (is_file($file)) {
    return false; // Let built-in server handle it
}

// Route to PHP file
if (is_file($file . '.php')) {
    require $file . '.php';
    exit;
}

// Route to directory index.php
if (is_dir($file) && is_file($file . '/index.php')) {
    require $file . '/index.php';
    exit;
}

// Try the explicit file path
if (is_file(__DIR__ . $path)) {
    require __DIR__ . $path;
    exit;
}

http_response_code(404);
echo json_encode(['error' => "Route not found: $path"]);
