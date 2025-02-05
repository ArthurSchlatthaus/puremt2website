<?php
function applyRateLimit()
{
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        return;
    }

    $ip = $_SERVER['REMOTE_ADDR'];
    $cacheKey = "rate_limit_$ip";
    $requestCount = (int)(get_cache($cacheKey) ?? 0);

    if ($requestCount > 100) {
        http_response_code(429);
        exit(json_encode(["error" => "Too many requests"]));
    }

    set_cache($cacheKey, $requestCount + 1, 60);
}

function get_cache($key)
{
    $cacheFile = __DIR__ . '/cache/' . md5($key) . '.txt';
    if (file_exists($cacheFile) && time() - filemtime($cacheFile) < 60) {
        return trim(file_get_contents($cacheFile));
    }
    return null;
}

function set_cache($key, $value, $ttl = 60)
{
    $cacheFile = __DIR__ . '/cache/' . md5($key) . '.txt';
    file_put_contents($cacheFile, $value);
    @chmod($cacheFile, 0644);
}

applyRateLimit();
