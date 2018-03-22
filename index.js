'use strict'

var mongoose = require('mongoose');
var app = require('./app');
var port = 3800;

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/database_social')
	.then(() =>{
		console.log("Base de datos conectada.");

		//Crear servidor.
		app.listen(port, ()=>{
			console.log("Servidor corriendo.");
		});
	}). catch(error=> console.log(error));

