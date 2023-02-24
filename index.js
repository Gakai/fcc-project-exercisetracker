// Boilerplate code from https://github.com/freeCodeCamp/boilerplate-project-exercisetracker

require('dotenv').config()

const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')

const { requestLogger } = require('./mymiddleware.js')

const {
	connect,
	User,
	mongoose: { Types },
} = require('./database.js')

const DATE_REX = /^\d{4}-\d{2}-\d{2}$/

const app = express()

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

app.use(bodyParser.urlencoded({ extended: false }))

// Api request logger
app.use('/api', requestLogger())

function handleServerError(res, err, msg) {
	if (err instanceof Error) console.log(err.name, err.message)
	else console.log(err)
	return res.status(500).json({ error: msg })
}

function validateId(res, id) {
	if (!Types.ObjectId.isValid(id)) {
		console.log('Invalid user id:', id)
		res.status(400).json({ error: 'Invalid user id' })
		return false
	}
	return true
}

app
	.route('/api/users')
	.get(async (req, res) => {
		try {
			const data = await User.find({}).select({ username: true })
			return res.json(data)
		} catch (err) {
			return handleServerError(res, err, 'Could not fetch users')
		}
	})
	.post(async (req, res) => {
		const { username } = req.body
		if (!username) return res.status(400).json({ error: 'Missing username' })

		console.log(`Creating new user: '${username}'`)
		const user = new User({ username })
		try {
			const { _id } = (await user.save()).toObject()
			console.log(`Saved new user ${username} (${_id})`)
			return res.json({ _id, username })
		} catch (err) {
			return handleServerError(res, err, 'Unable to save user')
		}
	})

app.post('/api/users/:_id/exercises', async (req, res) => {
	const { _id } = req.params
	if (!validateId(res, _id)) return

	// FormData validation
	const { description, duration: durationStr, date: dateStr } = req.body
	console.log(`New Ex: '${description}' ${durationStr || '?'}m at '${dateStr}'`)
	if (!(typeof description === 'string' && description.length > 3))
		return res.status(400).json({ error: 'Description too short' })
	const duration = parseInt(durationStr)
	if (duration <= 0) return res.status(400).json({ error: 'Invalid duration' })
	/** @type {Date} */
	if (dateStr && !DATE_REX.test(dateStr))
		return res.status(400).json({ error: 'Invalid date' })
	// unification of the date-string
	const date = (dateStr ? new Date(dateStr) : new Date()).toDateString()

	const exercise = {
		date,
		duration,
		description,
	}

	try {
		const user = await User.findById(_id)
		if (!user) {
			console.log('User not found:', _id)
			return res.json({ error: 'Unknown user id' })
		}
		const username = user.username

		console.log(exercise)
		user.log.push(exercise)
		await user.save()

		console.log(`New Exercise saved for user ${username} (${_id})`)
		return res.json({
			_id,
			username,
			...exercise,
		})
	} catch (err) {
		return handleServerError(res, err, 'Unable to post exercise')
	}
})

app.get('/api/users/:_id/logs', async (req, res) => {
	const { _id } = req.params
	if (!validateId(res, _id)) return

	try {
		const user = await User.findById(_id)
		if (!user) {
			console.log('User not found:', _id)
			return res.json({ error: 'Unknown user id' })
		}
		const { id, log, ...resJson } = user.toObject({
			virtuals: true,
			versionKey: false,
		})

		// Query filtering
		const from = DATE_REX.test(req.query.from)
			? new Date(new Date(req.query.from).toDateString())
			: NaN
		const to = DATE_REX.test(req.query.to)
			? new Date(new Date(req.query.to).toDateString())
			: NaN
		const limit = parseInt(req.query.limit)
		console.log(from, to, limit)
		let filteredLogs = log
		if (!isNaN(from)) {
			filteredLogs = filteredLogs.filter(l => from <= new Date(l.date))
		}
		if (!isNaN(to)) {
			filteredLogs = filteredLogs.filter(l => to >= new Date(l.date))
		}
		if (!isNaN(limit)) {
			filteredLogs = filteredLogs.slice(0, limit)
		}

		return res.json({
			...resJson,
			log: filteredLogs,
		})
	} catch (err) {
		return handleServerError(res, err, 'Unable to get logs')
	}
})

const listener = app.listen(process.env.PORT || 3000, () => {
	console.log('Your app is listening on port ' + listener.address().port)
})
