<?php

$decoded = require '../auth.php';
if (!$decoded || !isset($decoded['id'])) {
    send_json_response(401, "Unauthorized");
}

$userId = $decoded['id'];
$postId = $_GET['post_id'] ?? null;

if (!$postId) {
    send_json_response(400, "Post ID is required");
}

// Check if the user is an admin
$stmt = $conn->prepare("SELECT is_admin FROM users WHERE id = ?");
$stmt->bind_param("i", $userId);
$stmt->execute();
$result = $stmt->get_result()->fetch_assoc();

if (!$result || !$result['is_admin']) {
    send_json_response(403, "Forbidden");
}

// Delete the post
$stmt = $conn->prepare("DELETE FROM forum_posts WHERE id = ?");
$stmt->bind_param("i", $postId);

if ($stmt->execute()) {
    logActivity("Admin $userId deleted post $postId");
    echo json_encode(["message" => "Post deleted successfully"]);
} else {
    send_json_response(500, "Failed to delete post");
}
