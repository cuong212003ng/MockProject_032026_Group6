const express = require('express')
const indexRoutes = require('./routes/index.route')

const app = express();

app.use(express.json())

app.use('/api', indexRoutes)

app.get('/', (req, res) => {
    res.send('Student Management API');
});

module.exports = app;