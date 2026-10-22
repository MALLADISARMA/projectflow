package com.zosh.service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.HexFormat;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.zosh.modal.PaymentWebhookEvent;
import com.zosh.modal.PlanType;
import com.zosh.repository.PaymentWebhookEventRepository;

@Service
public class PaymentWebhookService {

    private final String webhookSecret;
    private final PaymentWebhookEventRepository eventRepository;
    private final SubscriptionService subscriptionService;

    public PaymentWebhookService(
            @Value("${razorpay.webhook.secret}") String webhookSecret,
            PaymentWebhookEventRepository eventRepository,
            SubscriptionService subscriptionService) {
        this.webhookSecret = webhookSecret;
        this.eventRepository = eventRepository;
        this.subscriptionService = subscriptionService;
    }

    @Transactional
    public void process(String payload, String signature, String eventId) throws Exception {
        if (webhookSecret.isBlank()) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                    "Razorpay webhook secret is not configured");
        }
        if (signature == null || eventId == null || eventId.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Missing Razorpay webhook signature or event ID");
        }
        if (!isValidSignature(payload, signature)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid Razorpay webhook signature");
        }
        if (eventRepository.existsById(eventId)) {
            return;
        }

        JSONObject event = new JSONObject(payload);
        if ("payment_link.paid".equals(event.optString("event"))) {
            JSONObject paymentLink = event.getJSONObject("payload")
                    .getJSONObject("payment_link")
                    .getJSONObject("entity");
            applyPaidPlan(paymentLink.getString("reference_id"));
        }

        eventRepository.save(new PaymentWebhookEvent(eventId));
    }

    private boolean isValidSignature(String payload, String signature) throws Exception {
        Mac mac = Mac.getInstance("HmacSHA256");
        mac.init(new SecretKeySpec(webhookSecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
        String expected = HexFormat.of().formatHex(mac.doFinal(payload.getBytes(StandardCharsets.UTF_8)));
        return MessageDigest.isEqual(
                expected.getBytes(StandardCharsets.US_ASCII),
                signature.getBytes(StandardCharsets.US_ASCII));
    }

    private void applyPaidPlan(String referenceId) {
        String[] referenceParts = referenceId.split("-", 2);
        if (referenceParts.length != 2) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid payment reference");
        }

        try {
            Long userId = Long.valueOf(referenceParts[0]);
            PlanType planType = PlanType.valueOf(referenceParts[1]);
            if (planType == PlanType.FREE) {
                throw new IllegalArgumentException("Free plan is not purchasable");
            }
            subscriptionService.upgradeSubscription(userId, planType);
        } catch (IllegalArgumentException exception) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid payment plan reference", exception);
        }
    }
}
