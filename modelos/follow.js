'use strict'

const mongoose = require('mongoose');
var schema = mongoose.Schema;

var followSchema = Schema({
	user: { type: Schema.ObjectId, ref: 'User'},
	followed: { type: Schema.ObjectId, ref: 'User' }
});

module.exports = mongoose.model('Follow', followSchema);