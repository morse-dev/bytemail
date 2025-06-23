document.getElementById('signupForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const bytemail = document.getElementById('newAddress').value.trim();
  const email = document.getElementById('newEmail').value.trim();
  const password = document.getElementById('newPassword').value;

  if (!bytemail || !email || !password) {
    alert('Please fill all fields.');
    return;
  }

  const res = await fetch('http://localhost:3000/api/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ bytemail, email, password }),
  });

  const data = await res.json();

  if (data.success) {
    alert(`Account created! Your UID is ${data.uid}`);
    window.location.href = 'index.html'; // redirect to sign-in
  } else {
    alert(data.message || 'Sign-up failed');
  }
});
