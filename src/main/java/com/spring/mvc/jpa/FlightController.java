package com.spring.mvc.jpa;

import java.util.List;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;

@Controller
@RequestMapping("/flights")
public class FlightController {

    private final FlightRepository flights;

    public FlightController(FlightRepository flights) {
        this.flights = flights;
    }

    @GetMapping
    public String list(Model m) {
        List<Flight> all = flights.findAll();
        m.addAttribute("flights", all);
        return "flight/list";
    }

    @GetMapping("/new")
    public String createForm(HttpSession session, Model m) {
        if (session.getAttribute(AuthController.UID) == null) return "redirect:/auth/login";
        m.addAttribute("flight", new Flight());
        return "flight/form";
    }

    @PostMapping
    public String create(@Valid @ModelAttribute("flight") Flight flight,
                         BindingResult br,
                         HttpSession session) {
        if (session.getAttribute(AuthController.UID) == null) return "redirect:/auth/login";
        if (br.hasErrors()) return "flight/form";
        flights.save(flight);
        return "redirect:/flights";
    }

    @GetMapping("/{id}/edit")
    public String editForm(@PathVariable Integer id, HttpSession session, Model m) {
        if (session.getAttribute(AuthController.UID) == null) return "redirect:/auth/login";
        m.addAttribute("flight", flights.findById(id).orElseThrow());
        return "flight/form";
    }

    @PostMapping("/{id}")
    public String update(@PathVariable Integer id,
                         @Valid @ModelAttribute("flight") Flight flight,
                         BindingResult br,
                         HttpSession session) {
        if (session.getAttribute(AuthController.UID) == null) return "redirect:/auth/login";
        if (br.hasErrors()) return "flight/form";
        flight.setFlightId(id);
        flights.save(flight);
        return "redirect:/flights";
    }

    @PostMapping("/{id}/delete")
    public String delete(@PathVariable Integer id, HttpSession session) {
        if (session.getAttribute(AuthController.UID) == null) return "redirect:/auth/login";
        flights.deleteById(id);
        return "redirect:/flights";
    }
}
