package com.spring.mvc.jpa;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;

/**
 * Handles reservation browsing, creation, review, payment, editing, and cancellation
 * for the currently logged-in passenger.
 */
@Controller
@RequestMapping("/reservations")
public class ReservationController {

    private final ReservationRepository reservations;
    private final PassengerRepository passengers;
    private final FlightRepository flights;

    /**
     * Wires repositories via constructor injection.
     */
    public ReservationController(ReservationRepository reservations,
                                 PassengerRepository passengers,
                                 FlightRepository flights) {
        this.reservations = reservations;
        this.passengers = passengers;
        this.flights = flights;
    }

    /**
     * GET /reservations
     * Shows the user's reservation list and the flight-filter UI.
     * - Requires login (redirects to /auth/login if missing).
     * - Loads unique dropdown values (airlines, origins, destinations, times, dates).
     * - Adds user's existing reservations to the model.
     * - If flights table is empty, sets databaseEmpty=true for the view to handle.
     *
     * @return Thymeleaf view "reservation/list"
     */
    @GetMapping
    public String myList(HttpSession session, Model m) {
        Integer uid = (Integer) session.getAttribute(AuthController.UID);
        if (uid == null) return "redirect:/auth/login";
        
        // Get all flights for selection
        List<Flight> allFlights = flights.findAll();
        
        // If DB has no flights, return list page with empty dropdowns
        if (allFlights == null || allFlights.isEmpty()) {
            m.addAttribute("flights", new java.util.ArrayList<Flight>());
            m.addAttribute("airlines", new java.util.ArrayList<String>());
            m.addAttribute("origins", new java.util.ArrayList<String>());
            m.addAttribute("destinations", new java.util.ArrayList<String>());
            m.addAttribute("departureTimes", new java.util.ArrayList<LocalDateTime>());
            m.addAttribute("arrivalTimes", new java.util.ArrayList<LocalDateTime>());
            m.addAttribute("departureDates", new java.util.ArrayList<LocalDate>());
            m.addAttribute("items", reservations.findByPassenger_PassengerId(uid));
            m.addAttribute("reservation", new Reservation());
            m.addAttribute("databaseEmpty", true);
            return "reservation/list";
        }
        
        // Build dropdown lists
        List<String> airlines = allFlights.stream()
            .map(Flight::getAirlineName)
            .distinct()
            .sorted()
            .collect(java.util.stream.Collectors.toList());
        
        List<String> origins = allFlights.stream()
            .map(Flight::getOrigin)
            .distinct()
            .sorted()
            .collect(java.util.stream.Collectors.toList());
        
        List<String> destinations = allFlights.stream()
            .map(Flight::getDestination)
            .distinct()
            .sorted()
            .collect(java.util.stream.Collectors.toList());
        
        List<LocalDateTime> departureTimes = allFlights.stream()
            .map(Flight::getDepartureTime)
            .distinct()
            .sorted()
            .collect(java.util.stream.Collectors.toList());
        List<LocalDateTime> arrivalTimes = allFlights.stream()
            .map(Flight::getArrivalTime)
            .distinct()
            .sorted()
            .collect(java.util.stream.Collectors.toList());

        List<LocalDate> departureDates = allFlights.stream()
            .map(f -> f.getDepartureTime().toLocalDate())
            .distinct()
            .sorted()
            .collect(java.util.stream.Collectors.toList());

        m.addAttribute("flights", allFlights);
        m.addAttribute("airlines", airlines);
        m.addAttribute("origins", origins);
        m.addAttribute("destinations", destinations);
        m.addAttribute("departureTimes", departureTimes);
        m.addAttribute("arrivalTimes", arrivalTimes);
        m.addAttribute("items", reservations.findByPassenger_PassengerId(uid));
        m.addAttribute("reservation", new Reservation());
        m.addAttribute("departureDates", departureDates);
        m.addAttribute("databaseEmpty", false);
        return "reservation/list";
    }

