-- First, let's create the test user if it doesn't exist
-- The password hash is for 'password123' (for testing purposes only)
INSERT INTO "user" (id, username, email, password, "createdAt", "updatedAt")
VALUES 
('4e0e1d7e-d101-49e1-afee-981d9afeb009', 'testuser', 'test@example.com', '$2b$10$RzfnWvid5nRjwNq8TFsDiOZ7TgMzQIknWD4rLnNYP9gTBbjed5WBu', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Also insert on conflict of email
INSERT INTO "user" (id, username, email, password, "createdAt", "updatedAt")
VALUES 
('4e0e1d7e-d101-49e1-afee-981d9afeb009', 'testuser', 'test@example.com', '$2b$10$RzfnWvid5nRjwNq8TFsDiOZ7TgMzQIknWD4rLnNYP9gTBbjed5WBu', NOW(), NOW())
ON CONFLICT (email) DO NOTHING;
