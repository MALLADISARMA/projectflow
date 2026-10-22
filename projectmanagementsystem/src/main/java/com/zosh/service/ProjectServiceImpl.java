package com.zosh.service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.zosh.modal.Chat;
import com.zosh.modal.Project;
import com.zosh.modal.User;
import com.zosh.repository.ProjectRepository;


@Service
@Transactional(readOnly = true)
public class ProjectServiceImpl implements ProjectService{

	@Autowired
	private ProjectRepository projectRepository;
	
	@Autowired
	private UserService userService;
	
	@Autowired
	private ChatService chatService;
	
	
	
	@Override
	@Transactional
	public Project createProject(Project project, User user) throws Exception {
		// TODO Auto-generated method stub
		Project createdProject = new Project();

		createdProject.setOwner(user);
		createdProject.setTags(project.getTags());
		createdProject.setName(project.getName());
		createdProject.setCategory(project.getCategory());
		createdProject.setDescription(project.getDescription());
		createdProject.getTeam().add(user);
		
		Project savedProject = projectRepository.save(createdProject);

		Chat chat = new Chat();
		chat.setProject(savedProject);
		chat.getUsers().add(user);
		
		Chat projectChat = chatService.createChat(chat);
		savedProject.setChat(projectChat);

		return savedProject;
			
		
	}

	@Override
	public List<Project> getProjectByTeam(User user, String category, String tag) throws Exception {
		// TODO Auto-generated method stub
		
		List<Project> projects = projectRepository.findByTeamContainingOrOwner(user, user);
		
		if(category!=null) {
			projects=projects.stream().filter(project->category.equals(project.getCategory())).collect(Collectors.toList());
		}
		if(tag!=null) {
			projects=projects.stream()
					.filter(project -> project.getTags() != null && project.getTags().contains(tag))
					.collect(Collectors.toList());
		}
		 
		
		
		return projects;
	}

	@Override
	public Project getProjectById(Long projectId) throws Exception {
		// TODO Auto-generated method stub
		Optional<Project> optionalProject = projectRepository.findById(projectId);
		if (optionalProject.isEmpty()) {
		    throw new Exception("project not found");
		}
		return optionalProject.get();
	}

	@Override
	public Project getProjectForMember(Long projectId, User user) throws Exception {
	Project project = getProjectById(projectId);
	if (!isMember(project, user)) {
		throw new AccessDeniedException("You are not a member of this project");
	}
	return project;
	}

	@Override
	public Project getProjectForOwner(Long projectId, User user) throws Exception {
	Project project = getProjectById(projectId);
	if (user == null || project.getOwner() == null
			|| !project.getOwner().getId().equals(user.getId())) {
		throw new AccessDeniedException("Only the project owner can perform this action");
	}
	return project;
	}

	private boolean isMember(Project project, User user) {
	return user != null && (project.getOwner() != null
			&& project.getOwner().getId().equals(user.getId())
			|| project.getTeam().stream().anyMatch(member -> member.getId().equals(user.getId())));
	}

	@Override
	@Transactional
	public void deleteProject(Long projectId, User user) throws Exception {
	getProjectForOwner(projectId, user);
	projectRepository.deleteById(projectId);
		
	}

	@Override
	@Transactional
	public Project updateProject(Project updatedProject, Long id, User user) throws Exception {
		Project project = getProjectForOwner(id, user);

		if (updatedProject.getName() != null) {
			project.setName(updatedProject.getName());
		}
		if (updatedProject.getDescription() != null) {
			project.setDescription(updatedProject.getDescription());
		}
		if (updatedProject.getCategory() != null) {
			project.setCategory(updatedProject.getCategory());
		}
		if (updatedProject.getTags() != null) {
			project.setTags(updatedProject.getTags());
		}

		return projectRepository.save(project);
		
	}

	@Override
	@Transactional
	public void addUserToProject(Long projectId, Long userId) throws Exception {
		// TODO Auto-generated method stub
		Project project = getProjectById(projectId);
		User user = userService.findUserById(userId);
		if (!project.getTeam().contains(user)) {
		    if (project.getChat() != null) {
		        project.getChat().getUsers().add(user);
		    }
		    project.getTeam().add(user);
		}
		projectRepository.save(project);
		
	}

	@Override
	@Transactional
	public void removeUserFromProject(Long projectId, Long userId) throws Exception {
		// TODO Auto-generated method stub
		Project project = getProjectById(projectId);
		User user = userService.findUserById(userId);

		if (project.getTeam().contains(user)) {
		    if (project.getChat() != null) {
		        project.getChat().getUsers().remove(user);
		    }
		    project.getTeam().remove(user);
		}

		projectRepository.save(project);
		
	}

	@Override
	public Chat getChatByProjectId(Long projectId) throws Exception {
		Project project=getProjectById(projectId);
		
		return project.getChat();
	}
	public List<Project> searchProjects(String keyword,User user) throws Exception{
		

		return projectRepository.findByNameContainingAndTeamContains(keyword, user);
		
		
	}

	
  
}
