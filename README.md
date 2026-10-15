# MediCare+ — Hospital Management System

MediCare+ is a web-based healthcare management application built as a
Software Configuration Management (SCM) course project. It aims to help
hospitals manage patient records, appointments, prescriptions and
clinical operations securely.

> **Status:** Step 1 — project setup and homepage only.

## Technology Stack

| Layer     | Technology                  |
|-----------|-----------------------------|
| Frontend  | HTML5, CSS3, JavaScript     |
| Backend   | Node.js, Express            |
| Database  | MySQL (to be added later)   |
| SCM       | Git, GitHub                 |

## Project Structure

    MediCare-Plus/
    ├── frontend/        # HTML, CSS, JS
    │   ├── css/
    │   ├── js/
    │   └── index.html
    ├── backend/         # Express server
    │   ├── server.js
    │   └── package.json
    ├── .gitignore
    └── README.md

## Getting Started

1. Install [Node.js](https://nodejs.org) and Git.
2. Clone the repository and install dependencies:

       cd backend
       npm install

3. Copy `.env.example` to `.env`.
4. Start the server:

       npm run dev

5. Open http://localhost:5000 in your browser.

## Planned Modules
User & Authentication, Patient Records, Appointments, Electronic
Prescriptions, Administration & Security, Analytics & Reporting.