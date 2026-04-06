# Online Flight Reservation System

A Spring Boot MVC web application for managing flights and passenger reservations. The system uses Thymeleaf for the UI, Spring Data JPA with Hibernate for persistence, and MySQL as the database.

## Project Overview

This project was built as a COMP303 Enterprise Java assignment. It allows passengers to register, log in, browse available flights, create reservations, review booking details, complete a mock payment step, manage their profile, and update or cancel reservations based on business rules.

## Features

- Passenger sign up and login with session-based authentication
- View and update passenger profile information
- Flight listing and flight CRUD management
- Search available flights by route
- Create a reservation from the flight selection page or reservation form
- Review reservation details before confirmation
- Mock payment processing that marks reservations as `CONFIRMED`
- Edit an existing reservation and recalculate total cost
- Cancel a reservation if departure is at least 10 days away
- Seed SQL script for database creation and sample data

## Tech Stack

- Java 17
- Spring Boot 3
- Spring MVC
- Spring Data JPA / Hibernate
- Thymeleaf
- MySQL
- Maven

## Project Structure

```text
OnlineFlightReservationSystem/
|-- src/main/java/com/spring/mvc/jpa
|   |-- AuthController.java
|   |-- FlightController.java
|   |-- HomeController.java
|   |-- ProfileController.java
|   |-- ReservationController.java
|   |-- Flight.java
|   |-- Passenger.java
|   |-- Reservation.java
|   |-- FlightRepository.java
|   |-- PassengerRepository.java
|   |-- ReservationRepository.java
|   `-- OnlineFlightReservationSystemApplication.java
|-- src/main/resources
|   |-- application.properties
|   |-- static/
|   `-- templates/
|-- reservation.sql
|-- pom.xml
|-- mvnw
|-- mvnw.cmd
`-- README.md
```

## Database Setup

1. Open MySQL.
2. Run the SQL script provided in [`reservation.sql`](./reservation.sql).
3. The script will:
   - create the `reservation` database
   - create the `Passenger`, `Flight`, and `Reservation` tables
   - insert sample passengers and flights

The application is currently configured with:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/reservation
spring.datasource.username=root
spring.datasource.password=Freedom57!!
server.port=9091
spring.jpa.hibernate.ddl-auto=validate
```

If your local MySQL username or password is different, update `src/main/resources/application.properties` before running the application.

## How to Run

### Option 1: Using Maven Wrapper

On Windows:

```powershell
.\mvnw.cmd spring-boot:run
```

On macOS/Linux:

```bash
./mvnw spring-boot:run
```

### Option 2: Using Maven

```bash
mvn spring-boot:run
```

After startup, open:

```text
http://localhost:9091/
```

## Main Application Flow

1. Register a new passenger account or log in with an existing one.
2. Browse flights and search by origin/destination.
3. Select flight details and number of passengers.
4. Create a reservation.
5. Review and confirm the reservation.
6. Complete the mock payment form.
7. Manage reservations from the reservations page.
8. Edit profile information as needed.

## Business Rules Implemented

- A passenger must be logged in to manage flights, reservations, or profile data.
- A reservation must contain at least one passenger.
- Total reservation price is calculated from flight price x number of passengers.
- Reservation status starts as `PENDING` and becomes `CONFIRMED` after successful payment.
- A reservation can only be cancelled when the departure date is at least 10 days away.
- Profile updates allow password changes, but the password field can be left blank when updating other details.

## Important Notes

- Passwords are stored in plain text in this lab project for simplicity. In a real application, they should be hashed and secured properly.
- Payment processing is mocked and always succeeds in the current implementation.
- Hibernate is set to `validate`, so the MySQL schema must already exist before the application starts.

## Sample Data

The SQL script includes:

- sample passenger accounts
- sample flights across multiple airlines and routes
- enough seeded data to test booking, editing, and cancellation scenarios

## Screenshots

Project screenshots are included in:

- `Screenshots_FlightReserve.pdf`

## Author

Farouk Oladega
