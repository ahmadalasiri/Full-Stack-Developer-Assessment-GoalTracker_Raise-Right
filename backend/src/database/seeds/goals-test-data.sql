-- First, let's create some root-level goals (10 goals)
INSERT INTO goal (id, title, description, deadline, "isPublic", "order", "ownerId", "publicId", "createdAt", "updatedAt")
VALUES
-- Public root goals
('8c2f4a9b-1e2d-4b8a-9c3e-7f5a1b2c3d4e', 'Complete Project X', 'Finish the main project by deadline', '2025-07-01 00:00:00+00', true, 0, '4e0e1d7e-d101-49e1-afee-981d9afeb009', '9a8b7c6d-5e4f-4c3b-8a2e-1f0d9e8c7b6a', NOW(), NOW()),
('3e7a9b2c-4f1d-48e9-b5c3-6a2e8d0f7c1b', 'Learn TypeScript', 'Master TypeScript for backend development', '2025-06-15 00:00:00+00', true, 1, '4e0e1d7e-d101-49e1-afee-981d9afeb009', '2c1b9a8e-7d6f-4e3c-9b2a-8f0e1d7c6b5a', NOW(), NOW()),
('6b4e2c9a-8d1f-4a7e-b3c2-5f9a0e8d7c6b', 'Read Design Patterns Book', 'Study software design patterns', '2025-06-30 00:00:00+00', true, 2, '4e0e1d7e-d101-49e1-afee-981d9afeb009', '7d6c1b9a-2e8f-4c3a-9b5e-0f1d8e7c6a4b', NOW(), NOW()),
('9a3b7c4e-2f1d-4e8a-b6c3-8f0a1e9d7c5b', 'Exercise Daily', 'Maintain physical health with regular exercise', '2025-12-31 00:00:00+00', true, 3, '4e0e1d7e-d101-49e1-afee-981d9afeb009', '4e3c9a8b-7d1f-4b6e-9c2a-5f0e8d7c6b3a', NOW(), NOW()),
('2b6c9a3e-7f1d-4c8a-b5e2-9a0f1e8d7c4b', 'Network More', 'Attend industry events and connect with peers', '2025-08-15 00:00:00+00', true, 4, '4e0e1d7e-d101-49e1-afee-981d9afeb009', '8a4b3c9e-1f7d-4e6c-b2a9-0f5e8d7c6b3a', NOW(), NOW()),
-- Private root goals
('5c3a9b7e-8d1f-4c6a-b2e9-0f5a1e8d7c4b', 'Update Resume', 'Refresh resume with recent experience', '2025-05-30 00:00:00+00', false, 5, '4e0e1d7e-d101-49e1-afee-981d9afeb009', NULL, NOW(), NOW()),
('7d4b2c9a-1f8e-4c3a-b6e2-9a0f5e8d7c1b', 'Financial Planning', 'Review and update personal finances', '2025-06-10 00:00:00+00', false, 6, '4e0e1d7e-d101-49e1-afee-981d9afeb009', NULL, NOW(), NOW()),
('1a6c9b3e-7f2d-4e8a-b5c2-9a0f1e8d7c4b', 'Plan Vacation', 'Research and book summer vacation', '2025-07-15 00:00:00+00', false, 7, '4e0e1d7e-d101-49e1-afee-981d9afeb009', NULL, NOW(), NOW()),
('4e9a3b7c-2f1d-4c6a-b8e2-5f0a9e8d7c3b', 'Complete Online Course', 'Finish the AWS certification course', '2025-09-01 00:00:00+00', false, 8, '4e0e1d7e-d101-49e1-afee-981d9afeb009', NULL, NOW(), NOW()),
('b7c8d9e0-f123-4567-89ab-cdef01234567', 'Home Renovation', 'Plan and execute home office renovation', '2025-10-31 00:00:00+00', false, 9, '4e0e1d7e-d101-49e1-afee-981d9afeb009', NULL, NOW(), NOW());

