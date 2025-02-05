<?php
require 'cors.php';
require 'db.php';
require 'config.php';
require 'functions.php';

use Firebase\JWT\JWT;

$secret_key = $_ENV['SECRET_KEY'];

$data = get_json_input();
$username = $data['username'] ?? '';
$password = $data['password'] ?? '';
$recaptchaToken = $data['recaptchaToken'] ?? '';

if (empty($username) || empty($password)) {
    send_json_response(400, "Username and password are required");
}

validateRecaptcha($recaptchaToken);

$user = get_user_by_username($conn, $username);

if ($user && password_verify($password, $user['password'])) {
    if ((int)$user['is_active'] === 0) {
        send_json_response(400, "User account is not active");
    }

    $payload = [
        "id" => $user['id'],
        "username" => $username,
        "exp" => time() + 3600,
        "is_admin" => $user['is_admin'],
        "is_active" => $user['is_active'],
    ];
    echo json_encode(["success" => true, "token" => JWT::encode($payload, $secret_key, 'HS256')]);
} else {
    send_json_response(401, "Invalid credentials");
}
?>
