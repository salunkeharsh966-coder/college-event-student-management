# Deployment Guide — College Event & Student Management System

## Before deploying
This project has a React + Vite frontend, Spring Boot 3 / Java 17 backend, and MySQL database.
The ZIP contains the application source. It does not contain a hosted database or real production credentials.

## 1. Push the project to GitHub
1. Extract this ZIP.
2. Create a new GitHub repository.
3. Upload/push the contents of the `college-event-student-management` folder so that `backend/` and `frontend/` are at the repository root.
4. Do not commit real database passwords.

## 2. Database
The backend uses MySQL. You need a MySQL server reachable from Render (a managed external MySQL provider or your own hosted MySQL server).
Create a database named `college_event_db` if your provider does not create one automatically.
Keep the database host, port, database name, username, and password from your provider. Do not use `localhost` for a database hosted elsewhere.

## 3. Deploy backend to Render
1. In Render, create a new Web Service and connect the GitHub repository.
2. Choose Docker as the runtime/environment.
3. Set the Root Directory to `backend` if Render asks for it. Dockerfile path should then be `Dockerfile`.
4. Add these environment variables:
   - `SPRING_DATASOURCE_URL` = `jdbc:mysql://DB_HOST:DB_PORT/college_event_db?useSSL=true&allowPublicKeyRetrieval=true&serverTimezone=UTC`
   - `SPRING_DATASOURCE_USERNAME` = your database username
   - `SPRING_DATASOURCE_PASSWORD` = your database password
   - `APP_CORS_ALLOWED_ORIGINS` = your exact Vercel site URL, e.g. `https://your-project.vercel.app`
5. Deploy and wait for the service to finish building.
6. Copy the public Render URL, for example `https://your-api.onrender.com`.
7. Test `https://your-api.onrender.com/api/dashboard` after the database is configured. It should return JSON totals.

Important: Replace `DB_HOST` and `DB_PORT` with the real values supplied by your MySQL host. Do not include angle brackets or spaces. Database provider connection requirements may vary.

## 4. Deploy frontend to Vercel
1. Import the same GitHub repository into Vercel.
2. Set Root Directory to `frontend`.
3. Framework preset: Vite. Build command: `npm run build`. Output directory: `dist`.
4. Add environment variable:
   - `VITE_API_BASE_URL` = `https://YOUR-RENDER-SERVICE.onrender.com/api`
5. Deploy. If you change this environment variable later, redeploy the frontend.

## 5. Connect CORS
After the Vercel deployment is ready, copy the exact production URL and set it as `APP_CORS_ALLOWED_ORIGINS` on Render. If you have both a Vercel production URL and a preview URL, comma-separate the origins. Save the change and redeploy/restart the Render service.

## 6. Smoke-test the live application
- Open the Vercel URL and refresh the Dashboard.
- Add a test student with a unique email.
- Create a test event.
- Register the student for the event.
- Verify the dashboard totals and registration list update.
- Try deleting a test student/event only after confirming the expected behaviour.

## API endpoints
- `GET /api/students`
- `POST /api/students`
- `GET /api/students/{id}`
- `DELETE /api/students/{id}`
- `GET /api/events`
- `POST /api/events`
- `DELETE /api/events/{id}`
- `GET /api/registrations`
- `POST /api/registrations`
- `GET /api/dashboard`

## Limitations to disclose honestly in a college report
- This is an academic mini-project, not a production-hardened application.
- It does not implement login, role-based access control, or authentication.
- It needs a separately hosted MySQL database for public deployment.
- Do not use real sensitive student information in a public demo.
