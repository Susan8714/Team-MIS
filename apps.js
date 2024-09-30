const apiBaseURL = "https://xm13wwlq-8080.euw.devtunnels.ms/api/v1";

let contacts = [];
let trash = [];
let recentContacts = []; // Array to hold recent contacts
let currentContactIndex; // To store index for confirmation during deletion

// Function to load the appropriate section
function loadSection(section) {
  // Hide all sections
  document.getElementById("contacts-section").classList.add("hidden");
  document.getElementById("add-contact-form").classList.add("hidden");
  document.getElementById("trash-section").classList.add("hidden");
  document.getElementById("recent-section").classList.add("hidden");

  // Show the selected section
  if (section === "contacts") {
    document.getElementById("contacts-section").classList.remove("hidden");
    renderContacts();
  } else if (section === "trash") {
    document.getElementById("trash-section").classList.remove("hidden");
    renderTrash();
  } else if (section === "recent") {
    document.getElementById("recent-section").classList.remove("hidden");
    renderRecentContacts();
  }
}

function showAddContactForm() {
  document.getElementById("add-contact-form").classList.remove("hidden");
}

function hideAddContactForm() {
  document.getElementById("add-contact-form").classList.add("hidden");
}

// Updated addContact() function to handle error logging and API response checks
async function addContact() {
  const name = document.getElementById("fullName").value.trim();
  const email = document.getElementById("email").value.trim();
  const phone = document.getElementById("phoneNumber").value.trim();

  if (name && email && phone) {
    try {
      // API request to add a new contact
      const response = await fetch(`${apiBaseURL}/contacts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName: name,
          email: email,
          phoneNumber: phone,
        }),
      });

      // Log the API response for debugging
      const jsonResponse = await response.json();
      console.log("Response JSON:", jsonResponse);
      console.log(response.body);
      if (response.ok) {
        // Push the new contact into the contacts array
        contacts.push(jsonResponse);
        recentContacts.push(jsonResponse);

        // Reset the form and hide the add contact form
        document.getElementById("contactForm").reset();
        document.getElementById("add-contact-form").classList.add("hidden");
        document.getElementById("form-errors").classList.add("hidden");

        // Re-render the contact lists
        renderContacts();
        renderRecentContacts();
      } else {
        // Handle error response from API
        document.getElementById("form-errors").textContent =
          jsonResponse.message || "An error occurred while adding the contact.";
        document.getElementById("form-errors").classList.remove("hidden");
      }
    } catch (error) {
      // Catch and log any error that occurs during the request
      console.error("Error:", error);
      document.getElementById("form-errors").textContent =
        "An error occurred while adding the contact.";
      document.getElementById("form-errors").classList.remove("hidden");
    }
  } else {
    // If the form fields are not filled correctly, show an error message
    document.getElementById("form-errors").textContent =
      "Please fill out all fields correctly.";
    document.getElementById("form-errors").classList.remove("hidden");
  }
}

// Function to delete a contact and show confirmation dialog
function deleteContact(index) {
  currentContactIndex = index; // Store the current index for confirmation
  document.querySelector(".confirm-dialog").style.display = "block"; // Show confirmation dialog
}

// Confirm deletion
document
  .querySelector(".confirm-delete")
  .addEventListener("click", async () => {
    const contact = contacts[currentContactIndex];
    try {
      const response = await fetch(`${apiBaseURL}/contacts/${contact.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        contacts.splice(currentContactIndex, 1); // Remove contact from the list
        trash.push(contact); // Move deleted contact to trash
        renderContacts(); // Re-render the contacts section
        renderRecentContacts(); // Re-render recent contacts section
        document.querySelector(".confirm-dialog").style.display = "none"; // Hide confirmation dialog
        console.log("Contact deleted successfully");
      } else {
        const error = await response.json();
        console.error("Error deleting contact:", error.message);
        document.getElementById("form-errors").textContent =
          "Failed to delete the contact. Please try again.";
        document.getElementById("form-errors").classList.remove("hidden");
      }
    } catch (error) {
      console.error("Error deleting contact:", error);
      document.getElementById("form-errors").textContent =
        "An error occurred while deleting the contact.";
      document.getElementById("form-errors").classList.remove("hidden");
    }
  });

// Cancel deletion
document.querySelector(".cancel-delete").addEventListener("click", () => {
  document.querySelector(".confirm-dialog").style.display = "none"; // Hide confirmation dialog
});

// Function to restore a contact from the trash
async function restoreContact(index) {
  const contact = trash[index];
  try {
    // API request to restore a contact
    const response = await fetch(`${apiBaseURL}/contacts`, {
      method: "POST", // Use POST to re-create the contact
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(contact), // Re-create the contact from trash
    });

    if (response.ok) {
      const restoredContact = await response.json();
      trash.splice(index, 1); // Remove from trash array
      contacts.push(restoredContact); // Add back to contacts array
      renderTrash(); // Re-render trash section
      renderContacts(); // Re-render contacts section
      renderRecentContacts(); // Re-render recent contacts section
      console.log("Contact restored successfully");
    } else {
      const error = await response.json();
      console.error("Error restoring contact:", error.message);
      document.getElementById("form-errors").textContent =
        "Failed to restore the contact. Please try again.";
      document.getElementById("form-errors").classList.remove("hidden");
    }
  } catch (error) {
    console.error("Error restoring contact:", error);
    document.getElementById("form-errors").textContent =
      "An error occurred while restoring the contact.";
    document.getElementById("form-errors").classList.remove("hidden");
  }
}

// Function to fetch all contacts from the API
async function fetchContacts() {
  try {
    // API request to get all contacts
    const response = await fetch(`${apiBaseURL}/contacts`);
    if (response.ok) {
      contacts = await response.json();
      renderContacts(); // Render or update contacts on successful fetch
    } else {
      console.error("Error fetching contacts");
    }
  } catch (error) {
    console.error("Error fetching contacts:", error);
  }
}

// Call fetchContacts when the page loads
window.onload = fetchContacts;

// function renderContacts() {
//   const contactsList = document.getElementById("contacts-list");
//   contactsList.innerHTML = "";

//   if (contacts.length === 0) {
//     document.getElementById("no-contacts-message").classList.remove("hidden");
//   } else {
//     document.getElementById("no-contacts-message").classList.add("hidden");
//   }

//   contacts.forEach((contact, index) => {
//     const row = document.createElement("tr");
//     row.innerHTML = `
//       <td>${contact.fullName}</td>
//       <td>${contact.email}</td>
//       <td>${contact.phoneNumber}</td>
//       <td>

//       <button id="editbtn" onclick="EditContact(${index})">Edit</button>
//       <button id="savebtn">Save</button>
//       </td>
//     `;
//     contactsList.appendChild(row);
//   });
// }
function renderContacts() {
  const contactsList = document.getElementById("contacts-list");
  contactsList.innerHTML = "";

  if (contacts.length === 0) {
    document.getElementById("no-contacts-message").classList.remove("hidden");
  } else {
    document.getElementById("no-contacts-message").classList.add("hidden");
  }

  contacts.forEach((contact, index) => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${contact.fullName}</td>
      <td>${contact.email}</td>
      <td>${contact.phoneNumber}</td>
      <td>
         <button onclick="deleteContact(${index})">Delete</button>
        <button class="editbtn" data-index="${index}">Edit</button>
        <button class="savebtn hidden" data-index="${index}">Save</button>
      </td>
    `;
    contactsList.appendChild(row);
  });

  document.querySelectorAll(".editbtn").forEach((editButton) => {
    editButton.addEventListener("click", (event) => {
      const index = event.target.getAttribute("data-index");
      const row = event.target.closest("tr");

      const nameCell = row.cells[0];
      const emailCell = row.cells[1];
      const phoneCell = row.cells[2];

      const nameInput = document.createElement("input");
      nameInput.type = "text";
      nameInput.value = nameCell.textContent;

      const emailInput = document.createElement("input");
      emailInput.type = "email";
      emailInput.value = emailCell.textContent;

      const phoneInput = document.createElement("input");
      phoneInput.type = "text";
      phoneInput.value = phoneCell.textContent;

      nameCell.innerHTML = "";
      nameCell.appendChild(nameInput);

      emailCell.innerHTML = "";
      emailCell.appendChild(emailInput);

      phoneCell.innerHTML = "";
      phoneCell.appendChild(phoneInput);

      // Show save button, hide edit button
      const saveButton = row.querySelector(".savebtn");
      editButton.classList.add("hidden");
      saveButton.classList.remove("hidden");

      // Save functionality
      saveButton.addEventListener("click", async () => {
        const updatedName = nameInput.value.trim();
        const updatedEmail = emailInput.value.trim();
        const updatedPhone = phoneInput.value.trim();

        if (updatedName && updatedEmail && updatedPhone) {
          try {
            // Assuming there's an API endpoint for updating a contact
            const response = await fetch(
              `${apiBaseURL}/contacts/${contacts[index].id}`,
              {
                method: "PUT", // Or "PATCH" based on API
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  fullName: updatedName,
                  email: updatedEmail,
                  phoneNumber: updatedPhone,
                }),
              }
            );

            if (response.ok) {
              // Update contacts array with new data
              contacts[index] = await response.json();

              // Update the UI after saving
              nameCell.textContent = updatedName;
              emailCell.textContent = updatedEmail;
              phoneCell.textContent = updatedPhone;

              // Hide save button, show edit button again
              saveButton.classList.add("hidden");
              editButton.classList.remove("hidden");
              let alert = window.alert("Contact updated successfully!");
            } else {
              const error = await response.json();
              console.error("Error updating contact:", error.message);
            }
          } catch (error) {
            console.error("Error during contact update:", error);
          }
        } else {
          alert("Please fill in all the fields.");
        }
      });
    });
  });
}

function renderTrash() {
  const trashList = document.getElementById("trash-list");
  trashList.innerHTML = "";

  if (trash.length === 0) {
    document.getElementById("no-trash-message").classList.remove("hidden");
  } else {
    document.getElementById("no-trash-message").classList.add("hidden");
  }

  trash.forEach((contact, index) => {
    const li = document.createElement("li");
    li.innerHTML = `
      ${contact.fullName} - ${contact.email} - ${contact.phoneNumber}
      <button idAA="restore-btn" onclick="restoreContact(${index});window.alert('Restored')">Restore</button>
    `;
    trashList.appendChild(li);
  });
}

function renderRecentContacts() {
  const recentList = document.getElementById("recent-list");
  recentList.innerHTML = "";

  if (recentContacts.length === 0) {
    document.getElementById("no-recent-message").classList.remove("hidden");
  } else {
    document.getElementById("no-recent-message").classList.add("hidden");
  }

  // Sort by last interacted date, most recent first
  recentContacts.sort(
    (a, b) => new Date(b.lastInteracted) - new Date(a.lastInteracted)
  );

  recentContacts.forEach((contact) => {
    const li = document.createElement("li");
    li.innerHTML = `
      ${contact.fullName} - ${contact.email} - ${contact.phoneNumber}
    `;
    recentList.appendChild(li);
  });
}
recentContacts.sort(
  (a, b) => new Date(b.lastInteracted) - new Date(a.lastInteracted)
);

recentContacts.forEach((contact) => {
  const li = document.createElement("li");
  li.innerHTML = `
    ${contact.name} - ${contact.email} - ${contact.phone}
  `;
  recentList.appendChild(li);
});

let debounceTimer;
function filterContacts() {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    const searchValue = document.getElementById("search").value.toLowerCase();

    if (!searchValue) {
      // If search field is empty, render all contacts
      renderContacts();
      return;
    }

    const filteredContacts = contacts.filter(
      (contact) =>
        contact.fullName.toLowerCase().includes(searchValue) ||
        contact.email.toLowerCase().includes(searchValue) ||
        contact.phoneNumber.includes(searchValue)
    );

    const contactsList = document.getElementById("contacts-list");
    contactsList.innerHTML = "";

    if (filteredContacts.length === 0) {
      document.getElementById("no-contacts-message").classList.remove("hidden");
    } else {
      document.getElementById("no-contacts-message").classList.add("hidden");
    }

    filteredContacts.forEach((contact) => {
      const index = contacts.indexOf(contact); // using correct index from original array
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${contact.fullName}</td>
        <td>${contact.email}</td>
        <td>${contact.phoneNumber}</td>
        <td>
          <button onclick="deleteContact(${index})">Delete</button>
        </td>
      `;
      contactsList.appendChild(row);
    });
  }, 200);
}
const searchBar = document.getElementById("search");

