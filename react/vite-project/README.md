# ProjectFlow UI

This React/Vite frontend connects to the Spring Boot API in `../../projectmanagementsystem`.

## Run locally on Windows

1. Start MySQL and configure the backend database settings as described in the backend README.
2. In a terminal, start the backend:

   ```powershell
   cd E:\projectflow\projectmanagementsystem
   .\mvnw.cmd spring-boot:run
   ```

   The backend listens on `http://localhost:5454`.

3. In a second terminal, start the UI:

   ```powershell
   cd E:\projectflow\react\vite-project
   npm install
   npm run dev
   ```

4. Open the Vite URL printed in the terminal (normally `http://localhost:5173`), then create an account or sign in.

## Frontend features

- Separate sign-up and sign-in pages, with the JWT-backed session kept in browser storage.
- Project list, category/search filters, project creation/editing/deletion, and email invitations.
- Project workspace with tasks, status/assignee updates, task comments, and team chat.
- Profile and subscription pages. Paid plans use the backend's Razorpay payment-link endpoint; the subscription changes only after the backend receives payment confirmation.
- Invitation links open publicly at `/accept_invitation?token=...`. Recipients can sign in or create an account, then are returned to the invitation and added to the project. They must use the email address that received the invite.

The UI uses `http://localhost:5454` by default. To use a different backend, create a `.env` file beside `package.json` and set `VITE_API_URL`; `.env.example` shows the expected format. Restart Vite after changing environment variables.
