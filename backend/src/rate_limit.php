<?php
function applyRateLimit(): void
{
    $redis = new Redis();
    $redis->connect(getenv('REDIS_HOST') ?: 'redis', getenv('REDIS_PORT') ?: 6379);

    $ip = $_SERVER['REMOTE_ADDR'];
    $cacheKey = "rate_limit_$ip";
    $requestCount = (int)($redis->get($cacheKey) ?? 0);

    if ($requestCount > 100) {
        http_response_code(429);
        exit(json_encode(["error" => "Too many requests"]));
    }

    $redis->setex($cacheKey, 60, $requestCount + 1); // Set expiration of 60 seconds
}
applyRateLimit();

// for i in {1..100}; do curl -X POST http://localhost:8080/test/rate_limit_test.php; echo ""; done
