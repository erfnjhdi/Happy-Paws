//import modules
const express = require('express');
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');
const session = require('express-session');
//create express apps
const app = express();
const port = 5001;

//serve static files from 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

//EJS view engine
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//set up sessions
app.use(session({
    secret: 'your-secret-key', // replace with a strong secret key
    resave: false,
    saveUninitialized: true,
}));

//path to login txt file
const loginFilePath = path.join(__dirname, 'data/login.txt');

//middleware to check if user is logged in
function checkLogin(req, res, next) {
    if (req.session.user) {
        next();
    } else {
        res.render('login', { message: 'Please log in to access this page.' });
    }
}

//routes for pages
app.get('/', (req, res) => res.render('home'));
app.get('/find_pet', (req, res) => res.render('find_pet'));
app.get('/dog_care', (req, res) => res.render('dog_care'));
app.get('/cat_care', (req, res) => res.render('cat_care'));
app.get('/pet_giveaway', checkLogin, (req, res) => res.render('pet_giveaway'));
app.get('/contact_us', (req, res) => res.render('contact_us'));
app.get('/privacy', (req, res) => res.render('privacy'));
app.get('/create_account', (req, res) => res.render('create_account'));

//route to handle registration form submission
app.post('/register', (req, res) => {
    const { username, password } = req.body;

    if (!validateUsernameFormat(username)) {
        res.status(400).json({ success: false, message: 'Invalid username format. Username must contain only letters and digits.' });
        return;
    }

    if (!validatePasswordFormat(password)) {
        res.status(400).json({ success: false, message: 'Invalid password format. Password must be at least 4 characters long and contain at least one letter and one digit.' });
        return;
    }

    if (usernameExists(username)) {
        res.status(409).json({ success: false, message: 'Username already exists. Please choose a different username.' });
    } else {
        const newUserEntry = `${username}:${password}\n`;
        fs.appendFileSync(loginFilePath, newUserEntry, 'utf-8');
        res.status(201).json({ success: true, message: 'Account created successfully. You can now login' });
    }
});


//route to handle login form submission
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    if (!validateUsernameFormat(username)) {
        return res.status(400).json({ success: false, message: 'Invalid username format. Username must contain only letters and digits.' });
    }

    if (!validatePasswordFormat(password)) {
        return res.status(400).json({ success: false, message: 'Invalid password format. Password must be at least 4 characters long and contain at least one letter and one digit.' });
    }

    if (!usernameExists(username) || !isPasswordCorrect(username, password)) {
        return res.status(401).json({ success: false, message: 'Invalid username or password.' });
    }

    // Create session or any other login-related logic
    req.session.user = { username }; // Example: Store user info in session

    // Redirect URL after successful login
    res.json({ success: true, redirectUrl: '/pet_giveaway' });
});

//validate username format
function validateUsernameFormat(username) {
    const usernamePattern = /^[a-zA-Z0-9]+$/;
    return usernamePattern.test(username);
}

//validate password format
function validatePasswordFormat(password) {
    const passwordPattern = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{4,}$/;
    return passwordPattern.test(password);
}

//check if username exists
function usernameExists(username) {
    const fileContent = fs.readFileSync(loginFilePath, 'utf8');
    const users = fileContent.split('\n').filter(line => line.trim() !== '');

    return users.some(line => line.startsWith(username + ':'));
}

//check if password is correct
function isPasswordCorrect(username, password) {
    const fileContent = fs.readFileSync(loginFilePath, 'utf8');
    const users = fileContent.split('\n').filter(line => line.trim() !== '');

    for (const line of users) {
        const [storedUsername, storedPassword] = line.split(':');
        if (storedUsername === username) {
            return storedPassword === password;
        }
    }

    return false;
}

