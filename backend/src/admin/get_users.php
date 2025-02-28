<?php
header("Content-Type: application/json");
require '../cors.php';
require_once '../functions.php';
require '../db.php';

$decoded = require '../auth.php';
if (!$decoded || !isset($decoded['id']) || !isset($decoded['is_admin'])) {
    send_json_response(401, "Unauthorized");
}

$stmt = $conn->prepare("SELECT id, username, is_admin, is_active FROM users");
$stmt->execute();
$users = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);

send_json_response(200, null, ["users" => $users]);

