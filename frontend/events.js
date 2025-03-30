document.addEventListener("DOMContentLoaded", function () {
    fetchEvents();
});

document.addEventListener("DOMContentLoaded", function () {
    fetchEvents();
});

function fetchEvents() {
    fetch("/events")
        .then(response => response.json())
        .then(events => {
            console.log("Fetched events:", events);
            const container = document.getElementById("events-container");
            container.innerHTML = ""; 

            events.forEach(event => {
                const eventCard = document.createElement("div");
                eventCard.classList.add("event-card");

                // Create image element
                const eventImage = document.createElement("img");
                eventImage.src = event.image || 'https://via.placeholder.com/200';
                eventImage.alt = "Event Image";
                eventImage.classList.add("event-image");

                // Check if event is full
                const currentAttendees = event.currentAttendees || 0;
                const maxAttendees = event.maxAttendees || Infinity;
                const isFull = currentAttendees >= maxAttendees;
                const isRegistered = event.isRegistered || false; // Assuming backend sends this info

                // Create event details container
                const eventDetails = document.createElement("div");
                eventDetails.classList.add("event-details");
                eventDetails.innerHTML = `
                    <h3>${event.title}</h3>
                    <p><strong>Category:</strong> ${event.category}</p>
                    <p><strong>Date:</strong> ${new Date(event.date).toDateString()}</p>
                    <p><strong>Time:</strong> ${event.time}</p>
                    <p><strong>Venue:</strong> ${event.location || "TBD"}</p>
                    <p><strong>Description:</strong> ${event.description}</p>
                    <p><strong>Attendees:</strong> ${currentAttendees}/${maxAttendees}</p>
                    <button class="btn register-btn" data-id="${event._id}" 
                        style="background-color: ${isFull || isRegistered ? 'grey' : 'blue'}; color: white;" 
                        ${isFull || isRegistered ? "disabled" : ""}>
                        ${isRegistered ? "Registered" : isFull ? "Full" : "Register"}
                    </button>
                    <button class="btn delete-btn" data-id="${event._id}">Delete</button>
                `;

                // Append image and details to event card
                eventCard.appendChild(eventImage);
                eventCard.appendChild(eventDetails);

                // Append the event card to the container
                container.appendChild(eventCard);
            });

            // Add event listeners to Register buttons
            document.querySelectorAll(".register-btn").forEach(button => {
                button.addEventListener("click", function () {
                    const eventId = this.getAttribute("data-id");

                    if (!this.disabled) {
                        registerForEvent(eventId, this);
                    }
                });
            });

            // Add event listeners to Delete buttons
            document.querySelectorAll(".delete-btn").forEach(button => {
                button.addEventListener("click", function () {
                    const eventId = this.getAttribute("data-id");
                    showDeleteConfirmation(eventId);
                });
            });
        })
        .catch(error => console.error("Error fetching events:", error));
}

// Function to register for an event
async function registerForEvent(eventId) {
    const userId = localStorage.getItem("userId");

    if (!userId) {
        alert("You must be signed in to register for an event.");
        return;
    }

    try {
        const response = await fetch(`/register/${eventId}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId })
        });

        const data = await response.json();

        if (response.ok) {
            alert(data.message);
        } else {
            alert(data.message);
        }
    } catch (error) {
        console.error("Error:", error);
        alert("Something went wrong. Please try again.");
    }
}




// Show delete confirmation modal
function showDeleteConfirmation(eventId) {
    const modal = document.getElementById("delete-modal");

    if (!modal) {
        console.error("Delete modal not found in the DOM.");
        return;
    }

    modal.style.display = "block";
    modal.setAttribute("data-event-id", eventId);

    document.getElementById("confirm-delete").onclick = () => {
        deleteEvent(eventId);
        modal.style.display = "none";
    };

    document.getElementById("cancel-delete").onclick = () => {
        modal.style.display = "none";
    };
}

// Function to delete an event
async function deleteEvent(eventId) {
    try {
        const response = await fetch(`/events/${eventId}`, { method: "DELETE" });
        const result = await response.json();

        if (response.ok) {
            fetchEvents(); // ✅ Refresh event list silently after deletion
        } else {
            alert("Error deleting event: " + result.message);
        }
    } catch (error) {
        console.error("Error deleting event:", error);
    }
}