//route to handle user logout
app.get('/logout', (req, res) => {
    if(req.session && req.session.user && req.session.user.username){
        // End the session
        req.session.destroy(err => {
            if (err) {
                return res.redirect('/'); //redirect to home in case of an error
            }
            //display logout successful message
            res.render('logout', { message: 'Logout successful.' });
        });
    } else {
        //display not logged in message
        res.render('logout', { message: 'You are not logged in, please log in first or create an account.' });
    }
});

//path to pet info file
const petGiveawayFilePath = path.join(__dirname, 'data/available_animals.txt');

//function to get the nextid based on previous
const getNextPetId = (callback) => {
    fs.readFile(petGiveawayFilePath, 'utf8', (err, data) => {
        if (err) {
            //If the file doesn't exist or there's an error, start with ID 1
            return callback(null, 1);
        }

        const lines = data.trim().split('\n');
        let maxId = 0;

        lines.forEach(line => {
            const parts = line.split(':');
            const id = parseInt(parts[0], 10);
            if (id > maxId) {
                maxId = id;
            }
        });

        //return the next ID
        callback(null, maxId + 1);
    });
};

//route to serve pet giveaway form
app.post('/submit_pet_giveaway', checkLogin, (req, res) => {
    const { 'animal-type': animalType, 'animal-breed': animalBreed, 'preferred-age': preferredAge, 'preferred-gender': preferredGender, 'social-preference': socialPreference } = req.body;
    const username = req.session.user.username; // Retrieve username from session

    //get the next pet ID and handle the callback
    getNextPetId((err, nextId) => {
        if (err) {
            console.error('Error getting next pet ID:', err);
            res.render('pet_giveaway', { message: 'Error saving pet information.' });
            return;
        }

        //format the data
        const petData = `${nextId}:${username}:${animalType}:${animalBreed}:${preferredAge}:${preferredGender}:${socialPreference}\n`;

        //append the pet data to the file
        fs.appendFile(petGiveawayFilePath, petData, err => {
            if (err) {
                res.render('pet_giveaway', { message: 'Error saving pet information.' });
                return;
            }

            res.render('pet_giveaway', { message: 'Pet registered for adoption successfully!' });
        });
    });
});

//route for find_pet submission and comparing to txt info file results
app.post('/submit_find', (req, res) => {
    const { 'animal-type': searchType, 'animal-breed': searchBreed, 'preferred-age': searchAge, 'preferred-gender': searchGender, 'social-preference': searchSocial } = req.body;

    //read available animals data
    fs.readFile(petGiveawayFilePath, 'utf8', (err, data) => {
        if (err) {
            res.status(500).send('Error reading pet information.');
            return;
        }

        const pets = data.split('\n').filter(Boolean); //remove empty lines
        const matchingPets = pets.filter(pet => {
            const [id, , type, breed, age, gender, social] = pet.split(':').map(field => field.trim()); // Trim whitespace

            //check each field, allowing "Does not matter" to match anything
            const typeMatch = !searchType || searchType === type;
            const breedMatch = !searchBreed || searchBreed === breed || searchBreed === 'Does not matter';
            const ageMatch = !searchAge || searchAge === age || searchAge === 'Does not matter';
            const genderMatch = !searchGender || searchGender === gender || searchGender === 'Does not matter';
            const socialMatch = !searchSocial || searchSocial === social;

            return typeMatch && breedMatch && ageMatch && genderMatch && socialMatch;
        });

        if (matchingPets.length > 0) {
            const formattedPets = matchingPets.map(pet => {
                const [id, , type, breed, age, gender, social] = pet.split(':').map(field => field.trim()); //trim whitespace
                return `ID: ${id}, Type: ${type}, Breed: ${breed}, Age: ${age}, Gender: ${gender}, Social Preference: ${social}`;
            }).join('<br><br>');

            res.render('match_results', { results: `Here are the pets we found for you:<br><br>${formattedPets}` });
        } else {
            res.render('match_results', { results: 'No pets found matching your criteria.' });
        }
    });
});




//start server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
