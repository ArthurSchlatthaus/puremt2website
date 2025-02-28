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
$link = $data['link'] ?? '';

if (empty($name) || empty($link)) {
    send_json_response(400, "Name and link are required");
}

$stmt = $conn->prepare("INSERT INTO downloads (name, link) VALUES (?, ?)");
$stmt->bind_param("ss", $name, $link);

if ($stmt->execute()) {
    send_json_response(201, "Download added successfully");
} else {
    send_json_response(500, "Failed to add download");
}
