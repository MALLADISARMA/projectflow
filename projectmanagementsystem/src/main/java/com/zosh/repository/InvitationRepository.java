package com.zosh.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.zosh.modal.Invitation;

public interface InvitationRepository extends JpaRepository<Invitation,Long> {

	Invitation findByToken(String token);
	
	Invitation findByEmail(String userEmail );

	

	
	
	
}
