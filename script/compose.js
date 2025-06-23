document.getElementById('composeForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const user = JSON.parse(localStorage.getItem('bytemail_user'));
  if (!user) return alert("User not signed in.");

  const from_uid = user.uid;
  const to_address = document.getElementById('to').value.trim();
  const subject = document.getElementById('subject').value.trim();
  const body = document.getElementById('body').value.trim();

  const res = await fetch('http://localhost:3000/api/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ from_uid, to_address, subject, body })
  });

  const data = await res.json();

  if (data.success) {
    alert("Email sent!");
    window.location.href = "inbox.html";
  } else {
    alert(data.error || "Failed to send email.");
  }
});
