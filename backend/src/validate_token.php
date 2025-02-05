<?php
header("Content-Type: application/json");
require 'cors.php';
require 'db.php';
require 'functions.php';
require 'auth.php';

$headers = getallheaders();
$token = $headers['Authorization'] ?? '';

if (empty($token) || !str_starts_with($token, 'Bearer ')) {
    send_json_response(401, "Invalid token format", ["isValid" => false]);
}

$token = substr($token, 7);

try {
    $decoded = require 'auth.php';

    if (!isset($decoded['id'])) {
        send_json_response(401, "Token missing user ID", ["isValid" => false]);
    }

    $user_id = (int)$decoded['id'];
    $stmt = $conn->prepare("SELECT id FROM users WHERE id = ?");
    $stmt->bind_param("i", $user_id);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        send_json_response(401, "User does not exist", ["isValid" => false]);
    }

    send_json_response(200, null, ["isValid" => true]);

} catch (Exception $e) {
    send_json_response(401, "Token validation failed: " . $e->getMessage(), ["isValid" => false]);
}
