package com.spring.mvc.jpa;

import java.time.LocalDate;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ReservationRepository extends JpaRepository<Reservation, Integer> {
    List<Reservation> findByPassenger_PassengerId(Integer passengerId);
    List<Reservation> findByDepartureDateAfter(LocalDate date);
}
