-- Database: learn_it

-- DROP DATABASE IF EXISTS learn_it;

CREATE DATABASE learn_it
    WITH
    OWNER = postgres
    ENCODING = 'UTF8'
    LC_COLLATE = 'Indonesian_Indonesia.1252'
    LC_CTYPE = 'Indonesian_Indonesia.1252'
    LOCALE_PROVIDER = 'libc'
    TABLESPACE = pg_default
    CONNECTION LIMIT = -1
    IS_TEMPLATE = False;

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- users (auth + role)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100),
    email VARCHAR(100) UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role VARCHAR(20) DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO users (name, email, password, role)
VALUES ('Admin', 'admin@gmail.com', 'hashed_password', 'admin');

ALTER TABLE users
ALTER COLUMN role SET DEFAULT 'user';

UPDATE users
SET role = 'user'
WHERE role IS NULL;

DELETE FROM users WHERE email = 'admin@gmail.com';
SELECT * FROM users;
SELECT name, email, password, role FROM users;
SELECT id, name FROM users; 
UPDATE users
SET role = 'admin'
WHERE email = 'admin@gmail.com';

ALTER TABLE users
ADD COLUMN reset_token TEXT,
ADD COLUMN reset_token_expiry TIMESTAMP;

ALTER TABLE users
ADD COLUMN google_id VARCHAR(255);

ALTER TABLE users
ADD COLUMN provider VARCHAR(20) DEFAULT 'local';

ALTER TABLE users
ADD COLUMN avatar TEXT;

-- categories
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE categories
ADD COLUMN description TEXT NOT NULL DEFAULT '';
ALTER TABLE categories
ADD COLUMN image_url TEXT;
SELECT * FROM categories;

-- materials
CREATE TABLE materials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(200) NOT NULL,
    category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
ALTER TABLE materials 
ADD COLUMN description TEXT NOT NULL DEFAULT '';
SELECT * FROM materials;
SELECT id, title, category_id
FROM materials;

--material contents
CREATE TABLE material_contents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    material_id UUID REFERENCES materials(id) ON DELETE CASCADE,
    content_type VARCHAR(50), -- text, image, video
    content TEXT,
    sequence INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
ALTER TABLE material_contents
ADD CONSTRAINT content_type_check
CHECK (content_type IN ('text', 'image', 'video'));

SELECT * FROM material_contents;

-- learning path
-- CREATE TABLE learning_paths (
--     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--     title VARCHAR(200),
--     description TEXT,
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );

-- -- learning path details
-- CREATE TABLE learning_path_details (
--     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--     learning_path_id UUID REFERENCES learning_paths(id) ON DELETE CASCADE,
--     material_id UUID REFERENCES materials(id) ON DELETE CASCADE,
--     sequence INT,
--     UNIQUE (learning_path_id, material_id)
-- );

-- quiz
CREATE TABLE quizzes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    material_id UUID REFERENCES materials(id) ON DELETE CASCADE,
    title VARCHAR(200),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE quizzes
DROP COLUMN material_id;
ALTER TABLE quizzes
ADD COLUMN category_id UUID REFERENCES categories(id) ON DELETE CASCADE;
SELECT * FROM quizzes;

-- questions untuk soal kuis 
CREATE TABLE questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE,
    question TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- options untuk pilihan jawaban
CREATE TABLE options (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
    option_text TEXT,
    is_correct BOOLEAN DEFAULT FALSE
);

-- quiz results
CREATE TABLE quiz_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE,
    score INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE quiz_results
ADD COLUMN total_questions INT,
ADD COLUMN correct_answers INT;

SELECT * FROM quiz_results;

-- jawaban kuis user
CREATE TABLE user_answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
    selected_option_id UUID REFERENCES options(id),
    is_correct BOOLEAN,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- forum posts
CREATE TABLE forum_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200),
    content TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- comments
CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID REFERENCES forum_posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    content TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- user progress
CREATE TABLE user_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    material_id UUID REFERENCES materials(id) ON DELETE CASCADE,
    is_completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP,
    UNIQUE (user_id, material_id)
);

--indexing
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_materials_category ON materials(category_id);
CREATE INDEX idx_progress_user ON user_progress(user_id);
CREATE INDEX idx_quiz_material ON quizzes(material_id);