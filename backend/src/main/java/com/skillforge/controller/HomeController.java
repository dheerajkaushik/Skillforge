package com.skillforge.controller;

import org.springframework.web.bind.annotation.GetMapping;       // <--- Was missing
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HomeController {

    @GetMapping("/")
    public String home() {
        return "Backend is running";
    }
}
