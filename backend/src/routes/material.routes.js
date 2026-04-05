const router = require('express').Router()
const auth = require('../middlewares/auth.middleware')
const multer = require('multer')
const path = require('path')
const {
  getMateriales,
  getMaterialById,
  createMaterial,
  descargarMaterial,
  likeMaterial,
  deleteMaterial
} = require('../controllers/material.controller')

// Configuración de multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9)
    cb(null, unique + path.extname(file.originalname))
  }
})

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowed = ['.pdf', '.ppt', '.pptx', '.doc', '.docx', '.txt']
    const ext = path.extname(file.originalname).toLowerCase()
    if (allowed.includes(ext)) cb(null, true)
    else cb(new Error('Tipo de archivo no permitido'))
  }
})

router.get('/',                getMateriales)
router.get('/:id',             getMaterialById)
router.post('/',    auth, upload.single('archivo'), createMaterial)
router.get('/:id/descargar',   descargarMaterial)
router.post('/:id/like', auth, likeMaterial)
router.delete('/:id',    auth, deleteMaterial)

module.exports = router