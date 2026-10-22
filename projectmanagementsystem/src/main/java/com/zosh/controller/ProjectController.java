package com.zosh.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.zosh.modal.Chat;
import com.zosh.modal.Invitation;
import com.zosh.modal.Project;
import com.zosh.modal.User;
import com.zosh.repository.InviteRequest;
import com.zosh.response.MessageResponse;
import com.zosh.service.InvitationService;
import com.zosh.service.ProjectService;
import com.zosh.service.UserService;

@RestController
@RequestMapping("/api/projects")
public class ProjectController {
 @Autowired
 private ProjectService projectService;
 
 @Autowired
 private UserService userService;
 
 @Autowired
 private InvitationService invitationService;
 @GetMapping
 public ResponseEntity<List<Project>> getProjects(
		 @RequestParam(required=false) String category,
		 @RequestParam(required=false) String tag,
		 @RequestHeader("Authorization") String jwt
		 )throws Exception{
	 User user=userService.findUserProfileByJwt(jwt);
	 List<Project> projects=projectService.getProjectByTeam(user, category, tag);
	 return new ResponseEntity<>(projects,HttpStatus.OK);
 }
 @GetMapping("/{projectId}")
 public ResponseEntity<Project> getProjectById(
         @PathVariable Long projectId,
         @RequestHeader("Authorization") String jwt
 ) throws Exception {
     User user = userService.findUserProfileByJwt(jwt);
     Project project = projectService.getProjectForMember(projectId, user);
     return new ResponseEntity<>(project, HttpStatus.OK);
 }
 @PostMapping
 public ResponseEntity<Project> createProject(
         @RequestHeader("Authorization") String jwt,
         @RequestBody Project project
 ) throws Exception {
     User user = userService.findUserProfileByJwt(jwt);
     Project createdproject = projectService.createProject(project, user);
     return new ResponseEntity<>(createdproject, HttpStatus.OK);
 }
 
 @PatchMapping("/{projectId}")
 public ResponseEntity<Project> updateProject(
         @PathVariable Long projectId,
         @RequestHeader("Authorization") String jwt,
         @RequestBody Project project
 ) throws Exception {
     User user = userService.findUserProfileByJwt(jwt);
     Project updatedproject = projectService.updateProject(project, projectId, user);
     return new ResponseEntity<>(updatedproject, HttpStatus.OK);
 }
 @DeleteMapping("/{projectId}")
 public ResponseEntity<MessageResponse> deleteProject(
         @PathVariable Long projectId,
         @RequestHeader("Authorization") String jwt
 ) throws Exception {
     User user = userService.findUserProfileByJwt(jwt);
     projectService.deleteProject(projectId, user);
     MessageResponse res = new MessageResponse();
     res.setMessage("Project deleted successfully");
     return new ResponseEntity<>(res, HttpStatus.OK);
 }
 @GetMapping("/search")
 public ResponseEntity<List<Project>> searchProjects(
         @RequestParam(required = false) String keyword,
         @RequestHeader("Authorization") String jwt
 ) throws Exception {
     User user = userService.findUserProfileByJwt(jwt);
     List<Project> projects = projectService.searchProjects(keyword, user);
     return new ResponseEntity<>(projects, HttpStatus.OK);
 }
 @GetMapping("/{projectId}/chat")
 public ResponseEntity<Chat> getChatByProjectId(
         @PathVariable Long projectId,
         @RequestHeader("Authorization") String jwt
 ) throws Exception {
     User user = userService.findUserProfileByJwt(jwt);
     projectService.getProjectForMember(projectId, user);
     Chat chat = projectService.getChatByProjectId(projectId);
     return new ResponseEntity<>(chat, HttpStatus.OK);
 }
 @PostMapping("/invite")
 public ResponseEntity<MessageResponse> inviteProject(
          @RequestBody InviteRequest req,
		 @RequestHeader("Authorization") String jwt
 ) throws Exception {
     User user = userService.findUserProfileByJwt(jwt);
     projectService.getProjectForOwner(req.getProjectId(), user);
     invitationService.sendInvitation(req.getEmail(),req.getProjectId());
     
     MessageResponse res=new MessageResponse();
     res.setMessage("Invitation sent");
     return new ResponseEntity<>(res,HttpStatus.OK);
 }
 
 
 

@PostMapping("/accept_invite")
public ResponseEntity<Invitation> acceptInviteProject(
        @RequestParam String token,
        @RequestHeader("Authorization") String jwt
) throws Exception {
    User user = userService.findUserProfileByJwt(jwt);
    Invitation invitation = invitationService.acceptInvitation(token, user);
    
    return new ResponseEntity<>(invitation, HttpStatus.ACCEPTED);
}
}
 
 
 
	
	
	
