-- Fix admin user - ensure admin@gmail.com exists with role 'admin'
-- Run this SQL directly on your database

-- Step 1: Delete existing admin@gmail.com if present (optional, comment out if you want to keep password)
DELETE FROM users WHERE email = 'admin@gmail.com';

-- Step 2: Insert admin user with proper role
-- Note: Use the hashed password from resetAdminPassword.js output
-- For now, we'll insert with a placeholder that you should update via resetAdminPassword.js script
INSERT INTO users (name, email, password, role, provider)
VALUES ('Admin', 'admin@gmail.com', 'placeholder_hash', 'admin', 'local')
ON CONFLICT (email) DO UPDATE 
SET role = 'admin', provider = 'local'
WHERE users.email = 'admin@gmail.com';

-- Step 3: Verify the admin user
SELECT id, name, email, role, provider FROM users WHERE email = 'admin@gmail.com';

-- Step 4: Check all users and their roles
SELECT id, name, email, role FROM users;
