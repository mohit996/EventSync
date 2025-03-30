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

    // Image file handling
    const imageInput = document.getElementById("banner");
    if (imageInput.files.length > 0) {
        formData.append("eventImage", imageInput.files[0]); // Attach image
    }

    try {
        const response = await fetch("/createevent", {
            method: "POST",
            body: formData // Browser auto-sets Content-Type for FormData
        });

        if (response.ok) {
            console.log("Event created successfully!");
            window.location.href = "events.html"; // Redirect after successful creation
        } else {
            const data = await response.json();
            alert(data.message || "Failed to create event");
        }
    } catch (error) {
        console.error("Error:", error);
        alert("Error creating event");
    }
});
