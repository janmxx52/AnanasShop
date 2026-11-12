<?php

require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(\Illuminate\Contracts\Http\Kernel::class);

$response = $kernel->handle(
    $request = \Illuminate\Http\Request::create('/api/categories/giay', 'GET'),
    1
);

echo "=== CATEGORY DETAIL ===\n";
$data = json_decode($response->getContent());
echo json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
echo "\n\n";

// Show if products are included
if (isset($data->data->products)) {
    echo "✓ Products included in category detail\n";
    echo "Product count: " . count($data->data->products) . "\n";
    if (count($data->data->products) > 0) {
        echo "First product keys: " . implode(", ", array_keys((array)$data->data->products[0])) . "\n";
    }
}

echo "\n\n---\n\n";

$response = $kernel->handle(
    $request = \Illuminate\Http\Request::create('/api/brands/ananas', 'GET'),
    1
);

echo "=== BRAND DETAIL ===\n";
$data = json_decode($response->getContent());
echo json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . "\n";

// Show if products are included
if (isset($data->data->products)) {
    echo "✓ Products included in brand detail\n";
    echo "Product count: " . count($data->data->products) . "\n";
    if (count($data->data->products) > 0) {
        echo "First product keys: " . implode(", ", array_keys((array)$data->data->products[0])) . "\n";
    }
}
