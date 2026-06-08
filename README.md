# Lab System Allocation

A full-stack application for managing lab resources, batch allocation, student attendance, and overall lab operations. This project includes:

- **Backend**: Express + MongoDB API
- **Frontend**: React SPA with routing and dashboards

---

## What this project does

This system helps educational labs manage:

- Lab definitions and capacities
- Batch creation and allocation
- Student records and assigned batches
- Attendance tracking per batch and student
- Dashboard statistics for quick oversight

The UI supports navigation between the dashboard, labs, batches, students, allocations, and attendance screens.

---

## Project structure

- `backend/` - REST API server using Express and Mongoose
- `frontend/` - React application built with Create React App

### Backend folders

- `backend/models/` - Mongoose schemas for `Student`, `Batch`, `Lab`, and `Attendance`
- `backend/routes/` - API endpoints for managing data and operations
- `backend/server.js` - application entry point

### Frontend folders

- `frontend/src/` - React source files
- `frontend/src/pages/` - top-level page components
- `frontend/src/utils/api.js` - centralized API client and endpoint definitions

---

## Key features

- Create, read, update, and delete labs, batches, and students
- Assign or unassign students to batches
- Bulk allocation support
- Attendance marking and reporting
- Dashboard metrics including allocation status and attendance history
- Browser-based React navigation

---

## Technology stack

- Node.js + Express
- MongoDB + Mongoose
- React + React Router
- Axios for API communication
- React Hot Toast for notifications
- CORS support for local development

---

## Prerequisites

- Node.js 18+ installed
- npm or yarn installed
- MongoDB instance available

---

## Setup

### Backend

1. Open a terminal in `backend/`
2. Install dependencies:

```bash
cd backend
npm install
```

3. Create a `.env` file with your MongoDB connection string:

```env
MONGO_URI=mongodb://localhost:27017/lab-system
PORT=5000
```

4. Start the backend server:

```bash
npm run dev
```

The API will run at `http://localhost:5000` by default.

### Frontend

1. Open a terminal in `frontend/`
2. Install dependencies:

```bash
cd frontend
npm install
```

3. Start the React app:

```bash
npm start
```

The frontend runs at `http://localhost:3000` and proxies API requests to the backend.

---

## Backend API overview

### Student routes

- `GET /api/students` - list students
- `GET /api/students/:id` - get student details
- `POST /api/students` - create student
- `PUT /api/students/:id` - update student
- `DELETE /api/students/:id` - delete student

### Batch routes

- `GET /api/batches` - list batches with student counts
- `GET /api/batches/:id` - get batch details and student list
- `POST /api/batches` - create batch
- `PUT /api/batches/:id` - update batch
- `DELETE /api/batches/:id` - delete batch
- `GET /api/batches/:id/students` - students in a batch

### Lab routes

- `GET /api/labs` - list labs
- `GET /api/labs/:id` - get lab details
- `POST /api/labs` - create lab
- `PUT /api/labs/:id` - update lab
- `DELETE /api/labs/:id` - delete lab

### Allocation routes

- `POST /api/allocations/assign` - assign student to batch
- `POST /api/allocations/unassign` - remove student from batch
- `POST /api/allocations/bulk-assign` - allocate many students at once

### Attendance routes

- `GET /api/attendance` - list attendance records
- `POST /api/attendance` - mark or update attendance
- `GET /api/attendance/student/:studentId` - attendance summary for a student
- `GET /api/attendance/batch/:batchId` - attendance for a batch

### Dashboard route

- `GET /api/dashboard/stats` - fetch summary statistics and recent attendance

---

## Notes

- The frontend uses `proxy` to route API requests to `http://localhost:5000`.
- Batch allocation checks capacity before assigning students.
- Attendance entries are deduplicated by batch and date; repeated submissions update existing entries.

---

## Useful commands

From `backend/`

```bash
npm run dev
```

From `frontend/`

```bash
npm start
```

---

## Recommended next steps

- Seed some sample labs, batches, and students
- Use the dashboard to verify allocations and attendance tracking
- Extend the UI with search, filters, or export functionality

---

## License

This repository is provided as-is for lab allocation and attendance management demonstration.
