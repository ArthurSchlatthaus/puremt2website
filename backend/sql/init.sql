CREATE DATABASE IF NOT EXISTS puremt2;
USE puremt2;

CREATE TABLE IF NOT EXISTS users
(
    id             INT AUTO_INCREMENT PRIMARY KEY,
    username       VARCHAR(255) NOT NULL UNIQUE,
    password       VARCHAR(255) NOT NULL,
    last_post_time BIGINT     DEFAULT NULL,
    is_admin       TINYINT(1) DEFAULT 0,
    is_active      TINYINT(1) DEFAULT 1
);

CREATE TABLE IF NOT EXISTS categories
(
    id            INT AUTO_INCREMENT PRIMARY KEY,
    name          VARCHAR(255) NOT NULL,
    color         VARCHAR(255) NOT NULL,
    is_admin_only TINYINT(1) DEFAULT 0
);

CREATE TABLE IF NOT EXISTS forum_threads
(
    id         INT AUTO_INCREMENT PRIMARY KEY,
    title      VARCHAR(255) NOT NULL,
    user_id    INT          NOT NULL,
    created_at TIMESTAMP  DEFAULT CURRENT_TIMESTAMP,
    is_closed  TINYINT(1) DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS thread_categories
(
    thread_id   INT NOT NULL,
    category_id INT NOT NULL,
    PRIMARY KEY (thread_id, category_id),
    FOREIGN KEY (thread_id) REFERENCES forum_threads (id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS forum_posts
(
    id         INT AUTO_INCREMENT PRIMARY KEY,
    thread_id  INT      NOT NULL,
    user_id    INT      NOT NULL,
    content    LONGTEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (thread_id) REFERENCES forum_threads (id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE post_reports
(
    id          INT AUTO_INCREMENT PRIMARY KEY,
    post_id     INT NOT NULL,
    user_id     INT NOT NULL,
    reported_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES forum_posts (id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS activity_logs
(
    id        INT AUTO_INCREMENT PRIMARY KEY,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    message   TEXT NOT NULL
);

CREATE TABLE downloads
(
    id   INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    link TEXT         NOT NULL
);
