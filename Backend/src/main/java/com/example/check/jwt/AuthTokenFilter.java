package com.example.check.jwt;


import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;


import com.example.check.serviceImpl.UserDetailsServiceImpl;



public class AuthTokenFilter extends OncePerRequestFilter {
	  @Autowired
	  private JwtUtils jwtUtils;

	  @Autowired
	  private UserDetailsServiceImpl userDetailsService;

	  private static final Logger logger = LoggerFactory.getLogger(AuthTokenFilter.class);

	  @Override
	  protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
	      throws ServletException, IOException {
	    try {
	      String jwt = parseJwt(request);
	      System.out.println("JWT Filter - Request URI: " + request.getRequestURI());
	      System.out.println("JWT Filter - JWT token: " + (jwt != null ? jwt.substring(0, Math.min(20, jwt.length())) + "..." : "null"));
	      
	      if (jwt != null && jwtUtils.validateJwtToken(jwt)) {
	        String username = jwtUtils.getUserNameFromJwtToken(jwt);
	        System.out.println("JWT Filter - Username from token: " + username);

	        UserDetails userDetails = userDetailsService.loadUserByUsername(username);
	        UsernamePasswordAuthenticationToken authentication =
	            new UsernamePasswordAuthenticationToken(
	                userDetails,
	                null,
	                userDetails.getAuthorities());
	        authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

	        SecurityContextHolder.getContext().setAuthentication(authentication);
	        System.out.println("JWT Filter - Authentication set successfully for user: " + username);
	      } else {
	        System.out.println("JWT Filter - JWT validation failed or token is null");
	      }
	    } catch (Exception e) {
	      logger.error("Cannot set user authentication: {}", e);
	      System.err.println("JWT Filter - Error: " + e.getMessage());
	    }

	    filterChain.doFilter(request, response);
	  }

	  private String parseJwt(HttpServletRequest request) {
	    String headerAuth = request.getHeader("Authorization");
	    System.out.println("JWT Filter - Authorization header: " + headerAuth);

	    if (StringUtils.hasText(headerAuth) && headerAuth.startsWith("Bearer ")) {
	      String token = headerAuth.substring(7, headerAuth.length());
	      System.out.println("JWT Filter - Extracted token length: " + token.length());
	      return token;
	    }

	    System.out.println("JWT Filter - No valid Authorization header found");
	    return null;
	  }
	}
