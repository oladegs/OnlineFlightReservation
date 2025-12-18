package com.spring.mvc.jpa;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;

@Controller
@RequestMapping("/auth")
public class AuthController {

    /** Session attribute that stores the logged-in passengerId */
    public static final String UID = "uid";

    private final PassengerRepository passengers;

    public AuthController(PassengerRepository passengers) {
        this.passengers = passengers;
    }

    // ---------- Sign Up ----------
    @GetMapping("/signup")
    public String signUpForm(Model m) {
        m.addAttribute("passenger", new Passenger());
        return "auth/signup";
    }

    @PostMapping("/signup")
    public String signUp(@Valid @ModelAttribute Passenger passenger, BindingResult br, Model m) {
        if (passengers.existsByEmail(passenger.getEmail())) {
            br.rejectValue("email", "exists", "Email already registered");
        }
        if (br.hasErrors()) return "auth/signup";

        // NOTE (lab): password stored as plain text for simplicity. Hash in real apps.
        passengers.save(passenger);
        return "redirect:/auth/login";
    }

    // ---------- Login ----------
    @GetMapping("/login")
    public String loginForm() {
        return "auth/login";
    }

    @PostMapping("/login")
    public String login(@RequestParam String email,
                        @RequestParam String password,
                        HttpSession session,
                        Model m) {
        Passenger p = passengers.findByEmail(email);
        if (p == null || !p.getPassword().equals(password)) {
            m.addAttribute("error", "Invalid email or password");
            return "auth/login";
        }
        session.setAttribute(UID, p.getPassengerId());
        session.setAttribute("email", p.getEmail());
        return "redirect:/reservations";
    }

    // ---------- Logout ----------
    @PostMapping("/logout")
    public String logout(HttpSession session) {
        session.invalidate();
        return "redirect:/";
    }
}
