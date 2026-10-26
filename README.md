# 🎬 IMovies — Movie Ticket Booking Made Simple

A complete, production-grade full-stack movie ticket booking web application built with the **MERN** stack (MongoDB Atlas, Express.js, React, Node.js) and Bootstrap 5.

Designed for technical reviews, project viva examinations, and real-world cinema ticketing workflows.

---

## 📌 Table of Contents

- [Architectural Overview](#architectural-overview)
- [Technology Stack](#technology-stack)
- [Monorepo Project Structure](#monorepo-project-structure)
- [Prerequisites](#prerequisites)
- [Environment Configuration](#environment-configuration)
- [Installation and Setup](#installation-and-setup)
- [Database Seeding](#database-seeding)
- [Running the Application](#running-the-application)
- [REST API Reference](#rest-api-reference)
- [Booking & Concurrency Architecture](#booking--concurrency-architecture)
- [Simulated Payment Gateway](#simulated-payment-gateway)
- [Automated Testing](#automated-testing)
- [Role-Based Access Control](#role-based-access-control)

---

## 🏗️ Architectural Overview

IMovies is structured as a decoupled monorepo separating the frontend React Single Page Application (SPA) from the backend Express REST API:

```
                      +-----------------------------+
                      |       Client (Vite/React)    |
                      |   Port 5173 / Bootstrap 5   |
                      +--------------+--------------+
                                     |
                                     | Axios HTTP (Bearer JWT)
                                     v
                      +-----------------------------+
                      |   Server (Express.js/Node)  |
                      |   Port 5000 / RESTful API   |
                      |   Helmet, RateLimit, CORS   |
                      +--------------+--------------+
                                     |
                                     | Mongoose ODM (TLS)
                                     v
                      +-----------------------------+
                      |    MongoDB Atlas Cluster    |
                      |    Persistent Collections   |
                      +-----------------------------+
```

---

## 💻 Technology Stack

### Frontend
- **Framework:** React 18.x
- **Build Tool:** Vite 6.x
- **Routing:** React Router DOM 6.x
- **UI & Icons:** Bootstrap 5.3 + Bootstrap Icons
- **HTTP Client:** Axios with centralized interceptors (Bearer token auto-injection)
- **Notifications:** React Toastify
- **State Management:** React Context API (`AuthContext`)

### Backend
- **Runtime:** Node.js (v20+)
- **Framework:** Express.js (ES Modules)
- **Database Driver:** Mongoose 8.x
- **Security:** Helmet, express-rate-limit, cors, bcryptjs, jsonwebtoken
- **Validation:** express-validator
- **Logging:** Morgan

### Database
- **Provider:** MongoDB Atlas (Cloud)
- **Collections:** `users`, `movies`, `theatres`, `shows`, `bookings`
- **Persistence:** Strictly persistent document collections with indexes, references, and server-side constraints.

---

## 📁 Monorepo Project Structure

```
IMovies/
├── client/                     # Frontend React application
│   ├── public/                 # Static public assets
│   ├── src/
│   │   ├── components/common/  # Navbar, Footer, MovieCard, ProtectedRoute
│   │   ├── context/            # AuthContext (user state, token storage, logout)
│   │   ├── pages/              # Route views
│   │   │   ├── HomePage.jsx                 # Hero, featured movies & system diagnostics
│   │   │   ├── MoviesPage.jsx               # Movie catalog with search, filters & pagination
│   │   │   ├── MovieDetailsPage.jsx         # Movie details & showtimes grouped by theatre
│   │   │   ├── SeatSelectionPage.jsx        # Interactive auditorium seat layout map
│   │   │   ├── CheckoutPage.jsx             # Order summary & simulated payment gateway
│   │   │   ├── BookingConfirmationPage.jsx  # Electronic cinema pass / ticket view
│   │   │   ├── MyBookingsPage.jsx           # Customer ticket wallet & cancellations
│   │   │   ├── AdminDashboardPage.jsx       # Admin portal (Movies, Theatres, Shows, Bookings)
│   │   │   ├── LoginPage.jsx                # Authentication sign-in
│   │   │   ├── RegisterPage.jsx             # User account creation
│   │   │   ├── ProfilePage.jsx              # User profile & account overview
│   │   │   └── NotFoundPage.jsx             # 404 handler
│   │   ├── services/           # Axios service clients
│   │   │   ├── api.js          # Base Axios instance with token interceptors
│   │   │   ├── authService.js
│   │   │   ├── movieService.js
│   │   │   ├── theatreService.js
│   │   │   ├── showService.js
│   │   │   ├── bookingService.js
│   │   │   ├── paymentService.js
│   │   │   └── adminService.js
│   │   ├── App.jsx             # Router and AuthProvider orchestrator
│   │   ├── index.css           # Cinema dark theme design
│   │   └── main.jsx            # React root mount
│   ├── index.html
│   └── package.json
├── server/                     # Backend Express REST API
│   ├── config/
│   │   └── db.js               # MongoDB Atlas connection manager & graceful shutdown
│   ├── controllers/            # Route business logic handlers
│   │   ├── authController.js
│   │   ├── movieController.js
│   │   ├── theatreController.js
│   │   ├── showController.js
│   │   ├── bookingController.js
│   │   ├── paymentController.js
│   │   └── adminController.js
│   ├── middleware/             # Auth, RBAC, error & not-found handlers
│   │   ├── auth.js             # protect & authorize middleware
│   │   └── errorHandler.js
│   ├── models/                 # Mongoose schemas
│   │   ├── User.js
│   │   ├── Movie.js
│   │   ├── Theatre.js
│   │   ├── Show.js
│   │   └── Booking.js
│   ├── routes/                 # Express API route modules
│   │   ├── healthRoutes.js
│   │   ├── authRoutes.js
│   │   ├── movieRoutes.js
│   │   ├── theatreRoutes.js
│   │   ├── showRoutes.js
│   │   ├── bookingRoutes.js
│   │   ├── paymentRoutes.js
│   │   └── adminRoutes.js
│   ├── services/
│   │   └── paymentService.js   # Idempotent payment simulator
│   ├── scripts/
│   │   ├── seedAdmin.js        # Administrator bootstrap script
│   │   └── seedData.js         # Sample movies, theatres & shows seeder
│   ├── test/                   # Automated Node.js test suite
│   │   ├── health.test.js
│   │   ├── auth.test.js
│   │   ├── movies.test.js
│   │   ├── theatres_shows.test.js
│   │   └── bookings_payments.test.js
│   ├── app.js                  # Express middleware setup & route binding
│   ├── server.js               # Server entry point & graceful listener
│   └── package.json
├── .gitignore
├── package.json                # Monorepo root scripts (concurrently dev runner)
└── README.md
```

---

## ⚙️ Environment Configuration

### Backend (`server/.env`)

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-host>/imovies?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_at_least_32_characters_long
CLIENT_URL=http://localhost:5173
```

### Frontend (`client/.env`)

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

---

## 📦 Installation and Setup

```bash
# 1. Install all monorepo dependencies (root, server, client)
npm run install:all

# Or manually:
npm install
cd server && npm install
cd ../client && npm install
cd ..
```

---

## 🎬 Database Seeding

Populate initial movies, theatres, screen configurations, and upcoming shows into your MongoDB Atlas cluster:

```bash
# Seed initial sample cinema catalog
npm run seed:data

# Bootstrap the default administrator account
ADMIN_EMAIL=admin@imovies.com ADMIN_PASSWORD=AdminPass123! npm run seed:admin
```

---

## 🏃 Running the Application

### Option A: Run Both Concurrently (Recommended)
From the root directory:
```bash
npm run dev
```
- **Backend API:** [http://localhost:5000](http://localhost:5000)
- **Frontend App:** [http://localhost:5173](http://localhost:5173)

### Option B: Run Individually
```bash
# In Terminal 1 (Backend):
npm run server

# In Terminal 2 (Frontend):
npm run client
```

---

## 🔑 REST API Reference

### System Health
| Endpoint | Method | Access | Description |
| :--- | :--- | :--- | :--- |
| `/api/health` | `GET` | Public | Distinguishes API uptime from MongoDB connection readiness |

### Authentication
| Endpoint | Method | Access | Description |
| :--- | :--- | :--- | :--- |
| `/api/auth/register` | `POST` | Public | Register new customer account (strictly forces `USER` role) |
| `/api/auth/login` | `POST` | Public | Authenticate user & return signed JWT |
| `/api/auth/me` | `GET` | Private | Retrieve authenticated user profile |
| `/api/auth/admin-check`| `GET` | Private (Admin)| Verifies administrator privileges |

### Movies Catalog
| Endpoint | Method | Access | Description |
| :--- | :--- | :--- | :--- |
| `/api/movies` | `GET` | Public | List movies with search, genre/language filter & pagination |
| `/api/movies/:id` | `GET` | Public | Retrieve detailed movie record by ID |
| `/api/movies` | `POST` | Admin | Create a new movie record |
| `/api/movies/:id` | `PUT` | Admin | Update existing movie record |
| `/api/movies/:id` | `DELETE` | Admin | Delete movie record |

### Theatres & Screens
| Endpoint | Method | Access | Description |
| :--- | :--- | :--- | :--- |
| `/api/theatres` | `GET` | Public | List cinema theatres (with optional city filter) |
| `/api/theatres/:id` | `GET` | Public | Get theatre details & screen capacities |
| `/api/theatres` | `POST` | Admin | Add a new cinema theatre location |
| `/api/theatres/:id` | `PUT` | Admin | Update theatre location information |
| `/api/theatres/:id` | `DELETE` | Admin | Remove theatre location |

### Show Scheduling
| Endpoint | Method | Access | Description |
| :--- | :--- | :--- | :--- |
| `/api/shows` | `GET` | Public | Query shows by movie, theatre, date, and city |
| `/api/shows/:id` | `GET` | Public | Retrieve show details, seat availability & screen layout |
| `/api/shows` | `POST` | Admin | Schedule show with automatic overlap conflict detection |
| `/api/shows/:id` | `PUT` | Admin | Update show details with schedule conflict checking |
| `/api/shows/:id` | `DELETE` | Admin | Cancel or delete show schedule |

### Seat Selection & Bookings
| Endpoint | Method | Access | Description |
| :--- | :--- | :--- | :--- |
| `/api/bookings` | `POST` | Private | Reserve seats with atomic concurrency lock & pending state |
| `/api/bookings/my-bookings` | `GET` | Private | Retrieve current user's tickets & booking history |
| `/api/bookings/:id` | `GET` | Private | Get booking details (enforces ownership or Admin role) |
| `/api/bookings/:id/cancel` | `POST` | Private | Cancel booking and atomically release seats to auditorium |
| `/api/bookings/admin/all` | `GET` | Admin | Administrator oversight of all customer bookings |

### Simulated Payments
| Endpoint | Method | Access | Description |
| :--- | :--- | :--- | :--- |
| `/api/payments/process` | `POST` | Private | Process simulated payment (CARD, UPI, Net Banking) & confirm booking |

### Administrator Suite
| Endpoint | Method | Access | Description |
| :--- | :--- | :--- | :--- |
| `/api/admin/stats` | `GET` | Admin | Aggregated database metrics (movies, theatres, shows, revenue) |

---

## 🔒 Booking & Concurrency Architecture

To eliminate race conditions and double-booking bugs:
1. **Atomic Conditional Holds:** When a customer selects seats, the server executes a MongoDB conditional atomic update:
   ```javascript
   Show.findOneAndUpdate({
     _id: showId,
     bookedSeats: { $nin: selectedSeats },
     "heldSeats.seatNumber": { $nin: selectedSeats }
   }, {
     $push: { heldSeats: { $each: holdItems } }
   });
   ```
2. **Double-Booking Immunity:** If another user is booking simultaneously, the atomic query matches 0 documents and immediately returns HTTP 409 Conflict, ensuring two customers can never reserve the same seat.
3. **Automatic Hold Expiry:** Seat holds expire after 10 minutes if uncompleted. Expired holds are automatically purged by database operations.
4. **Server-Side Price Calculation:** Ticket prices and order totals are calculated exclusively on the backend from the Show's `ticketPrice`, ignoring any client-sent totals.

---

## 💳 Simulated Payment Gateway

For academic demonstration and technical reviews, IMovies implements a full transaction lifecycle:
- Supports **Credit/Debit Card**, **UPI Instant Payment**, and **Net Banking**.
- **Successful Simulation:** Transitions booking status to `CONFIRMED`, assigns unique transaction ID (`TXN-XXXXXX`), and permanently marks seats as booked.
- **Failure Simulation:** Demonstrates card decline handling, transitions booking to `EXPIRED`, and immediately releases the reserved seats back into the auditorium pool.
- **Idempotency:** Rejects duplicate confirmation attempts on already-confirmed tickets.

---

## 🧪 Automated Testing

Run the full backend test suite:
```bash
npm test --prefix server
```

The automated test suite runs **26 unit and integration tests** verifying:
- Password hashing and verification with bcrypt
- JWT generation, expiry, and signature tampering rejection
- Role-based authorization (`protect` and `authorize('ADMIN')`)
- Public registration role enforcement (rejects self-assigned admin)
- Duplicate email prevention and generic login error messaging
- Movie CRUD operations, search filters, and server-side pagination
- Theatre and screen layout validations
- Show schedule conflict and overlap prevention
- Atomic seat hold and double-booking concurrency rejection
- Booking cancellation and automatic seat release
- Payment simulation approval and decline workflows
- System health diagnostic schema

Verify the frontend production build:
```bash
npm run build --prefix client
```

---

## 🛡️ Role-Based Access Control

- **`USER`:** Can browse catalog, view showtimes, select seats, complete simulated checkout, view electronic tickets, and cancel bookings.
- **`ADMIN`:** Full access to the Administrator Control Room (`/admin`), including live database metric aggregation, movie CRUD management, theatre and screen configuration, show scheduling with conflict guards, and platform-wide booking audits.
