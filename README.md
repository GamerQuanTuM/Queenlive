# Queenlive Project

Queenlive is a full-stack application built with Next.js for the frontend and NestJS for the backend. This project provides a live chat and e-commerce functionality with real-time communication capabilities.

## Project Structure

The project is organized into two main directories:

- **client**: Next.js frontend application
- **server**: NestJS backend application

## Technologies Used

### Frontend (Client)
- [Next.js 15](https://nextjs.org/) - React framework with server-side rendering
- [React 19](https://react.dev/) - UI library
- [TailwindCSS 4](https://tailwindcss.com/) - Utility-first CSS framework
- [Socket.io Client](https://socket.io/docs/v4/client-api/) - Real-time communication
- [Radix UI](https://www.radix-ui.com/) - Unstyled, accessible UI components

### Backend (Server)
- [NestJS 11](https://nestjs.com/) - Progressive Node.js framework
- [TypeORM](https://typeorm.io/) - ORM for database interactions
- [PostgreSQL](https://www.postgresql.org/) - Relational database
- [Socket.io](https://socket.io/) - Real-time communication
- [Passport & JWT](https://docs.nestjs.com/security/authentication) - Authentication

## Getting Started

### Prerequisites

- Node.js (LTS version recommended)
- pnpm (for client) or npm (for server)
- PostgreSQL database

### Installation

1. Clone the repository
   ```bash
   git clone <repository-url>
   cd Queenlive
   ```

2. Install dependencies for both client and server

   **Client:**
   ```bash
   cd client
   pnpm install
   ```

   **Server:**
   ```bash
   cd server
   npm install
   ```

3. Configure the database
   - Create a PostgreSQL database
   - Update the database configuration in the server's environment variables

## Running the Application

### Development Mode

1. Start the backend server
   ```bash
   cd server
   npm run dev
   ```
   The server will be available at http://localhost:3000 by default.

2. Start the frontend client
   ```bash
   cd client
   pnpm dev
   ```
   The client will be available at http://localhost:8000 by default.

### Production Mode

1. Build and start the backend server
   ```bash
   cd server
   npm run build
   npm run start:prod
   ```

2. Build and start the frontend client
   ```bash
   cd client
   pnpm build
   pnpm start
   ```

## Features

- User authentication and authorization
- Real-time chat functionality
- Product browsing and ordering
- Responsive design for various devices

## Docker Support

The server includes Docker configuration for containerized deployment:

```bash
cd server
docker-compose up
```
