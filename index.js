const express = require('express')
const cors = require('cors')
const { port } = require('./config/config.json')
const bodyParser = require('body-parser')
// require('./db/connection')

const db = require("./models");

db.sequelize.sync({ force: true }).then(() => {
  console.log("Drop and re-sync db.");
  db.users.create({
    firstname: 'paypay',
    lastname: 'admin',
    email: 'admin@paypay.com',
    password: 'admin1234',
    role: 'admin'
  }).then(data => {
    console.log('Admin user created successfully');
  }).catch(err => {
    console.log(err)
  });
});

const app = express()

app.use(cors())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())


const indexRoute = require('./routes/indexRoute')
const authRoutes = require('./routes/authRoutes')
const userRoutes = require('./routes/userRoutes')
const requestRoutes = require('./routes/requestRoutes')
const reviewRoutes = require('./routes/reviewRoutes')
app.use(express.static(__dirname + "/public"));


app.use('/api', [indexRoute, authRoutes, reviewRoutes, userRoutes, requestRoutes])

// Handle SPA
app.get(/.*/, (req, res) => res.sendFile(__dirname + '/public/index.html'));

app.listen(port, function () {
  console.log(`Paypay task app api is running at http://localhost:${port}`)
})

module.exports = app