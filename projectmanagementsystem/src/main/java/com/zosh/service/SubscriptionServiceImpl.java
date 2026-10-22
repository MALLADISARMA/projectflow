package com.zosh.service;

import java.time.LocalDate;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.zosh.modal.PlanType;
import com.zosh.modal.Subscription;
import com.zosh.modal.User;
import com.zosh.repository.SubscriptionRepository;

@Service
public class SubscriptionServiceImpl implements SubscriptionService {

	@Autowired
	private SubscriptionRepository subscriptionRepository;
	
	
	@Override
	public Subscription createSubscription(User user) {
		// TODO Auto-generated method stub
		Subscription subscription = new Subscription();

		subscription.setUser(user);
		subscription.setSubscriptionStartDate(LocalDate.now());
		subscription.setSubscriptionEndDate(LocalDate.now().plusMonths(12));
		subscription.setValid(true);
		subscription.setPlanType(PlanType.FREE);

		return subscriptionRepository.save(subscription);		
	
	}

	@Override
	public Subscription getUsersSubscription(Long userId) throws Exception {
		// TODO Auto-generated method stub
		Subscription subscription = subscriptionRepository.findByUserId(userId);
		if (subscription == null) {
			throw new IllegalStateException("Subscription not found for user " + userId);
		}
		if (!isValid(subscription)) {
		    subscription.setPlanType(PlanType.FREE);
		    subscription.setSubscriptionEndDate(LocalDate.now().plusMonths(12));
		    subscription.setSubscriptionStartDate(LocalDate.now());
		}

		return subscriptionRepository.save(subscription);
		}

	

	@Override
	public Subscription upgradeSubscription(Long userId, PlanType planType) {
		Subscription subscription = subscriptionRepository.findByUserId(userId);
		if (subscription == null) {
			throw new IllegalStateException("Subscription not found for user " + userId);
		}
		if (planType == null || planType == PlanType.FREE) {
			throw new IllegalArgumentException("A paid subscription plan is required");
		}
		subscription.setPlanType(planType);
		subscription.setSubscriptionStartDate(LocalDate.now());

		if (planType.equals(PlanType.ANNUALLY)) {
		    subscription.setSubscriptionEndDate(LocalDate.now().plusMonths(12));
		} else {
		    subscription.setSubscriptionEndDate(LocalDate.now().plusMonths(1));
		}

		return subscriptionRepository.save(subscription);
	}

	@Override
	public boolean isValid(Subscription subscription) {
		    if (subscription == null) {
		        return false;
		    }
		    if (subscription.getPlanType() == PlanType.FREE) {
		        return true;
		    }
		    LocalDate endDate = subscription.getSubscriptionEndDate();
		    if (endDate == null) {
		        return false;
		    }
		    LocalDate currentDate = LocalDate.now();

		    return endDate.isAfter(currentDate) || endDate.isEqual(currentDate);
		}
	}
