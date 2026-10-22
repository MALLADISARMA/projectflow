# Project Management System

A Spring Boot-based project management backend providing authentication, projects, issues, comments, chat, invitations and messaging features.

## Key Features

- **Authentication:** JWT-based auth implemented under the config package.
- **Project management:** Create, update and list projects.
- **Issue tracking:** Create and manage issues with comments and invitations.
- **Real-time chat/message support:** Chat and message models, repositories and services.

## Tech Stack

- Java (Spring Boot)
- Maven (wrapper included)
- Spring Data JPA
- JWT for authentication

## Prerequisites

- Java 17 or newer
- Maven (optional if using the included wrapper)

## Quick start

1. Open a terminal at the repository root and change into the module folder:

```bash
cd projectmanagementsystem
```

2. Run using the Maven wrapper (Windows):

```powershell
mvnw.cmd spring-boot:run
```

Or (macOS / Linux):

```bash
./mvnw spring-boot:run
```

3. Build the jar:

```bash
./mvnw clean package
# or on Windows
mvnw.cmd clean package
```

4. Run tests:

```bash
./mvnw test
```

## Configuration

Application configuration is located in [projectmanagementsystem/src/main/resources/application.properties](projectmanagementsystem/src/main/resources/application.properties). Runtime settings can be overridden with environment variables:

| Variable | Default | Purpose |
| --- | --- | --- |
| `DB_URL` | `jdbc:mysql://localhost:3306/projectmanagementsystem?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=UTC` | MySQL JDBC URL |
| `DB_USERNAME` | `root` | MySQL username |
| `DB_PASSWORD` | empty | MySQL password |
| `DB_DDL_AUTO` | `update` | Hibernate schema behavior |
| `JWT_SECRET` | local-development-only value | JWT signing secret; set a private secret of at least 32 bytes outside local development |
| `MAIL_USERNAME`, `MAIL_PASSWORD` | empty | SMTP credentials |
| `RAZORPAY_API_KEY`, `RAZORPAY_API_SECRET` | empty | Razorpay credentials |
| `RAZORPAY_WEBHOOK_SECRET` | empty | Secret configured for the Razorpay webhook |
| `APP_FRONTEND_URL` | `http://localhost:5173` | Frontend base URL used for payment redirects |

Local startup uses MySQL on `localhost:3306`; set `DB_URL`, `DB_USERNAME`, and `DB_PASSWORD` to match your MySQL installation. Email and payment credentials are only needed when using those integrations. Tests use an isolated in-memory H2 database and do not require MySQL or external-service credentials.

For local development on Windows, edit the ignored `projectmanagementsystem/.env` file with your credentials, then run:

```powershell
.\run-local.ps1
```

The `.env` file is excluded from Git. `.env.example` is a credentials-free template; do not commit real passwords or API keys. To enable paid plan upgrades, configure a Razorpay webhook for `POST /webhooks/razorpay`, subscribe to the `payment_link.paid` event, and put its webhook signing secret in `RAZORPAY_WEBHOOK_SECRET`. The server validates the webhook signature and applies the plan only after payment confirmation; the frontend must not call a direct plan-upgrade endpoint.

Important JWT helpers are in the `config` package: [projectmanagementsystem/src/main/java/com/zosh/config](projectmanagementsystem/src/main/java/com/zosh/config).

## Main packages and entrypoints

- Application entry: [projectmanagementsystem/src/main/java/com/zosh/ProjectmanagementsystemApplication.java](projectmanagementsystem/src/main/java/com/zosh/ProjectmanagementsystemApplication.java)
- Controllers (REST API):
  - [projectmanagementsystem/src/main/java/com/zosh/controller/AuthController.java](projectmanagementsystem/src/main/java/com/zosh/controller/AuthController.java)
  - [projectmanagementsystem/src/main/java/com/zosh/controller/ProjectController.java](projectmanagementsystem/src/main/java/com/zosh/controller/ProjectController.java)
  - [projectmanagementsystem/src/main/java/com/zosh/controller/IssueController.java](projectmanagementsystem/src/main/java/com/zosh/controller/IssueController.java)
  - [projectmanagementsystem/src/main/java/com/zosh/controller/CommentController.java](projectmanagementsystem/src/main/java/com/zosh/controller/CommentController.java)
  - [projectmanagementsystem/src/main/java/com/zosh/controller/CommentController.java](projectmanagementsystem/src/main/java/com/zosh/controller/CommentController.java)

Check the `service` and `repository` packages for business logic and persistence.

## Running in production

- Build the jar with `./mvnw clean package` and run with `java -jar target/*.jar` after configuring production-ready properties.

## Contributing

- Fork, create a feature branch, run tests, and open a pull request.

## License

Add a license file to the repository if you wish to declare reuse terms.

---

If you'd like, I can also add a repository-level `README.md`, create `CONTRIBUTING.md`, or commit and push this change. Which would you prefer?
