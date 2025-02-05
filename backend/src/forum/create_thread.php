<?php
require '../cors.php';
require '../db.php';
require '../functions.php';

$decoded = require '../auth.php';
authenticate_user($decoded);

$data = get_json_input();
$title = $data['title'] ?? '';

if (empty($title)) {
    send_json_response(400, "Title is required");
}

$stmt = $conn->prepare("INSERT INTO forum_threads (title, user_id) VALUES (?, ?)");
$stmt->bind_param("si", $title, $decoded['id']);

if ($stmt->execute()) {
    echo json_encode(["message" => "Thread created successfully!", "thread_id" => $conn->insert_id]);
} else {
    send_json_response(500, "Failed to create thread");
}
