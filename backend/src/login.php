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

if (empty($username) || empty($password)) {
    send_json_response(400, "Username and password are required");
}

$user = get_user_by_username($conn, $username);

if ($user && password_verify($password, $user['password'])) {
    $payload = [
        "id" => $user['id'],
        "username" => $username,
        "exp" => time() + 3600 // Token expires in 1 hour
    ];
    echo json_encode(["success" => true, "token" => JWT::encode($payload, $secret_key, 'HS256')]);
} else {
    send_json_response(401, "Invalid credentials");
}
?>
