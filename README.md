StyleRent 👗
Smart Clothing Rental & Inventory Management Platform
StyleRent is a modern, responsive frontend application designed for a clothing rental and boutique inventory management platform. It provides customers with an intuitive way to discover clothing, check rental availability, select rental dates, and manage their rentals, while providing dedicated interfaces for boutique owners and administrators.
Frontend Repository — This repository contains the frontend implementation of StyleRent.

🎯 Objectives

Provide a modern digital clothing rental experience
Simplify clothing discovery and rental booking
Display clothing availability based on rental dates
Provide size, color, category, and price filtering
Create dedicated dashboards for customers, owners, and administrators
Build a scalable frontend ready for Spring Boot REST API integration

✨ Features

👤 Customer

Registration and login interface
Clothing catalog
Search and filtering
Clothing details
Size and color selection
Rental date selection
Rental booking interface
Payment interface
Rental history
Rental status tracking
Profile management
Reviews and ratings

🧑‍💼 Boutique Owner

Owner dashboard
Clothing management
Add/edit/delete clothing UI
Inventory management
Size and color management
Stock monitoring
Rental management
Revenue and rental overview

🛡️ Administrator

Admin dashboard
User management interface
Clothing management
Rental monitoring
Inventory monitoring
Reports and statistics
Platform activity overview

🛠️ Technology Stack

Technology
Purpose
React.js
Frontend framework
Bootstrap / Tailwind CSS
UI and responsive design
Axios
REST API communication
Java 17
Backend technology planned
Spring Boot 3.x
Backend REST API planned
Spring Security + JWT
Authentication planned
Spring Data JPA + Hibernate
Data layer planned
MySQL 8
Database planned
Maven
Backend build tool
JUnit 5
Backend testing
Swagger / OpenAPI
API documentation
Technology Constraint
This project follows the Java technology stack for the backend.
Python, Django, Flask, PHP, and other backend technologies are not used.

🏗️ Frontend Architecture

                    StyleRent
                       │
                       ▼
                 React.js UI
                       │
          ┌────────────┼────────────┐
          ▼            ▼            ▼
      Customer       Owner        Admin
          │            │            │
          └────────────┼────────────┘
                       ▼
                    Axios
                       │
                       ▼
             Spring Boot REST API
                       │
                       ▼
                    MySQL
                    
📂 Project Structure

src/
├── components/
├── pages/
├── layouts/
├── services/
├── hooks/
├── context/
├── assets/
├── data/
├── utils/
└── App.jsx

🔄 Main User Flow

Home
 ↓
Register / Login
 ↓
Browse Clothing
 ↓
View Clothing Details
 ↓
Check Availability
 ↓
Select Rental Dates
 ↓
Rental Booking
 ↓
Payment
 ↓
Rental Tracking
 ↓
Return

🎨 UI Highlights

Responsive design
Fashion-focused visual identity
Reusable React components
Clean navigation
Product cards
Advanced filtering
Dashboard cards
Rental status indicators
Form validation
Loading and error states
Mobile-friendly layouts

🔌 Backend Integration

The frontend is structured to connect with the planned Java backend through REST APIs:
React.js
    ↓
Axios
    ↓
Spring Boot REST API
    ↓
Spring Security + JWT
    ↓
Spring Data JPA / Hibernate
    ↓
MySQL 8
During frontend development, mock data can be used until the Spring Boot backend APIs are available.

🚀 Future Enhancements

AI-based clothing recommendations
QR/barcode-based inventory tracking
Email rental reminders
Advanced analytics
Multi-boutique support
Mobile application
Real-time notifications

👨‍💻 Project Information

Project Name: StyleRent
Project Type: Clothing Rental & Inventory Management Platform
Repository: Frontend
Frontend: React.js
UI: Bootstrap / Tailwind CSS
API Client: Axios
Backend: Java 17 + Spring Boot 3.x
Database: MySQL 8

📌 Project Status

Frontend: 🚧 In Development
Backend: 🔜 Planned
Database Integration: 🔜 Planned
API Integration: 🔜 Planned

⭐ Repository Description

StyleRent — A modern React-based clothing rental and inventory management platform designed for customers, boutique owners, and administrators.
