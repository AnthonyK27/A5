require('dotenv').config();
const Sequelize = require('sequelize');

let sequelize = new Sequelize(
    process.env.DB_DATABASE,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        dialect: "postgres",
        port: 5432,
        dialectModule: require("pg"),
        dialectOptions: {
            ssl: { rejectUnauthorized: false},
        },
    }
);

sequelize
  .authenticate()
  .then(() => {
    console.log('Connection has been established successfully.');
  })
  .catch((err) => {
    console.log('Unable to connect to the database:', err);
  });

const Theme = sequelize.define(
    'Theme', 
    {
        id: { 
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        name: Sequelize.STRING,
        
    },
    {
        createdAt: false,
        updatedAt: false,
    }
);

const Set = sequelize.define(
    'Set', 
    {
        set_num: 
        {
            type: Sequelize.STRING,
            primaryKey: true,
        },
        name: Sequelize.STRING,
        year: Sequelize.INTEGER,
        num_parts: Sequelize.INTEGER,
        theme_id: Sequelize.INTEGER,
        img_url: Sequelize.STRING,
    },
    {
        createdAt: false,
        updatedAt: false,
    }
);

Set.belongsTo(Theme, {foreignKey: 'theme_id'});
Theme.hasMany(Set, {foreignKey: 'theme_id'});

function initialize() {
    return new Promise((resolve,reject) => {
        if(sequelize.sync()) {
            resolve('Initialization Resolved!');
        }
        else {
            reject('Unable to read data');
        }
    })
}

function getAllSets() {
    return new Promise((resolve,reject) => {
        sequelize.sync().then(() => {
            Set.findAll( { include: [Theme]})
            .then((data) => {
                if(data.length === 0) {
                    reject('Unable to return sets');
                }
                else {
                   resolve(data);
                }
            })
        });
    })
}
function getSetByNum(setNum) {
    return new Promise((resolve,reject) => {
        sequelize.sync().then(() => {
            Set.findAll( { include: [Theme], where: { set_num: {[Sequelize.Op.eq] : setNum}}})
            .then((data) => {
                if(data.length === 0) {
                    reject('Unable to return sets');
                }
                else {
                   resolve(data[0]);
                }
            })
        })
    })
}

function getSetsByTheme(theme) {
    return new Promise((resolve,reject) => {
        sequelize.sync().then(() => {
            Set.findAll({include: [Theme], where: {
                '$Theme.name$': {
                [Sequelize.Op.iLike]: `%${theme}%`
                }
            }})
            .then((data) => {
                if(data.length === 0) {
                    reject('Unable to return sets');
                }
                else {
                resolve(data);
                }
            })
        })
    })
}

function addSet(setData) {
    return new Promise((resolve,reject) => {
        sequelize.sync().then(() => {
            Set.create({
                set_num: setData.set_num,
                name: setData.name,
                year: setData.year,
                num_parts: setData.num_parts,
                theme_id: setData.theme_id,
                img_url: setData.img_url,
            })
            .then(() => {
                resolve();
            })
            .catch((err) => {
                reject(err.errors[0].message);
            })
        })
    })
}

function getAllThemes() {
    return new Promise((resolve,reject) => {
        sequelize.sync().then(() => {
            Theme.findAll({
                include: [{
                  model: Set,
                  required: true
                 }]
            })
            .then((data) => {
                if(data.length === 0) {
                    reject('Unable to return themes');
                }
                else {
                    //console.log(data);
                    resolve(data);
                }
            })
        });
    })
}

function editSet(set_num, setData) {
    return new Promise((resolve,reject) => {
        sequelize.sync().then(() => {
            Set.update(
                {
                    set_num: setData.set_num,
                    name: setData.name,
                    year: setData.year,
                    num_parts: setData.num_parts,
                    theme_id: setData.theme_id,
                    img_url: setData.img_url,
                },
                {
                    where: { set_num: set_num},
                }
            )
            .then(() => {
                resolve();
            })
            .catch((err) => {
                reject(err.errors[0].message);
            })
        })
    })
}

function deleteSet(set_num) {
    return new Promise((resolve,reject) => {
        sequelize.sync().then(() => {
            Set.destroy({
                where: {set_num : set_num},
            })
            .then(() => {
                resolve();
            })
            .catch((err) => {
                reject(err.errors[0].message);
            })
        })
    })
}

module.exports = { initialize, getAllSets, getSetByNum, getSetsByTheme, addSet, getAllThemes, editSet, deleteSet };