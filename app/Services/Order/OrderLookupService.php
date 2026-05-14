<?php

namespace App\Services\Order;

use App\Models\Order;

class OrderLookupService
{
    public function lookup(array $payload): ?Order
    {
        $order = Order::query()
            ->where('code', (string) $payload['order_code'])
            ->with('items')
            ->first();

        if (!$order) {
            return null;
        }

        $email = $this->normalizeEmail($payload['email'] ?? null);
        $phone = $this->normalizePhone($payload['phone'] ?? null);

        $emailMatched = $email !== null ? $this->matchEmail($order, $email) : true;
        $phoneMatched = $phone !== null ? $this->matchPhone($order, $phone) : true;

        if (!$emailMatched || !$phoneMatched) {
            return null;
        }

        $order->setAttribute('lookup_masked_shipping_address', $this->maskShippingAddress((string) $order->shipping_address));
        $order->setAttribute('lookup_status_timeline', $this->buildStatusTimeline((string) $order->status));

        return $order;
    }

    private function matchEmail(Order $order, string $email): bool
    {
        $candidates = array_filter([
            $this->normalizeEmail($order->customer_email),
            $this->normalizeEmail($order->guest_email),
        ], static fn ($value) => $value !== null);

        return in_array($email, $candidates, true);
    }

    private function matchPhone(Order $order, string $phone): bool
    {
        $candidates = array_filter([
            $this->normalizePhone($order->customer_phone),
            $this->normalizePhone($order->guest_phone),
            $this->normalizePhone($order->shipping_phone),
        ], static fn ($value) => $value !== null);

        return in_array($phone, $candidates, true);
    }

    private function normalizeEmail(?string $email): ?string
    {
        if ($email === null) {
            return null;
        }

        $email = mb_strtolower(trim($email));

        return $email === '' ? null : $email;
    }

    private function normalizePhone(?string $phone): ?string
    {
        if ($phone === null) {
            return null;
        }

        $phone = trim($phone);

        return $phone === '' ? null : $phone;
    }

    private function maskShippingAddress(string $shippingAddress): string
    {
        $shippingAddress = trim($shippingAddress);
        if ($shippingAddress === '') {
            return '****';
        }

        return mb_substr($shippingAddress, 0, 20) . '****';
    }

    private function buildStatusTimeline(string $currentStatus): array
    {
        $timelineStatuses = match ($currentStatus) {
            'cancelled' => ['pending', 'confirmed', 'processing', 'shipping', 'cancelled'],
            'returned' => ['pending', 'confirmed', 'processing', 'shipping', 'returned'],
            default => ['pending', 'confirmed', 'processing', 'shipping', 'delivered'],
        };

        $currentIndex = array_search($currentStatus, $timelineStatuses, true);
        if ($currentIndex === false) {
            $timelineStatuses[] = $currentStatus;
            $currentIndex = count($timelineStatuses) - 1;
        }

        $timeline = [];
        foreach ($timelineStatuses as $index => $status) {
            $state = 'pending';
            if ($index < $currentIndex) {
                $state = 'reached';
            } elseif ($index === $currentIndex) {
                $state = 'current';
            }

            $timeline[] = [
                'status' => $status,
                'state' => $state,
            ];
        }

        return $timeline;
    }
}

