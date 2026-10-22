package com.zosh.service;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.nio.charset.StandardCharsets;
import java.util.HexFormat;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import com.zosh.modal.PaymentWebhookEvent;
import com.zosh.modal.PlanType;
import com.zosh.repository.PaymentWebhookEventRepository;

@ExtendWith(MockitoExtension.class)
class PaymentWebhookServiceTests {

    private static final String SECRET = "test-webhook-secret";
    private static final String EVENT_ID = "event-123";
    private static final String PAID_EVENT = "{\"event\":\"payment_link.paid\","
            + "\"payload\":{\"payment_link\":{\"entity\":{\"reference_id\":\"42-MONTHLY\"}}}}";

    @Mock
    private PaymentWebhookEventRepository eventRepository;

    @Mock
    private SubscriptionService subscriptionService;

    private PaymentWebhookService service;

    @BeforeEach
    void setUp() {
        service = new PaymentWebhookService(SECRET, eventRepository, subscriptionService);
    }

    @Test
    void appliesPlanOnlyForSignedPaidEvent() throws Exception {
        when(eventRepository.existsById(EVENT_ID)).thenReturn(false);

        service.process(PAID_EVENT, sign(PAID_EVENT), EVENT_ID);

        verify(subscriptionService).upgradeSubscription(42L, PlanType.MONTHLY);
        verify(eventRepository).save(any(PaymentWebhookEvent.class));
    }

    @Test
    void rejectsInvalidSignatureWithoutApplyingPlan() {
        assertThrows(ResponseStatusException.class,
                () -> service.process(PAID_EVENT, "invalid-signature", EVENT_ID));

        verify(subscriptionService, never()).upgradeSubscription(any(), any());
        verify(eventRepository, never()).save(any());
    }

    @Test
    void ignoresAlreadyProcessedEvent() throws Exception {
        when(eventRepository.existsById(EVENT_ID)).thenReturn(true);

        service.process(PAID_EVENT, sign(PAID_EVENT), EVENT_ID);

        verify(subscriptionService, never()).upgradeSubscription(any(), any());
        verify(eventRepository, never()).save(any());
    }

    private String sign(String payload) throws Exception {
        Mac mac = Mac.getInstance("HmacSHA256");
        mac.init(new SecretKeySpec(SECRET.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
        return HexFormat.of().formatHex(mac.doFinal(payload.getBytes(StandardCharsets.UTF_8)));
    }
}
