package com.zosh.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.zosh.modal.Chat;

public interface ChatRepository extends JpaRepository<Chat,Long> {

}
