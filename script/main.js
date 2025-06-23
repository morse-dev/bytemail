const folders = ["inbox", "archived", "sent", "promotional", "subscriptions"];
let currentFolder = "inbox";

const sidebarItems = document.querySelectorAll(".sidebar li");
const folderTitle = document.getElementById("folder-title");
const emailsContainer = document.getElementById("emails");
const composeSection = document.getElementById("compose");
const openComposeBtn = document.getElementById("openComposeBtn");
const closeComposeBtn = document.getElementById("closeComposeBtn");

// Delete confirmation modal elements
const deleteConfirm = document.getElementById("deleteConfirm");
const deleteProceedBtn = document.getElementById("deleteProceedBtn");
const deleteCancelBtn = document.getElementById("deleteCancelBtn");

// Email viewer modal elements
const emailView = document.getElementById("emailView");
const viewSubject = document.getElementById("viewSubject");
const viewFrom = document.getElementById("viewFrom");
const viewTo = document.getElementById("viewTo");
const viewBody = document.getElementById("viewBody");
const closeEmailViewBtn = document.getElementById("closeEmailView");


// To track which email is pending deletion
let emailToDelete = null;

function renderEmails(folder) {
  emailsContainer.innerHTML = "";
  const emails = fakeEmails[folder] || [];
  if (!emails.length) {
    emailsContainer.innerHTML = "<p>No emails in this folder.</p>";
    return;
  }
  emails.forEach(email => {
    const div = document.createElement("div");
    div.className = "email";
    div.dataset.emailId = email.id;
    div.innerHTML = `
      <strong>From:</strong> ${email.from}<br>
      <strong>Subject:</strong> ${email.subject}<br>
      <p>${email.body}</p>
      <button class="deleteBtn" title="Delete email">🗑️</button>
    `;
    emailsContainer.appendChild(div);
  });

  // Attach delete event handlers
  const deleteButtons = document.querySelectorAll(".deleteBtn");
  deleteButtons.forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation(); // prevent triggering email view
      const emailDiv = e.target.closest(".email");
      const emailId = parseInt(emailDiv.dataset.emailId);
      emailToDelete = emailId;
      showDeleteConfirm();
    });
  });

  // Attach email view handlers (except delete button)
  const emailDivs = document.querySelectorAll(".email");
  emailDivs.forEach(div => {
    div.addEventListener("click", (e) => {
      if (e.target.classList.contains("deleteBtn")) return; // ignore clicks on delete button
      const emailId = parseInt(div.dataset.emailId);
      const email = fakeEmails[currentFolder].find(e => e.id === emailId);
      if (email) openEmailView(email);
    });
  });
}

sidebarItems.forEach(item => {
  item.addEventListener("click", () => {
    sidebarItems.forEach(i => i.classList.remove("active"));
    item.classList.add("active");
    currentFolder = item.dataset.folder;
    folderTitle.textContent = currentFolder.charAt(0).toUpperCase() + currentFolder.slice(1);
    renderEmails(currentFolder);
  });
});

// Open compose modal
openComposeBtn.addEventListener("click", () => {
  composeSection.classList.remove("hidden");
});

// Close compose modal
closeComposeBtn.addEventListener("click", () => {
  composeSection.classList.add("hidden");
});

// Delete confirmation handlers
deleteProceedBtn.addEventListener("click", () => {
  if (emailToDelete !== null) {
    // Remove email from fakeEmails
    fakeEmails[currentFolder] = fakeEmails[currentFolder].filter(email => email.id !== emailToDelete);
    emailToDelete = null;
    hideDeleteConfirm();
    renderEmails(currentFolder);
  }
});

deleteCancelBtn.addEventListener("click", () => {
  emailToDelete = null;
  hideDeleteConfirm();
});

function showDeleteConfirm() {
  deleteConfirm.classList.remove("hidden");
}

function hideDeleteConfirm() {
  deleteConfirm.classList.add("hidden");
}

// Email view modal controls
function openEmailView(email) {
  viewSubject.textContent = email.subject;
  viewFrom.textContent = email.from;
  viewTo.textContent = email.to || "unknown";
  viewBody.textContent = email.body;
  emailView.classList.remove("hidden");
}

closeEmailViewBtn.addEventListener("click", () => {
  emailView.classList.add("hidden");
});

// Initial render
renderEmails(currentFolder);

// Compose email send handler (placeholder)
document.getElementById("sendBtn").onclick = () => {
  alert("Send functionality coming soon!");
};
