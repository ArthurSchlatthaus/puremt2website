<?php

require '../auth.php';
$decoded = require '../auth.php';
if (!$decoded || !isset($decoded['id'])) {
    send_json_response(401, "Unauthorized");
}

$userId = $decoded['id'];
$postId = $_GET['post_id'] ?? null;

if (!$postId) {
    send_json_response(400, "Post ID is required");
}

// Insert the report into the database
$stmt = $conn->prepare("INSERT INTO post_reports (post_id, user_id) VALUES (?, ?)");
$stmt->bind_param("ii", $postId, $userId);

if ($stmt->execute()) {
    logActivity("User $userId reported post $postId");
    echo json_encode(["message" => "Post reported successfully"]);
} else {
    send_json_response(500, "Failed to report post");
}
