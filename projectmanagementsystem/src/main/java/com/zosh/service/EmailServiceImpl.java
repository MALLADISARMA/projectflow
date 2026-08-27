package com.zosh.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.MailSendException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

@Service

public class EmailServiceImpl implements EmailService {
	
	@Autowired
	private JavaMailSender javaMailSender;
	
	
	
	
	@Override
	public void sendEmailWithToken(String userEmail, String link) {
	    try {
	        MimeMessage mimeMessage = javaMailSender.createMimeMessage();
	        MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, "utf-8");

	        String subject = "Join Project Team Invitation";
	        String text = "Click the link to join the project team: " + link;

	        helper.setSubject(subject);
	        helper.setText(text, true);
	        helper.setTo(userEmail);

	        javaMailSender.send(mimeMessage);

	    } catch (MessagingException e) {
	        throw new MailSendException("Failed to construct email", e);
	    } catch (Exception e) {
	        throw new MailSendException("Failed to send mail", e);
	    }
	}
	
	
	

}
