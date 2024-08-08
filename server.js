/********************************************************************************
* WEB322 – Assignment 05
*
* I declare that this assignment is my own work in accordance with Seneca's
* Academic Integrity Policy:
*
* https://www.senecacollege.ca/about/policies/academic-integrity-policy.html
*
* Name: Anthony Korepanov Student ID: 153329230 Date: 2024-07-20
*
* Published URL: https://anthony-korepanov-web322-a5.vercel.app/
*
********************************************************************************/

const legoData = require("./modules/legoSets");
const express = require('express')
const path = require('path');
const app = express()
const port = 3000
app.use(express.static(__dirname + '/public'));
app.use(express.json());
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.use(express.urlencoded({extended:true}));

legoData.initialize()
.then((data) => {
    console.log(data);
  })
.catch((data) => {
console.log(data);
})


app.get('/', (req, res) => {
  res.render("home");
});
app.get('/about', (req, res) => {
  res.render("about");
})
app.get('/lego/sets', (req, res) => {
    if(req.query.theme)
    {
       //Handle Query
      legoData.getSetsByTheme(req.query.theme)
      .then((data) => {
        res.render("sets", {sets: data});
      })
      .catch((data) => {
        res.status(404).render("404", {message : data});
    })
    }
    else {
    legoData.getAllSets()
    .then((data) => {
      res.render("sets", {sets: data});
      })
    .catch((data) => {
        res.send(data);
    })
  }
});

app.get('/lego/sets/:setNum', (req, res) => {
  legoData.getSetByNum(req.params.setNum)
  .then((data) => {
    //console.log(data);
    res.render("set", {set: data});
  })
  .catch((data) => {
      res.status(404).render("404", {message : data});
  })
})

app.get('/lego/addSet', (req, res) => {
  legoData.getAllThemes()
  .then((themeData) => {
    res.render("addSet", {themes : themeData });
  })
  .catch((data) => {
    console.log(data);
  })
})

app.post('/lego/addSet', (req, res) => {
  legoData.addSet(req.body)
  .then(() =>{
    res.redirect('/lego/sets');
  })
  .catch((err) => {
    res.render("500", {message: `I'm sorry, but we have encountered the following error: ${err}`});
  })
})

app.get('/lego/editSet/:setNum', (req, res) => {
  legoData.getSetByNum(req.params.setNum)
  .then((setData) => {
    legoData.getAllThemes()
    .then((themeData) => {
      res.render("editSet", {themes : themeData, set : setData})
    })
  })
  .catch((err) => {
    res.status(404).render("404", {message : err});
  })
})

app.post('/lego/editSet', (req, res) => {
  legoData.editSet(req.body.set_num, req.body)
  .then(() =>{
    res.redirect('/lego/sets');
  })
  .catch((err) => {
    res.render("500", {message: `I'm sorry, but we have encountered the following error: ${err}`});
  })
})

app.get('/lego/deleteSet/:setNum', (req, res) => {
  legoData.deleteSet(req.params.setNum)
  .then(() => {
    res.redirect('/lego/sets');
  })
  .catch((err) => {
    res.render("500", {message: `I'm sorry, but we have encountered the following error: ${err}`});
  })
})

app.use((req, res, next) => {
  res.status(404).render("404", {message : "Im sorry, we could not find your request"});
});

app.listen(port, () => console.log(`Assignment 5 listening on port ${port}!`));  