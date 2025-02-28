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
$downloadId = $data['id'] ?? null;
$name = $data['name'] ?? '';
$link = $data['link'] ?? '';

if (!$downloadId || empty($name) || empty($link)) {
    send_json_response(400, "Download ID, name, and link are required");
}

$stmt = $conn->prepare("UPDATE downloads SET name = ?, link = ? WHERE id = ?");
$stmt->bind_param("ssi", $name, $link, $downloadId);

if ($stmt->execute()) {
    send_json_response(200, "Download updated successfully");
} else {
    send_json_response(500, "Failed to update download");
}
