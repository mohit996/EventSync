document.querySelector(".form-container form").addEventListener("submit", async function(event) {
    event.preventDefault();

    const formData = new FormData();
    formData.append("title", document.getElementById("event_name").value);
    formData.append("category", document.getElementById("category").value);
    formData.append("date", document.getElementById("date").value);
    formData.append("time", document.getElementById("event_time").value);
    formData.append("location", document.getElementById("venue").value);
    formData.append("description", document.getElementById("description").value);
    formData.append("maxAttendees", parseInt(document.getElementById("attendees").value));
    formData.append("createdBy", "Admin");

    const imageInput = document.getElementById("banner");
    if (imageInput.files.length > 0) {
        formData.append("eventImage", imageInput.files[0]);
    }

    try {
        const response = await fetch("/api/createevent", {
            method: "POST",
            body: formData
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        if (data.eventId) {
            alert("Event created successfully!");
            window.location.href = "events.html";
        } else {
            throw new Error('No event ID received');
        }
    } catch (error) {
        console.error("Error:", error);
        alert("Error creating event: " + error.message);
    }
});
