package com.zosh.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RestController;

import com.zosh.modal.Message;
import com.zosh.modal.User;
import com.zosh.request.CreateMessageRequest;
import com.zosh.service.MessageService;
import com.zosh.service.UserService;

@RestController
@RequestMapping("/api/messages")
public class MessageController {
	@Autowired
    private MessageService messageService;

    @Autowired
    private UserService userService;

    @PostMapping("/send")
    public ResponseEntity<Message> sendMessage(@RequestBody CreateMessageRequest request,
            @RequestHeader("Authorization") String token)
            throws Exception {
        User user = userService.findUserProfileByJwt(token);
        Message sentMessage = messageService.sendMessage(user, request.getProjectId(), request.getContent());
        return ResponseEntity.ok(sentMessage);
    }
    @GetMapping("/chat/{projectId}")
    public ResponseEntity<List<Message>> getMessagesByChatId(@PathVariable Long projectId,
            @RequestHeader("Authorization") String token)
            throws Exception {
        User user = userService.findUserProfileByJwt(token);
        List<Message> messages = messageService.getMessagesByProjectId(projectId, user);
        return ResponseEntity.ok(messages);
    }
    
    

}
