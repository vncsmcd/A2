/********************************************************************************
*  WEB322 – Assignment 02
* 
*  I declare that this assignment is my own work in accordance with Seneca's
*  Academic Integrity Policy:
* 
*  https://www.senecacollege.ca/about/policies/academic-integrity-policy.html
* 
*  Name: Vinicius Leal Student ID: 152826228  Date:09/23/2024
*
********************************************************************************/

const setData = require("../data/setData");
const themeData = require("../data/themeData");


let sets = []; 



// Initialize function to fill the sets array
function initialize() {
    return new Promise((resolve, reject) => {
        try {
            setData.forEach(set => {
                const theme = themeData.find(theme => theme.id === set.theme_id);
                sets.push({
                    ...set,
                    theme: theme ? theme.name : "Unknown"
                });
            });
            resolve();
        } catch (error) {
            reject("Error initializing sets data");
        }
    });
}

// Function to get all sets
function getAllSets() {
    return new Promise((resolve, reject) => {
        if (sets.length > 0) {
            resolve(sets);
        } else {
            reject("No sets available");
        }
    });
}

// Function to get a set by its set number
function getSetByNum(setNum) {
    return new Promise((resolve, reject) => {
        const set = sets.find(set => set.set_num === setNum);
        if (set) {
            resolve(set);
        } else {
            reject(`Unable to find set with set number: ${setNum}`);
        }
    });
}

// Function to get sets by theme
function getSetsByTheme(theme) {
    return new Promise((resolve, reject) => {
        const filteredSets = sets.filter(set => set.theme.toLowerCase().includes(theme.toLowerCase()));
        if (filteredSets.length > 0) {
            resolve(filteredSets);
        } else {
            reject(`Unable to find sets with theme: ${theme}`);
        }
    });
}



// Testing the functions
initialize();
console.log(getAllSets());
console.log(getSetByNum("001-1"));
console.log(getSetsByTheme("tech"));

// Export the functions
module.exports = {
    initialize,
    getAllSets,
    getSetByNum,
    getSetsByTheme
};

