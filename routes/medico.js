var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var mdAuth = require('../middlewares/autenticacion');

var Medico = require('../models/medico');

var app = express();

// ============================================
//            Obtener los medicos
// ============================================
app.get('/', (req, res, next) => {
    var desde = req.query.desde || 0;
    desde = Number(desde);
    Medico.find({})
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email')
        .populate('hospital')
        .exec((err, medicos) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al cargar los medicos',
                    errors: err
                });
            }
            Medico.count({}, (err, contador) => {
                if (err) {
                    return res.status(404).json({
                        ok: false,
                        mensaje: 'Error, no hay medicos',
                        errors: err
                    });
                }
                res.status(200).json({
                    ok: true,
                    medicos: medicos,
                    total: contador
                });
            });
        });
});

// ============================================
//            Actualizar los medico
// ============================================
app.put('/:id', mdAuth.verificaToken, (req, res) => {
    var id = req.params.id;
    var body = req.body;

    Medico.findById(id, (err, medico) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al obtener el medico',
                errors: err
            });
        }
        if (err) {
            return res.status(404).json({
                ok: false,
                mensaje: 'El Medico ' + id + ' no se ha encontrado',
                errors: { mensaje: 'No existe el Medico con ese ID' }
            });
        }
        medico.nombre = body.nombre;
        medico.usuario = req.usuario._id;
        medico.hospital = body.hospital;
        medico.save((err, medicoGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar el medico',
                    errors: err
                });
            }
            res.status(200).json({
                ok: true,
                medico: medicoGuardado
            })
        });


    });
});

// ============================================
//            Crear medico
// ============================================
app.post('/', mdAuth.verificaToken, (req, res) => {
    var body = req.body;
    var medico = new Medico({
        nombre: body.nombre,
        usuario: req.usuario._id,
        hospital: body.hospital
    });

    medico.save((err, medicoGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear el medico',
                errors: err
            });
        }
        res.status(201).json({
            ok: true,
            medico: medicoGuardado
        });
    });
});

// ============================================
//            Eliminar medico
// ============================================
app.delete('/:id', mdAuth.verificaToken, (req, res) => {
    var id = req.params.id;

    Medico.findByIdAndRemove(id, (err, medicoBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al eliminar el medico',
                errors: err
            });
        }
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al obtener el Medico, no existe ninguna coincidencia.',
                errors: { mensaje: 'Error al obtener el Medico, no existe ninguna coincidencia.' }
            });
        }
        res.status(200).json({
            ok: true,
            medico: medicoBorrado
        });
    });
});

module.exports = app;