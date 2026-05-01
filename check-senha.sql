-- Verificar se o hash da senha está correto
-- A senha 'consumer123' em bcrypt deve começar com $2a$
SELECT email, name, 
       CASE 
         WHEN password LIKE '$2a$%' THEN 'Hash bcrypt (válido)'
         ELSE 'Formato inválido'
       END as status_senha
FROM users WHERE email = 'consumer@turis-hub.com';