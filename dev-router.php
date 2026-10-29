<?php
/*
 * Local development only:  php -S localhost:8000 dev-router.php
 * PHP's built-in server ignores .htaccess, so this mimics its rewrites:
 * /impressum serves impressum.php, /impressum.html redirects to /impressum,
 * /kontakt (and the other section URLs) serve index.php.
 */
if (PHP_SAPI !== "cli-server") {
    http_response_code(404);
    exit;
}

$path = rawurldecode(parse_url($_SERVER["REQUEST_URI"], PHP_URL_PATH));
$file = __DIR__ . $path;

if (preg_match('#^/index(\.php|\.html)?$#', $path)) {
    header("Location: /", true, 301);
    exit;
}

if (preg_match('#^(.+)\.html$#', $path, $match) && !is_file($file)) {
    header("Location: " . $match[1], true, 301);
    exit;
}

// Section URLs of the start page (keep in sync with .htaccess)
if (preg_match('#^/(ueber-mich|projekte|kontakt)/?$#', $path)) {
    require __DIR__ . "/index.php";
    return true;
}

if (is_file($file . ".php")) {
    require $file . ".php";
    return true;
}

// Existing files and "/" (index.php) are served by the built-in server.
if ($path === "/" || is_file($file)) {
    return false;
}

// Like Apache: anything else does not exist. (The built-in server would
// otherwise answer with index.php.)
http_response_code(404);
echo "404 Not Found";
return true;
