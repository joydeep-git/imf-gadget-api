# IMF Gadget API (TypeScript)

Welcome to the **IMF Gadget API** built with **Node.js**, **TypeScript**, **PostgreSQL**, and **JWT authentication**. This API enables the Impossible Missions Force (IMF) to manage their gadgets securely, while providing users with the ability to:

- Add, update, and delete gadgets.
- Trigger a self-destruct sequence for gadgets.
- Authenticate using JWT tokens with robust token validation and blacklist management.
- Ensure that each gadget is accessible only by the user who created it.

## Features


- **User Authentication**:
  - Secure JWT-based authentication.
  - Token blacklist management to prevent reuse of tokens after signout.
  - Token validation for each protected route.

  - `POST user/register`: Create new user.
  - `POST user/login`: Login with super secure `TOKEN`, which expires after 24 hours.
  - `PATCH user/update/{userId}`: Get user details.
  - `GET user/details/{userId}`: Update gadget details.
  - `POST user/logout/{userId}`: Logout user and blacklist the token.
  - `DELETE user/delete/{userId}`: Delete User account and gadgets created by the user.


- **Gadget Management**:
  - `GET /{userId}/get`: Retrieve all gadgets created by the logged-in user.
  - `POST /{userId}/create`: Add a new gadget to the inventory with a unique codename.
  - `PATCH /{userId}/gadgets/{gadgetId}`: Update gadget details.
  - `DELETE /{userId}/gadgets/{gadgetId}`: Mark a gadget as "Decommissioned" without actually deleting it.
- **Self-Destruct**:

  - `/{userId}/self-destruct/{gadgetId}`: Trigger a self-destruct sequence for a gadget.

- **Database**:
  - PostgreSQL to store user and gadget data.
  - Blacklist table to prevent reuse of JWT tokens after user signs out.

## Tech Stack

- **Node.js & TypeScript** for the backend.
- **Express.js** for routing.
- **PostgreSQL** for database management.
- **JWT** for authentication and token validation.
- Deployed on **Render**.

## Getting Started

### Prerequisites

Make sure you have the following installed:

- **Node.js** (LTS version)
- **npm**
- **PostgreSQL**

### Installation


1. Setup ENV variables

  ```bash
  PORT= 5472

  NODE_ENV= production | development

  JWT_SECRET_KEY= // secret key

  // enter postgresql

  POSTGRES_PASSWORD=

  POSTGRES_DB_NAME=

  POSTGRES_SERVER=

  POSTGRES_USER=
  ```


2. Clone the repository:

   ```bash
   git clone git@github.com:joydeep-git/imf-gadget-api.git

   cd imf-gadget-api

   npm i

   npm run dev
   ```


