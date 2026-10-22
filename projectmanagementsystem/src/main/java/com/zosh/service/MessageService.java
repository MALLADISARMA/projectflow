package com.zosh.service;

import java.util.List;

import com.zosh.modal.Message;
import com.zosh.modal.User;

public interface MessageService {
	
	Message sendMessage(User sender, Long projectId, String content) throws Exception;

	List<Message> getMessagesByProjectId(Long projectId, User user) throws Exception;

}
