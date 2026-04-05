const router = require('express').Router()
const pool = require('../config/database')
const auth = require('../middlewares/auth.middleware')

// Obtener perfil propio
router.get('/me', auth, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, nombre, correo, carrera, cuatrimestre, created_at FROM usuarios WHERE id = $1',
      [req.user.id]
    )
    res.json(result.rows[0])
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener perfil' })
  }
})

module.exports = router