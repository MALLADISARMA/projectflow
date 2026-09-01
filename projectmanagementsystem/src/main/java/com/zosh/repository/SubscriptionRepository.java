package com.zosh.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.zosh.modal.Subscription;

public interface SubscriptionRepository extends JpaRepository<Subscription,Long> {
  
	
	Subscription findByUserId(Long userId);
}
