# Pharmacy Management System

A simple and useful pharmacy / medical store management app built with React, Express, MongoDB Atlas, and Tailwind CSS.

This version is focused on daily store work:
- medicine search by name on the dashboard
- simple inventory management
- supplier directory and restock tracking
- low stock and expiry alerts
- responsive UI for desktop and mobile

Authentication is currently disabled so the app opens directly into the store dashboard.

## Current Features

### Dashboard
- quick medicine search by name
- stock overview cards
- low stock shortlist
- upcoming expiry view
- recent restock activity

### Inventory
- add medicine with name, batch, expiry, and stock
- update medicine details
- increase, decrease, or set stock
- delete medicine
- search by medicine name or batch
- filter by all, low stock, out of stock, and expiring soon

### Suppliers
- add supplier details
- record restocks for existing medicines
- track recent restock entries

### Alerts
- low stock alerts
- out of stock alerts
- expiry warnings
- expired batch warnings

## Tech Stack

- Frontend: React, Vite, Tailwind CSS, Axios
- Backend: Node.js, Express
- Database: MongoDB Atlas with Mongoose

## Project Structure

```text
PMS/
├── backend/
│   ├── config/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   ├── .env
│   └── server.js
├── frontend/
│   ├── src/
│   ├── .env
│   └── vite.config.js
└── README.md
```

## Setup

### 1. Clone the project

```bash
git clone <your-repo-url>
cd PMS
```

### 2. Install dependencies

```bash
cd backend
npm install
```

```bash
cd ../frontend
npm install
```

## Environment Variables

### Backend

Create `backend/.env` and add:

```env
PORT=5050
MONGO_URI="your-mongodb-atlas-connection-string"
MONGO_DB_NAME=pharmacy_management
LOW_STOCK_THRESHOLD=20
GOOGLE_CLIENT_ID=optional-for-now
```

### Frontend

Create `frontend/.env` and add:

```env
VITE_BACKEND_PORT=5050
VITE_GOOGLE_CLIENT_ID=optional-for-now
```

## Run The App

### Start backend

```bash
cd backend
npm start
```

Backend runs on:

```text
http://127.0.0.1:5050
```

### Start frontend

```bash
cd frontend
npm run dev
```

Frontend runs on:

```text
http://127.0.0.1:5173
```

## Important Note About Port 5050

The backend uses port `5050` because port `5000` can conflict with macOS system services on some machines.

If you change the backend port:
- update `backend/.env`
- update `frontend/.env`

## How To Use

### Add a medicine
1. Open Inventory
2. Enter medicine name, batch number, expiry date, and stock
3. Save the medicine

If the same medicine name and batch already exist, the app will restock that batch instead of creating a duplicate.

### Update or manage stock
1. Open Inventory
2. Select a medicine from the list
3. Edit details or adjust stock

### Add a supplier
1. Open Suppliers
2. Enter supplier name, contact, and phone
3. Save the supplier

### Record a restock
1. Open Suppliers
2. Select supplier
3. Select medicine
4. Enter quantity received
5. Save restock

### Search medicine from dashboard
1. Open Dashboard
2. Type the medicine name in the search box
3. Check stock, batch, and expiry details

## API Overview

### Health
- `GET /api/health`

### Inventory
- `GET /api/inventory`
- `POST /api/inventory`
- `PATCH /api/inventory/:id`
- `PATCH /api/inventory/:id/stock`
- `DELETE /api/inventory/:id`

### Suppliers
- `GET /api/suppliers`
- `POST /api/suppliers`
- `GET /api/suppliers/purchases`
- `POST /api/suppliers/purchases`

### Alerts
- `GET /api/alerts`

## Available Scripts

### Backend

```bash
npm start
npm run dev
```

### Frontend

```bash
npm run dev
npm run build
npm run lint
```

## Current Status

Implemented:
- dashboard medicine search
- responsive inventory page
- supplier and restock management
- alert system
- MongoDB Atlas connection

Temporarily removed:
- active login flow
- active Google authentication flow
- selling price and cost price from the main workflow

## Troubleshooting

### MongoDB connected but frontend still fails
- make sure backend is running on `5050`
- make sure frontend proxy points to the same backend port
- check `http://127.0.0.1:5050/api/health`

### Blank or failed API data
- confirm MongoDB Atlas IP access is allowed
- confirm your `MONGO_URI` is correct
- restart both frontend and backend after editing `.env`

### Port already in use
- change the backend port in `backend/.env`
- update the same port in `frontend/.env`

## Future Improvements

- billing page
- printable invoice
- customer history
- sales reports
- role-based authentication

## Author

Built for pharmacy / medical store management and improved for a simple day-to-day workflow.
