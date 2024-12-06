const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // Import bcryptjs for password hashing
require('dotenv').config();

const Schema = mongoose.Schema;

// Define userSchema
const userSchema = new Schema({
    userName: { type: String, unique: true },
    password: String,
    email: String,
    loginHistory: [
        {
            dateTime: Date,
            userAgent: String,
        }
    ]
});

let User; // to be defined on new connection

// Exported Functions
module.exports = {
    initialize() {
        return new Promise((resolve, reject) => {
            let db = mongoose.createConnection(process.env.MONGODB);
            db.on('error', (err) => {
                reject(err); // reject the promise with the provided error
            });
            db.once('open', () => {
                User = db.model('users', userSchema); // initialize User
                resolve();
            });
        });
    },

    registerUser(userData) {
        return new Promise((resolve, reject) => {
            // Check if passwords match
            if (userData.password !== userData.password2) {
                reject('Passwords do not match');
                return;
            }

            // Hash the password before saving
            bcrypt.hash(userData.password, 10)
                .then((hash) => {
                    // Replace the plain text password with the hashed password
                    userData.password = hash;

                    // Create a new user object
                    let newUser = new User({
                        userName: userData.userName,
                        password: userData.password,
                        email: userData.email,
                        loginHistory: [],
                    });

                    // Save the new user
                    newUser.save()
                        .then(() => resolve())
                        .catch((err) => {
                            if (err.code === 11000) {
                                reject('User Name already taken');
                            } else {
                                reject(`There was an error creating the user: ${err}`);
                            }
                        });
                })
                .catch(() => {
                    reject('There was an error encrypting the password');
                });
        });
    },

    checkUser(userData) {
        return new Promise((resolve, reject) => {
            User.find({ userName: userData.userName })
                .then((users) => {
                    if (users.length === 0) {
                        reject(`Unable to find user: ${userData.userName}`);
                        return;
                    }
                    let user = users[0];
                    bcrypt.compare(userData.password, user.password)
                        .then((result) => {
                            if (!result) {
                                reject(`Incorrect Password for user: ${userData.userName}`);
                                return;
                            }
                            // Update login history
                            if (user.loginHistory.length === 8) user.loginHistory.pop();
                            user.loginHistory.unshift({
                                dateTime: new Date().toString(),
                                userAgent: userData.userAgent,
                            });
                            User.updateOne(
                                { userName: user.userName },
                                { $set: { loginHistory: user.loginHistory } }
                            ).then(() => resolve(user))
                                .catch((err) => reject(`Error updating login history: ${err}`));
                        })
                        .catch(() => reject("Error comparing passwords"));
                })
                .catch(() => reject(`Unable to find user: ${userData.userName}`));
        });
    }
    
    
};
