CREATE TABLE tasks (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description VARCHAR(500),
    completed BOOLEAN DEFAULT FALSE
);

INSERT INTO tasks (title, description, completed)
VALUES 
('Learn Spring Boot', 'Understand basics of Spring Boot REST API', false),
('Deploy with Docker', 'Manually deploy app into Docker container', false);
