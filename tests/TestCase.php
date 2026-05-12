<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;

abstract class TestCase extends BaseTestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        if (empty(config('app.key'))) {
            // generate a temporary app key for testing
            config(['app.key' => 'base64:' . base64_encode(random_bytes(32))]);
        }
    }
}
