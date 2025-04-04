document.addEventListener("DOMContentLoaded", () => {
    const getStartedBtn = document.getElementById("get-started-btn");
    const form = document.getElementById("form");
    const user_name = document.getElementById("user_name");
    const email_input = document.getElementById("email_input");
    const password_input = document.getElementById("password_input");
    const repeat_password_input = document.getElementById("repeat_password_input");
    const error_message = document.getElementById("error-message");

    // ✅ Transition effect for "Get Started" button
    if (getStartedBtn) {
        getStartedBtn.addEventListener("click", (event) => {
            event.preventDefault(); // Prevent default instant navigation

            document.body.classList.add("slide-transition");

            // Wait for animation to complete before redirecting
            setTimeout(() => {
                window.location.href = "signin.html";
            }, 700);
        });
    }

    // ✅ Form Submission Logic
    if (form) {
        form.addEventListener("submit", async (e) => {
            e.preventDefault();

            let errors = [];

            if (user_name) {
                errors = getSignupFormErrors(user_name.value, email_input.value, password_input.value, repeat_password_input.value);
            } else {
                errors = getSigninFormErrors(email_input.value, password_input.value);
            }

            if (errors.length > 0) {
                error_message.innerText = errors.join(". ");
                return;
            }

            if (user_name) await submitForm();
            else await submitSignInForm();
        });
    }

    function getSignupFormErrors(username, email, password, repeatPassword) {
        let errors = [];

        if (username === "" || username == null) {
            errors.push("Firstname is required");
            user_name.classList.add("incorrect");
        }
        if (email === "" || email == null) {
            errors.push("Email is required");
            email_input.classList.add("incorrect");
        }
        if (password === "" || password == null) {
            errors.push("Password is required");
            password_input.classList.add("incorrect");
        }
        if (password.length < 8) {
            errors.push("Password must be at least 8 characters long");
            password_input.classList.add("incorrect");
        }
        if (password !== repeatPassword) {
            errors.push("Password does not match repeated password");
            password_input.classList.add("incorrect");
            repeat_password_input.classList.add("incorrect");
        }
        return errors;
    }

    function getSigninFormErrors(email, password) {
        let errors = [];

        if (email === "" || email == null) {
            errors.push("Email is required");
            email_input.classList.add("incorrect");
        }
        if (password === "" || password == null) {
            errors.push("Password is required");
            password_input.classList.add("incorrect");
        }
        return errors;
    }

    const allInput = [email_input, password_input];
    if (user_name) allInput.push(user_name);
    if (repeat_password_input) allInput.push(repeat_password_input);

    allInput.forEach((input) => {
        input.addEventListener("input", () => {
            if (input.classList.contains("incorrect")) {
                input.classList.remove("incorrect");
                error_message.innerText = "";
            }
        });
    });

    async function submitForm() {
        const formData = {
            username: user_name.value, // Ensure this is not undefined
            email: email_input.value,
            password: password_input.value
        };
    
        console.log("Form Data Being Sent:", formData); // Debugging
    
        try {
            const response = await fetch("/signup", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(formData)
            });
    
            const data = await response.json();
            console.log("Server Response:", data); // Debugging
    
            if (response.ok) {
                console.log("Signup successful");
                if (data.userId) {
                    localStorage.setItem("userId", data.userId);
                }
                window.location.href = "/main2.html";
            } else {
                error_message.innerText = data.message || "Signup failed.";
            }
        } catch (error) {
            console.error("Error:", error);
            error_message.innerText = "Something went wrong. Please try again";
        }
    }
    

    async function submitSignInForm() {
        const formData = {
            email: email_input.value,
            password: password_input.value
        };

        try {
            const response = await fetch("/signin", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                console.log("Signin successful");

                // ✅ Store userId in localStorage after signin
                if (data.userId) {
                    localStorage.setItem("userId", data.userId);
                }

                removeSignupElements();
                window.location.href = "/main2.html";
            } else {
                error_message.innerText = data.message;
            }
        } catch (error) {
            console.error("Error:", error);
            error_message.innerText = "Something went wrong. Please try again.";
        }
    }

    function removeSignupElements() {
        const signupContainer = document.getElementById("log");
        if (signupContainer) {
            signupContainer.remove();
            console.log("Signup elements removed after sign-in.");
        }
    }
});
