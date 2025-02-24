<?php
$allowed_origins = [
    "http://localhost:3000",
    "https://puremt2.de",
    "https://www.puremt2.de"
];

// Check if the request has an Origin header
if (isset($_SERVER["HTTP_ORIGIN"])) {
    $origin = $_SERVER["HTTP_ORIGIN"];

    // If the origin is in the allowed list, allow it
    if (in_array($origin, $allowed_origins)) {
        header("Access-Control-Allow-Origin: " . $origin);
        header("Access-Control-Allow-Credentials: true");
    } else {
        // Block requests from unknown origins
        header("HTTP/1.1 403 Forbidden");
        exit("CORS policy error: Origin not allowed");
    }
} else {
    // Default to production if no Origin is set (e.g., direct server requests)
    header("Access-Control-Allow-Origin: https://puremt2.de");
}

// Allow required headers and methods
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

// Handle preflight requests
if ($_SERVER["REQUEST_METHOD"] == "OPTIONS") {
    http_response_code(200);
    exit();
}
