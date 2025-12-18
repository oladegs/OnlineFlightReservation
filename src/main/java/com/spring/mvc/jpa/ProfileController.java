package com.spring.mvc.jpa;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;

import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;

@Controller
@RequestMapping("/profile")
public class ProfileController {

    private final PassengerRepository passengers;

    public ProfileController(PassengerRepository passengers) {
        this.passengers = passengers;
    }

    @GetMapping
    public String view(HttpSession session, Model m) {
        Integer uid = (Integer) session.getAttribute(AuthController.UID);
        if (uid == null) return "redirect:/auth/login";
        m.addAttribute("p", passengers.findById(uid).orElseThrow());
        return "profile/view";
    }

    @PostMapping
    public String update(@Valid @ModelAttribute("p") Passenger incoming,
                         BindingResult br,
                         HttpSession session) {
        Integer uid = (Integer) session.getAttribute(AuthController.UID);
        if (uid == null) return "redirect:/auth/login";
        
        // If password is blank, ignore password validation errors (password is optional for updates)
        boolean passwordIsBlank = (incoming.getPassword() == null || incoming.getPassword().trim().isEmpty());
        
        // Check for errors, but ignore password errors if password is blank
        boolean hasErrors = false;
        if (passwordIsBlank) {
            // Check for non-password errors only
            hasErrors = br.getFieldErrors().stream()
                .anyMatch(error -> !error.getField().equals("password")) || br.hasGlobalErrors();
        } else {
            // Password provided, check all errors including password validation
            hasErrors = br.hasErrors();
            // Manual validation for password length if provided
            if (!hasErrors && (incoming.getPassword().length() < 6 || incoming.getPassword().length() > 255)) {
                br.rejectValue("password", "error.password", "Password must be between 6 and 255 characters");
                hasErrors = true;
            }
        }
        
        if (hasErrors) {
            // Keep password blank in form if it was blank (for display purposes)
            if (passwordIsBlank) {
                incoming.setPassword(""); // Keep blank in form
            }
            return "profile/view";
        }

        // All validation passed, update the passenger
        Passenger p = passengers.findById(uid).orElseThrow();
        p.setFirstname(incoming.getFirstname());
        p.setLastname(incoming.getLastname());
        p.setAddress(incoming.getAddress());
        p.setCity(incoming.getCity());
        p.setPostalCode(incoming.getPostalCode());
        
        // Only update password if provided and valid
        if (!passwordIsBlank) {
            p.setPassword(incoming.getPassword()); // plain text for lab
        }
        
        passengers.save(p);
        return "redirect:/profile?updated=true";
    }
}
