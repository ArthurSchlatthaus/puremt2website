<?php
require 'cors.php';
require 'db.php';
require 'functions.php';
require 'config.php';

use Firebase\JWT\JWT;

$secret_key = $_ENV['SECRET_KEY'];
$recaptcha_secret = $_ENV['RECAPTCHA_SECRET_KEY'];
$data = get_json_input();
$username = $data['username'] ?? '';
$password = $data['password'] ?? '';
$recaptchaToken = $data['recaptchaToken'] ?? '';

if (empty($username) || empty($password)) {
    send_json_response(400, "Username and password are required");
}

if (get_user_by_username($conn, $username)) {
    send_json_response(400, "Username is already taken");
}

validateRecaptcha($recaptchaToken);

if (insert_user($conn, $username, $password)) {
    $payload = [
        "id" => $conn->insert_id,
        "username" => $username,
        "exp" => time() + 3600,
    ];
    $jwt = JWT::encode($payload, $secret_key, 'HS256');

    echo json_encode(["message" => "Registration successful!", "token" => $jwt]);
} else {
    send_json_response(500, "Failed to register user");
}

