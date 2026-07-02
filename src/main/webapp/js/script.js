let currentUser = null;

function loadCurrentUser() {
    currentUser = JSON.parse(localStorage.getItem("currentUser"));
}

// REGISTER
function registerUser() {
    const name = document.getElementById("name").value.trim();
    const contact = document.getElementById("contact").value.trim();
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!name || !contact || !username || !password) {
        alert("Please fill all fields");
        return;
    }
    if (contact.length < 10) {
        alert("Enter valid 10-digit contact number");
        return;
    }

    let users = JSON.parse(localStorage.getItem("users")) || [];
    if (users.find(u => u.username === username)) {
        alert("Username already exists!");
        return;
    }

    users.push({ name, contact, username, password });
    localStorage.setItem("users", JSON.stringify(users));

    alert("🎉 Registration Successful!");
    window.location.href = "login.html";
}

// LOGIN
function loginUser() {
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!username || !password) {
        alert("Please fill all fields");
        return;
    }

    let users = JSON.parse(localStorage.getItem("users")) || [];
    const user = users.find(u => u.username === username && u.password === password);

    if (!user) {
        alert("Invalid username or password");
        return;
    }

    localStorage.setItem("currentUser", JSON.stringify(user));
    alert(`✅ Welcome, ${user.name}!`);
    window.location.href = "dashboard.html";
}

// CREATE RIDE
function createRide() {
    loadCurrentUser();
    if (!currentUser) {
        alert("Please login first");
        return;
    }

    const source = document.getElementById("source").value.trim();
    const destination = document.getElementById("destination").value.trim();
    const time = document.getElementById("time").value;
    const seats = parseInt(document.getElementById("seats").value);

    if (!source || !destination || !time || !seats) {
        alert("Please fill all ride details");
        return;
    }

    let rides = JSON.parse(localStorage.getItem("rides")) || [];
    rides.push({
        id: Date.now(),
        driver: currentUser.username,
        driverName: currentUser.name,
        source,
        destination,
        time,
        seats: seats,
        joined: 0
    });

    localStorage.setItem("rides", JSON.stringify(rides));
    alert("🚗 Ride Created Successfully!");
    window.location.href = "search-ride.html";
}

// LOAD RIDES
function loadRides() {
    loadCurrentUser();
    const container = document.getElementById("ridesContainer");
    let rides = JSON.parse(localStorage.getItem("rides")) || [];

    if (rides.length === 0) {
        container.innerHTML = `<div class="col-12 text-center py-5 text-muted">No rides available yet. Create one!</div>`;
        return;
    }

    container.innerHTML = rides.map(ride => `
        <div class="col-md-6 col-lg-4">
            <div class="card h-100">
                <div class="card-body">
                    <h5 class="card-title"><i class="bi bi-person-circle"></i> ${ride.driverName}</h5>
                    <p><strong>${ride.source}</strong> → <strong>${ride.destination}</strong></p>
                    <p class="text-muted"><i class="bi bi-clock"></i> ${ride.time} • ${ride.seats} seats</p>
                    <button onclick="joinRide(${ride.id}, this)" class="btn btn-success w-100">Join Ride</button>
                </div>
            </div>
        </div>
    `).join("");
}

// JOIN RIDE
function joinRide(id, btn) {
    loadCurrentUser();
    if (!currentUser) return;

    let rides = JSON.parse(localStorage.getItem("rides")) || [];
    const rideIndex = rides.findIndex(r => r.id === id);
    if (rideIndex === -1) return;

    if (rides[rideIndex].seats > 0) {
        rides[rideIndex].seats--;
        localStorage.setItem("rides", JSON.stringify(rides));

        let joined = JSON.parse(localStorage.getItem("joinedRides")) || [];
        joined.push(rides[rideIndex]);
        localStorage.setItem("joinedRides", JSON.stringify(joined));

        btn.innerHTML = "✅ Joined";
        btn.disabled = true;
        alert("You have successfully joined the ride!");
    }
}

// SUBMIT COMPLAINT
function submitComplaint() {
    const text = document.getElementById("complaintText").value.trim();
    if (!text) {
        alert("Please describe your complaint");
        return;
    }
    alert("📩 Complaint submitted successfully!");
    document.getElementById("complaintText").value = "";
}

// LOAD REPORTS
function loadReports() {
    loadCurrentUser();
    if (!currentUser) return;

    const container = document.getElementById("reportsContent");
    let rides = JSON.parse(localStorage.getItem("rides")) || [];
    let joinedRides = JSON.parse(localStorage.getItem("joinedRides")) || [];

    const myCreated = rides.filter(r => r.driver === currentUser.username);

    let html = `
        <div class="col-12 mb-4">
            <h4>Hello, ${currentUser.name} 👋</h4>
            <p class="text-muted">Your complete travel summary</p>
        </div>
    `;

    html += `<div class="col-md-6"><div class="card"><div class="card-header bg-primary text-white">Rides Created (${myCreated.length})</div>`;
    if (myCreated.length === 0) {
        html += `<div class="card-body text-muted">No rides created yet.</div>`;
    } else {
        html += `<ul class="list-group list-group-flush">`;
        myCreated.forEach(r => html += `<li class="list-group-item">${r.source} → ${r.destination} <span class="badge bg-success float-end">${r.time}</span></li>`);
        html += `</ul>`;
    }
    html += `</div></div>`;

    html += `<div class="col-md-6"><div class="card"><div class="card-header bg-success text-white">Rides Joined (${joinedRides.length})</div>`;
    if (joinedRides.length === 0) {
        html += `<div class="card-body text-muted">No rides joined yet.</div>`;
    } else {
        html += `<ul class="list-group list-group-flush">`;
        joinedRides.forEach(r => html += `<li class="list-group-item">${r.source} → ${r.destination} <span class="badge bg-primary float-end">${r.time}</span></li>`);
        html += `</ul>`;
    }
    html += `</div></div>`;

    container.innerHTML = html;
}

// Page specific auto load
if (window.location.pathname.includes("search-ride.html")) window.onload = loadRides;
if (window.location.pathname.includes("reports.html")) window.onload = loadReports;