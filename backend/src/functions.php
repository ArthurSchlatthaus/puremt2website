<?php
function get_json_input() {
    return json_decode(file_get_contents("php://input"), true) ?? [];
}

function send_json_response($status, $message = null, $data = []) {
    http_response_code($status);
    echo json_encode(array_merge(["error" => $message], $data));
    exit();
}

function authenticate_user($decoded, $user_id = null) {
    if (!$decoded || !isset($decoded['id'])) {
        send_json_response(401, "Unauthorized");
    }
    $user_id = trim((string)$user_id);
    $decoded_id = trim((string)$decoded['id']);

    if ($user_id && $decoded_id !== $user_id) {
        send_json_response(401, "User ID mismatch user_id:$user_id decoded:$decoded_id");
    }
}

function get_user_by_username($conn, $username) {
    $stmt = $conn->prepare("SELECT id, password FROM users WHERE username = ?");
    $stmt->bind_param("s", $username);
    $stmt->execute();
    return $stmt->get_result()->fetch_assoc();
}

function insert_user($conn, $username, $password) {
    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
    $stmt = $conn->prepare("INSERT INTO users (username, password) VALUES (?, ?)");
    $stmt->bind_param("ss", $username, $hashedPassword);
    return $stmt->execute();
}

function fetch_threads($conn, $user_id = null) {
    $query = "SELECT t.id, t.title, t.created_at, u.username 
              FROM forum_threads t
              JOIN users u ON t.user_id = u.id";
    if ($user_id) {
        $query .= " WHERE t.user_id = ?";
    }
    $query .= " ORDER BY t.created_at DESC";

    $stmt = $conn->prepare($query);
    if ($user_id) {
        $stmt->bind_param("i", $user_id);
    }
    $stmt->execute();
    return $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
}

function fetch_posts_for_thread($conn, $thread_id) {
    $stmt = $conn->prepare("SELECT p.id, p.content, p.created_at, u.username 
                            FROM forum_posts p 
                            JOIN users u ON p.user_id = u.id 
                            WHERE p.thread_id = ? 
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
