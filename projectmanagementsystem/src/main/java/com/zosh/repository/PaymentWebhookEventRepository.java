package com.zosh.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.zosh.modal.PaymentWebhookEvent;

public interface PaymentWebhookEventRepository extends JpaRepository<PaymentWebhookEvent, String> {
}
