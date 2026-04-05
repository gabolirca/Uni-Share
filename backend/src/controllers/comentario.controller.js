const pool = require('../config/database')

// Obtener comentarios de un material
const getComentarios = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT c.*, u.nombre as autor
      FROM comentarios c
      JOIN usuarios u ON c.usuario_id = u.id
      WHERE c.material_id = $1
      ORDER BY c.created_at ASC
    `, [req.params.material_id])
    res.json(result.rows)
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener comentarios' })
  }
}

// Crear comentario
const createComentario = async (req, res) => {
  const { contenido } = req.body
  const { material_id } = req.params

  if (!contenido) return res.status(400).json({ error: 'El contenido es requerido' })

  try {
    const result = await pool.query(
      `INSERT INTO comentarios (contenido, usuario_id, material_id)
       VALUES ($1, $2, $3) RETURNING *`,
      [contenido, req.user.id, material_id]
    )
    res.status(201).json(result.rows[0])
  } catch (err) {
    res.status(500).json({ error: 'Error al crear comentario' })
  }
}

// Eliminar comentario
const deleteComentario = async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM comentarios WHERE id = $1 AND usuario_id = $2 RETURNING *',
      [req.params.id, req.user.id]
    )
    if (result.rows.length === 0) return res.status(404).json({ error: 'Comentario no encontrado o sin permiso' })
    res.json({ message: 'Comentario eliminado' })
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar comentario' })
  }
}

module.exports = { getComentarios, createComentario, deleteComentario }