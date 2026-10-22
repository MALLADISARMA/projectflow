package com.zosh.config;

public class JwtConstant {
	public static final String SECRET_KEY = System.getenv().getOrDefault(
			"JWT_SECRET",
			"projectmanagementsystem-local-development-secret-change-before-production");
	public static final String JWT_HEADER="Authorization";
	

}
