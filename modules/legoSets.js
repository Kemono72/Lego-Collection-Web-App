/********************************************************************************
*  WEB322 – Assignment 02
* 
*  I declare that this assignment is my own work in accordance with Seneca's
*  Academic Integrity Policy:
* 
*  https://www.senecacollege.ca/about/policies/academic-integrity-policy.html
* 
*  Name: Kemono Onomek ID: 146433230  Date: Sep 26, 2024
*
********************************************************************************/
const fs = require('fs');
const Sequelize = require("sequelize");
require('dotenv').config();
require('pg');

// Validate required environment variables
const { DB_HOST, DB_USER, DB_PASSWORD, DB_DATABASE } = process.env;
if (!DB_HOST || !DB_USER || !DB_PASSWORD || !DB_DATABASE) {
  throw new Error("Missing required environment variables for database configuration.");
}

// Initialize Sequelize connection
const sequelize = new Sequelize(DB_DATABASE, DB_USER, DB_PASSWORD, {
  host: DB_HOST,
  dialect: 'postgres',
  port: 5432,
  dialectOptions: {
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
  },
});

// Define Theme model
const Theme = sequelize.define('Theme', { 
  id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: Sequelize.STRING, allowNull: false },
});

// Define Set model
const Set = sequelize.define('Set', {
  set_num: { type: Sequelize.STRING, primaryKey: true },
  name: { type: Sequelize.STRING, allowNull: false },
  year: { type: Sequelize.INTEGER, allowNull: false },
  num_parts: { type: Sequelize.INTEGER, allowNull: true },
  theme_id: { type: Sequelize.INTEGER, allowNull: false },
  img_url: { type: Sequelize.STRING, allowNull: true },
});

// Create association between Set and Theme models
Set.belongsTo(Theme, { foreignKey: 'theme_id' });

// Initialize database connection and sync models
function initialize() {
  return sequelize.sync()
    .then(() => Promise.resolve())
    .catch((err) => Promise.reject(`Unable to sync the database: ${err.message}`));
}

// Retrieve all themes from the database
function getAllThemes() {
  return Theme.findAll()
    .then(themes => Promise.resolve(themes))
    .catch(err => Promise.reject(`Error fetching themes: ${err.message}`));
}

// Function to add a new set to the database
function addSet(setData) {
  return Set.create(setData)
    .then(() => Promise.resolve())
    .catch(err => Promise.reject(`Error adding set: ${err.message || err.errors[0]?.message}`));
}

// Function to delete a set from the database
function deleteSet(set_num) {
  return Set.destroy({ where: { set_num } })
    .then((rowsDeleted) => {
      if (rowsDeleted > 0) {
        return Promise.resolve();
      } else {
        return Promise.reject("Set not found.");
      }
    })
    .catch(err => Promise.reject(`Error deleting set: ${err.message}`));
}

// Function to edit an existing set
function editSet(setNum, updatedData) {
  return Set.update(updatedData, { where: { set_num: setNum } })
    .then(([affectedRows]) => {
      if (affectedRows > 0) {
        return Promise.resolve();
      } else {
        return Promise.reject("Set not found or no changes made.");
      }
    })
    .catch(err => Promise.reject(`Error updating set: ${err.message}`));
}

// Retrieve all sets with associated theme data
function getAllSets() {
  return Set.findAll({ include: [Theme] })
    .then(sets => Promise.resolve(sets))
    .catch(err => Promise.reject(`Unable to retrieve sets: ${err.message}`));
}

// Retrieve a set by its set number with theme data included
function getSetByNum(setNum) {
  return Set.findOne({ include: [Theme], where: { set_num: setNum } })
    .then(set => {
      if (set) return Promise.resolve(set);
      else return Promise.reject("Set with number not found.");
    })
    .catch(err => Promise.reject(`Error finding set: ${err.message}`));
}

// Retrieve sets by theme name with theme data included
function getSetsByTheme(theme) {
  return Set.findAll({
    include: [Theme],
    where: {
      '$Theme.name$': {
        [Sequelize.Op.iLike]: `%${theme}%`
      }
    }
  })
    .then(sets => {
      if (sets.length > 0) return Promise.resolve(sets);
      else return Promise.reject(`No sets found for theme: ${theme}`);
    })
    .catch(err => Promise.reject(`Error finding sets by theme: ${err.message}`));
}

module.exports = { initialize, getAllSets, getSetByNum, getSetsByTheme, getAllThemes, addSet, deleteSet, editSet };
