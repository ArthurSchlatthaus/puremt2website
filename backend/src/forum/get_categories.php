<?php
require '../cors.php';
require '../db.php';
require '../functions.php';
header("Content-Type: application/json");

$decoded = require '../auth.php';
authenticate_user($decoded);

$stmt = $conn->prepare("SELECT id, name, color, is_admin_only FROM categories ORDER BY name ASC");
$stmt->execute();
$result = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);

echo json_encode(["categories" => $result]);
