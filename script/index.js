document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const bytemail = document.getElementById('userAddress').value.trim();
  const password = document.getElementById('password').value;

  if (!bytemail || !password) {
    alert('Please fill all fields.');
    return;
  }

  const res = await fetch('http://localhost:3000/api/signin', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ bytemail, password }),
  });

  const data = await res.json();

  if (data.success) {
    localStorage.setItem('bytemail_user', JSON.stringify({
      uid: data.uid,
      bytemail,
      email: data.email,
    }));
    window.location.href = 'inbox.html';
  } else {
    alert(data.message || 'Login failed');
  }
});
