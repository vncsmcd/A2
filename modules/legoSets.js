/******************************************************************************** 
*  WEB322 – Assignment 06
*  
*  I declare that this assignment is my own work in accordance with Seneca's 
*  Academic Integrity Policy: 
*  
*  https://www.senecacollege.ca/about/policies/academic-integrity-policy.html 
*  
*  Name: Vinicius Macedo Pereira Leal Student ID: 152826228 Date: 12/06/2024
* 
*  Published URL: https://a6-dun.vercel.app

********************************************************************************/


require('dotenv').config();
require ('pg');
const Sequelize = require('sequelize');

// Initialize Sequelize
let sequelize = new Sequelize(process.env.DB_DATABASE, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    dialect: 'postgres',
    port: 5432,
    dialectOptions: {
        require: true,
      ssl: { rejectUnauthorized: false },
    }
  });


// Define Theme Model
const Theme = sequelize.define('Theme', {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false,
    },
  }, {
    timestamps: false,
});

// Define Set Model
const Set = sequelize.define(
    'Set',
    {
      set_num: {
        type: Sequelize.STRING,
        primaryKey: true, 
      },
      name: Sequelize.STRING,
      year: Sequelize.INTEGER,
      num_parts: Sequelize.INTEGER,
      theme_id: Sequelize.INTEGER,
      img_url: Sequelize.STRING
    },
    {
      createdAt: false, 
      updatedAt: false,
    }
  );
  


Set.belongsTo(Theme, { foreignKey: 'theme_id' });

// Initialize Database
function initialize() {
    return new Promise(async (resolve, reject) => {
        try {
            await sequelize.sync(); // Synchronize the database models with the database
            console.log("Database synchronized successfully.");
            resolve();
        } catch (error) {
            console.error("Error synchronizing the database:", error);
            reject("Error initializing sets data");
        }
    });
}

// Fetch All Sets
function getAllSets() {
    return new Promise(async (resolve, reject) => {
        try {
            const sets = await Set.findAll({ include: [Theme] });
            if (sets.length > 0) {
                resolve(sets);
            } else {
                reject("No sets available");
            }
        } catch (error) {
            console.error("Error fetching sets:", error);
            reject("An error occurred while retrieving the sets.");
        }
    });
}

// Fetch a Set by Set Number
function getSetByNum(setNum) {
    return new Promise(async (resolve, reject) => {
        try {
            const sets = await Set.findAll({
                include: [Theme],
                where: { set_num: setNum },
            });
            if (sets.length > 0) {
                resolve(sets[0]);
            } else {
                reject(`Unable to find set with set number: ${setNum}`);
            }
        } catch (error) {
            console.error("Error fetching set by set number:", error);
            reject("An error occurred while retrieving the set.");
        }
    });
}

// Fetch Sets by Theme
function getSetsByTheme(theme) {
    return new Promise(async (resolve, reject) => {
        try {
            const sets = await Set.findAll({
                include: [Theme],
                where: {
                    '$Theme.name$': {
                        [Sequelize.Op.iLike]: `%${theme}%`,
                    },
                },
            });
            if (sets.length > 0) {
                resolve(sets);
            } else {
                reject(`Unable to find sets with theme: ${theme}`);
            }
        } catch (error) {
            console.error("Error fetching sets by theme:", error);
            reject("An error occurred while retrieving the sets.");
        }
    });
}

// Fetch All Themes
function getAllThemes() {
    return new Promise(async (resolve, reject) => {
        try {
            const themes = await Theme.findAll();
            resolve(themes);
        } catch (error) {
            console.error("Error fetching themes:", error);
            reject("An error occurred while retrieving themes.");
        }
    });
}

// Add a New Set
function addSet(setData) {
    return new Promise(async (resolve, reject) => {
        try {
            await Set.create(setData);
            resolve();
        } catch (error) {
            console.error("Error adding new set:", error);
            reject(error.errors[0]?.message || "An error occurred while adding the set.");
        }
    });
}


function updateSet(setNum, updatedData) {
    return new Promise(async (resolve, reject) => {
        try {
            const result = await Set.update(updatedData, {
                where: { set_num: setNum },
            });
            if (result[0] === 0) {
                reject(`Unable to update set with set number: ${setNum}`);
            } else {
                resolve();
            }
        } catch (error) {
            console.error("Error updating set:", error);
            reject("An error occurred while updating the set.");
        }
    });
}


function deleteSet(setNum) {
    return new Promise(async (resolve, reject) => {
        try {
            const result = await Set.destroy({
                where: { set_num: setNum },
            });
            if (result === 0) {
                reject(`Unable to delete set with set number: ${setNum}`);
            } else {
                resolve();
            }
        } catch (error) {
            console.error("Error deleting set:", error);
            reject("An error occurred while deleting the set.");
        }
    });
}


// Export Functions
module.exports = {
    initialize,
    getAllSets,
    getSetByNum,
    getSetsByTheme,
    getAllThemes,
    addSet,
    updateSet,
    deleteSet,
};