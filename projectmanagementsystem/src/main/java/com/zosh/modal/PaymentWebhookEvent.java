package com.zosh.modal;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "payment_webhook_event")
public class PaymentWebhookEvent {

    @Id
    private String id;

    protected PaymentWebhookEvent() {
    }

    public PaymentWebhookEvent(String id) {
        this.id = id;
    }

    public String getId() {
        return id;
    }
}
