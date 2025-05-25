# GoalTracker - Full-Stack Developer Assessment

A modern goal management application with hierarchical structure built for the Raise Right assessment. Create, organize, and track personal goals with up to 3 levels of nesting.

## 🔗 Links

- **GitHub**: [https://github.com/ahmadalasiri/Full-Stack-Developer-Assessment-GoalTracker_Raise-Right](https://github.com/ahmadalasiri/Full-Stack-Developer-Assessment-GoalTracker_Raise-Right)
- **Live Demo**: [https://goal-tracker.ahmadalasiri.info](https://goal-tracker.ahmadalasiri.info)
- **API Documentation (Swagger)**: [http://api.goal-tracker.ahmadalasiri.info/api/docs](http://api.goal-tracker.ahmadalasiri.info/api/docs)

![Tech Stack](https://img.shields.io/badge/Stack-Angular%2019%20%7C%20NestJS%2011%20%7C%20PostgreSQL%2015-blue)

## 📋 Table of Contents

- [setup instructions](#setup-instructions)
- [database choice explanation](#database-choice-explanation)
- [tech stack summary](#tech-stack-summary)
- [key decisions and trade-offs](#key-decisions-and-trade-offs)
- [known limitations or pending features](#known-limitations-or-pending-features)

## Setup Instructions

### Docker Setup (Recommended)

```bash
git clone https://github.com/ahmadalasiri/Full-Stack-Developer-Assessment-GoalTracker_Raise-Right.git
cd GoalTracker
docker-compose up --build
```

Access: Frontend at `http://localhost:4200`, API at `http://localhost:3001/api`

### Local Development

```bash
# Backend
cd backend && npm install && npm run start:dev

# Frontend (new terminal)
cd frontend && npm install && npm start

# Database
docker-compose up postgres -d
```

**Prerequisites**: Docker, Node.js 20+, Git

## Database Choice Explanation

**PostgreSQL** was chosen as the primary database, and here's why it made sense for this project:

### Pros

- **Supports Transactions and ACID:** This is super helpful when reordering goals—like when you drag and drop them. Everything happens safely inside a transaction, so your data stays consistent.

- **Automatic Cascade Deletes:** Perfect for our goal hierarchy. If you delete a parent goal, all its child goals get deleted automatically—no worries about leftover orphaned records.

- **Great for Complex Queries:** It handles our nested goals really well, especially with recursive queries.

- **Clear and Structured Schema:** The database schema is well-defined and organized, which makes PostgreSQL a natural fit.

- **Better at Joins than MongoDB:** Since our goals have parent-child relationships, PostgreSQL’s relational joins make managing these connections way smoother compared to MongoDB.

### Cons

- **Setup Can Be Tricky:** Compared to NoSQL options, PostgreSQL takes a bit more effort to configure.

- **Slower to Develop at First:** From my experience with MongoDB, you can move faster at the start using Mongo—but eventually, you might run into issues that PostgreSQL avoids 🙂

### Alternatives Considered

- **MongoDB**: Rejected due to need for relational constraints and ACID transactions for goal hierarchies
- **MySQL**: PostgreSQL offers better support for complex data types

## Tech Stack Summary

### Frontend Stack

- Angular 19
- TypeScript 5.7
- Tailwind CSS 4.1.7

### Backend Stack

- NestJS 11
- TypeORM 0.3.24
- PostgreSQL 15

### DevOps & Development

- Docker & Docker Compose
- Nginx
- Contabo

## Key Decisions and Trade-offs

### 1. Monorepo vs Multi-repo Structure

**Decision**: Monorepo with frontend and backend together

- ✅ **Pros**: Shared types, easier setup, coordinated releases, simplified development workflow
- ❌ **Cons**: Larger repository size, potential CI/CD complexity for larger teams

### 2. Tailwind CSS vs Component Libraries

**Decision**: Tailwind CSS with minimal component library usage

- ✅ **Pros**: Rapid prototyping, smaller bundle size, design consistency, no library lock-in

## Known Limitations or Pending Features

### Current Implementation Limitations

#### Logging and Monitoring

- **Issue**: No comprehensive logging system or application monitoring
- **Impact**: Difficult to debug issues in production and track application performance
- **Solution**: Implement structured logging with Winston/Pino and monitoring with Sentry

#### Security Enhancements

- **Issue**: Basic security measures, missing advanced protection
- **Impact**: Potential vulnerabilities in production environment
- **Solution**: Add rate limiting per user, CSRF protection, comprehensive security headers, input sanitization

#### Documentation

- **Issue**: Manual API documentation, no interactive documentation
- **Impact**: Poor developer experience for API consumers
- **Solution**: Implement Swagger/OpenAPI for automatic interactive API documentation

#### Testing Coverage

- **Issue**: Limited test suite (~30% coverage)
- **Impact**: Higher risk of bugs, difficult to refactor safely
- **Solution**: Comprehensive unit, integration, and E2E testing with Jest and Cypress

#### Real-time Collaboration

- **Issue**: No real-time updates when multiple users edit shared goals
- **Impact**: Users must refresh to see changes from other sessions
- **Solution**: WebSocket implementation

#### JWT Storage in localStorage

- **Issue**: Authentication tokens stored in localStorage instead of HTTP-only cookies
- **Impact**: Vulnerable to XSS attacks that could steal the token
- **Solution**: Use HTTP-only cookies with appropriate security flags

### Technical Debt

#### Sentry Integration

- **Current**: No error tracking and performance monitoring
- **Improvement**: Integrate Sentry for real-time error tracking, performance monitoring, and alerting

#### Error Handling

- **Current**: Basic error responses and generic messages
- **Improvement**: Granular error codes, user-friendly messages, retry mechanisms

### Scalability Considerations

#### Database Performance

- **Current**: Single PostgreSQL instance
- **Bottleneck**: All operations on single database
- **Solution**: Read replicas, connection pooling, query optimization

#### Application Scaling

- **Current**: Single NestJS instance
- **Bottleneck**: CPU and memory constraints
- **Solution**: Horizontal scaling with load balancer

#### Session Management

- **Current**: JWT tokens in localStorage
- **Security Risk**: XSS vulnerability, no token revocation
- **Solution**: Secure HTTP-only cookies or Redis session store
