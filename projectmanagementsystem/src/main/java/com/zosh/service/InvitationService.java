package com.zosh.service;

import com.zosh.modal.Invitation;
import com.zosh.modal.User;

public interface InvitationService {
	
	public void sendInvitation (String email, Long projectId);

	public Invitation acceptInvitation(String token, User user) throws Exception;

	public String getTokenByUserMail(String userEmail);

	void deleteToken(String token);

}
