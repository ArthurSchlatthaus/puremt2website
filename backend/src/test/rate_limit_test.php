<?php
require __DIR__ . '/../rate_limit.php';

header("Content-Type: application/json");

applyRateLimit();
echo json_encode(["success" => true, "message" => "Request allowed"]);
