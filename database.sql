CREATE EXTENSION IF NOT EXIST "uuid-ossp";
CREATE DATABASE chat_app;
CREATE TABLE users(
  user_id SERIAL PRIMARY KEY,
  fullname TEXT NOT NULL,
  email TEXT NOT NULL,
  hashpassword TEXT NOT NULL,
  activationLink uuid  ,
  isActivated BOOLEAN DEFAULT false,
  avatar TEXT,
  last_seen  TEXT
);
CREATE TABLE dialogs(
  dialog_id SERIAL PRIMARY KEY ,
  textData TEXT,
  partnerId SERIAL  REFERENCES users(user_id),
  authorId SERIAL  REFERENCES users(user_id),
  userId SERIAL  REFERENCES users(user_id),
  updatedAt TEXT,
  unreadedmessages INTEGER DEFAULT 0
 
);
SELECT * FROM users;
INSERT INTO users (fullname, email, hashpassword) VALUES('Bob','vov@email.com','bob');
CREATE TABLE userToken(
  refreshKeyHeader TEXT,
  refreshKeyPayload TEXT,
  refreshKeySignature TEXT,
  user_id SERIAL,
  FOREIGN KEY (user_id) REFERENCES users(user_id)
);
CREATE TABLE messages(
  message_id SERIAL PRIMARY KEY,
  textData TEXT,
  dialogId SERIAL REFERENCES dialogs(dialog_id) ON DELETE CASCADE,
  userId SERIAL REFERENCES users(user_id),
  sendedAt TEXT,
  isRead BOOLEAN DEFAULT false,
  audio TEXT DEFAULT NULL,
  attachments TEXT DEFAULT NULL
);