<?php
/*
 * Shared document start and <head> for every page.
 * Set before including:
 *   $page_title        (required)
 *   $page_path         URL path of the page, e.g. "/impressum" (canonical link)
 *   $page_description  meta and Open Graph description
 *   $page_keywords     meta keywords
 *   $page_robots       e.g. "noindex" for pages search engines should skip
 *   $page_styles       extra stylesheets
 *   $page_scripts      extra scripts, run after site.js (all scripts use defer)
 *   $page_fonts        extra fonts to preload
 */
const SITE_URL = "https://marwin-ritschel.de";
const SHARE_IMAGE = [
    "path" => "/images/auch_ich.webp",
    "type" => "image/webp",
    "width" => 1174,
    "height" => 1271,
];

$page_path = $page_path ?? null;
$page_description = $page_description ?? null;
$page_keywords = $page_keywords ?? null;
$page_robots = $page_robots ?? null;
$page_styles = $page_styles ?? [];
$page_scripts = $page_scripts ?? [];
$page_fonts = array_merge(
    ["/fonts/inter-v19-latin-500.woff2", "/fonts/inter-v19-latin-900.woff2"],
    $page_fonts ?? []
);
$page_url = $page_path !== null ? SITE_URL . $page_path : null;

function e($value)
{
    return htmlspecialchars($value, ENT_QUOTES, "UTF-8");
}

// Adds ?v=<modification time>, so a changed file gets a new URL and the long
// cache times in .htaccess never serve an old version.
function asset($path)
{
    $file = __DIR__ . "/.." . $path;
    return is_file($file) ? $path . "?v=" . filemtime($file) : $path;
}
?>
<!doctype html>
<html lang="de">
  <head>
    <meta charset="utf-8" />
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1, minimum-scale=1"
    />
    <title><?= e($page_title) ?></title>
<?php if ($page_description): ?>
    <meta name="description" content="<?= e($page_description) ?>" />
<?php endif; ?>
<?php if ($page_keywords): ?>
    <meta name="keywords" content="<?= e($page_keywords) ?>" />
<?php endif; ?>
<?php if ($page_robots): ?>
    <meta name="robots" content="<?= e($page_robots) ?>" />
<?php endif; ?>
    <meta name="author" content="Marwin Ritschel" />
<?php if ($page_url): ?>
    <link rel="canonical" href="<?= e($page_url) ?>" />
<?php endif; ?>
    <!-- Link previews -->
    <meta property="og:type" content="website" />
    <meta property="og:locale" content="de_DE" />
    <meta property="og:site_name" content="Marwin Ritschel" />
    <meta property="og:title" content="<?= e($page_title) ?>" />
<?php if ($page_description): ?>
    <meta property="og:description" content="<?= e($page_description) ?>" />
<?php endif; ?>
<?php if ($page_url): ?>
    <meta property="og:url" content="<?= e($page_url) ?>" />
<?php endif; ?>
    <meta property="og:image" content="<?= e(SITE_URL . SHARE_IMAGE["path"]) ?>" />
    <meta property="og:image:type" content="<?= e(SHARE_IMAGE["type"]) ?>" />
    <meta property="og:image:width" content="<?= SHARE_IMAGE["width"] ?>" />
    <meta property="og:image:height" content="<?= SHARE_IMAGE["height"] ?>" />
    <meta property="og:image:alt" content="Porträt von Marwin Ritschel" />
    <meta name="twitter:card" content="summary" />
    <!-- Icons -->
    <link rel="icon" href="/images/favicon-32.png" sizes="32x32" type="image/png" />
    <link rel="icon" href="/images/logo.svg" type="image/svg+xml" />
    <link rel="apple-touch-icon" href="/images/apple-touch-icon.png" />
    <!-- Fonts -->
<?php foreach ($page_fonts as $font): ?>
    <link rel="preload" href="<?= e($font) ?>" as="font" type="font/woff2" crossorigin />
<?php endforeach; ?>
    <!-- CSS -->
    <link rel="stylesheet" href="<?= e(asset("/css/normalize.css")) ?>" />
    <link rel="stylesheet" href="<?= e(asset("/css/fonts.css")) ?>" />
    <link rel="stylesheet" href="<?= e(asset("/css/style.css")) ?>" />
<?php foreach ($page_styles as $style): ?>
    <link rel="stylesheet" href="<?= e(asset($style)) ?>" />
<?php endforeach; ?>
    <!-- javascript -->
    <script defer src="<?= e(asset("/javascript/librarys/gsap.min.js")) ?>"></script>
    <script defer src="<?= e(asset("/javascript/site.js")) ?>"></script>
<?php foreach ($page_scripts as $script): ?>
    <script defer src="<?= e(asset($script)) ?>"></script>
<?php endforeach; ?>
  </head>