    /**
     * POST /reservations/book
     * Creates a reservation directly from selected flight filters and passenger counts.
     * - Verifies login and that the selected flight combination actually exists.
     * - Validates passenger count (>= 1).
     * - Persists a new reservation with PENDING status, then redirects to payment page.
     * - On any validation error, rebuilds dropdown lists and returns to the list view with an error message.
     *
     * @return redirect to payment page if success, otherwise "reservation/list"
     */
    @PostMapping("/book")
    public String bookFlight(@RequestParam String airlineName,
                            @RequestParam String origin,
                            @RequestParam String destination,
                            @RequestParam String departureTime,
                            @RequestParam String arrivalTime,
                            @RequestParam String bookingDate,
                            @RequestParam String departureDate,
                            @RequestParam Integer adultPassengers,
                            @RequestParam Integer childPassengers,
                            HttpSession session, Model m) {
        Integer uid = (Integer) session.getAttribute(AuthController.UID);
        if (uid == null) return "redirect:/auth/login";

        try {
            // Parse times from strings 'yyyy-MM-dd HH:mm:ss'
            java.time.format.DateTimeFormatter fmt = java.time.format.DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
            java.time.LocalDateTime depTs = java.time.LocalDateTime.parse(departureTime, fmt);
            java.time.LocalDateTime arrTs = java.time.LocalDateTime.parse(arrivalTime, fmt);

            // Find matching flight based on all criteria
            List<Flight> matchingFlights = flights.findAll().stream()
                .filter(flight -> flight.getAirlineName().equals(airlineName)
                        && flight.getOrigin().equals(origin)
                        && flight.getDestination().equals(destination)
                        && flight.getDepartureTime().equals(depTs)
                        && flight.getArrivalTime().equals(arrTs))
                .collect(java.util.stream.Collectors.toList());
            
            if (matchingFlights.isEmpty()) {
                // Rebuild model and show error on same page
                List<Flight> allFlights = flights.findAll();
                List<String> airlines = allFlights.stream().map(Flight::getAirlineName).distinct().sorted().collect(java.util.stream.Collectors.toList());
                List<String> origins = allFlights.stream().map(Flight::getOrigin).distinct().sorted().collect(java.util.stream.Collectors.toList());
                List<String> destinations = allFlights.stream().map(Flight::getDestination).distinct().sorted().collect(java.util.stream.Collectors.toList());
                List<LocalDateTime> depTimes = allFlights.stream().map(Flight::getDepartureTime).distinct().sorted().collect(java.util.stream.Collectors.toList());
                List<LocalDateTime> arrTimes = allFlights.stream().map(Flight::getArrivalTime).distinct().sorted().collect(java.util.stream.Collectors.toList());
                List<LocalDate> departureDates = allFlights.stream().map(f -> f.getDepartureTime().toLocalDate()).distinct().sorted().collect(java.util.stream.Collectors.toList());
                m.addAttribute("flights", allFlights);
                m.addAttribute("airlines", airlines);
                m.addAttribute("origins", origins);
                m.addAttribute("destinations", destinations);
                m.addAttribute("departureTimes", depTimes);
                m.addAttribute("arrivalTimes", arrTimes);
                m.addAttribute("departureDates", departureDates);
                m.addAttribute("items", reservations.findByPassenger_PassengerId(uid));
                m.addAttribute("reservation", new Reservation());
                m.addAttribute("error", "Selected route/time is not available. Please choose another combination.");
                m.addAttribute("databaseEmpty", false);
                return "reservation/list";
            }
            
            // Use the first matching flight
            Flight flight = matchingFlights.get(0);
            Passenger passenger = passengers.findById(uid).orElseThrow();
            LocalDate bookingDateParsed = LocalDate.parse(bookingDate);
            LocalDate departureDateParsed = LocalDate.parse(departureDate);
            Integer noOfPassengers = (adultPassengers != null ? adultPassengers : 0) + (childPassengers != null ? childPassengers : 0);
            if (noOfPassengers < 1) {
                // Rebuild model and show error
                List<Flight> allFlights = flights.findAll();
                List<String> airlines = allFlights.stream().map(Flight::getAirlineName).distinct().sorted().collect(java.util.stream.Collectors.toList());
                List<String> origins = allFlights.stream().map(Flight::getOrigin).distinct().sorted().collect(java.util.stream.Collectors.toList());
                List<String> destinations = allFlights.stream().map(Flight::getDestination).distinct().sorted().collect(java.util.stream.Collectors.toList());
                List<LocalDateTime> depTimes = allFlights.stream().map(Flight::getDepartureTime).distinct().sorted().collect(java.util.stream.Collectors.toList());
                List<LocalDateTime> arrTimes = allFlights.stream().map(Flight::getArrivalTime).distinct().sorted().collect(java.util.stream.Collectors.toList());
                List<LocalDate> departureDates = allFlights.stream().map(f -> f.getDepartureTime().toLocalDate()).distinct().sorted().collect(java.util.stream.Collectors.toList());
                m.addAttribute("flights", allFlights);
                m.addAttribute("airlines", airlines);
                m.addAttribute("origins", origins);
                m.addAttribute("destinations", destinations);
                m.addAttribute("departureTimes", depTimes);
                m.addAttribute("arrivalTimes", arrTimes);
                m.addAttribute("departureDates", departureDates);
                m.addAttribute("items", reservations.findByPassenger_PassengerId(uid));
                m.addAttribute("error", "Please select at least 1 adult or child passenger.");
                return "reservation/list";
            }
            Double totalPrice = flight.getPrice() * noOfPassengers;

            Reservation reservation = new Reservation();
            reservation.setPassenger(passenger);
            reservation.setFlight(flight);
            reservation.setBookingDate(bookingDateParsed);
            reservation.setDepartureDate(departureDateParsed);
            reservation.setNumberOfPassengers(noOfPassengers);
            reservation.setTotalPrice(totalPrice);
            // Start as PENDING; user proceeds to payment
            reservation.setStatus("PENDING");

            Reservation saved = reservations.save(reservation);
            return "redirect:/reservations/payment/" + saved.getReservationId();
        } catch (Exception e) {
            m.addAttribute("error", "Error creating reservation: " + e.getMessage());
            return "redirect:/reservations";
        }
    }

