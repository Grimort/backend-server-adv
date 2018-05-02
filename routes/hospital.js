var express = require('express');
var app = express();
var mdAuth = require('../middlewares/autenticacion');

var Hospital = require('../models/hospital');


// ============================================
//            Obtener los hospitales
// ============================================
app.get('/', (req, res) => {
    var desde = req.query.desde || 0;
    desde = Number(desde);

    Hospital.find({})
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email')
        .exec((err, hospitales) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al cargar el hospital',
                    errors: err
                });
            }
            Hospital.count({}, (err, contador) => {
                if (err) {
                    return res.status(404).json({
                        ok: false,
                        mensaje: 'Error, no hay hospitales',
                        errors: err
                    });
                }
                res.status(200).json({
                    ok: true,
                    hospitales: hospitales,
                    total: contador
                });
            });
        });
});

// ============================================
//            Actualizar hospital
// ============================================
app.put('/:id', mdAuth.verificaToken, (req, res) => {

    var id = req.params.id;
    var body = req.body;

    Hospital.findById(id, (err, hospital) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al obtener el hospital',
                errors: err
            });
        }
        if (!hospital) {
            return res.status(404).json({
                ok: false,
                mensaje: 'El Hospital ' + id + ' no se ha encontrado',
                errors: { mensaje: 'No existe hospital con ese ID' }
            });
        }
        hospital.nombre = body.nombre;
        hospital.usuario = req.usuario._id; // revisar que es un usuario valido (usuario._id)
        hospital.save((err, hospitalGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar hospital.',
                    errors: err
                });
            }
            res.status(201).json({
                ok: true,
                hospital: hospitalGuardado
            });
        });

    });
});

// ============================================
//            Crear hospital
// ============================================
app.post('/', mdAuth.verificaToken, (req, res) => {
    var body = req.body;
    var hospital = new Hospital({
        nombre: body.nombre,
        usuario: req.usuario._id // revisar que es un usuario valido (usuario._id)
    });
    hospital.save((err, hospitalGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear hospital',
                errors: err
            });
        }
        res.status(201).json({
            ok: true,
            hospital: hospitalGuardado
        });
    });
});

// ============================================
//            Eliminar hospital
// ============================================
app.delete('/:id', mdAuth.verificaToken, (req, res) => {
    var id = req.params.id;

    Hospital.findByIdAndRemove(id, (err, hospitalBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al eliminar hospital',
                errors: err
            });
        }
        if (!hospitalBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al obtener el Hospital, no existe ninguna coincidencia.',
                errors: { mensaje: 'Error al obtener el Hospital, no existe ninguna coincidencia.' }
            });
        }
        res.status(200).json({
            ok: true,
            hospital: hospitalBorrado
        })
    });
});

module.exports = app;