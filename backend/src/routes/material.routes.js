const router = require('express').Router()

router.get('/', (req, res) => {
  res.json({ message: 'materiales - próximamente' })
})

module.exports = router