    /**
     * GET /reservations/search
     * Renders a simple search page with all flights listed.
     *
     * @return "reservation/search"
     */
    @GetMapping("/search")
    public String searchFlights(HttpSession session, Model m) {
        Integer uid = (Integer) session.getAttribute(AuthController.UID);
        if (uid == null) return "redirect:/auth/login";
        
        m.addAttribute("flights", flights.findAll());
        return "reservation/search";
    }

    /**
     * POST /reservations/search
     * Executes a basic in-memory search by origin/destination (substring match, case-insensitive)
     * and echoes the filters back to the results view.
     *
     * @return "reservation/results"
     */
    @PostMapping("/search")
    public String searchResults(@RequestParam(required = false) String origin,
                                @RequestParam(required = false) String destination,
                                @RequestParam(required = false) String departureDate,
                                HttpSession session, Model m) {
        Integer uid = (Integer) session.getAttribute(AuthController.UID);
        if (uid == null) return "redirect:/auth/login";

        List<Flight> allFlights = flights.findAll();
        List<Flight> matchingFlights = allFlights.stream()
            .filter(flight -> flight.getOrigin().toLowerCase().contains(origin.toLowerCase()) &&
                             flight.getDestination().toLowerCase().contains(destination.toLowerCase()))
            .collect(java.util.stream.Collectors.toList());
        
        m.addAttribute("flights", matchingFlights);
        m.addAttribute("origin", origin);
        m.addAttribute("destination", destination);
        m.addAttribute("departureDate", departureDate);
        return "reservation/results";
    }

    /**
     * GET /reservations/new
     * Shows a blank "new reservation" form (defaults: bookingDate=today, passengers=1, status=PENDING).
     * If flightId is provided, pre-selects that flight in the form.
     *
     * @return "reservation/new"
     */
    @GetMapping("/new")
    public String newForm(@RequestParam(required = false) Integer flightId,
                          HttpSession session, Model m) {
        if (session.getAttribute(AuthController.UID) == null) return "redirect:/auth/login";

        Reservation r = new Reservation();
        r.setBookingDate(LocalDate.now());
        r.setNumberOfPassengers(1);
        r.setStatus("PENDING");

        if (flightId != null) r.setFlight(flights.findById(flightId).orElse(null));

        m.addAttribute("reservation", r);
        m.addAttribute("flights", flights.findAll());
        return "reservation/new";
    }

    /**
     * POST /reservations/review
     * Validates the form-bound Reservation and computes derived fields for a review page:
     * - Requires a valid selected flight.
     * - Sets passenger, bookingDate=today, totalPrice=unitPrice * passengers, status=PENDING.
     * - On validation errors, returns user to the new form.
     *
     * @return "reservation/review" or "reservation/new"
     */
    @PostMapping("/review")
    public String review(@Valid @ModelAttribute("reservation") Reservation r,
                         BindingResult br,
                         HttpSession session,
                         Model m) {
        Integer uid = (Integer) session.getAttribute(AuthController.UID);
        if (uid == null) return "redirect:/auth/login";

        if (br.hasErrors() || r.getFlight() == null) {
            m.addAttribute("flights", flights.findAll());
            return "reservation/new";
        }
        Passenger p = passengers.findById(uid).orElseThrow();

        double unit = flights.findById(r.getFlight().getFlightId()).orElseThrow().getPrice();
        r.setPassenger(p);
        r.setBookingDate(LocalDate.now());
        r.setTotalPrice(unit * r.getNumberOfPassengers());
        r.setStatus("PENDING");

        m.addAttribute("review", r);
        return "reservation/review";
    }

