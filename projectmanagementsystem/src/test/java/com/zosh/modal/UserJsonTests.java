package com.zosh.modal;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.Test;

import com.fasterxml.jackson.databind.ObjectMapper;

class UserJsonTests {

    @Test
    void passwordCanBeReadFromSignupRequestButIsNeverSerialized() throws Exception {
        ObjectMapper mapper = new ObjectMapper();
        User user = mapper.readValue("{\"email\":\"person@example.com\",\"password\":\"secret\"}", User.class);

        assertTrue(user.getPassword().equals("secret"));
        assertFalse(mapper.writeValueAsString(user).contains("password"));
    }
}
