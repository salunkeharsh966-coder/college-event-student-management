# College Event & Student Management System

A beginner-friendly full-stack mini-project using React + Vite, Spring Boot, and MySQL.

## Requirements
- JDK 17 or newer
- Node.js LTS + npm
- MySQL Server
- Maven OR use `mvnw.cmd` if a Maven Wrapper is present in your environment

## 1. Create the database
Open MySQL Workbench or the MySQL command line and run:
```sql
CREATE DATABASE college_event_db;
```

## 2. Configure backend
Open `backend/src/main/resources/application.properties` and replace `YOUR_MYSQL_PASSWORD` with your MySQL password.
If your MySQL username differs, change `spring.datasource.username`.

From the `backend` folder run:
```powershell
mvn spring-boot:run
```
If Maven is not installed but `mvnw.cmd` exists, run:
```powershell
.\mvnw.cmd spring-boot:run
```
Backend URL: http://localhost:8080

## 3. Start frontend
Open a second terminal:
```powershell
cd frontend
npm install
npm run dev
```
Open the local URL Vite prints, usually http://localhost:5173.

## Main API endpoints
- GET/POST `/api/students`
- GET/DELETE `/api/students/{id}`
- GET/POST `/api/events`
- GET/DELETE `/api/events/{id}`
- GET/POST `/api/registrations`
- GET `/api/dashboard`

## Demo order
1. Add two students.
2. Create an event.
3. Register a student for the event.
4. Show the dashboard totals and registration list.

## Important
This is a mini-project starter for a local demonstration. It does not include login/authentication or production security. Do not use real sensitive personal data.


## Public deployment
See `DEPLOYMENT_GUIDE.md` for Render (Docker backend), hosted MySQL, and Vercel steps.
The frontend reads `VITE_API_BASE_URL`; the backend reads database settings and allowed origins from environment variables.
