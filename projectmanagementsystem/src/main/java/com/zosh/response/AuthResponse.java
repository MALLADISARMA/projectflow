package com.zosh.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
	private String jwt;
	private String message;
	public void setMessage(String message) {
	    this.message = message;
	}

	public void setJwt(String jwt) {
	    this.jwt = jwt;
	}
	

}
