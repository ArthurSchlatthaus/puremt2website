<?php
require __DIR__ . '/vendor/autoload.php';

use Dotenv\Dotenv;

header('Content-Type: application/json');

try {
    $dotenv = Dotenv::createImmutable(__DIR__);
    $dotenv->load();

    $host = $_ENV['DB_HOST'] ?? 'db';
    $db   = $_ENV['DB_NAME'] ?? 'puremt2';
    $user = $_ENV['DB_USER'] ?? 'root';
    $pass = $_ENV['DB_PASS'] ?? 'root';

    mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);
    $remoteConn = new mysqli($host, $user, $pass, $db, 3306);

    if ($remoteConn->connect_error) {
        throw new Exception("Database connection failed: " . $remoteConn->connect_error);
    }
} catch (Exception $e) {
    http_response_code(500);
    die(json_encode(["error" => "Database error", "details" => $e->getMessage()]));
}
