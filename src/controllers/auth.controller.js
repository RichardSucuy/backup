const { response } = require("express");
const bcrypt = require('bcryptjs');
const pool = require("../database/db");
const { generarJWT } = require("../helpers/jwt");

const login = async(req, res = response) => {
  const {user_usu, password } = req.body;

  try {
    
    const { rows } = await pool.query("SELECT * FROM usuarios;");
    const existeUsuario = rows.find( e => e.user_usu === user_usu );

    if (!existeUsuario ) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado"
      });
    }

    // Verificar la contraseña
    const validPassword = bcrypt.compareSync( password, existeUsuario.password);
    if( !validPassword ){
      return res.status(400).json({
        success: false,
        message: 'Credenciales invalidadas'
      });
    }

    // GENERAMOS EL TOKEN - JWT
    const token = await generarJWT( existeUsuario.id_usuario );

    res.json({
      success: true,
      token
    });

  } catch (err) {
    console.log( err );
    res.status(500).json({
      success: false,
      message: err.message
    });
    
  }
};

const renewToken = async(req, res=response) => {
  const { uid } = req.user;

  // Generar el TOKEN - JWT
  const token = await generarJWT( uid );

  // Obtener el usuario por UID
  //const usuario = await getUserById( uid );

  res.json ({
      success: true,
      token,
  });

};

module.exports = {
  login,
  renewToken
}