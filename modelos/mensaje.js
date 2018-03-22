'use strict'
const mongoose = require('mongoose');
var Schema = mongoose.Schema;

var mensajeSchema = Schema({
	text: String,
	created_at: String,
	emisor: { type: Schema.ObjectId, ref: 'User'},
	receptor: { type: Schema.ObjectId, ref: 'User'}
});

module.exports = mongoose.model('Mensaje', mensajeSchema);