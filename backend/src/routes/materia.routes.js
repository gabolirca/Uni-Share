const router = require('express').Router()
const auth = require('../middlewares/auth.middleware')
const {
  getMaterias,
  getMateriaById,
  createMateria,
  updateMateria,
  deleteMateria
} = require('../controllers/materia.controller')

router.get('/',       getMaterias)
router.get('/:id',    getMateriaById)
router.post('/',      auth, createMateria)
router.put('/:id',    auth, updateMateria)
router.delete('/:id', auth, deleteMateria)

module.exports = router