searchBar.addEventListener("click", function () {
  searchBar.style.background = "#fff";
  searchBar.style.color = "#000";
});
// Toggle dark mode
const moon = document
  .getElementById("theme-moon")
  .addEventListener("click", function () {
    document.querySelector(".main-content").classList.toggle("change-mode");
    document.body.classList.toggle("change");
    document.querySelector(".header").classList.toggle("header-mode");
    document.querySelector(".sidebar").classList.toggle("side-mode");
    document.querySelector(".logo").classList.toggle("logo-mode");
    document.querySelector(".search").classList.toggle("search-mode");
    document.getElementById("search").classList.toggle("input-mode");
    document.querySelector(".foot").classList.toggle("foot-mode");
    document.getElementById("side-a").classList.toggle("siden-mode");
    document.getElementById("side-b").classList.toggle("siden-mode");
    document.getElementById("side-c").classList.toggle("siden-mode");
    document.getElementById("theme-moon").classList.toggle("bit");
    document.querySelectorAll(".h2Color").classList.toggle("h2Color");
    document.getElementById("contacts-table").classList.toggle("Table");
    document.getElementsByTagName("th").classList.toggle("Thead");
  });
// let contactsTable = document.querySelectorAll(".trow");
// contactsTable.style.background = "#121212";

