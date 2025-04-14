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
  
- **Gadget Management**:
  - `GET /gadgets`: Retrieve all gadgets created by the logged-in user.
  - `POST /gadgets`: Add a new gadget to the inventory with a unique codename.
  - `PATCH /gadgets/{id}`: Update gadget details.
  - `DELETE /gadgets/{id}`: Mark a gadget as "Decommissioned" without actually deleting it.
  
- **Self-Destruct**:
  - `POST /gadgets/{id}/self-destruct`: Trigger a self-destruct sequence for a gadget.

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

1. Clone the repository:
   ```bash
   git clone https://github.com/joydeep-das/imf-gadget-api.git
   cd imf-gadget-api
