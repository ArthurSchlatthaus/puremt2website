<?php
require '../cors.php';
require '../db.php';

$stmt = $conn->prepare("SELECT id, name, link FROM downloads ORDER BY name ASC");
$stmt->execute();
$result = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);

echo json_encode(["downloads" => $result]);
