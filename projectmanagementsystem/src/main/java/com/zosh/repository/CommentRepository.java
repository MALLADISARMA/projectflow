package com.zosh.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.zosh.modal.Comment;

public interface CommentRepository extends JpaRepository<Comment,Long> {

	List<Comment> findCommentByIssueId(Long issueId);
	
	
}
