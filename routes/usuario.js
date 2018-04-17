var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var mdAuth = require('../middlewares/autenticacion');
// var SEED = require('../config/config').SEED;

var app = express();

var Usuario = require('../models/usuario');

// Rutas
// ============================================
//            Obtener los usuarios 
// ============================================
app.get('/', (req, res, next) => {

    Usuario.find({}, '_id nombre email img role ') // devuelve los mismo con el .exec o si el '?'
        .exec((err, usuarios) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error cargando usuarios',
                    errors: err
                });
            }

            res.status(200).json({
                ok: true,
                usuarios: usuarios
            });
        });
});

// ============================================
//            Actualizar usuario 
// ============================================

app.put('/:id', mdAuth.verificaToken, (req, res) => {

    var id = req.params.id;
    var body = req.body;

    Usuario.findById(id, (err, usuario) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuario.',
                errors: err
            });
        }
        if (!usuario) {
            return res.status(404).json({
                ok: false,
                mensaje: 'El usuario ' + id + ' no se ha encontrado.',
                errors: { message: 'No existe usuario con ese ID ' }
            });
        }
        usuario.nombre = body.nombre;
        usuario.email = body.email;
        usuario.role = body.role;
        usuario.password = 'lo:que:quieras';
        usuario.save((err, usuarioGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar usuario.',
                    errors: err
                });
            }
            res.status(201).json({
                ok: true,
                usuario: usuarioGuardado
            });
        });
    });
});

// ============================================
//            Crear nuevo usuario 
// ============================================
app.post('/', mdAuth.verificaToken, (req, res) => {
    var body = req.body;
    var usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        img: body.img,
        role: body.role
    });
    usuario.save((err, usuarioGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear usuario.',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            usuario: usuarioGuardado,
            usaurioToken: req.usuario
        });
    });
});

// ============================================
//            Borrar usuario 
// ============================================
app.delete('/:id', mdAuth.verificaToken, (req, res) => {
    var id = req.params.id;

    Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar usuario.',
                errors: err
            });
        }
        if (!usuarioBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al obtener usuario. No existe el usuario con ese ID',
                errors: { message: 'Error al obtener usuario. No existe el usuario con ese ID' }
            });
        }
        res.status(200).json({
            ok: true,
            usuario: usuarioBorrado
        });
    });
});


module.exports = app;