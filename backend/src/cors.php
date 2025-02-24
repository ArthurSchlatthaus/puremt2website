<?php

$allowed_origins = [
    "https://puremt2.de",
    "https://www.puremt2.de",
    "https://puremt2.de"
];

if (isset($_SERVER['HTTP_ORIGIN'])) {
    $origin = $_SERVER['HTTP_ORIGIN'];

    if (in_array($origin, $allowed_origins)) {
        header("Access-Control-Allow-Origin: " . $origin);
        header("Access-Control-Allow-Credentials: true");
    } else {
        header("HTTP/1.1 403 Forbidden");
        exit("CORS policy error: Origin not allowed.");
    }
} else {
    header("HTTP/1.1 403 Forbidden");
    exit("CORS policy error: No Origin header.");
}

header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}