-- Now, let's create some child goals (for the first 3 root goals)
INSERT INTO goal (id, title, description, deadline, "isPublic", "parentId", "order", "ownerId", "publicId", "createdAt", "updatedAt")
VALUES
-- Children of "Complete Project X"
('3c9a7b4e-8f1d-4c6a-b2e9-5a0f1e8d7c3b', 'Design Database Schema', 'Create efficient database design', '2025-06-01 00:00:00+00', true, '8c2f4a9b-1e2d-4b8a-9c3e-7f5a1b2c3d4e', 0, '4e0e1d7e-d101-49e1-afee-981d9afeb009', '6b3a9c7e-2f1d-4e8a-b5c2-9a0f1e8d7c4b', NOW(), NOW()),
('8a4b3c9e-7f1d-4e6c-b2a9-0f5e8d7c6b3a', 'Implement API Endpoints', 'Develop RESTful API services', '2025-06-15 00:00:00+00', false, '8c2f4a9b-1e2d-4b8a-9c3e-7f5a1b2c3d4e', 1, '4e0e1d7e-d101-49e1-afee-981d9afeb009', NULL, NOW(), NOW()),
-- Children of "Learn TypeScript"
('2e9a3b7c-4f1d-4c8a-b6e2-5a0f9e8d7c3b', 'Complete Beginner Tutorial', 'Follow TypeScript official guide', '2025-06-01 00:00:00+00', true, '3e7a9b2c-4f1d-48e9-b5c3-6a2e8d0f7c1b', 0, '4e0e1d7e-d101-49e1-afee-981d9afeb009', '9c3a7b4e-8f1d-4c6a-b2e9-5a0f1e8d7c3b', NOW(), NOW()),
('7c4b9a3e-2f1d-4e8a-b6c2-5a0f9e8d7c1b', 'Build Practice Project', 'Create a small application using TypeScript', '2025-06-10 00:00:00+00', false, '3e7a9b2c-4f1d-48e9-b5c3-6a2e8d0f7c1b', 1, '4e0e1d7e-d101-49e1-afee-981d9afeb009', NULL, NOW(), NOW()),
-- Children of "Read Design Patterns Book"
('4b9a3c7e-8f1d-4c6a-b2e9-5a0f1e8d7c3b', 'Study Creational Patterns', 'Learn about Factory, Builder, and Singleton', '2025-06-10 00:00:00+00', false, '6b4e2c9a-8d1f-4a7e-b3c2-5f9a0e8d7c6b', 0, '4e0e1d7e-d101-49e1-afee-981d9afeb009', NULL, NOW(), NOW()),
('9a3b7c4e-2f1d-4e8a-b6c2-5a0f9e8d7c1b', 'Practice Structural Patterns', 'Implement Adapter and Decorator patterns', '2025-06-20 00:00:00+00', true, '6b4e2c9a-8d1f-4a7e-b3c2-5f9a0e8d7c6b', 1, '4e0e1d7e-d101-49e1-afee-981d9afeb009', '3c9a7b4e-8f1d-4c6a-b2e9-5a0f1e8d7c2b', NOW(), NOW());

-- Finally, let's create some sub-child goals (grandchildren)
INSERT INTO goal (id, title, description, deadline, "isPublic", "parentId", "order", "ownerId", "publicId", "createdAt", "updatedAt")
VALUES
-- Sub-children of "Design Database Schema"
('6c3a9b7e-8f1d-4c6a-b2e9-5a0f1e8d7c2b', 'Define Data Models', 'Create entity relationship diagrams', '2025-05-25 00:00:00+00', false, '3c9a7b4e-8f1d-4c6a-b2e9-5a0f1e8d7c3b', 0, '4e0e1d7e-d101-49e1-afee-981d9afeb009', NULL, NOW(), NOW()),
('2a9b7c4e-8f1d-4c6a-b3e9-5a0f1e8d7c3b', 'Create SQL Scripts', 'Write migration scripts for database setup', '2025-05-28 00:00:00+00', true, '3c9a7b4e-8f1d-4c6a-b2e9-5a0f1e8d7c3b', 1, '4e0e1d7e-d101-49e1-afee-981d9afeb009', '7c4b9a3e-2f1d-4e8a-b6c2-5a0f9e8d7c1a', NOW(), NOW()),
-- Sub-children of "Complete Beginner Tutorial"
('8b3a9c7e-2f1d-4e8a-b6c2-5a0f9e8d7c1b', 'Learn Basic Types', 'Master primitive and reference types', '2025-05-28 00:00:00+00', true, '2e9a3b7c-4f1d-4c8a-b6e2-5a0f9e8d7c3b', 0, '4e0e1d7e-d101-49e1-afee-981d9afeb009', '4a9b3c7e-8f1d-4c6a-b2e9-5a0f1e8d7c2b', NOW(), NOW()),
('3c9a7b4e-8f1d-4c6a-b2e9-5a0f1e8d7c1a', 'Understand Interfaces', 'Learn about TypeScript interfaces and implementations', '2025-05-30 00:00:00+00', false, '2e9a3b7c-4f1d-4c8a-b6e2-5a0f9e8d7c3b', 1, '4e0e1d7e-d101-49e1-afee-981d9afeb009', NULL, NOW(), NOW());
