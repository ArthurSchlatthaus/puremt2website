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
$categoryId = $data['id'] ?? null;
$name = $data['name'] ?? null;
$color = $data['color'] ?? null;
$isAdminOnly = isset($data['is_admin_only']) ? (int)$data['is_admin_only'] : null;

if (!$categoryId || !$name || !$color || is_null($isAdminOnly)) {
    send_json_response(400, "Category ID, name, color, and admin-only status are required");
}

$stmt = $conn->prepare("UPDATE categories SET name = ?, color = ?, is_admin_only = ? WHERE id = ?");
$stmt->bind_param("ssii", $name, $color, $isAdminOnly, $categoryId);

if ($stmt->execute()) {
    send_json_response(200, "Category updated successfully");
} else {
    send_json_response(500, "Failed to update category");
}
