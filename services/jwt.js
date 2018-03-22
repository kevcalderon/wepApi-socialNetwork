'use strict'
const jwt = require('jwt-simple');
var moment = require('moment');

//con esta clave se genera el
var secret = 'clave_secreta';

exports.createToken = function(user){
	var payload = {
		sub: user._id,
		nombre: user.nombre,
		apellido: user.apellido,
		nick: user.nick,
		email: user.email,
		rol: user.role,
		image: user.image,
		//fecha y hora de creacion
		iat: moment().unix(),
		//fecha de expiracion
		exp: moment().add(30, 'days').unix
	};

	return jwt.encode(payload, secret);

};