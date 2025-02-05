<?php
require 'cors.php';
require 'vendor/autoload.php';

use Firebase\JWT\JWT;
use Firebase\JWT\Key;

$headers = getallheaders();
$token = $headers['Authorization'] ?? '';

if (!$token) {
    http_response_code(401);
    exit(json_encode(["error" => "No token provided"]));
}

$token = str_replace("Bearer ", "", $token);

try {
    $secret_key = $_ENV['SECRET_KEY'] ?? 'fallback_secret';

    if (!$secret_key) {
        throw new Exception("Secret key not set");
    }

    $decoded = JWT::decode($token, new Key($secret_key, 'HS256'));

    return (array) $decoded;

} catch (Exception $e) {
    http_response_code(401);
    exit(json_encode(["error" => "Invalid token", "details" => $e->getMessage()]));
}
