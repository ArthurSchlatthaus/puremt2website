<?php
header("Content-Type: application/json");
require '../cors.php';
require '../db.php';
require '../functions.php';

$decoded = require '../auth.php';
$user_id = $_GET['user_id'] ?? null;

authenticate_user($decoded, $user_id);

$threads = fetch_threads($conn, $user_id);
echo json_encode(["threads" => $threads]);
