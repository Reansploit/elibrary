<?php
$root = __DIR__;
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$file = $root . $uri;

// If the file exists, serve it
if ($uri !== '/' && is_file($file)) {
    return false;
}

// If it's a directory index
if (is_dir($file) && is_file($file . '/index.php')) {
    require $file . '/index.php';
    return true;
}

// For page routing - serve index.php for non-file requests
$_GET['page'] = ltrim($uri, '/');
require $root . '/index.php';
