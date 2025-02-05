<?php
header("Content-Type: application/json");
require '../cors.php';
require_once '../functions.php';
require '../db.php';

$decoded = require '../auth.php';
if (!$decoded || !isset($decoded['id']) || !isset($decoded['is_admin'])) {
    send_json_response(401, "Unauthorized");
}

$result = $conn->query("SELECT * FROM activity_logs ORDER BY timestamp DESC");

$logs = [];
while ($row = $result->fetch_assoc()) {
    $logs[] = $row;
}

header('Content-Type: application/json');
echo json_encode(["logs" => $logs]);
