<?php

require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(\Illuminate\Contracts\Http\Kernel::class);

$response = $kernel->handle(
    $request = \Illuminate\Http\Request::create('/api/categories', 'GET'),
    1
);

echo json_encode(json_decode($response->getContent()), JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
echo "\n\n---\n\n";

$response = $kernel->handle(
    $request = \Illuminate\Http\Request::create('/api/brands', 'GET'),
    1
);

echo json_encode(json_decode($response->getContent()), JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
