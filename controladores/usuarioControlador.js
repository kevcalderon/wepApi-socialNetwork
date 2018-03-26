'use strict'
const bcrypt = require('bcrypt-nodejs');
const Follow = require('../modelos/follow');
const User = require('../modelos/usuario');
var jwt = require('../services/jwt');
var mongoosePaginate = require('mongoose-pagination');
var fs = require('fs');
var path = require('path');
var async = require('asyncawait/async');
var await = require('asyncawait/await');

function home(req,res){
	res.status(200).send({
		message: "Saludo desde el servidor."
	});
}

function pruebas(req, res){
	res.status(200).send({
		message: "Accion de pruebas."
	});
}

//Registro de usuarios, con filtro.
function saveUser(req, res){
	var params = req.body;
	var user = new User();
	if(params.nombre && params.apellido && 
		params.nick && params.email && params.password){

		user.nombre = params.nombre;
	user.apellido = params.apellido;
	user.nick = params.nick;
	user.email = params.email;
	user.role = 'ROLE_USER';
	user.image = null;

		//CONTROLAR USUARIO DUPLICADO.
		User.find({ $or: [
			{email: user.email.toLowerCase()},
			{nick: user.nick.toLowerCase()}
			]}).exec((err, users)=>{
				if(err) return res.status(500).send({message: 'Error en la peticion'});

				if(users && users.length >= 1){
					return res.status(200).send({message: 'El usuario ya existe.'});
				} else {
					//GUARDA EL USUARIO Y EL RESTO DE CAMPOS.
					bcrypt.hash(params.password, null, null, (err, hash) =>{
						user.password = hash;
						user.save((err, userGuard)=>{
							if(userGuard){
								res.status(200).send({user: userGuard});
							} else if (err){
								return res.status(500).send({message: 'Error al guardar el usuario.'});
							} else {
								res.status(404).send({message: 'No se ha registrado.'});
							}
						});
					});

				}
			});

		} else {
			res.status(200).send({
				message: 'Todos los campos son necesarios.'
			});
		}
	}

	//Login de usuarios.
	function loginUser(req, res){
		var params = req.body;
		var email = params.email;
		var password = params.password;

		User.findOne({email: email}, (err, user)=>{
			if(err){
				return res.status(500).send({ message: 'Error en la peticion.'});
			} else if (user){
				bcrypt.compare(password, user.password, (err, check)=>{
					if(check){
						//Devolver datos del usuario.
						if(params.getToken){
							//generar y devolver token
							return res.status(200).send({
								token: jwt.createToken(user)
							});
						} else {
							return res.status(200).send({user});
						}
					} else {
						//error
						return res.status(404).send({message: 'No se ha podido identificar.'});
					}
				});
			} else {
				return res.status(404).send({message: 'El usuario no existe.'})
			}
		});
	}

	//Edicion de datos de usuario
	function updateUser(req, res){
		var userId = req.params.id;
		var update = req.body;

		//borrar la propiedad password
		delete update.password;

		if(userId != req.user.sub){
			//identificar si se logeo si no es asi no tiene permisos.
			return res.status(500).send({
				message: 'No tienes permiso para actualizar.'
			});
		}

		User.findByIdAndUpdate(userId, update, {new:true}, (err, userUpdated)=>{
			//new: true, devuelve el objeto actualizado.
			if(err) return res.status(500).send({
				message: 'Error en la peticion.'
			});

				if(!userUpdated) return res.status(404).send({
					message: 'No se ha podido actualizar el usuario.'
				});

					return res.status(200).send({
						user: userUpdated
					});
				});
	}


	//middleWare
	/*
	 metodo que se ejecuta antes de ejecutar la accion
	 del controlador que nosotros queremos 
	 que se ejecute.
	 */

	//Conseguir datos de un usuario
	function getUsuario(req, res){
		/*Cuando se tienen datos por url(params),
		  cuando se tienen datos por REST post-put(body).
		  */
		  var userId = req.params.id;

		  User.findById(userId, (err, user)=>{
		  	if(err)	return res.status(500).send({
		  		message: 'Error en la peticion'
		  	});
		  		if(!user) return res.status(404).send({
		  			message: 'El usuario no existe.'
		  		});	
		  			Follow.findOne({
		  				"user": req.user.sub,
		  				"followed": userId
		  			}).exec((err, follow)=>{
		  				if(err) return res.status(500).send({message: 'Error al comprobar el seguimiento.'});

		  				return res.status(200).send({user, follow});
		  			})


		  		});
		}


	//Conseguir lista de usuarios.
	function getUsers(req, res){
		//id del usuario logeado.
		var identityUserId = req.user.sub;
		var page = 1;

		if(req.params.page){
			page = req.params.page;
		}

		var itemsPorPage = 5;

		User.find().sort('_id').paginate(page, itemsPorPage, (err, users, total)=>{
			if(err){
				return res.status(500).send({
					message: 'Error en la peticion'
				});
			} else if(!users){
				return res.status(404).send({
					message: 'No hay usuarios.'
				});
			} else {
				return res.status(200).send({
					users,
					total,
					//redondeo, para el numero de paginas que devuelve.
					pages: Math.ceil(total/itemsPorPage)

				});
			}
		});
	}

	//Subir avatar.
	function cargarAvatar(req,res){
		var userId = req.params.id;

		if(userId != req.user.sub){
			//identificar si se logeo si no es asi no tiene permisos.
			return res.status(500).send({
				message: 'No tienes permiso para actualizar.'
			});
		}

		if(req.files){
			var filespath = req.files.image.path;
			var fileSplit = filespath.split('\\');
			console.log(filespath);
			console.log(fileSplit);

			var file_name = fileSplit[2];
			console.log(file_name);

			var extenseSplit = file_name.split('\.');
			var file_ext = extenseSplit[1];
			console.log(extenseSplit);

			if(userId != req.user.sub){
			//identificar si se logeo si no es asi no tiene permisos.
			return removeFilesOfUploads(res, filespath, 'No tienes permiso para actualizar.');
		}	

		if(file_ext == 'png' || file_ext == 'jpg' || file_ext == 'jpeg' || file_ext == 'gif'){
			User.findByIdAndUpdate(userId, {image: file_name}, {new: true}, (err, userUpdated)=>{
				if(err) return res.status(500).send({
					message: 'Error en la peticion.'
				});

					if(!userUpdated) return res.status(404).send({
						message: 'No se ha podido actualizar el usuario.'
					});

						return res.status(200).send({
							user: userUpdated
						});

					});
		} else {
			return removeFilesOfUploads(res, filespath, 'Extension no valida.');
		}

	} else {
		return res.status(200).send({
			message: 'No hay archivos para cargar.'
		});
	}
}

function removeFilesOfUploads(res, filespath, message){
	fs.unlink(filespath, (err)=>{
		return res.status(200).send({message: message});
	});
}

function getImageFile(req,res){
	var imageFile = req.params.imageFile;
	var path_file = './uploads/users/' + imageFile;
	fs.exists(path_file, (exists)=>{
		if(exists){
			res.sendFile(path.resolve(path_file));
		} else {
			res.status(200).send({message: 'No existe la imagen.'});
		}
	});
}



module.exports = {
	home,
	pruebas,
	saveUser,
	loginUser,
	getUsuario,
	getUsers,
	updateUser,
	cargarAvatar,
	getImageFile
}
