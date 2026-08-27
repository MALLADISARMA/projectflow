package com.zosh.service;

import java.util.List;

import com.zosh.modal.Comment;

public interface CommentService {
	Comment createComment(Long issueId, Long userId, String comment);
	void deleteComment(Long commentId, Long userId) throws Exception;
	List<Comment> findCommentByIssueId(Long issueId);
}
