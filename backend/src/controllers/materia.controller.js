const pool = require('../config/database')

// Obtener todas las materias
const getMaterias = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM materias ORDER BY nombre ASC')
    res.json(result.rows)
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener materias' })
  }
}

// Obtener una materia por ID
const getMateriaById = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM materias WHERE id = $1', [req.params.id])
    if (result.rows.length === 0) return res.status(404).json({ error: 'Materia no encontrada' })
    res.json(result.rows[0])
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener materia' })
  }
}

// Crear materia
const createMateria = async (req, res) => {
  const { nombre, descripcion } = req.body
  if (!nombre) return res.status(400).json({ error: 'El nombre es requerido' })
  try {
    const result = await pool.query(
      'INSERT INTO materias (nombre, descripcion) VALUES ($1, $2) RETURNING *',
      [nombre, descripcion]
    )
    res.status(201).json(result.rows[0])
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'La materia ya existe' })
    res.status(500).json({ error: 'Error al crear materia' })
  }
}

// Actualizar materia
const updateMateria = async (req, res) => {
  const { nombre, descripcion } = req.body
  try {
    const result = await pool.query(
      'UPDATE materias SET nombre = $1, descripcion = $2 WHERE id = $3 RETURNING *',
      [nombre, descripcion, req.params.id]
    )
    if (result.rows.length === 0) return res.status(404).json({ error: 'Materia no encontrada' })
    res.json(result.rows[0])
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar materia' })
  }
}

// Eliminar materia
const deleteMateria = async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM materias WHERE id = $1 RETURNING *', [req.params.id])
    if (result.rows.length === 0) return res.status(404).json({ error: 'Materia no encontrada' })
    res.json({ message: 'Materia eliminada' })
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar materia' })
  }
}

module.exports = { getMaterias, getMateriaById, createMateria, updateMateria, deleteMateria }