<?php
require 'db.php';

function get_json_input()
{
    return json_decode(file_get_contents("php://input"), true) ?? [];
}

function send_json_response($status, $message = null, $data = [])
{
    http_response_code($status);
    echo json_encode(array_merge(["error" => $message], $data));
    exit();
}

function authenticate_user($decoded, $user_id = null)
{
    if (!$decoded || !isset($decoded['id'])) {
        send_json_response(401, "Unauthorized");
    }
    $user_id = trim((string)$user_id);
    $decoded_id = trim((string)$decoded['id']);

    if ($user_id && $decoded_id !== $user_id) {
        send_json_response(401, "User ID mismatch user_id:$user_id decoded:$decoded_id");
    }
}

function get_user_by_username($conn, $username)
{
    $stmt = $conn->prepare("SELECT id, password, is_admin, is_active FROM users WHERE username = ?");
    $stmt->bind_param("s", $username);
    $stmt->execute();
    return $stmt->get_result()->fetch_assoc();
}

function insert_user($conn, $username, $password)
{
    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
    $stmt = $conn->prepare("INSERT INTO users (username, password) VALUES (?, ?)");
    $stmt->bind_param("ss", $username, $hashedPassword);
    return $stmt->execute();
}

function fetch_threads($conn, $user_id = null)
{
    $query = "SELECT t.id, t.title, t.created_at, u.username 
          FROM forum_threads t
          JOIN users u ON t.user_id = u.id 
          WHERE u.is_active = 1";

    if ($user_id) {
        $query .= " AND t.user_id = ?";
    }

    $query .= " ORDER BY t.created_at DESC";

    $stmt = $conn->prepare($query);
    if ($user_id) {
        $stmt->bind_param("i", $user_id);
    }
    $stmt->execute();
    return $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
}

function fetch_posts_for_thread($conn, $thread_id)
{
    $stmt = $conn->prepare("SELECT p.id, p.content, p.created_at, u.username 
                            FROM forum_posts p 
                            JOIN users u ON p.user_id = u.id 
                            WHERE p.thread_id = ? AND u.is_active = 1
                            ORDER BY p.created_at");
    $stmt->bind_param("i", $thread_id);
    $stmt->execute();
    $posts = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);

    // Encode content to prevent XSS
    foreach ($posts as &$post) {
        $post['content'] = htmlspecialchars($post['content'], ENT_QUOTES, 'UTF-8');
    }

    return $posts;
}


function get_user_last_post_time($userId)
{
    global $conn;
    $stmt = $conn->prepare("SELECT last_post_time FROM users WHERE id = ?");
    $stmt->bind_param("i", $userId);
    $stmt->execute();
    $result = $stmt->get_result()->fetch_assoc();
    return $result ? (int)$result['last_post_time'] : 0;
}

function update_user_last_post_time($userId, $timestamp)
{
    global $conn;
    $stmt = $conn->prepare("UPDATE users SET last_post_time = ? WHERE id = ?");
    $stmt->bind_param("ii", $timestamp, $userId);
    $stmt->execute();
}

function logActivity($message)
{
    global $conn;
    $stmt = $conn->prepare("INSERT INTO activity_logs (message) VALUES (?)");

    if (!$stmt) {
        error_log("Failed to prepare log statement: " . $conn->error);
        return;
    }

    $stmt->bind_param("s", $message);

    if ($stmt->execute()) {
        error_log("Log entry added to database: $message");
    } else {
        error_log("Failed to insert log entry: " . $stmt->error);
    }

    $stmt->close();
}
