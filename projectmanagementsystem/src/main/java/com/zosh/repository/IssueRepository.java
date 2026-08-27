package com.zosh.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.zosh.modal.Issue;

public interface IssueRepository extends JpaRepository<Issue,Long> {
	public List<Issue> findByProjectID(Long id);

}
