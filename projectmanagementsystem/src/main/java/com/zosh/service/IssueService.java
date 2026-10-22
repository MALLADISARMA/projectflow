package com.zosh.service;

import java.util.*;

import com.zosh.modal.Issue;
import com.zosh.modal.User;
import com.zosh.request.IssueRequest;

public interface IssueService {
	Issue getIssueById(Long issueId, User user) throws Exception;

	List<Issue> getIssueByProjectId(Long projectId, User user) throws Exception;

	Issue createIssue(IssueRequest issueRequest, User user) throws Exception;

	void deleteIssue(Long issueId, User user) throws Exception;

	Issue addUserToIssue(Long issueId, Long assigneeId, User user) throws Exception;

	Issue updateStatus(Long issueId, String status, User user) throws Exception;
}
