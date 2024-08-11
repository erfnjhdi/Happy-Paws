console.log('JavaScript file loaded');
//display date and time in header
window.onload = function() {
    showDateTime();
    setInterval(showDateTime, 1000);
};

function showDateTime() {
    //The current date
    const current = new Date();
    const day = String(current.getDate()).padStart(2, '0');
    const month = String(current.getMonth() + 1).padStart(2, '0');
    const year = current.getFullYear();

    //The current time
    const hour = String(current.getHours()).padStart(2, '0');
    const minutes = String(current.getMinutes()).padStart(2, '0');
    const seconds = String(current.getSeconds()).padStart(2, '0');

    //Add to HTML element
    document.getElementById("date").innerHTML = `${year}-${month}-${day} ${hour}:${minutes}:${seconds}`;
}

//Validate if find_pet form is empty
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('findpet');
    const errorMessage = document.getElementById('error-message');

    form.addEventListener('submit', (event) => {
        // Clear previous messages
        errorMessage.textContent = '';

        const radioGroups = ['animal-type', 'preferred-gender'];
        const selectFields = ['animal-breed', 'preferred-age'];
        const checkboxGroup = 'social-preference';
        let allFieldsFilled = true;

        // Check radio button groups
        radioGroups.forEach(group => {
            const radios = form.querySelectorAll(`input[name="${group}"]`);
            if (![...radios].some(radio => radio.checked)) {
                allFieldsFilled = false;
            }
        });

        // Check at least one checkbox in the social preference group
        const checkboxes = form.querySelectorAll(`input[name="${checkboxGroup}"]`);
        if (![...checkboxes].some(checkbox => checkbox.checked)) {
            allFieldsFilled = false;
        }

        // Check select fields
        selectFields.forEach(name => {
            const select = form.querySelector(`select[name="${name}"]`);
            if (!select.value) {
                allFieldsFilled = false;
            }
        });

        if (!allFieldsFilled) {
            event.preventDefault();
            errorMessage.textContent = 'Please fill in all required fields.';
        }
    });
});

//validate pet_giveaway form
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('giveaway');
    const errorMessage = document.getElementById('error-message');

    form.addEventListener('submit', (event) => {
        // Clear previous messages
        errorMessage.textContent = '';

        const radioGroups = ['animal-type', 'preferred-gender'];
        const selectFields = ['animal-breed', 'preferred-age'];
        const checkboxGroup = 'social-preference';
        let allFieldsFilled = true;

        // Check radio button groups
        radioGroups.forEach(group => {
            const radios = form.querySelectorAll(`input[name="${group}"]`);
            if (![...radios].some(radio => radio.checked)) {
                allFieldsFilled = false;
            }
        });

        // Check at least one checkbox in the social preference group
        const checkboxes = form.querySelectorAll(`input[name="${checkboxGroup}"]`);
        if (![...checkboxes].some(checkbox => checkbox.checked)) {
            allFieldsFilled = false;
        }

        // Check select fields
        selectFields.forEach(name => {
            const select = form.querySelector(`select[name="${name}"]`);
            if (!select.value) {
                allFieldsFilled = false;
            }
        });

        if (!allFieldsFilled) {
            event.preventDefault();
            errorMessage.textContent = 'Please fill in all required fields.';
        }
    });
});

//check for user and password for account creation on client side
document.addEventListener('DOMContentLoaded', () => {
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const usernameError = document.getElementById('username-error');
    const passwordError = document.getElementById('password-error');
    const responseMessage = document.getElementById('response-message');
    const registrationForm = document.getElementById('registration');

    function validateUsername() {
        const username = usernameInput.value;
        const usernameTest = /^[a-zA-Z0-9]+$/;
        if (!username.match(usernameTest)) {
            usernameInput.classList.add('invalid');
            usernameError.textContent = 'Invalid username format.';
        } else {
            usernameInput.classList.remove('invalid');
            usernameError.textContent = '';
        }
    }

    function validatePassword() {
        const password = passwordInput.value;
        const passwordTest = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{4,}$/;
        if (!password.match(passwordTest)) {
            passwordInput.classList.add('invalid');
            passwordError.textContent = 'Invalid password format.';
        } else {
            passwordInput.classList.remove('invalid');
            passwordError.textContent = '';
        }
    }

    usernameInput.addEventListener('input', validateUsername);
    passwordInput.addEventListener('input', validatePassword);

    registrationForm.onsubmit = function(event) {
        validateUsername();
        validatePassword();
        if (usernameInput.classList.contains('invalid') || passwordInput.classList.contains('invalid')) {
            event.preventDefault();
            return; //prevent form submission if validation fails
        }

        //prevent the default form submission
        event.preventDefault();
        
        //create a FormData object and send via fetch
        const formData = new FormData(registrationForm);
        const data = Object.fromEntries(formData.entries());

        fetch('/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                responseMessage.textContent = data.message;
                responseMessage.className = 'success'; //add a success class for styling
                // Optionally, clear form fields
                registrationForm.reset();
            } else {
                responseMessage.textContent = data.message;
                responseMessage.className = 'error'; //add an error class for styling
            }
        })
        .catch(error => {
            console.error('Error:', error);
            responseMessage.textContent = 'An error occurred. Please try again.';
            responseMessage.className = 'error';
        });
    };
})

//check for user and password for login on client side
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const usernameInput = document.getElementById('login-username');
    const passwordInput = document.getElementById('login-password');
    const loginErrorMessage = document.getElementById('login-error-message');

    function validateUsername() {
        const username = usernameInput.value;
        const usernamePattern = /^[a-zA-Z0-9]+$/;
        if (!usernamePattern.test(username)) {
            return 'Invalid username format. Username must contain only letters and digits.';
        }
        return '';
    }

    function validatePassword() {
        const password = passwordInput.value;
        const passwordPattern = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{4,}$/;
        if (!passwordPattern.test(password)) {
            return 'Invalid password format. Password must be at least 4 characters long and contain at least one letter and one digit.';
        }
        return '';
    }

    loginForm.onsubmit = function(event) {
        event.preventDefault(); //prevent default form submission

        // Validate inputs
        const usernameError = validateUsername();
        const passwordError = validatePassword();

        if (usernameError || passwordError) {
            loginErrorMessage.textContent = `${usernameError} ${passwordError}`;
            return; //prevent form submission if validation fails
        }

        //create a FormData object and send via fetch
        const formData = new FormData(loginForm);
        const data = Object.fromEntries(formData.entries());

        fetch('/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                window.location.href = data.redirectUrl; //redirect to the specified URL
            } else {
                loginErrorMessage.textContent = data.message;
            }
        })
        .catch(error => {
            console.error('Error:', error);
            loginErrorMessage.textContent = 'An error occurred. Please try again.';
        });
    };
});
