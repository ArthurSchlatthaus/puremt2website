<?php
require '../cors.php';
require '../db.php';
require '../functions.php';

$decoded = require '../auth.php';
authenticate_user($decoded);
$userId = $decoded['id'];

$lastPostTime = get_user_last_post_time($userId);
if (time() - $lastPostTime < 60) {
    send_json_response(429, "Please wait before create the thread");
}

$data = get_json_input();
$title = $data['title'] ?? '';

if (empty($title)) {
    send_json_response(400, "Title is required");
}

$stmt = $conn->prepare("INSERT INTO forum_threads (title, user_id) VALUES (?, ?)");
$stmt->bind_param("si", $title, $userId);

if ($stmt->execute()) {
    update_user_last_post_time($userId, time());
    logActivity("User $userId created a new thread: $title");
    echo json_encode(["message" => "Thread created successfully!", "thread_id" => $conn->insert_id]);
} else {
    send_json_response(500, "Failed to create thread");
}
