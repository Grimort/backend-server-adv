var express = require('express');
var Hospital = require('../models/hospital');
var Medico = require('../models/medico');
var Usuario = require('../models/usuario');

var app = express();


// Rutas
// =======================================================
//             Busqueda General
// =======================================================
app.get('/todo/:busqueda', (req, res, next) => {
    var busqueda = req.params.busqueda;
    var regExp = new RegExp(busqueda, 'i');

    Promise.all([
        buscarHospitales(busqueda, regExp),
        buscarMedicos(busqueda, regExp),
        buscarUsuarios(busqueda, regExp)
    ]).then(respuestas => {
        res.status(200).json({
            ok: true,
            hospitales: respuestas[0],
            medicos: respuestas[1],
            usuarios: respuestas[2]
        });
    });
});

// =======================================================
//             Busqueda Especifica
// =======================================================
app.get('/coleccion/:tabla/:busqueda', (req, res) => {
    var tabla = req.params.tabla;
    var busqueda = req.params.busqueda;
    var regExp = new RegExp(busqueda, 'i');
    var promesa;

    switch (tabla) {
        case 'medicos':
            promesa = buscarMedicos(busqueda, regExp);
            break;
        case 'usuarios':
            promesa = buscarUsuarios(busqueda, regExp);
            break;
        case 'hospitales':
            promesa = buscarHospitales(busqueda, regExp);
            break;
        default:
            res.status(400).json({
                ok: false,
                mensaje: 'Tipo de busqueda erroneo. Permitido solo: usuarios, medicos y hospitales',
                error: { message: 'Tipo de tabla no valida' }
            });
    }
    promesa.then(data => {
        res.status(200).json({
            ok: true,
            [tabla]: data
        });
    });
});

// =======================================================
//             Busqueda de Hospitales
// =======================================================
function buscarHospitales(busqueda, regex) {

    return new Promise((resolve, reject) => {
        Hospital.find({ nombre: regex })
            .populate('usuario', 'nombre email')
            .exec((err, hospitales) => {
                if (err) {
                    reject('error al cargar hospitales', err);
                } else {
                    resolve(hospitales);
                }
            });

    });
}

// =======================================================
//             Busqueda de Medicos
// =======================================================
function buscarMedicos(busqueda, regex) {
    return new Promise((resolve, reject) => {
        Medico.find({ nombre: regex })
            .populate('usuario', 'nombre email')
            .populate('hospital', 'nombre')
            .exec((err, medicos) => {
                if (err) {
                    reject('Error al cargar medicos', err);
                } else {
                    resolve(medicos);
                }
            });
    });
}

// =======================================================
//             Busqueda de Usuarios
// =======================================================
function buscarUsuarios(busqueda, regex) {
    return new Promise((resolve, reject) => {
        Usuario.find({}, 'nombre email role')
            .or([{ 'nombre': regex }, { 'email': regex }])
            .exec((err, usuarios) => {
                if (err) {
                    reject('Error al cargar usuarios', err)
                } else {
                    resolve(usuarios);
                }
            })
    });
}

module.exports = app;