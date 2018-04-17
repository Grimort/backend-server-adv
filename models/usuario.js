var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');

var Schema = mongoose.Schema;

var rolesValidos = {
    values: ['ADMIN_ROLE', 'USER_ROLE'],
    message: '{VALUE} no es un Role valido.'
}

var usuarioSchema = new Schema({
    nombre: { type: String, required: [true, 'El nombre es requerido.'] },
    email: { type: String, unique: true, required: [true, 'El correo es requerido.'] },
    password: { type: String, required: [true, 'Contraseña requerido.'] },
    img: { type: String, required: false },
    role: { type: String, required: true, default: 'USER_ROLE', enum: rolesValidos }
});

usuarioSchema.plugin(uniqueValidator, { message: '{PATH} debe ser único' }); // el PATH detecta el nombre de la propiedad

module.exports = mongoose.model('Usuario', usuarioSchema);