// Applying styles for dark mode
const css = `
.change .bit{
  background-color: #121212;
}
.change .header-mode{
  background-color: #121212;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}

.change .side-mode {
  background-color: darkgrey;
  opacity: 0.85;
  color: #e8f0fe;
}
  
.change .siden-mode{
  color: #fff;
}
Table Thead{
background-color: #121212;
}
.change .h2Color{
  color: #fff;
}

.change .foot-mode {
  background-color: #121212;
}

.change .sidebtn-mode{
  color: #fff;
}

.change  .input-mode{
  padding: 0.6rem;
  margin-right: 10em;
  width: 40em;
  border: none;
  border-radius: 30px;
  outline: none;
  // background-color: #f1f3f4;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}
 .change{
  background: linear-gradient(135deg, #121212  10%,  #4f4f5749 100%),
    url("Untitled.jpeg");
  background-size: cover;
  background-position: right center;
  background-repeat: no-repeat;
  background-blend-mode: overlay;
  color: white;
}
.change-mode.main-content {
 background-color: darkgrey;
 color: white;
 opacity: 0.85;
}
.change-mode button {
  background-color: #121212;
  color: white;
  padding: 10px 15px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  margin-bottom: 1rem;
  margin-right: 40px;
  float: right;
}`;
const searchB = document.getElementById("search");
const name = document.getElementById("fullName");
const email = document.getElementById("email");
const phone = document.getElementById("phoneNumber");

searchBar.addEventListener("click", function () {
  searchBar.style.background = "#f3f3f2";
  searchBar.style.color = "#000";
});
name.addEventListener("click", function () {
  name.style.background = "#c4c7c9";
  name.style.color = "#000";
});

email.addEventListener("click", function () {
  email.style.background = "#c4c7c9";
  email.style.color = "#000";
  email.style.border = "2px";
  email.style.borderColor = "#000";
});

phone.addEventListener("click", function () {
  phone.style.background = "#c4c7c9";
  phone.style.color = "#000";
  phone.style.border = "2px";
  phone.style.borderColor = "#000";
});

const style = document.createElement("style");
style.appendChild(document.createTextNode(css));
document.head.appendChild(style);

//Get back to Home-page
document.querySelector(".logo").addEventListener("click", () => {
  setTimeout(() => {
    window.location.href = "index.html";
  }, 1000);
});