    /**
     * POST /reservations/confirm
     * Finalizes and saves a reservation from the review step.
     * - Fills in all fields and persists with PENDING status (payment to follow).
     *
     * @return "reservation/confirm"
     */
    @PostMapping("/confirm")
    public String confirm(@RequestParam Integer flightId,
                          @RequestParam String departureDate,
                          @RequestParam Integer num,
                          HttpSession session,
                          Model m) {
        Integer uid = (Integer) session.getAttribute(AuthController.UID);
        if (uid == null) return "redirect:/auth/login";

        Passenger p = passengers.findById(uid).orElseThrow();
        Flight f = flights.findById(flightId).orElseThrow();

        Reservation r = new Reservation();
        r.setPassenger(p);
        r.setFlight(f);
        r.setBookingDate(LocalDate.now());
        r.setDepartureDate(LocalDate.parse(departureDate));
        r.setNumberOfPassengers(num);
        r.setTotalPrice(f.getPrice() * num);
        r.setStatus("PENDING"); // Will be set to CONFIRMED on successful payment

        Reservation saved = reservations.save(r);
        m.addAttribute("reservation", saved);
        return "reservation/confirm";
    }

    /**
     * GET /reservations/payment/{id}
     * Shows the payment form for a specific reservation.
     * - Ensures the reservation belongs to the logged-in passenger.
     *
     * @return "reservation/payment" or redirect to /reservations if unauthorized
     */
    @GetMapping("/payment/{id}")
    public String paymentForm(@PathVariable Integer id, HttpSession session, Model m) {
        Integer uid = (Integer) session.getAttribute(AuthController.UID);
        if (uid == null) return "redirect:/auth/login";

        Reservation r = reservations.findById(id).orElseThrow();
        if (!r.getPassenger().getPassengerId().equals(uid)) {
            return "redirect:/reservations";
        }

        m.addAttribute("reservation", r);
        return "reservation/payment";
    }

    /**
     * POST /reservations/payment/{id}
     * Processes payment (mocked as always successful here).
     * - On "success": sets status=CONFIRMED and redirects to list with ?paid=true flag.
     * - On "failure": redisplays payment page with error.
     *
     * @return redirect to /reservations?paid=true or "reservation/payment" on failure
     */
    @PostMapping("/payment/{id}")
    public String processPayment(@PathVariable Integer id,
                                 @RequestParam String paymentMethod,
                                 @RequestParam(required = false) String cardNumber,
                                 @RequestParam(required = false) String expiryDate,
                                 @RequestParam(required = false) String cvv,
                                 HttpSession session, Model m) {
        Integer uid = (Integer) session.getAttribute(AuthController.UID);
        if (uid == null) return "redirect:/auth/login";

        Reservation r = reservations.findById(id).orElseThrow();
        if (!r.getPassenger().getPassengerId().equals(uid)) {
            return "redirect:/reservations";
        }

        // Mock payment processing - in real app, integrate with payment gateway
        boolean paymentSuccessful = true; // Always successful for demo
        
        if (paymentSuccessful) {
            r.setStatus("CONFIRMED");
            reservations.save(r);
            // Redirect to list with success flag so UI can alert and show the new reservation
            return "redirect:/reservations?paid=true";
        } else {
            m.addAttribute("reservation", r);
            m.addAttribute("error", "Payment failed. Please try again.");
            return "reservation/payment";
        }
    }

    /**
     * GET /reservations/{id}/edit
     * Loads the edit form for a reservation owned by the user and
     * provides available departure times to choose from.
     *
     * @return "reservation/edit" or redirect if unauthorized
     */
    @GetMapping("/{id}/edit")
    public String editForm(@PathVariable Integer id, HttpSession session, Model m) {
        Integer uid = (Integer) session.getAttribute(AuthController.UID);
        if (uid == null) return "redirect:/auth/login";
        Reservation r = reservations.findById(id).orElseThrow();
        if (!r.getPassenger().getPassengerId().equals(uid)) return "redirect:/reservations";
        m.addAttribute("reservation", r);
        // Provide available departure times for dropdown
        List<LocalDateTime> departureTimes = flights.findAll().stream()
            .map(Flight::getDepartureTime)
            .distinct()
            .sorted()
            .collect(java.util.stream.Collectors.toList());
        m.addAttribute("departureTimes", departureTimes);
        return "reservation/edit";
    }

