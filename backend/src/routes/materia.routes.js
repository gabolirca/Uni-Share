const router = require('express').Router()

router.get('/', (req, res) => {
  res.json({ message: 'materias - próximamente' })
})

module.exports = router