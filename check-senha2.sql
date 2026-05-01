SELECT email, name, 
       CASE 
         WHEN password LIKE '$2a$%' THEN 'Hash bcrypt (válido)'
         ELSE 'Formato inválido'
       END as status_senha
FROM users WHERE email = 'consumer@turis-hub.com';