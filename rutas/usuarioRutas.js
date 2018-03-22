'use strict'
const express = require('express');
const UsuarioControlador = require('../controladores/usuarioControlador');

var api = express.Router();
var middleWarAuth = require('../middleWares/authenticate');
var multiparty = require('connect-multiparty');

var md_upload = multiparty({uploadDir: './uploads/users'});

api.get('/home', UsuarioControlador.home);
api.get('/pruebas', middleWarAuth.ensureAuth, UsuarioControlador.pruebas);
api.post('/registrar', UsuarioControlador.saveUser);
api.post('/login', UsuarioControlador.loginUser);
api.get('/user/:id',  middleWarAuth.ensureAuth, UsuarioControlador.getUsuario);
api.get('/users/:page?', middleWarAuth.ensureAuth, UsuarioControlador.getUsers);
api.put('/updateUser/:id', middleWarAuth.ensureAuth, UsuarioControlador.updateUser);
api.post('/uploadAvatar/:id', [middleWarAuth.ensureAuth, md_upload], UsuarioControlador.cargarAvatar);
api.get('/getImageFile/:imageFile', UsuarioControlador.getImageFile);
module.exports = api;
