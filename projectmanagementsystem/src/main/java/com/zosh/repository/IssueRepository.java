package com.zosh.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.zosh.modal.Issue;

public interface IssueRepository extends JpaRepository<Issue,Long> {
	List<Issue> findByProject_Id(Long id);

}
