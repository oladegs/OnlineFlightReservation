package com.spring.mvc.jpa;

import org.springframework.data.jpa.repository.JpaRepository;

public interface PassengerRepository extends JpaRepository<Passenger, Integer>{
    Passenger findByEmail(String email);
    boolean existsByEmail(String email);
}
