# GoalTracker - Full-Stack Developer Assessment

A modern full-stack web application for hierarchical goal management built for the Raise Right developer assessment. This application allows users to create, manage, and track personal goals with support for nested sub-goals up to 3 levels deep.

![Tech Stack](https://img.shields.io/badge/Stack-Angular%2019%20%7C%20NestJS%2011%20%7C%20PostgreSQL%2015-blue)
![Docker](https://img.shields.io/badge/Docker-Ready-brightgreen)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)

## 🚀 Quick Start

### Prerequisites

- Docker and Docker Compose installed
- Node.js 20+ (for local development)
- Git

### Docker Setup (Recommended)

```bash
# Clone the repository
git clone <repository-url>
cd GoalTracker

# Start the application with Docker
docker-compose up --build

# The application will be available at:
# Frontend: http://localhost:4200
# Backend API: http://localhost:3001/api
# Database: localhost:5432
```

### Local Development Setup

```bash
# Install dependencies
cd backend && npm install
cd ../frontend && npm install

# Start PostgreSQL (using Docker)
docker-compose up postgres -d

# Start backend
cd backend
npm run start:dev

# Start frontend (in another terminal)
cd frontend
npm run start
```

## 📋 Table of Contents

- [Tech Stack & Architecture](#-tech-stack--architecture)
- [Database Design](#-database-design)
- [API Documentation](#-api-documentation)
- [Features](#-features)
- [Project Structure](#-project-structure)
- [Development Commands](#-development-commands)
- [Design Decisions](#-design-decisions)
- [Known Limitations](#-known-limitations)
- [Testing](#-testing)

## 🛠 Tech Stack & Architecture

### Frontend

- **Angular 19** - Modern reactive web framework
- **TypeScript 5.7** - Type-safe development
- **Tailwind CSS 4.1.7** - Utility-first styling
- **Angular CDK** - Material Design components
- **RxJS** - Reactive programming

### Backend

- **NestJS 11** - Progressive Node.js framework
- **TypeORM 0.3.24** - Object-Relational Mapping
- **PostgreSQL 15** - Primary database
- **JWT Authentication** - Secure user sessions
- **Bcrypt** - Password hashing
- **Helmet** - Security middleware
- **Rate Limiting** - API protection

### DevOps & Tools

- **Docker & Docker Compose** - Containerization
- **Node.js 20** - Runtime environment
- **TypeScript** - Development language
- **ESLint & Prettier** - Code quality
- **Jest** - Testing framework

### Architecture Pattern

- **Monorepo Structure** - Organized codebase
- **RESTful API** - Standard HTTP methods
- **Repository Pattern** - Data access layer
- **Dependency Injection** - Loose coupling
- **Guards & Interceptors** - Cross-cutting concerns

## 🗄 Database Design

### PostgreSQL Choice Justification

**PostgreSQL** was selected as the primary database for several compelling reasons:

#### Technical Advantages

- **ACID Compliance**: Ensures data consistency for goal hierarchies
- **JSON Support**: Native support for flexible metadata storage
- **Advanced Indexing**: Efficient querying of nested goal structures
- **Referential Integrity**: Strong foreign key constraints for parent-child relationships
- **Performance**: Excellent performance for complex queries and joins

#### Business Requirements Alignment

- **Hierarchical Data**: PostgreSQL's recursive CTEs handle goal trees efficiently
- **Data Integrity**: Critical for goal dependencies and user data
- **Scalability**: Handles growing datasets with proper indexing
- **ACID Properties**: Essential for maintaining goal state consistency

#### Development Benefits

- **TypeORM Integration**: Excellent TypeScript support and decorators
- **Rich Ecosystem**: Extensive tooling and community support
- **Docker Support**: Easy containerization and deployment
- **Backup & Recovery**: Robust data protection mechanisms

### Database Schema

```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Goals table with hierarchical structure
CREATE TABLE goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  deadline TIMESTAMP,
  is_public BOOLEAN DEFAULT false,
  is_completed BOOLEAN DEFAULT false,
  parent_id UUID REFERENCES goals(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_goals_user_id ON goals(user_id);
CREATE INDEX idx_goals_parent_id ON goals(parent_id);
CREATE INDEX idx_goals_public ON goals(is_public) WHERE is_public = true;
```

## 🔗 API Documentation

### Authentication Endpoints

```
POST /api/auth/register    # User registration
POST /api/auth/login       # User login
GET  /api/auth/profile     # Get user profile (JWT required)
```

### Goals Management

```
GET    /api/goals          # Get user's goals (JWT required)
POST   /api/goals          # Create new goal (JWT required)
GET    /api/goals/:id      # Get specific goal (JWT required)
PUT    /api/goals/:id      # Update goal (JWT required)
DELETE /api/goals/:id      # Delete goal (JWT required)
```

### Public Goals

```
GET    /api/public-goals   # Get all public goals
GET    /api/public-goals/:id # Get specific public goal
```

### Request/Response Examples

**Create Goal:**

```json
POST /api/goals
{
  "title": "Learn TypeScript",
  "description": "Master TypeScript fundamentals",
  "deadline": "2024-12-31T23:59:59.000Z",
  "isPublic": false,
  "parentId": "uuid-of-parent-goal" // optional
}
```

**Response:**

```json
{
  "id": "generated-uuid",
  "title": "Learn TypeScript",
  "description": "Master TypeScript fundamentals",
  "deadline": "2024-12-31T23:59:59.000Z",
  "isPublic": false,
  "isCompleted": false,
  "userId": "user-uuid",
  "parentId": "parent-uuid",
  "children": [],
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

## ✨ Features

### Core Functionality

- ✅ **User Authentication** - JWT-based secure login/registration
- ✅ **Goal Management** - CRUD operations for personal goals
- ✅ **Hierarchical Goals** - Support for nested sub-goals (3 levels deep)
- ✅ **Public Goals** - Share goals publicly for community viewing
- ✅ **Goal Completion** - Mark goals as completed/incomplete
- ✅ **Deadline Tracking** - Set and monitor goal deadlines
- ✅ **Responsive Design** - Mobile-friendly interface

### Advanced Features

- ✅ **Real-time Validation** - Form validation with helpful error messages
- ✅ **Security Features** - Helmet, rate limiting, CORS protection
- ✅ **Data Integrity** - TypeORM entities with validation decorators
- ✅ **Error Handling** - Global exception filters and user-friendly messages
- ✅ **Docker Support** - Full containerization with docker-compose
- ✅ **Database Seeding** - Sample data generation for testing

### UI/UX Features

- ✅ **Modern Design** - Tailwind CSS with clean, intuitive interface
- ✅ **Dark/Light Mode** - Theme switching support
- ✅ **Loading States** - Smooth user experience with loading indicators
- ✅ **Form Validation** - Real-time validation with helpful messages
- ✅ **Responsive Layout** - Mobile-first design approach

## 📁 Project Structure

```
GoalTracker/
├── backend/                    # NestJS Backend
│   ├── src/
│   │   ├── auth/              # Authentication module
│   │   ├── users/             # User management
│   │   ├── goals/             # Goals CRUD operations
│   │   ├── public-goals/      # Public goals module
│   │   ├── common/            # Shared utilities
│   │   ├── database/          # Database configuration & seeds
│   │   └── main.ts            # Application bootstrap
│   ├── Dockerfile             # Backend container config
│   └── package.json           # Backend dependencies
├── frontend/                   # Angular Frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/    # UI components
│   │   │   ├── services/      # Angular services
│   │   │   ├── guards/        # Route guards
│   │   │   ├── models/        # TypeScript interfaces
│   │   │   └── core/          # Core functionality
│   │   ├── environments/      # Environment configs
│   │   └── styles.css         # Global styles
│   ├── Dockerfile             # Frontend container config
│   └── package.json           # Frontend dependencies
├── docker-compose.yml         # Multi-container setup
└── README.md                  # This file
```

## 🔧 Development Commands

### Backend Commands

```bash
cd backend

# Development
npm run start:dev           # Start with hot reload
npm run start:debug         # Start with debugger
npm run build               # Build for production

# Database
npm run db:seed             # Seed test data
npm run migration:generate  # Generate migration
npm run migration:run       # Run migrations

# Testing & Quality
npm run test                # Run unit tests
npm run test:e2e           # Run e2e tests
npm run lint               # Run ESLint
npm run format             # Format code with Prettier
```

### Frontend Commands

```bash
cd frontend

# Development
npm run start              # Start dev server (port 4200)
npm run build              # Build for production
npm run watch              # Build with file watching

# Testing & Quality
npm run test               # Run unit tests with Karma
ng generate component <name>  # Generate new component
ng generate service <name>    # Generate new service
```

### Docker Commands

```bash
# Full application
docker-compose up --build   # Build and start all services
docker-compose down         # Stop all services
docker-compose logs -f      # Follow logs

# Individual services
docker-compose up postgres  # Start only database
docker-compose up backend   # Start backend + database
docker-compose up frontend  # Start frontend only
```

## 🎯 Design Decisions

### Architecture Choices

**1. Monorepo Structure**

- **Decision**: Keep frontend and backend in the same repository
- **Rationale**: Simplified development, shared types, easier deployment
- **Trade-off**: Could complicate CI/CD for larger teams

**2. TypeORM with Synchronize**

- **Decision**: Use `synchronize: true` for development
- **Rationale**: Rapid prototyping, automatic schema updates
- **Trade-off**: Not suitable for production (use migrations instead)

**3. JWT Authentication**

- **Decision**: Stateless JWT tokens instead of sessions
- **Rationale**: Scalability, microservices compatibility, mobile-friendly
- **Trade-off**: Token revocation complexity, larger payload size

**4. Hierarchical Goal Structure**

- **Decision**: Self-referencing table with `parent_id` foreign key
- **Rationale**: Simple implementation, unlimited nesting potential
- **Trade-off**: Complex queries for deep hierarchies (mitigated with 3-level limit)

### Security Implementations

**1. Password Hashing**

- **Implementation**: Bcrypt with salt rounds
- **Rationale**: Industry standard, resistance to rainbow table attacks

**2. Rate Limiting**

- **Implementation**: Express rate limiting middleware
- **Configuration**: 100 requests per 15 minutes per IP
- **Rationale**: Prevent brute force and DDoS attacks

**3. CORS Configuration**

- **Implementation**: Specific origin allowlist in production
- **Development**: Permissive for localhost development
- **Rationale**: Prevent cross-origin attacks while enabling development

**4. Input Validation**

- **Implementation**: Class-validator decorators with DTOs
- **Rationale**: Type-safe validation, automatic sanitization

### Performance Optimizations

**1. Database Indexing**

- **Implementation**: Indexes on foreign keys and frequently queried columns
- **Rationale**: Faster query execution for goal hierarchies

**2. Lazy Loading**

- **Implementation**: Optional relation loading in TypeORM
- **Rationale**: Reduce unnecessary data transfer

**3. Connection Pooling**

- **Implementation**: PostgreSQL connection pooling
- **Rationale**: Efficient database connection management

## ⚠️ Known Limitations

### Current Limitations

**1. Goal Nesting Depth**

- **Limitation**: Maximum 3 levels of nesting
- **Reasoning**: UI complexity and performance considerations
- **Future**: Could be made configurable

**2. Real-time Updates**

- **Limitation**: No WebSocket implementation for real-time goal updates
- **Impact**: Users must refresh to see changes from other sessions
- **Future**: WebSocket or Server-Sent Events implementation

**3. File Attachments**

- **Limitation**: No file upload capability for goals
- **Impact**: Cannot attach documents or images to goals
- **Future**: AWS S3 or similar cloud storage integration

**4. Search Functionality**

- **Limitation**: No full-text search across goals
- **Impact**: Limited goal discovery capabilities
- **Future**: Elasticsearch or PostgreSQL full-text search

**5. Audit Trail**

- **Limitation**: No change history tracking
- **Impact**: Cannot see goal modification history
- **Future**: Event sourcing or audit log implementation

### Technical Debt

**1. Database Migrations**

- **Current**: Using TypeORM synchronize in development
- **Production Need**: Proper migration system for schema changes

**2. Error Handling**

- **Current**: Basic error responses
- **Enhancement**: More granular error codes and user-friendly messages

**3. Testing Coverage**

- **Current**: Limited test suite
- **Need**: Comprehensive unit, integration, and e2e tests

**4. API Documentation**

- **Current**: Manual documentation in README
- **Enhancement**: Swagger/OpenAPI automatic documentation

### Scalability Considerations

**1. Database Performance**

- **Current**: Single PostgreSQL instance
- **Future**: Read replicas, connection pooling, query optimization

**2. Caching Layer**

- **Current**: No caching implementation
- **Future**: Redis for session management and frequently accessed data

**3. API Rate Limiting**

- **Current**: Simple in-memory rate limiting
- **Future**: Distributed rate limiting with Redis

## 🧪 Testing

### Current Test Setup

```bash
# Backend tests
cd backend
npm run test              # Unit tests
npm run test:watch        # Watch mode
npm run test:cov          # Coverage report
npm run test:e2e          # End-to-end tests

# Frontend tests
cd frontend
npm run test              # Unit tests with Karma/Jasmine
```

### Test Coverage Goals

- **Unit Tests**: Service layer business logic
- **Integration Tests**: API endpoint testing
- **E2E Tests**: Complete user workflows
- **Component Tests**: Angular component behavior

## 🚀 Production Deployment

### Environment Variables

```bash
# Backend (.env)
DB_HOST=your-db-host
DB_PORT=5432
DB_USERNAME=your-db-user
DB_PASSWORD=your-db-password
DB_NAME=goaltracker
JWT_SECRET=your-jwt-secret
JWT_EXPIRES_IN=24h
PORT=3001
CORS_ORIGINS=https://your-domain.com

# Frontend environment.prod.ts
export const environment = {
  production: true,
  apiUrl: 'https://api.your-domain.com/api',
  // ... other production configs
};
```

### Docker Production Build

```bash
# Build optimized images
docker-compose -f docker-compose.prod.yml build

# Deploy with production configuration
docker-compose -f docker-compose.prod.yml up -d
```

### Recommended Production Enhancements

1. **SSL/TLS**: HTTPS certificates (Let's Encrypt)
2. **Reverse Proxy**: Nginx for load balancing
3. **Database**: Managed PostgreSQL service (AWS RDS, etc.)
4. **Monitoring**: Application and infrastructure monitoring
5. **Backup**: Automated database backups
6. **CI/CD**: Automated testing and deployment pipeline

---

## 👨‍💻 Development Notes

This application was built as part of the Raise Right full-stack developer assessment. The implementation focuses on demonstrating:

- Modern web development practices
- Clean, maintainable code architecture
- Security best practices
- Database design principles
- Docker containerization
- Comprehensive documentation

**Development Time**: ~8-10 hours
**Last Updated**: January 2025

For questions or feedback, please contact the development team.
