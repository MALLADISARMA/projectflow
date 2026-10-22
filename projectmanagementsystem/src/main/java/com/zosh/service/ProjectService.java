package com.zosh.service;

import java.util.List;

import com.zosh.modal.Chat;
import com.zosh.modal.Project;
import com.zosh.modal.User;

public interface ProjectService {
	Project createProject(Project project, User user) throws Exception;

	List<Project> getProjectByTeam(User user, String category, String tag) throws Exception;

	Project getProjectById(Long projectId) throws Exception;

	Project getProjectForMember(Long projectId, User user) throws Exception;

	Project getProjectForOwner(Long projectId, User user) throws Exception;

	void deleteProject(Long projectId, User user) throws Exception;

	Project updateProject(Project updatedProject, Long id, User user) throws Exception;
	
	void addUserToProject(Long projectId, Long userId) throws Exception;

	void removeUserFromProject(Long projectId, Long userId) throws Exception;

	Chat getChatByProjectId(Long projectId) throws Exception;
	
	List<Project> searchProjects(String keyword,User user) throws Exception;
	
	
	
	

}
