<?php
header("Content-Type: application/json");
require '../cors.php';
require '../db.php';
require '../functions.php';

$decoded = require '../auth.php';
authenticate_user($decoded);
$userId = $decoded['id'];

$lastPostTime = get_user_last_post_time($userId);
if (time() - $lastPostTime < 60) {
    send_json_response(429, "Please wait before posting again");
}

$data = get_json_input();
$thread_id = $data['thread_id'] ?? null;
$content = $data['content'] ?? '';

if (!$thread_id || empty($content)) {
    send_json_response(400, "Thread ID and content are required");
}

$stmt = $conn->prepare("INSERT INTO forum_posts (thread_id, user_id, content) VALUES (?, ?, ?)");
$stmt->bind_param("iis", $thread_id, $userId, $content);

$content = substr($content, 0, 50);
if ($stmt->execute()) {
    update_user_last_post_time($userId, time());
    logActivity("User $userId created a new post: $content");
    echo json_encode(["message" => "Reply added successfully!", "post_id" => $conn->insert_id]);
} else {
    send_json_response(500, "Failed to add reply");
}
