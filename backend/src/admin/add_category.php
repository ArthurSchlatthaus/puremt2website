<?php
require '../cors.php';
require '../db.php';
require '../functions.php';

$decoded = require '../auth.php';
authenticate_user($decoded);
if (!$decoded['is_admin']) {
    send_json_response(403, "Unauthorized");
}

$data = get_json_input();
$name = $data['name'] ?? '';
$color = $data['color'] ?? '';
$isAdminOnly = isset($data['is_admin_only']) ? (int)$data['is_admin_only'] : 0;

if (empty($name) || empty($color)) {
    send_json_response(400, "Category name and color are required");
}

$stmt = $conn->prepare("INSERT INTO categories (name, color, is_admin_only) VALUES (?, ?, ?)");
$stmt->bind_param("ssi", $name, $color, $isAdminOnly);

if ($stmt->execute()) {
    send_json_response(201, "Category added successfully");
} else {
    send_json_response(500, "Failed to add category");
}
