
# Role-Based Access Control (RBAC) API

Overview

This API implements Role-Based Access Control (RBAC) for managing users, roles, and permissions. It allows you to register users, assign roles to users, assign permissions to roles, and manage access control in your system. The API also provides secure authentication using JWT and supports password reset functionality via email.

## Features


User Management: Register, login, update user details, and delete users.

- Role Management: Assign roles to users, create new roles, and fetch all roles.

- Permission Management: Create, read, and assign permissions to roles.

- JWT Authentication: Secure login with JWT, with token expiration and role-based access control.

- Password Reset: Forgot password functionality with email verification.

- Role-Permission Management: Assign specific permissions to roles and fetch the permissions of a role.

- Swagger API Documentation: Provides interactive documentation to explore and test API endpoints.

## Technology Used

- Node.js with Express.js for the backend framework.
- MySQL for database management.
- JWT (JSON Web Token) for authentication.
- Nodemailer for email handling (password reset).
- bcryptjs for hashing passwords.
- Swagger for API documentation.
- dotenv for environment variable management.
## How to Set Up

1. Clone the repository to your local machine.
2. Install dependencies by running pnpm install.
3. Configure your environment: Create a .env file and add your database and email settings.
4. Start the server: Run the server using pnpm start.
5. Access the API: The API will run at http://localhost:5000/. You can also access the Swagger documentation at http://localhost:5000/api-docs.
## Swagger API Documentation


The API has interactive documentation using Swagger UI. You can visit it at http://localhost:5000/api-docs to see all available endpoints, their descriptions, and try them out directly from the documentation.

