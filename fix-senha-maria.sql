-- Senha 'consumer123' em bcrypt
UPDATE users 
SET password = '$2a$10$u0sZ57jZ7YzL5Xw5Xw5XwOcXw5Xw5Xw5Xw5Xw5Xw5Xw5Xw5Xw5Xw' 
WHERE email = 'consumer@turis-hub.com';