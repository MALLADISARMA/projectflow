package com.zosh.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.zosh.modal.Chat;
import com.zosh.modal.Message;
import com.zosh.modal.User;
import com.zosh.repository.MessageRepository;

@Service
@Transactional(readOnly = true)
public class MessageServiceImpl implements MessageService{
	@Autowired
	private MessageRepository messageRepository;

	@Autowired
	private ProjectService projectService;
	
	@Override
	@Transactional
	public Message sendMessage(User sender, Long projectId, String content) throws Exception{
	    Chat chat = projectService.getProjectForMember(projectId, sender).getChat();
	    if (chat == null) {
	        throw new IllegalStateException("Project chat is not configured");
	    }

	    Message message = new Message();
	    message.setContent(content);
	    message.setSender(sender);
	    message.setCreatedAt(LocalDateTime.now());
	    message.setChat(chat);
	    Message savedMessage=messageRepository.save(message);

	    return savedMessage;
	}

	@Override
	public List<Message> getMessagesByProjectId(Long projectId, User user) throws Exception {
	    projectService.getProjectForMember(projectId, user);
	    Chat chat = projectService.getChatByProjectId(projectId);
	    List<Message> findByChatIdOrderByCreatedAtAsc = messageRepository.findByChatIdOrderByCreatedAtAsc(chat.getId());
	    return findByChatIdOrderByCreatedAtAsc;
	}
}
