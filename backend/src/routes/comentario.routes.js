const router = require('express').Router({ mergeParams: true })
const auth = require('../middlewares/auth.middleware')
const { getComentarios, createComentario, deleteComentario } = require('../controllers/comentario.controller')

router.get('/',        getComentarios)
router.post('/',  auth, createComentario)
router.delete('/:id', auth, deleteComentario)

module.exports = router