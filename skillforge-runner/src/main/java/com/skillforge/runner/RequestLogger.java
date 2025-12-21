package com.skillforge.runner;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.stereotype.Component;
import java.io.IOException;

@Component
public class RequestLogger implements Filter {
    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        HttpServletRequest req = (HttpServletRequest) request;
        System.out.println("🔍 INCOMING REQUEST: [" + req.getMethod() + "] " + req.getRequestURI());
        chain.doFilter(request, response);
    }
}