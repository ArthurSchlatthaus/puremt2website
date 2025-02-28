<?php
require '../auth.php';
$decoded = require '../auth.php';
if (!$decoded || !isset($decoded['id'])) {
    send_json_response(401, "Unauthorized");
}

$userId = $decoded['id'];
$threadId = $_GET['thread_id'] ?? null;

if (!$threadId) {
    send_json_response(400, "Thread ID is required");
}

// Check if the user is an admin
$stmt = $conn->prepare("SELECT is_admin FROM users WHERE id = ?");
$stmt->bind_param("i", $userId);
$stmt->execute();
$result = $stmt->get_result()->fetch_assoc();

if (!$result || !$result['is_admin']) {
    send_json_response(403, "Forbidden");
}

// Close the thread
$stmt = $conn->prepare("UPDATE forum_threads SET is_closed = 1 WHERE id = ?");
$stmt->bind_param("i", $threadId);

if ($stmt->execute()) {
    logActivity("Admin $userId closed thread $threadId");
    echo json_encode(["message" => "Thread closed successfully"]);
} else {
    send_json_response(500, "Failed to close thread");
}
