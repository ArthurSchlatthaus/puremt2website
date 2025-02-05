<?php
require '../cors.php';
require '../db.php';
require '../functions.php';

$decoded = require '../auth.php';
authenticate_user($decoded);

$thread_id = $_GET['thread_id'] ?? null;

if (!$thread_id) {
    send_json_response(400, "Thread ID is required");
}

// Fetch thread details
$threadQuery = $conn->prepare("SELECT t.id, t.title, t.created_at, u.username 
                               FROM forum_threads t 
                               JOIN users u ON t.user_id = u.id 
                               WHERE t.id = ?");
$threadQuery->bind_param("i", $thread_id);
$threadQuery->execute();
$thread = $threadQuery->get_result()->fetch_assoc();

if (!$thread) {
    send_json_response(404, "Thread not found");
}

// Fetch replies
$posts = fetch_posts_for_thread($conn, $thread_id);

echo json_encode(["thread" => $thread, "posts" => $posts]);
