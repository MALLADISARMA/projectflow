package com.zosh.service;

import java.util.*;

import com.zosh.modal.Issue;
import com.zosh.modal.User;
import com.zosh.request.IssueRequest;

public interface IssueService {
	Issue getIssueById(Long issueId) throws Exception;

	List<Issue> getIssueByProjectId(Long projectId) throws Exception;

	Issue createIssue(IssueRequest issueRequest, User user) throws Exception;

	void deleteIssue(Long issueId, Long userid) throws Exception;

	Issue addUserToIssue(Long issueId, Long userId) throws Exception;

	Issue updateStatus(Long issueId, String status) throws Exception;
}
