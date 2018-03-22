'use strict'
const mongoose = require('mongoose');
var schema = mongoose.Schema;

var publicacionSchema = Schema({
	text: String,
	file: String,
	created_at: String,
	user: { type: Schema.ObjectId, ref: 'User'}
});

module.exports = mongoose.model('Publication', publicacionSchema);