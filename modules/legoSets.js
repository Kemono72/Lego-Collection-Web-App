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

const setData = require("../data/setData.json");
const themeData = require("../data/themeData.json");

let sets = [];


function initialize() {
    return new Promise((resolve, reject) => { 
      try {
        sets = [];
        setData.forEach(set => { 
          const theme = themeData.find(theme => theme.id === set.theme_id)?.name || 'Unknown'; 
          sets.push({
            ...set, 
            theme   
          });
        });
        resolve();
      } catch (error) {
        reject("Initializing failed " + error.message);
      }
    });
  }

function getAllSets() {
    return new Promise((resolve, reject) => {
      if (sets.length > 0) {
        resolve(sets); 
      } else {
        reject('No sets found.');
      }
    });
  }


  function getSetByNum(setNum) {
    return new Promise((resolve, reject) => {
      const matchedSet = sets.find(set => set.set_num === setNum);
      if (matchedSet) {
        resolve(matchedSet);
      } else {
        reject(`Set with number ${setNum} not found`);
      }
    });
  }


function getSetsByTheme(theme) {
    return new Promise((resolve, reject) => {
      const themeSets = sets.filter(set => set.theme.toLowerCase().includes(theme.toLowerCase()));
      if (themeSets.length > 0) {
        resolve(themeSets);
      } else {
        reject(`No sets found for theme: ${theme}`);
      }
    });
  }

module.exports = { initialize, getAllSets, getSetByNum, getSetsByTheme }
 

