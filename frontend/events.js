document.addEventListener("DOMContentLoaded", function() {
    fetchEvents();
});

async function fetchEvents() {
    try {
        const response = await fetch("/api/events");
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const events = await response.json();
        displayEvents(events);
    } catch (error) {
        console.error("Error fetching events:", error);
        document.getElementById("events-container").innerHTML = 
            `<p class="error-message">Error loading events. Please try again later.</p>`;
    }
}

function displayEvents(events) {
    const container = document.getElementById("events-container");
    container.innerHTML = "";

    events.forEach(event => {
        const eventCard = createEventCard(event);
        container.appendChild(eventCard);
    });
}

function createEventCard(event) {
    const eventCard = document.createElement("div");
    eventCard.classList.add("event-card");

    const eventImage = document.createElement("img");
    eventImage.src = event.image || 'https://via.placeholder.com/200';
    eventImage.alt = "Event Image";
    eventImage.classList.add("event-image");

    const currentAttendees = event.currentAttendees || 0;
    const maxAttendees = event.maxAttendees || Infinity;
    const isFull = currentAttendees >= maxAttendees;
    const isRegistered = event.registeredUsers?.includes(localStorage.getItem("userId"));

    const eventDetails = document.createElement("div");
    eventDetails.classList.add("event-details");
    eventDetails.innerHTML = `
        <h3>${event.title}</h3>
        <p><strong>Category:</strong> ${event.category}</p>
        <p><strong>Date:</strong> ${new Date(event.date).toDateString()}</p>
        <p><strong>Time:</strong> ${event.time}</p>
        <p><strong>Venue:</strong> ${event.location}</p>
        <p><strong>Description:</strong> ${event.description}</p>
        <p><strong>Attendees:</strong> ${currentAttendees}/${maxAttendees}</p>
        <button class="btn register-btn" data-id="${event._id}" 
            ${isFull || isRegistered ? "disabled" : ""}>
            ${isRegistered ? "Registered" : isFull ? "Full" : "Register"}
        </button>
        <button class="btn delete-btn" data-id="${event._id}">Delete</button>
    `;

    eventCard.appendChild(eventImage);
    eventCard.appendChild(eventDetails);

    // Add event listeners
    const registerBtn = eventDetails.querySelector(".register-btn");
    registerBtn.addEventListener("click", () => registerForEvent(event._id));

    const deleteBtn = eventDetails.querySelector(".delete-btn");
    deleteBtn.addEventListener("click", () => showDeleteConfirmation(event._id));

    return eventCard;
}

async function registerForEvent(eventId) {
    const userId = localStorage.getItem("userId");
    if (!userId) {
        alert("Please sign in to register for events");
        return;
    }

    try {
        const response = await fetch(`/api/register/${eventId}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        alert(data.message);
        fetchEvents(); // Refresh the events list
    } catch (error) {
        console.error("Error:", error);
        alert("Error registering for event: " + error.message);
    }
}

async function deleteEvent(eventId) {
    try {
        const response = await fetch(`/api/events/${eventId}`, {
            method: "DELETE"
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        alert(data.message);
        fetchEvents(); // Refresh the events list
    } catch (error) {
        console.error("Error:", error);
        alert("Error deleting event: " + error.message);
    }
}

function showDeleteConfirmation(eventId) {
    if (confirm("Are you sure you want to delete this event?")) {
        deleteEvent(eventId);
    }
}
