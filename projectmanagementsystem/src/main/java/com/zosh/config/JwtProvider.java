package com.zosh.config;

import java.util.Date;

import javax.crypto.SecretKey;

import org.springframework.security.core.Authentication;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

public class JwtProvider {
	 static SecretKey key = Keys.hmacShaKeyFor(JwtConstant.SECRET_KEY.getBytes());
//    Claims claims = Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(jwt).getBody();

//    String email = String.valueOf(claims.get("email"));
 //   String authorities = String.valueOf(claims.get("authorities"));
	 
	 public static String generateToken(Authentication auth) {
		 return Jwts.builder().setIssuedAt(new Date())
			        .setExpiration(new Date(new Date().getTime() + 86400000))
			        .claim("email", auth.getName())
			        .signWith(key)
			        .compact();

			
	 }
	 public static String getEmailFromToken(String jwt){
        if (jwt == null || jwt.isBlank()) {
            throw new IllegalArgumentException("Authorization token is required");
        }
        String token = jwt.trim();
        if (token.regionMatches(true, 0, "Bearer ", 0, 7)) {
            token = token.substring(7).trim();
        }
        if (token.isEmpty()) {
            throw new IllegalArgumentException("Bearer token is empty");
        }

        Claims claims = Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token).getBody();
        String email = claims.get("email", String.class);
        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException("Token does not contain an email");
        }
        return email;
		 
	 }
}
