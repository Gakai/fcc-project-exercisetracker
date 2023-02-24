// Boilerplate code from https://github.com/freeCodeCamp/boilerplate-project-exercisetracker

require('dotenv').config()

const express = require('express')
const app = express()
const cors = require('cors')

const { connect, Log, User, Exercise } = require('./database.js')
connect(err => {
	if (!err) return console.log('Database connected.')
	console.error('Connection to database failed.')
	process.exit(1)
})

app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
	res.sendFile(__dirname + '/views/index.html')
})

const listener = app.listen(process.env.PORT || 3000, () => {
	console.log('Your app is listening on port ' + listener.address().port)
})
