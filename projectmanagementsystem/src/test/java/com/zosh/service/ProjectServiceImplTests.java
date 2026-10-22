package com.zosh.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.test.util.ReflectionTestUtils;

import com.zosh.modal.Project;
import com.zosh.modal.User;
import com.zosh.repository.ProjectRepository;

@ExtendWith(MockitoExtension.class)
class ProjectServiceImplTests {

    @Mock
    private ProjectRepository projectRepository;

    @Mock
    private UserService userService;

    @Mock
    private ChatService chatService;

    private ProjectServiceImpl service;

    @BeforeEach
    void setUp() {
        service = new ProjectServiceImpl();
        ReflectionTestUtils.setField(service, "projectRepository", projectRepository);
        ReflectionTestUtils.setField(service, "userService", userService);
        ReflectionTestUtils.setField(service, "chatService", chatService);
    }

    @Test
    void tagFilterMatchesTagsInsteadOfCategory() throws Exception {
        User user = user(1L);
        Project project = new Project();
        project.setCategory("engineering");
        project.setTags(List.of("backend"));
        when(projectRepository.findByTeamContainingOrOwner(user, user)).thenReturn(List.of(project));

        List<Project> results = service.getProjectByTeam(user, null, "backend");

        assertEquals(List.of(project), results);
    }

    @Test
    void nonMemberCannotReadProject() {
        User owner = user(1L);
        Project project = new Project();
        project.setOwner(owner);
        when(projectRepository.findById(7L)).thenReturn(Optional.of(project));

        assertThrows(AccessDeniedException.class, () -> service.getProjectForMember(7L, user(2L)));
    }

    @Test
    void nonOwnerCannotManageProject() {
        User owner = user(1L);
        Project project = new Project();
        project.setOwner(owner);
        when(projectRepository.findById(7L)).thenReturn(Optional.of(project));

        assertThrows(AccessDeniedException.class, () -> service.getProjectForOwner(7L, user(2L)));
    }

    private User user(Long id) {
        User user = new User();
        user.setId(id);
        return user;
    }
}
