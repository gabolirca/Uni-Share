const pool = require('../config/database')
const path = require('path')
const fs = require('fs')

// Obtener todos los materiales
const getMateriales = async (req, res) => {
  try {
    const { materia_id } = req.query
    let query = `
      SELECT m.*, u.nombre as autor, mat.nombre as materia
      FROM materiales m
      JOIN usuarios u ON m.usuario_id = u.id
      LEFT JOIN materias mat ON m.materia_id = mat.id
    `
    const params = []
    if (materia_id) {
      query += ' WHERE m.materia_id = $1'
      params.push(materia_id)
    }
    query += ' ORDER BY m.created_at DESC'

    const result = await pool.query(query, params)
    res.json(result.rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Error al obtener materiales' })
  }
}

// Obtener un material por ID
const getMaterialById = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT m.*, u.nombre as autor, mat.nombre as materia
      FROM materiales m
      JOIN usuarios u ON m.usuario_id = u.id
      LEFT JOIN materias mat ON m.materia_id = mat.id
      WHERE m.id = $1
    `, [req.params.id])

    if (result.rows.length === 0) return res.status(404).json({ error: 'Material no encontrado' })
    res.json(result.rows[0])
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener material' })
  }
}

// Subir material
const createMaterial = async (req, res) => {
  const { titulo, descripcion, materia_id, tipo } = req.body
  const archivo_url = req.file ? `/uploads/${req.file.filename}` : null

  if (!titulo) return res.status(400).json({ error: 'El título es requerido' })

  try {
    const result = await pool.query(
      `INSERT INTO materiales (titulo, descripcion, archivo_url, tipo, usuario_id, materia_id)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [titulo, descripcion, archivo_url, tipo, req.user.id, materia_id]
    )
    res.status(201).json(result.rows[0])
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Error al subir material' })
  }
}

// Descargar / contar descarga
const descargarMaterial = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM materiales WHERE id = $1', [req.params.id])
    if (result.rows.length === 0) return res.status(404).json({ error: 'Material no encontrado' })

    await pool.query('UPDATE materiales SET descargas = descargas + 1 WHERE id = $1', [req.params.id])

    const material = result.rows[0]
    const filePath = path.join(__dirname, '../../', material.archivo_url)

    if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'Archivo no encontrado' })

    res.download(filePath)
  } catch (err) {
    res.status(500).json({ error: 'Error al descargar' })
  }
}

// Dar like
const likeMaterial = async (req, res) => {
  try {
    const result = await pool.query(
      'UPDATE materiales SET likes = likes + 1 WHERE id = $1 RETURNING likes',
      [req.params.id]
    )
    if (result.rows.length === 0) return res.status(404).json({ error: 'Material no encontrado' })
    res.json({ likes: result.rows[0].likes })
  } catch (err) {
    res.status(500).json({ error: 'Error al dar like' })
  }
}

// Eliminar material
const deleteMaterial = async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM materiales WHERE id = $1 AND usuario_id = $2 RETURNING *',
      [req.params.id, req.user.id])
    if (result.rows.length === 0) return res.status(404).json({ error: 'Material no encontrado o sin permiso' })
    res.json({ message: 'Material eliminado' })
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar material' })
  }
}

module.exports = { getMateriales, getMaterialById, createMaterial, descargarMaterial, likeMaterial, deleteMaterial }