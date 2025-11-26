# Backend README

## Supabase Configuration

This project uses Supabase for authentication and database services. The configuration is loaded from a `.env` file in this directory.

### IMPORTANT: Configuration Error

The application is currently failing to connect to Supabase because the configured `SUPABASE_URL` is not reachable. This is causing login and other features to fail.

The current invalid URL is: `https://vtqqtdcxhbfjbgwiygme.supabase.co`

### How to Fix

1.  **Rename `testenv.txt` to `.env`**: The environment variables are stored in `testenv.txt`. This file should be renamed to `.env` so that it is correctly and automatically loaded.

    ```bash
    mv testenv.txt .env
    ```

2.  **Find your correct Supabase URL**: Log in to your [Supabase Dashboard](https://supabase.com/dashboard). Navigate to your project's settings and find the API URL.

3.  **Update the `.env` file**: Open the `.env` file and replace the value of `SUPABASE_URL` with the correct URL from your Supabase project. You should also verify that `SUPABASE_ANON_KEY` and `SUPABASE_SERVICE_ROLE_KEY` are correct.

    Example:
    ```
    SUPABASE_URL=https://<your-project-ref>.supabase.co
    SUPABASE_ANON_KEY=<your-anon-key>
    SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
    ...
    ```

4.  **Restart the backend server**: After updating the `.env` file, you must restart the backend server for the changes to take effect.

## Security Vulnerabilities Todo List

Here is a list of security vulnerabilities that were identified in the backend code.

-   **[Critical] Broken Access Control & IDOR in `patientRoutes.js`**: `GET /patients/:id` allows anyone to access full medical and payment history of any patient.
-   **[Critical] Broken Access Control & IDOR in `referralRoutes.js`**: `GET /patient/:patientId`, `GET /referrals`, `GET /clinics`, `POST /add-clinic`, `PUT /clinic/:id` allow unauthorized access/modification.
-   **[High] Information Disclosure in `patientRoutes.js`**: `GET /patients` allows anyone to get a list of all patients.
-   **[Medium] Potential HTML Injection / XSS in Emails (`utils/email.js`)**: Data is not sanitized before being embedded in the HTML email body.
-   **[Low] Information Leakage through Logging (`middleware/checkAdmin.js`)**: Extensive logging could leak user and token information in production logs.