    /**
     * POST /reservations/{id}
     * Updates passengers and departure time for an existing reservation.
     * - Validates the new (departureTime, arrivalTime, route) combination exists.
     * - Recomputes total price.
     * - Uses RedirectAttributes to signal success (and potential refund) back to list.
     *
     * @return redirect to /reservations on success, or "reservation/edit" with error
     */
    @PostMapping("/{id}")
    public String update(@PathVariable Integer id,
                         @RequestParam Integer adultPassengers,
                         @RequestParam Integer childPassengers,
                         @RequestParam String departureTime,
                         HttpSession session,
                         Model m,
                         org.springframework.web.servlet.mvc.support.RedirectAttributes attrs) {
        Integer uid = (Integer) session.getAttribute(AuthController.UID);
        if (uid == null) return "redirect:/auth/login";

        Reservation r = reservations.findById(id).orElseThrow();
        if (!r.getPassenger().getPassengerId().equals(uid)) return "redirect:/reservations";

        try {
            // Parse departure time from string 'yyyy-MM-dd HH:mm:ss'
            java.time.format.DateTimeFormatter fmt = java.time.format.DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
            LocalDateTime depTs = LocalDateTime.parse(departureTime, fmt);
            
            // Validate that the selected departure time and current flight's arrival time exist as a combination
            LocalDateTime arrivalTime = r.getFlight().getArrivalTime();
            List<Flight> matchingFlights = flights.findAll().stream()
                .filter(flight -> flight.getAirlineName().equals(r.getFlight().getAirlineName())
                        && flight.getOrigin().equals(r.getFlight().getOrigin())
                        && flight.getDestination().equals(r.getFlight().getDestination())
                        && flight.getDepartureTime().equals(depTs)
                        && flight.getArrivalTime().equals(arrivalTime))
                .collect(java.util.stream.Collectors.toList());
            
            if (matchingFlights.isEmpty()) {
                // Return to edit page with error
                m.addAttribute("reservation", r);
                List<LocalDateTime> departureTimes = flights.findAll().stream()
                    .map(Flight::getDepartureTime)
                    .distinct()
                    .sorted()
                    .collect(java.util.stream.Collectors.toList());
                m.addAttribute("departureTimes", departureTimes);
                m.addAttribute("error", "Error! Selected route/time is not available. Please choose another combination.");
                return "reservation/edit";
            }
            
            // Update passengers/date and recompute totals
            double oldTotal = r.getTotalPrice() != null ? r.getTotalPrice() : 0.0;
            Integer noOfPassengers = (adultPassengers != null ? adultPassengers : 0) + (childPassengers != null ? childPassengers : 0);
            if (noOfPassengers < 1) {
                m.addAttribute("reservation", r);
                List<LocalDateTime> departureTimes = flights.findAll().stream()
                    .map(Flight::getDepartureTime)
                    .distinct()
                    .sorted()
                    .collect(java.util.stream.Collectors.toList());
                m.addAttribute("departureTimes", departureTimes);
                m.addAttribute("error", "Please select at least 1 adult or child passenger.");
                return "reservation/edit";
            }
            r.setNumberOfPassengers(noOfPassengers);
            r.setDepartureDate(depTs.toLocalDate());
            double newTotal = r.getFlight().getPrice() * r.getNumberOfPassengers();
            r.setTotalPrice(newTotal);
            reservations.save(r);
            boolean refund = newTotal < oldTotal;
            attrs.addAttribute("updated", true);
            if (refund) attrs.addAttribute("refund", true);
            return "redirect:/reservations";
        } catch (Exception e) {
            m.addAttribute("reservation", r);
            List<LocalDateTime> departureTimes = flights.findAll().stream()
                .map(Flight::getDepartureTime)
                .distinct()
                .sorted()
                .collect(java.util.stream.Collectors.toList());
            m.addAttribute("departureTimes", departureTimes);
            m.addAttribute("error", "Error updating reservation: " + e.getMessage());
            return "reservation/edit";
        }
    }

