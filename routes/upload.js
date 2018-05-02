var express = require('express');
var fileUpload = require('express-fileupload');
var fs = require('fs');

var app = express();

var Usuario = require('../models/usuario');
var Medico = require('../models/medico');
var Hospital = require('../models/hospital');


// default options
app.use(fileUpload());

// Rutas
app.put('/:tipo/:id', (req, res, next) => {

    var tipo = req.params.tipo;
    var id = req.params.id;

    // colecciones permitidas
    var tiposColeccion = ['medicos', 'usuarios', 'hospitales'];

    if (tiposColeccion.indexOf(tipo) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'tipo de coleccioon no valida',
            errors: { message: 'tipo de coleccioon no valida' }
        });
    }

    if (!req.files) {

        return res.status(400).json({
            ok: false,
            mensaje: 'no se selecciono archivo',
            errors: { message: 'se debe seleccionar una imagen' }
        });
    }
    // botener nombre del archivo
    var archivo = req.files.imagen;
    var nombreImagen = archivo.name.split('.');
    var extensionArchivo = nombreImagen[nombreImagen.length - 1];

    // Extensiones permitidas 
    var extensionesPermitidas = ['png', 'jpeg', 'jpg', 'gif'];

    if (extensionesPermitidas.indexOf(extensionArchivo) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'extension no valida',
            errors: { message: 'Las extensiones permitidas son: ' + extensionesPermitidas.join(' - ') }
        });
    }

    // nombre de archivo personalziado
    var nombreArchivo = `${ id }-${new Date().getMilliseconds() }.${ extensionArchivo }`;

    // mover el archivo del temporal a un path
    var path = `./uploads/${ tipo }/${ nombreArchivo }`;
    archivo.mv(path, err => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al mover el archivo',
                errors: err
            });
        }

        subirPorTipo(tipo, id, path, res);

        /* 
        res.status(200).json({
            ok: true,
            mensaje: "Archivo movido",
            extensionArchivo: extensionArchivo
        }); */
    });
});

function subirPorTipo(tipo, id, nombreArchivo, res) {
    if (tipo === 'usuarios') {
        Usuario.findById(id, (err, usuario) => {
            if (!usuario) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Usuario no existe',
                    errors: { message: 'Usuairo no existe' }
                });
            }
            var pathViejo = './uploads/usuarios/' + usuario.img;
            // Elimina la imagen vieja si existe
            if (fs.existsSync(pathViejo)) {
                fs.unlink(pathViejo);
            }
            usuario.img = nombreArchivo;
            usuario.save((err, usuarioActualizado) => {
                usuarioActualizado.password = 'xD'
                return res.status(200).json({
                    ok: true,
                    mensaje: "Imagen de usuario actualizada",
                    extensionArchivo: usuarioActualizado
                });
            });
        });
    }
    if (tipo === 'medicos') {
        Medico.findById(id, (err, medico) => {
            if (!medico) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Medico no existe',
                    errors: { message: 'Medico no existe' }
                });
            }
            var pathViejo = './uploads/medicos/' + medico.img;
            // Elimina la imagen vieja si existe
            if (fs.existsSync(pathViejo)) {
                fs.unlink(pathViejo);
            }
            medico.img = nombreArchivo;
            medico.save((err, medicoActualizado) => {
                return res.status(200).json({
                    ok: true,
                    mensaje: "Imagen de medico actualizada",
                    extensionArchivo: medicoActualizado
                });
            });
        });
    }
    if (tipo === 'hospitales') {
        Hospital.findById(id, (err, hospital) => {
            if (!hospital) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Hospital no existe',
                    errors: { message: 'Hospital no existe' }
                });
            }
            var pathViejo = './uploads/hospitales/' + hospital.img;
            // Elimina la imagen vieja si existe
            if (fs.existsSync(pathViejo)) {
                fs.unlink(pathViejo);
            }
            hospital.img = nombreArchivo;
            hospital.save((err, hospitalActualizado) => {
                return res.status(200).json({
                    ok: true,
                    mensaje: "Imagen de hospital actualizada",
                    extensionArchivo: hospitalActualizado
                });
            });
        });
    }
}

module.exports = app;