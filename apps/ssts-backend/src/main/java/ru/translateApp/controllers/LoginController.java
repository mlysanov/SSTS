package ru.translateApp.controllers;


import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;
import org.springframework.security.core.GrantedAuthority;

@RestController
@RequestMapping("/api")
public class LoginController {

    @PostMapping("/login")
    @ResponseBody
    public List<String> handlePostRequest(Authentication authentication) {
        return authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toList());
    }
}
