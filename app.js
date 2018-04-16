// Requires
var express = require('express');
var mongoose = require('mongoose');

// Inicializar variables
var app = express();

// Conexion a la base d datos
mongoose.connection.openUri('mongodb://localhost:27017/hospitalDB', (err, res) => {
    if (err) throw err;
    console.log('Base de Datos: \x1b[32m%s\x1b[0m', 'ONLINE'); // \x1b[32m%s\x1b[0m, cambia de color el texto ONLINE a verde  
});

// Rutas
app.get('/', (req, res, next) => {
    res.status(200).json({
        ok: true,
        mensaje: 'Peticion realizada correctamente.'
    });
});

// Escuchar petiticiones
app.listen(3000, () => {
    console.log('Express server corriendo en puerto 3000: \x1b[32m%s\x1b[0m', 'ONLINE'); // \x1b[32m%s\x1b[0m, cambia de color el texto ONLINE a verde
});