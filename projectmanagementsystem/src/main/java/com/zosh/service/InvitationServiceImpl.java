package com.zosh.service;

import java.util.UUID;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.zosh.modal.Invitation;
import com.zosh.modal.User;
import com.zosh.repository.InvitationRepository;

@Service
public class InvitationServiceImpl implements InvitationService {

    @Autowired
    private InvitationRepository invitationRepository;

    @Autowired
    private EmailService emailService;

    @Autowired
    private ProjectService projectService;

    
    public void sendInvitation(String email, Long projectId) {

        String invitationToken = UUID.randomUUID().toString();

        Invitation invitation = new Invitation();
        invitation.setEmail(email);
        invitation.setProjectId(projectId);
        invitation.setToken(invitationToken);

        invitationRepository.save(invitation);

        String invitationLink = "http://localhost:5173/accept_invitation?token=" + invitationToken;
        emailService.sendEmailWithToken(email, invitationLink);
    }

    @Override
    @Transactional
    public Invitation acceptInvitation(String token, User user) throws Exception {

        Invitation invitation = invitationRepository.findByToken(token);

        if (invitation == null) {
            throw new IllegalArgumentException("Invalid invitation token");
        }
        if (user == null || user.getEmail() == null
                || !invitation.getEmail().equalsIgnoreCase(user.getEmail())) {
            throw new org.springframework.security.access.AccessDeniedException(
                    "Invitation was issued to a different email address");
        }

        projectService.addUserToProject(invitation.getProjectId(), user.getId());
        invitationRepository.delete(invitation);
        return invitation;
    }

   
    public String getTokenByUserMail(String userEmail) {

        Invitation invitation = invitationRepository.findByEmail(userEmail);

        if (invitation == null) {
            throw new RuntimeException("Invitation not found for email");
        }

        return invitation.getToken();
    }

    
    public void deleteToken(String token) {

        Invitation invitation = invitationRepository.findByToken(token);

        if (invitation != null) {
            invitationRepository.delete(invitation);
        }
    }
}