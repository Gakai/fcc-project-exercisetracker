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

const ExerciseSchema = new Schema(
	{
		description: { type: String, required: true, minLength: 3 },
		duration: { type: Number, required: true, min: 1 },
		date: { type: Date, required: true },
	},
	{ _id: false }
)

const userSchema = new Schema(
	{
		username: { type: String, required: true, minLength: 1 },
		log: [ExerciseSchema],
	},
	{
		virtuals: {
			count: {
				get() {
					return this.log.length
				},
			},
		},
	}
)
const User = model('User', userSchema)

module.exports = {
	mongoose,
	connect,
	User,
}
