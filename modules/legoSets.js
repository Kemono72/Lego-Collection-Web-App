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
require('dotenv').config();
const Sequelize = require('sequelize');

const sequelize = new Sequelize(process.env.DB_DATABASE, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    dialect: 'postgres',
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false,
        },
    },
    logging: false,
});

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

const Set = sequelize.define('Set', {
    set_num: {
        type: Sequelize.STRING,
        primaryKey: true,
    },
    name: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    year: {
        type: Sequelize.INTEGER,
        allowNull: false,
    },
    num_parts: {
        type: Sequelize.INTEGER,
        allowNull: true,
    },
    theme_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
    },
    img_url: {
        type: Sequelize.STRING,
        allowNull: true,
    },
}, {
    timestamps: false,
});

Set.belongsTo(Theme, { foreignKey: 'theme_id' });

function initialize() {
    return sequelize.sync()
        .then(() => Promise.resolve("Database synchronized successfully"))
        .catch((err) => Promise.reject(`Failed to synchronize database: ${err.message}`));
}

function getAllSets() {
    return Set.findAll({
        include: Theme,
    }).then(sets => sets.map(set => set.toJSON()))
        .catch(err => Promise.reject(`Error retrieving sets: ${err.message}`));
}

function getSetByNum(setNum) {
    return Set.findOne({
        where: { set_num: setNum },
        include: Theme,
    }).then(set => {
        if (!set) throw new Error(`Set with number ${setNum} not found`);
        return set.toJSON();
    }).catch(err => Promise.reject(`Error retrieving set: ${err.message}`));
}

function getSetsByTheme(theme) {
    return Set.findAll({
        include: Theme,
        where: { '$Theme.name$': { [Sequelize.Op.iLike]: `%${theme}%` } },
    }).then(sets => {
        if (sets.length === 0) throw new Error(`No sets found for theme: ${theme}`);
        return sets.map(set => set.toJSON());
    }).catch(err => Promise.reject(`Error retrieving sets by theme: ${err.message}`));
}

function getAllThemes() {
    return Theme.findAll()
        .then(themes => themes.map(theme => theme.toJSON()))
        .catch(err => Promise.reject(`Error retrieving themes: ${err.message}`));
}

function addSet(setData) {
    return Set.create(setData)
        .then(() => Promise.resolve())
        .catch(err => Promise.reject(`Error adding set: ${err.errors[0]?.message || err.message}`));
}

function editSet(set_num, setData) {
    return Set.update(setData, {
        where: { set_num },
    }).then(([affectedRows]) => {
        if (affectedRows === 0) throw new Error(`Set with number ${set_num} not found`);
        return Promise.resolve();
    }).catch(err => Promise.reject(`Error editing set: ${err.errors[0]?.message || err.message}`));
}

function deleteSet(set_num) {
    return Set.destroy({
        where: { set_num },
    }).then(deletedRows => {
        if (deletedRows === 0) throw new Error(`Set with number ${set_num} not found`);
        return Promise.resolve();
    }).catch(err => Promise.reject(`Error deleting set: ${err.errors[0]?.message || err.message}`));
}

module.exports = {
    initialize,
    getAllSets,
    getSetByNum,
    getSetsByTheme,
    getAllThemes,
    addSet,
    editSet,
    deleteSet,
};
