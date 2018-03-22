'use strict'
const mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = Schema({
	nombre: String,
	apellido: String,
	nick: String,
	email: String,
	password: String,
	rol: String,
	image: String
});

module.exports = mongoose.model('User', userSchema);