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

Application configuration is located in [projectmanagementsystem/src/main/resources/application.properties](projectmanagementsystem/src/main/resources/application.properties). Update database settings, JWT secrets, and other environment-specific values there or via environment variables.

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
