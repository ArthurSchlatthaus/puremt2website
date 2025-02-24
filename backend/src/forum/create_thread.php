<?php
require '../cors.php';
require '../db.php';
require '../functions.php';

$decoded = require '../auth.php';
authenticate_user($decoded);
$userId = $decoded['id'];
$is_admin = $decoded['is_admin'] ?? 0;

$data = get_json_input();
$title = $data['title'] ?? '';
$categoryIds = $data['categories'] ?? [];

if (empty($title)) {
    send_json_response(400, "Title is required");
}

$conn->begin_transaction();

try {
    $stmt = $conn->prepare("INSERT INTO forum_threads (title, user_id) VALUES (?, ?)");
    $stmt->bind_param("si", $title, $userId);
    $stmt->execute();
    $threadId = $stmt->insert_id;

    if (!empty($categoryIds)) {
        $validCategories = [];

        foreach ($categoryIds as $categoryId) {
            $stmt = $conn->prepare("SELECT is_admin_only FROM categories WHERE id = ?");
            $stmt->bind_param("i", $categoryId);
            $stmt->execute();
            $category = $stmt->get_result()->fetch_assoc();

            if ($category) {
                if ($category['is_admin_only'] == 1 && !$is_admin) {
                    continue; // Skip this category if the user is not an admin
                }
                $validCategories[] = $categoryId;
            }
        }

        if (!empty($validCategories)) {
            $stmt = $conn->prepare("INSERT INTO thread_categories (thread_id, category_id) VALUES (?, ?)");
            foreach ($validCategories as $categoryId) {
                $stmt->bind_param("ii", $threadId, $categoryId);
                $stmt->execute();
            }
        }
    }

    update_user_last_post_time($userId, time());
    logActivity("User $userId created a new thread: $title");
    $conn->commit();

    send_json_response(201, "Thread created successfully!", ["thread_id" => $threadId]);
} catch (Exception $e) {
    $conn->rollback();
    send_json_response(500, "Failed to create thread", ["error" => $e->getMessage()]);
}