    /**
     * POST /reservations/{id}/update-and-pay
     * Same update logic as above, but on success it sends the user directly
     * to the payment page for the reservation.
     *
     * @return redirect to /reservations/payment/{id} or "reservation/edit" with error
     */
    @PostMapping("/{id}/update-and-pay")
    public String updateAndPay(@PathVariable Integer id,
                               @RequestParam Integer adultPassengers,
                               @RequestParam Integer childPassengers,
                               @RequestParam String departureTime,
                               HttpSession session,
                               Model m) {
        Integer uid = (Integer) session.getAttribute(AuthController.UID);
        if (uid == null) return "redirect:/auth/login";

        Reservation r = reservations.findById(id).orElseThrow();
        if (!r.getPassenger().getPassengerId().equals(uid)) return "redirect:/reservations";

        try {
            // Parse departure time from string 'yyyy-MM-dd HH:mm:ss'
            java.time.format.DateTimeFormatter fmt = java.time.format.DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
            LocalDateTime depTs = LocalDateTime.parse(departureTime, fmt);
            
            // Validate that the selected departure time and current flight's arrival time exist as a combination
            LocalDateTime arrivalTime = r.getFlight().getArrivalTime();
            List<Flight> matchingFlights = flights.findAll().stream()
                .filter(flight -> flight.getAirlineName().equals(r.getFlight().getAirlineName())
                        && flight.getOrigin().equals(r.getFlight().getOrigin())
                        && flight.getDestination().equals(r.getFlight().getDestination())
                        && flight.getDepartureTime().equals(depTs)
                        && flight.getArrivalTime().equals(arrivalTime))
                .collect(java.util.stream.Collectors.toList());
            
            if (matchingFlights.isEmpty()) {
                // Return to edit page with error
                m.addAttribute("reservation", r);
                List<LocalDateTime> departureTimes = flights.findAll().stream()
                    .map(Flight::getDepartureTime)
                    .distinct()
                    .sorted()
                    .collect(java.util.stream.Collectors.toList());
                m.addAttribute("departureTimes", departureTimes);
                m.addAttribute("error", "Error! Selected route/time is not available. Please choose another combination.");
                return "reservation/edit";
            }
            
            // Update and go to payment
            Integer noOfPassengers = (adultPassengers != null ? adultPassengers : 0) + (childPassengers != null ? childPassengers : 0);
            if (noOfPassengers < 1) {
                m.addAttribute("reservation", r);
                List<LocalDateTime> departureTimes = flights.findAll().stream()
                    .map(Flight::getDepartureTime)
                    .distinct()
                    .sorted()
                    .collect(java.util.stream.Collectors.toList());
                m.addAttribute("departureTimes", departureTimes);
                m.addAttribute("error", "Please select at least 1 adult or child passenger.");
                return "reservation/edit";
            }
            r.setNumberOfPassengers(noOfPassengers);
            r.setDepartureDate(depTs.toLocalDate());
            r.setTotalPrice(r.getFlight().getPrice() * r.getNumberOfPassengers());
            reservations.save(r);
            return "redirect:/reservations/payment/" + id;
        } catch (Exception e) {
            m.addAttribute("reservation", r);
            List<LocalDateTime> departureTimes = flights.findAll().stream()
                .map(Flight::getDepartureTime)
                .distinct()
                .sorted()
                .collect(java.util.stream.Collectors.toList());
            m.addAttribute("departureTimes", departureTimes);
            m.addAttribute("error", "Error updating reservation: " + e.getMessage());
            return "reservation/edit";
        }
    }

    /**
     * POST /reservations/{id}/cancel
     * Cancels a reservation if it is at least 10 days before the departure date.
     * - Otherwise, reloads the list with an error message showing days remaining.
     *
     * @return redirect to /reservations on success, or "reservation/list" with error
     */
    @PostMapping("/{id}/cancel")
    public String cancel(@PathVariable Integer id, HttpSession session, Model m) {
        Integer uid = (Integer) session.getAttribute(AuthController.UID);
        if (uid == null) return "redirect:/auth/login";

        Reservation r = reservations.findById(id).orElseThrow();
        if (!r.getPassenger().getPassengerId().equals(uid)) return "redirect:/reservations";

        // 10-day cancellation rule validation
        long days = ChronoUnit.DAYS.between(LocalDate.now(), r.getDepartureDate());
        if (days < 10) {
            m.addAttribute("items", reservations.findByPassenger_PassengerId(uid));
            m.addAttribute("error", "You can cancel only up to 10 days before departure. Current days until departure: " + days);
            return "reservation/list";
        }
        r.setStatus("CANCELED");
        reservations.save(r);
        return "redirect:/reservations";
    }
}
