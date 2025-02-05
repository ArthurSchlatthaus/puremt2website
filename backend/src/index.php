<?php
require_once 'rate_limit.php';
logActivity("API accessed");

echo json_encode(["message" => "API is running"]);

