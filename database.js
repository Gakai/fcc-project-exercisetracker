const mongoose = require('mongoose')
const { Schema, model } = mongoose
const { String, Number, Date } = Schema.Types

/** @param {mongoose.CallbackWithoutResult} callback */
function connect(callback) {
	mongoose.set('strictQuery', false)
	mongoose.connect(
		process.env.MONGO_URL,
		{ dbName: 'exercisetracker' },
		callback
	)
}

const userSchema = new Schema({
	username: String,
})
const User = model('User', userSchema)

const exerciseSchema = new Schema({
	username: String,
	description: String,
	duration: Number,
	date: Date,
})
const Exercise = model('Exercise', exerciseSchema)

// const logEntrySchema = new Schema({
// 	description: String,
// 	duration: Number,
// 	date: Date,
// })
const logSchema = new Schema({
	username: String,
	count: Number,
	log: [
		{
			description: String,
			duration: Number,
			date: Date,
		},
	],
})
const Log = model('Log', logSchema)

module.exports = {
	connect,
	Log,
	User,
	Exercise,
}
