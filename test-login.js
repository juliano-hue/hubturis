fetch('http://localhost:3000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'consumer@turis-hub.com',
    password: 'consumer123'
  })
})
.then(res => res.json())
.then(console.log)
.catch(console.error);