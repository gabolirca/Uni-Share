const router = require('express').Router()
const pool = require('../config/database')
const auth = require('../middlewares/auth.middleware')
const multer = require('multer')
const path = require('path')

// Configuración multer para fotos de perfil
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    cb(null, `avatar-${req.user.id}-${Date.now()}${path.extname(file.originalname)}`)
  }
})
const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: (req, file, cb) => {
    const allowed = ['.jpg', '.jpeg', '.png', '.webp']
    const ext = path.extname(file.originalname).toLowerCase()
    if (allowed.includes(ext)) cb(null, true)
    else cb(new Error('Solo se permiten imágenes'))
  }
})

// Obtener perfil propio
router.get('/me', auth, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, nombre, correo, carrera, cuatrimestre, descripcion, foto_url, created_at FROM usuarios WHERE id = $1',
      [req.user.id]
    )
    res.json(result.rows[0])
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener perfil' })
  }
})

// Actualizar perfil
router.put('/me', auth, upload.single('foto'), async (req, res) => {
  const { nombre, carrera, cuatrimestre, descripcion } = req.body
  const foto_url = req.file ? `/uploads/${req.file.filename}` : null

  try {
    let query, params
    if (foto_url) {
      query = `UPDATE usuarios SET nombre=$1, carrera=$2, cuatrimestre=$3, descripcion=$4, foto_url=$5 WHERE id=$6 RETURNING id, nombre, correo, carrera, cuatrimestre, descripcion, foto_url`
      params = [nombre, carrera, cuatrimestre, descripcion, foto_url, req.user.id]
    } else {
      query = `UPDATE usuarios SET nombre=$1, carrera=$2, cuatrimestre=$3, descripcion=$4 WHERE id=$5 RETURNING id, nombre, correo, carrera, cuatrimestre, descripcion, foto_url`
      params = [nombre, carrera, cuatrimestre, descripcion, req.user.id]
    }
    const result = await pool.query(query, params)
    res.json(result.rows[0])
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar perfil' })
  }
})

module.exports = router