-- Usuarios
CREATE TABLE IF NOT EXISTS usuarios (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  correo VARCHAR(150) UNIQUE NOT NULL,
  carrera VARCHAR(100),
  cuatrimestre INT,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Materias
CREATE TABLE IF NOT EXISTS materias (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) UNIQUE NOT NULL,
  descripcion TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Materiales
CREATE TABLE IF NOT EXISTS materiales (
  id SERIAL PRIMARY KEY,
  titulo VARCHAR(200) NOT NULL,
  descripcion TEXT,
  archivo_url VARCHAR(255),
  tipo VARCHAR(50),
  usuario_id INT REFERENCES usuarios(id) ON DELETE CASCADE,
  materia_id INT REFERENCES materias(id) ON DELETE SET NULL,
  likes INT DEFAULT 0,
  descargas INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Comentarios
CREATE TABLE IF NOT EXISTS comentarios (
  id SERIAL PRIMARY KEY,
  contenido TEXT NOT NULL,
  usuario_id INT REFERENCES usuarios(id) ON DELETE CASCADE,
  material_id INT REFERENCES materiales(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW()
);