<?php

require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(\Illuminate\Contracts\Http\Kernel::class);

$response = $kernel->handle(
    $request = \Illuminate\Http\Request::create('/api/categories/giay', 'GET'),
    1
);

$d = json_decode($response->getContent());

echo "CATEGORY DETAIL CHECK:\n";
echo "Success: " . ($d->success ? "true" : "false") . "\n";
echo "Message: " . $d->message . "\n";
echo "Has products: " . (isset($d->data->products) ? "true" : "false") . "\n";
if (isset($d->data->products)) {
    echo "Product count: " . count($d->data->products) . "\n";
}
echo "\n";

$response = $kernel->handle(
    $request = \Illuminate\Http\Request::create('/api/brands/ananas', 'GET'),
    1
);

$d = json_decode($response->getContent());

echo "BRAND DETAIL CHECK:\n";
echo "Success: " . ($d->success ? "true" : "false") . "\n";
echo "Message: " . $d->message . "\n";
echo "Has products: " . (isset($d->data->products) ? "true" : "false") . "\n";
if (isset($d->data->products)) {
    echo "Product count: " . count($d->data->products) . "\n";
}
