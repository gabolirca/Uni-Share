const router = require('express').Router()

router.get('/', (req, res) => {
  res.json({ message: 'users - próximamente' })
})

module.exports = router