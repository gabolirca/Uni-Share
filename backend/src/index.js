const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
const path = require('path')

dotenv.config()

const pool = require('./config/database')

// Probar conexión al arrancar
pool.query('SELECT 1').then(() => {
  console.log('Base de datos lista')
}).catch(err => {
  console.error('Error conectando a DB:', err.message)
})
const app = express()
const PORT = process.env.PORT || 3000

// Middlewares
app.use(cors())
// Logger simple
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`)
  next()
})
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use('/uploads', express.static(path.join(__dirname, '../uploads')))

// Rutas (las iremos agregando)
app.use('/api/auth',      require('./routes/auth.routes'))
app.use('/api/users',     require('./routes/user.routes'))
app.use('/api/materias',  require('./routes/materia.routes'))
app.use('/api/materiales',require('./routes/material.routes'))
app.use('/api/materiales/:material_id/comentarios', require('./routes/comentario.routes'))
// Ruta de salud — para verificar que el servidor corre
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() })
})

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`)
})

module.exports = app