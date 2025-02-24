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

if (!$downloadId) {
    send_json_response(400, "Download ID is required");
}

$stmt = $conn->prepare("DELETE FROM downloads WHERE id = ?");
$stmt->bind_param("i", $downloadId);

if ($stmt->execute()) {
    send_json_response(200, "Download deleted successfully");
} else {
    send_json_response(500, "Failed to delete download");
}
