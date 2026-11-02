package com.zosh.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.MailAuthenticationException;
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

	@Value("${spring.mail.username:}")
	private String senderAddress;

	@Value("${spring.mail.password:}")
	private String senderPassword;

	@Override
	public void sendEmailWithToken(String userEmail, String link) {
	    if (senderAddress.isBlank()) {
	        throw new MailSendException(
	                "Invitation email is not configured. Set MAIL_USERNAME and MAIL_PASSWORD in the backend .env file.");
	    }
	    if (senderPassword.isBlank()) {
	        throw new MailSendException(
	                "Invitation email is not configured. Set MAIL_PASSWORD in the backend .env file.");
	    }
	    try {
	        MimeMessage mimeMessage = javaMailSender.createMimeMessage();
	        MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, "utf-8");

	        String subject = "Join Project Team Invitation";
	        String text = "<p>You have been invited to join a project team.</p>"
	                + "<p><a href=\"" + link + "\">Accept your project invitation</a></p>"
	                + "<p>Use this link to open the invitation: " + link + "</p>";

	        helper.setSubject(subject);
	        helper.setText(text, true);
	        helper.setTo(userEmail);
	        helper.setFrom(senderAddress.trim());

	        javaMailSender.send(mimeMessage);

	    } catch (MessagingException e) {
	        throw new MailSendException("Invitation email could not be created.", e);
	    } catch (MailAuthenticationException e) {
	        throw new MailSendException(
	                "Gmail rejected the SMTP credentials. Set MAIL_USERNAME to the Google account that generated "
	                        + "the App Password, then set MAIL_PASSWORD to that account's current 16-character "
	                        + "Google App Password. A normal Gmail password cannot be used for SMTP.",
	                e);
	    } catch (Exception e) {
	        throw new MailSendException(
	                "Invitation email could not be sent. Check the backend SMTP settings and email app password.", e);
	    }
	}
}
