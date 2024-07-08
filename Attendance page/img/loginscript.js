document.querySelector('#loginForm2').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent the form from submitting the traditional way

    const email = document.querySelector('#username').value;
    const password = document.querySelector('#password').value;
    const errorMessageElement = document.querySelector('#error-message');

    fetch('https://localhost:7198/api/Account/Login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json' // Adjusted to accept JSON
        },
        body: JSON.stringify({ userName: email, password: password })
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(err => {
                throw new Error(err[""][0]); // Extract the error message
            });
        }
        return response.json();
    })
    .then(data => {
        console.log('Success:', data);
        // Save token to cookies
        document.cookie = `authToken=${data.token}; path=/`;
        // Redirect to main page on successful login
        window.location.href = "../Main Page/main_page.html";
    })
    .catch(error => {
        console.error('There was a problem with your fetch operation:', error);
        errorMessageElement.textContent = error.message; // Display the error message to the user
    });
});

// Function to delete cookies
function deleteCookie(name) {
    document.cookie = name + '=; Max-Age=0; path=/; domain=' + location.hostname;
}

// Event listener for the logout button
document.querySelector('#logoutButton').addEventListener('click', function() {
    deleteCookie('authToken'); // Delete the authToken cookie
    window.location.href = "../Login Page/login.html"; // Redirect to the login page
});
