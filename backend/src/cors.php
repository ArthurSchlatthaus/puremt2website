<?php
function getRedis() {
    static $redis = null;
    if ($redis === null) {
        $redis = new Redis();
        $redis->connect('redis', 6379); // Adjust host/port if needed
    }
    return $redis;
}

function logActivity(string $message): void
{
    $redis = getRedis();
    $redis->lpush("activity_logs", json_encode([
        "timestamp" => time(),
        "message" => $message,
    ]));
}

// Allowed origins for CORS
$allowed_origins = [
    "http://localhost:3000",
    "https://puremt2.de",
    "https://www.puremt2.de"
];

// Log the incoming origin
logActivity("Incoming Origin: " . ($_SERVER["HTTP_ORIGIN"] ?? 'NONE'));

// Check if the request has an Origin header
if (isset($_SERVER["HTTP_ORIGIN"])) {
    $origin = $_SERVER["HTTP_ORIGIN"];

    if (in_array($origin, $allowed_origins)) {
        header("Access-Control-Allow-Origin: " . $origin);
        header("Access-Control-Allow-Credentials: true"); // Needed for authentication cookies

        logActivity("CORS Allowed: " . $origin);
    } else {
        header("HTTP/1.1 403 Forbidden");
        logActivity("CORS Blocked: " . $origin);
        exit("CORS policy error: Origin not allowed.");
    }
} else {
    header("HTTP/1.1 403 Forbidden");
    logActivity("CORS Blocked: No Origin header present.");
    exit("CORS policy error: No Origin header.");
}

// Allowed methods
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");

// Allowed headers
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

// Handle preflight (OPTIONS) requests
if ($_SERVER["REQUEST_METHOD"] == "OPTIONS") {
    logActivity("Preflight request received.");
    http_response_code(200);
    exit();
}

logActivity("CORS processing completed.");
