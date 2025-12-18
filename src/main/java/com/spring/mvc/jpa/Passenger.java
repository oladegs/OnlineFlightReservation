package com.spring.mvc.jpa;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Entity
@Table(name = "Passenger")  
public class Passenger {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "passenger_id")
    private Integer passengerId;

    // Login identifier – unique and required
    @NotBlank
    @Email
    @Size(max = 120)
    @Column(name = "email")
    private String email;

    // Demo only: store a hash in real apps
    @NotBlank
    @Size(min = 6, max = 255)
    @Column(name = "password")
    private String password;

    @NotBlank
    @Size(max = 80)
    @Column(name = "firstname")
    private String firstname;

    @NotBlank
    @Size(max = 80)
    @Column(name = "lastname")
    private String lastname;

    @Size(max = 255)
    @Column(name = "address")
    private String address;

    @Size(max = 120)
    @Column(name = "city")
    private String city;

    @Size(max = 20)
    @Column(name = "postalCode")
    private String postalCode;

	public Passenger() {
		super();
	}

	public Integer getPassengerId() {
		return passengerId;
	}

	public void setPassengerId(Integer passengerId) {
		this.passengerId = passengerId;
	}

	public String getEmail() {
		return email;
	}

	public void setEmail(String email) {
		this.email = email;
	}

	public String getPassword() {
		return password;
	}

	public void setPassword(String password) {
		this.password = password;
	}

	public String getFirstname() {
		return firstname;
	}

	public void setFirstname(String firstname) {
		this.firstname = firstname;
	}

	public String getLastname() {
		return lastname;
	}

	public void setLastname(String lastname) {
		this.lastname = lastname;
	}

	public String getAddress() {
		return address;
	}

	public void setAddress(String address) {
		this.address = address;
	}

	public String getCity() {
		return city;
	}

	public void setCity(String city) {
		this.city = city;
	}

	public String getPostalCode() {
		return postalCode;
	}

	public void setPostalCode(String postalCode) {
		this.postalCode = postalCode;
	}
}
