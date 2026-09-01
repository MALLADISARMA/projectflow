package com.zosh.service;

import com.zosh.modal.PlanType;
import com.zosh.modal.Subscription;
import com.zosh.modal.User;

public interface SubscriptionService {
	Subscription createSubscription(User user);

	Subscription getUsersSubscription(Long userId) throws Exception;

	Subscription upgradeSubscription(Long userId, PlanType planType);

	boolean isValid(Subscription subscription);
}
