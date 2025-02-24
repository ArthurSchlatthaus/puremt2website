<?php
require 'db.php';

function getRedis()
{
    static $redis = null;
    if (!$redis) {
        $redis = new Redis();
        $redis->connect(getenv('REDIS_HOST') ?: 'redis', 6379);
    }
    return $redis;
}

function get_json_input()
{
    return json_decode(file_get_contents("php://input"), true) ?? [];
}

function send_json_response($status, $message = null, $data = [])
{
    http_response_code($status);
    $response_key = ($status >= 400) ? "error" : "message";

    $response = [$response_key => $message];

    if (!empty($data)) {
        $response['data'] = $data;
    }

    echo json_encode($response);
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
    $redis = getRedis();
    $cacheKey = "user:$username";

    if ($redis->exists($cacheKey)) {
        return json_decode($redis->get($cacheKey), true);
    }

    $stmt = $conn->prepare("SELECT id, password, is_admin, is_active FROM users WHERE username = ?");
    $stmt->bind_param("s", $username);
    $stmt->execute();
    $user = $stmt->get_result()->fetch_assoc();

    if ($user) {
        $redis->setex($cacheKey, 300, json_encode($user)); // Cache for 5 mins
    }

    return $user;
}

function insert_user($conn, $username, $password)
{
    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
    $stmt = $conn->prepare("INSERT INTO users (username, password) VALUES (?, ?)");
    $stmt->bind_param("ss", $username, $hashedPassword);

    $result = $stmt->execute();
    if ($result) {
        $redis = getRedis();
        $cacheKey = "user:$username";
        $redis->del($cacheKey); // Remove cache after inserting new user
    }
    return $result;
}

function fetch_threads($conn, $user_id = null)
{
    $query = "SELECT t.id, t.title, t.created_at, u.username, 
                 IFNULL(GROUP_CONCAT(DISTINCT JSON_OBJECT('id', c.id, 'name', c.name, 'color', c.color) ORDER BY c.name SEPARATOR ','), '[]') AS categories
          FROM forum_threads t
          JOIN users u ON t.user_id = u.id
          LEFT JOIN thread_categories tc ON t.id = tc.thread_id
          LEFT JOIN categories c ON tc.category_id = c.id
          WHERE u.is_active = 1";

    if ($user_id) {
        $query .= " AND t.user_id = ?";
    }

    $query .= " GROUP BY t.id ORDER BY t.created_at DESC";

    $stmt = $conn->prepare($query);
    if ($user_id) {
        $stmt->bind_param("i", $user_id);
    }
    $stmt->execute();
    $result = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);

    foreach ($result as &$thread) {
        $thread['categories'] = json_decode("[" . $thread['categories'] . "]", true);
    }

    return $result;
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

    foreach ($posts as &$post) {
        $post['content'] = htmlspecialchars($post['content'], ENT_QUOTES, 'UTF-8');
    }

    return $posts;
}

function get_user_last_post_time($userId): int
{
    $redis = getRedis();
    $cacheKey = "last_post_time:$userId";

    if ($redis->exists($cacheKey)) {
        return (int)$redis->get($cacheKey);
    }

    global $conn;
    $stmt = $conn->prepare("SELECT last_post_time FROM users WHERE id = ?");
    $stmt->bind_param("i", $userId);
    $stmt->execute();
    $result = $stmt->get_result()->fetch_assoc();
    $lastPostTime = $result ? (int)$result['last_post_time'] : 0;

    $redis->setex($cacheKey, 60, $lastPostTime); // Cache for 60 seconds

    return $lastPostTime;
}

function update_user_last_post_time($userId, $timestamp): void
{
    global $conn;
    $stmt = $conn->prepare("UPDATE users SET last_post_time = ? WHERE id = ?");
    $stmt->bind_param("ii", $timestamp, $userId);
    $stmt->execute();

    $redis = getRedis();
    $cacheKey = "last_post_time:$userId";
    $redis->setex($cacheKey, 60, $timestamp); // Update cache
}

function logActivity($message): void
{
    $redis = getRedis();
    $redis->lpush("activity_logs", json_encode([
        "timestamp" => time(),
        "message" => $message,
    ]));
}

function validateRecaptcha($recaptchaToken): void
{
    $redis = getRedis();
    $cacheKey = "recaptcha:$recaptchaToken";

    if ($redis->exists($cacheKey)) {
        return;
    }

    $recaptcha_secret = $_ENV['RECAPTCHA_SECRET_KEY'];

    if (empty($recaptchaToken)) {
        send_json_response(400, "reCAPTCHA token is required");
        exit;
    }

    $recaptcha_url = "https://www.google.com/recaptcha/api/siteverify";
    $response = file_get_contents("$recaptcha_url?secret=$recaptcha_secret&response=$recaptchaToken");
    $responseKeys = json_decode($response, true);

    if (!$responseKeys || !$responseKeys["success"]) {
        send_json_response(403, "reCAPTCHA verification failed");
        exit;
    }

// Cache reCAPTCHA validation result for 60 seconds
    $redis->setex($cacheKey, 60, "valid");
}
