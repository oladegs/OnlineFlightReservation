package com.spring.mvc.jpa;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import jakarta.servlet.http.HttpSession;

@Controller
public class HomeController {
	@GetMapping("/")
    public String index(HttpSession session, Model model) {
        model.addAttribute("loggedIn", session.getAttribute(AuthController.UID) != null);
        return "index";
    }
}
