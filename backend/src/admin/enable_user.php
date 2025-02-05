<?php
header("Content-Type: application/json");
require '../cors.php';
require_once '../functions.php';
require '../db.php';

$decoded = require '../auth.php';
if (!$decoded || !isset($decoded['id']) || !isset($decoded['is_admin'])) {
    send_json_response(401, "Unauthorized");
}

// Retrieve user ID from request
$data = get_json_input();
$userId = $data['user_id'] ?? null;

if (!$userId) {
    send_json_response(400, "User ID is required");
}

// Prepare the SQL statement
$stmt = $conn->prepare("UPDATE users SET is_active = 1 WHERE id = ?");
$stmt->bind_param("i", $userId);

if ($stmt->execute()) {
    logActivity("Admin enable user ID: $userId");
    send_json_response(200, "User enabled successfully");
} else {
    send_json_response(500, "Failed to enable user");
}
?>
