package com.zosh.repository;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor

public class InviteRequest {
    private Long projectId;
    private String email;

    // Default No-Args Constructor
    public InviteRequest() {
    }

    // Parameterized Constructor
    public InviteRequest(Long projectId, String email) {
        this.projectId = projectId;
        this.email = email;
    }

    // Getters and Setters
    public Long getProjectId() {
        return projectId;
    }

    public void setProjectId(Long projectId) {
        this.projectId = projectId;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }
}