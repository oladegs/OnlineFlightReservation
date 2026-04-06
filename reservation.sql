DROP DATABASE IF EXISTS reservation;
CREATE DATABASE reservation;
USE reservation;

-- Drop child table first because of foreign keys
DROP TABLE IF EXISTS Reservation;
DROP TABLE IF EXISTS Passenger;
DROP TABLE IF EXISTS Flight;

CREATE TABLE Passenger (
  passenger_id INT AUTO_INCREMENT PRIMARY KEY,
  email        VARCHAR(120) NOT NULL UNIQUE,
  password     VARCHAR(255) NOT NULL,    
  firstname    VARCHAR(80)  NOT NULL,
  lastname     VARCHAR(80)  NOT NULL,
  address      VARCHAR(255),
  city         VARCHAR(120),
  postalCode   VARCHAR(20)
);

CREATE TABLE Flight (
  flight_id       INT AUTO_INCREMENT PRIMARY KEY,
  airline_name    VARCHAR(120) NOT NULL,
  departure_time  DATETIME     NOT NULL,
  arrival_time    DATETIME     NOT NULL,
  origin          VARCHAR(120) NOT NULL,
  destination     VARCHAR(120) NOT NULL,
  price           FLOAT NOT NULL CHECK (price >= 0)
);

CREATE TABLE Reservation (
  reservation_id    INT AUTO_INCREMENT PRIMARY KEY,
  passenger_id      INT NOT NULL,
  flight_id         INT NOT NULL,
  booking_date      DATE NOT NULL,
  departure_date    DATE NOT NULL,
  no_of_passengers  INT NOT NULL CHECK (no_of_passengers >= 1),
  total_price       FLOAT NOT NULL CHECK (total_price >= 0),
  status            VARCHAR(20) NOT NULL,
  CONSTRAINT fk_res_passenger FOREIGN KEY (passenger_id) REFERENCES Passenger(passenger_id),
  CONSTRAINT fk_res_flight    FOREIGN KEY (flight_id) REFERENCES Flight(flight_id)
);

INSERT INTO Passenger (email, password, firstname, lastname, address, city, postalCode) VALUES
('sarah.miles@example.com',   'Pass@123',  'Sarah',   'Miles',   '45 Queen St W',     'Toronto',     'M5H 2N2'),
('daniel.nguyen@example.com', 'Welcome1',  'Daniel',  'Nguyen',  '92 Bay Street',     'Toronto',     'M5J 2S8'),
('fatima.khan@example.com',   'Secure#45', 'Fatima',  'Khan',    '18 King St E',      'Mississauga', 'L5B 1H8'),
('james.lee@example.com',     'MyPass99',  'James',   'Lee',     '120 Dundas St E',   'Scarborough', 'M1B 4X7'),
('olivia.brown@example.com',  'Travel@22', 'Olivia',  'Brown',   '230 Yonge Street',  'North York',  'M2N 5G3');

/* 
Flights for testing:
- 3 airlines: Air Canada, Emirates, KLM
- 4 cities: Toronto, New York, London, Dubai
- Main set starts in May 2026
- Lighter set also starts in May 2026
*/

-- MAIN: May 19 departures, May 19 + May 20 arrivals
INSERT INTO Flight (airline_name, departure_time, arrival_time, origin, destination, price)
SELECT
  a.airline_name,
  d.departure_time,
  r.arrival_time,
  o.city AS origin,
  x.city AS destination,
  CASE
    WHEN (o.city IN ('Toronto','New York') AND x.city IN ('Toronto','New York')) THEN 199.00
    WHEN (o.city IN ('Toronto','New York') AND x.city = 'London')
      OR (o.city = 'London' AND x.city IN ('Toronto','New York')) THEN 749.00
    WHEN (o.city IN ('Toronto','New York') AND x.city = 'Dubai')
      OR (o.city = 'Dubai' AND x.city IN ('Toronto','New York')) THEN 899.00
    WHEN (o.city = 'London' AND x.city = 'Dubai')
      OR (o.city = 'Dubai' AND x.city = 'London') THEN 799.00
    ELSE 599.00
  END AS price
FROM
  (SELECT 'Air Canada' AS airline_name UNION ALL
   SELECT 'Emirates' UNION ALL
   SELECT 'KLM') a
CROSS JOIN
  (SELECT '2026-05-19 09:00:00' AS departure_time UNION ALL
   SELECT '2026-05-19 18:00:00') d
CROSS JOIN
  (SELECT '2026-05-19 09:00:00' AS arrival_time UNION ALL
   SELECT '2026-05-19 18:00:00' UNION ALL
   SELECT '2026-05-20 09:00:00' UNION ALL
   SELECT '2026-05-20 18:00:00') r
CROSS JOIN
  (SELECT 'Toronto' AS city UNION ALL
   SELECT 'New York' UNION ALL
   SELECT 'London' UNION ALL
   SELECT 'Dubai') o
CROSS JOIN
  (SELECT 'Toronto' AS city UNION ALL
   SELECT 'New York' UNION ALL
   SELECT 'London' UNION ALL
   SELECT 'Dubai') x
WHERE o.city <> x.city
  AND r.arrival_time >= d.departure_time;

-- LIGHT: May 5 → May 6 subset (only Air Canada, Toronto ↔ New York)
INSERT INTO Flight (airline_name, departure_time, arrival_time, origin, destination, price)
SELECT
  'Air Canada' AS airline_name,
  d.departure_time,
  r.arrival_time,
  o.city AS origin,
  x.city AS destination,
  199.00 AS price
FROM
  (SELECT '2026-05-05 09:00:00' AS departure_time UNION ALL
   SELECT '2026-05-05 18:00:00') d
CROSS JOIN
  (SELECT '2026-05-06 09:00:00' AS arrival_time UNION ALL
   SELECT '2026-05-06 18:00:00') r
CROSS JOIN
  (SELECT 'Toronto' AS city UNION ALL
   SELECT 'New York') o
CROSS JOIN
  (SELECT 'Toronto' AS city UNION ALL
   SELECT 'New York') x
WHERE o.city <> x.city;

SELECT * FROM Passenger;
SELECT * FROM Flight;
SELECT * FROM Reservation;