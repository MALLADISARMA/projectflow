package com.zosh.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.zosh.modal.Issue;
import com.zosh.modal.User;
import com.zosh.modal.Project;
import com.zosh.repository.IssueRepository;
import com.zosh.request.IssueRequest;

@Service
@Transactional(readOnly = true)
public class IssueServiceImpl implements IssueService {

    @Autowired
    private IssueRepository issueRepository;

    @Autowired
    private ProjectService projectService;

    @Autowired
    private UserService userService;

    @Override
    public Issue getIssueById(Long issueId, User user) throws Exception {
        Optional<Issue> issue = issueRepository.findById(issueId);

        if (issue.isPresent()) {
            Issue foundIssue = issue.get();
            projectService.getProjectForMember(foundIssue.getProject().getId(), user);
            return foundIssue;
        }

        throw new Exception("No issues found with issue id " + issueId);
    }

    @Override
    public List<Issue> getIssueByProjectId(Long projectId, User user) throws Exception {
        projectService.getProjectForMember(projectId, user);
        return issueRepository.findByProject_Id(projectId);
    }

    @Override
    @Transactional
    public Issue createIssue(IssueRequest issueRequest, User user) throws Exception {

        Project project = projectService.getProjectForMember(issueRequest.getProjectId(), user);

        Issue issue = new Issue();
        issue.setTitle(issueRequest.getTitle());
        issue.setDescription(issueRequest.getDescription());
        issue.setStatus(issueRequest.getStatus());
        issue.setPriority(issueRequest.getPriority());
        issue.setDueDate(issueRequest.getDueDate());

        // FIX: set correct project relationship
        issue.setProject(project);

        // if Issue entity has user field
       
        return issueRepository.save(issue);
    }

    @Override
    @Transactional
    public void deleteIssue(Long issueId, User user) throws Exception {
        getIssueById(issueId, user);
        issueRepository.deleteById(issueId);
    }

    @Override
    @Transactional
    public Issue addUserToIssue(Long issueId, Long assigneeId, User user) throws Exception {
        Issue issue = getIssueById(issueId, user);
        User assignee = userService.findUserById(assigneeId);
        projectService.getProjectForMember(issue.getProject().getId(), assignee);

        issue.setAssignee(assignee);
        return issueRepository.save(issue);
    }

    @Override
    @Transactional
    public Issue updateStatus(Long issueId, String status, User user) throws Exception {
        Issue issue = getIssueById(issueId, user);
        issue.setStatus(status);
        return issueRepository.save(issue);
    }
}