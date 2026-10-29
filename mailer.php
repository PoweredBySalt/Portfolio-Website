<?php

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require __DIR__ . '/PHPMailer/src/Exception.php';
require __DIR__ . '/PHPMailer/src/PHPMailer.php';
require __DIR__ . '/PHPMailer/src/SMTP.php';

const CONTACT_ADDRESS = "contact@marwin-ritschel.de";

// Spam protection
const MIN_FILL_SECONDS = 3; // a form sent faster than this is from a bot
const RATE_LIMIT_COUNT = 5; // messages per IP address ...
const RATE_LIMIT_WINDOW = 3600; // ... within this many seconds

// Field name => maximum length. Keep in sync with maxlength in index.php.
const FIELDS = [
    "name" => 100,
    "nachname" => 100,
    "firma" => 100,
    "email" => 254,
    "betreff" => 200,
    "nachricht" => 5000,
];
const OPTIONAL_FIELDS = ["firma"];

const SMTP_TIMEOUT = 20; // seconds; PHPMailer's default of 300 would hang the request

/*
 * Ends the request with a status from includes/contact_messages.php or
 * "gesendet". contact.js asks for JSON; a plain form post is redirected to
 * /sent, or back to the form with ?formular=<status>.
 */
function finish($status, $http_code = 200)
{
    $wants_json = strpos($_SERVER["HTTP_ACCEPT"] ?? "", "application/json") !== false;

    if ($wants_json) {
        $messages = require __DIR__ . "/includes/contact_messages.php";
        http_response_code($http_code);
        header("Content-Type: application/json; charset=utf-8");
        echo json_encode([
            "status" => $status,
            "message" => $messages[$status] ?? "",
        ]);
    } elseif ($status === "gesendet") {
        header("Location: /sent", true, 303);
    } else {
        header("Location: /kontakt?formular=" . $status, true, 303);
    }
    exit;
}

// Allows RATE_LIMIT_COUNT messages per IP address and window. The address is
// only stored as a keyed hash ($secret stays in config.php, so it can't be
// brute-forced), in the server's temp folder. Files older than the window are
// deleted. If the folder cannot be written, nobody is blocked.
function is_rate_limited($ip, $secret)
{
    $now = time();
    $folder = sys_get_temp_dir();

    foreach (glob($folder . "/kontakt_*.json") ?: [] as $old_file) {
        if ($now - (int) @filemtime($old_file) > RATE_LIMIT_WINDOW) {
            @unlink($old_file);
        }
    }

    $file = $folder . "/kontakt_" . hash_hmac("sha256", $ip, $secret) . ".json";

    $times = is_file($file) ? json_decode((string) @file_get_contents($file), true) : [];
    $times = array_filter(
        is_array($times) ? $times : [],
        fn($time) => is_int($time) && $now - $time < RATE_LIMIT_WINDOW
    );

    if (count($times) >= RATE_LIMIT_COUNT) {
        return true;
    }

    $times[] = $now;
    @file_put_contents($file, json_encode(array_values($times)), LOCK_EX);
    return false;
}

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    header("Location: /kontakt");
    exit;
}

// Honeypot: the "website" field is hidden from people, only bots fill it in.
// Pretend success so they don't retry.
if (($_POST["website"] ?? "") !== "") {
    finish("gesendet");
}

// Zugangsdaten liegen außerhalb des Web-Roots
$config_file = __DIR__ . '/../config.php';
if (!is_file($config_file)) {
    error_log("Kontaktformular: config.php fehlt");
    finish("fehler", 500);
}
$config = require $config_file;
if (!is_array($config) || !is_string($config["smtp_password"] ?? null) || $config["smtp_password"] === "") {
    error_log("Kontaktformular: smtp_password fehlt in config.php");
    finish("fehler", 500);
}

// form_time is signed by index.php, so a bot can't fake an old timestamp
$form_time = filter_var($_POST["form_time"] ?? "", FILTER_VALIDATE_INT);
$form_sig = $_POST["form_sig"] ?? "";
if (
    $form_time === false ||
    $form_time > time() ||
    !is_string($form_sig) ||
    !hash_equals(hash_hmac("sha256", "form_time|" . $form_time, $config["smtp_password"]), $form_sig)
) {
    finish("eingabe", 422);
}
if (time() - $form_time < MIN_FILL_SECONDS) {
    finish("zu_schnell", 422);
}

$values = [];
foreach (FIELDS as $field => $max_length) {
    $value = $_POST[$field] ?? "";
    if (!is_string($value)) {
        finish("eingabe", 422);
    }
    $value = trim($value);
    $is_missing = $value === "" && !in_array($field, OPTIONAL_FIELDS, true);
    if ($is_missing || mb_strlen($value) > $max_length) {
        finish("eingabe", 422);
    }
    $values[$field] = $value;
}

if (!filter_var($values["email"], FILTER_VALIDATE_EMAIL) || ($_POST["dse"] ?? "") !== "1") {
    finish("eingabe", 422);
}

if (is_rate_limited($_SERVER["REMOTE_ADDR"] ?? "", $config["smtp_password"])) {
    finish("zu_viele", 429);
}

$mail = new PHPMailer(true);

try {
    $mail->isSMTP();
    $mail->SMTPAuth = true;

    $mail->Host = "smtp.strato.com";
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
    $mail->Port = 465;
    $mail->Timeout = SMTP_TIMEOUT;
    $mail->CharSet = PHPMailer::CHARSET_UTF8;

    $mail->Username = CONTACT_ADDRESS;
    $mail->Password = $config["smtp_password"];

    $full_name = $values["name"] . " " . $values["nachname"];
    $mail->setFrom(CONTACT_ADDRESS, "Kontaktaufnahme von: " . $full_name);
    $mail->addAddress(CONTACT_ADDRESS, "Contact");
    $mail->addReplyTo($values["email"], $full_name);

    $mail->Subject = $values["betreff"];

    $mail->Body = "Name:  " . $values["name"] .
        "\n" .
        "Nachname:  " . $values["nachname"] .
        "\n" .
        "Firma:  " . $values["firma"] .
        "\n" .
        "Email:  " . $values["email"] .
        "\n" .
        "\n" .
        "\n" .
        "Betreff:  " . $values["betreff"] .
        "\n" .
        "\n" . "Nachricht:" .
        "\n" .
        "\n" .
        $values["nachricht"];

    $mail->send();
} catch (Exception $e) {
    error_log("Kontaktformular: " . $mail->ErrorInfo);
    finish("fehler", 500);
}

finish("gesendet");
