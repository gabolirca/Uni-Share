const pool = require('../config/database')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

// REGISTRO
const register = async (req, res) => {
  const { nombre, correo, carrera, cuatrimestre, password } = req.body

  if (!nombre || !correo || !password) {
    return res.status(400).json({ error: 'Nombre, correo y password son requeridos' })
  }

  try {
    const existe = await pool.query('SELECT id FROM usuarios WHERE correo = $1', [correo])
    if (existe.rows.length > 0) {
      return res.status(409).json({ error: 'El correo ya está registrado' })
    }

    const hash = await bcrypt.hash(password, 10)

    const result = await pool.query(
      `INSERT INTO usuarios (nombre, correo, carrera, cuatrimestre, password_hash)
       VALUES ($1, $2, $3, $4, $5) RETURNING id, nombre, correo, carrera`,
      [nombre, correo, carrera, cuatrimestre, hash]
    )

    res.status(201).json({ message: 'Usuario registrado', user: result.rows[0] })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Error en el servidor' })
  }
}

// LOGIN
const login = async (req, res) => {
  const { correo, password } = req.body

  if (!correo || !password) {
    return res.status(400).json({ error: 'Correo y password requeridos' })
  }

  try {
    const result = await pool.query('SELECT * FROM usuarios WHERE correo = $1', [correo])
    const user = result.rows[0]

    if (!user) {
      return res.status(401).json({ error: 'Credenciales incorrectas' })
    }

    const validPassword = await bcrypt.compare(password, user.password_hash)
    if (!validPassword) {
      return res.status(401).json({ error: 'Credenciales incorrectas' })
    }

    const token = jwt.sign(
      { id: user.id, nombre: user.nombre, correo: user.correo },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    )

    res.json({ message: 'Login exitoso', token, user: { id: user.id, nombre: user.nombre, correo: user.correo, carrera: user.carrera } })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Error en el servidor' })
  }
}

module.exports = { register, login }