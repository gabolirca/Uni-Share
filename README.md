# UniShare

> Plataforma web universitaria para compartir material académico, construida con arquitectura de alta disponibilidad basada en contenedores.

![Estado](https://img.shields.io/badge/estado-producción-green)
![Node](https://img.shields.io/badge/node-v20.20.2-brightgreen)
![Docker](https://img.shields.io/badge/docker-compose-blue)
![PostgreSQL](https://img.shields.io/badge/postgresql-15-blue)
![NGINX](https://img.shields.io/badge/nginx-alpine-green)

---

## Tabla de Contenidos

- [Descripción](#-descripción)
- [Arquitectura](#-arquitectura)
- [Tecnologías](#-tecnologías)
- [Funcionalidades](#-funcionalidades)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Instalación y Despliegue](#-instalación-y-despliegue)
- [API REST](#-api-rest)
- [Alta Disponibilidad](#-alta-disponibilidad)
- [Chaos Engineering](#-chaos-engineering)
- [Monitoreo](#-monitoreo)
- [Equipo](#-equipo)

---

## Descripción

UniShare es una red social académica que permite a estudiantes universitarios compartir, descargar y valorar material de estudio organizado por materias y carreras.

El proyecto implementa principios de **DevOps** y **Site Reliability Engineering (SRE)** con:

- Balanceo de carga con múltiples instancias del backend
- Replicación de base de datos PostgreSQL (Master/Replica)
- Monitoreo en tiempo real con Netdata
- Pruebas de resiliencia con Chaos Engineering
- Tunnel seguro con ngrok para acceso externo

---

##  Arquitectura

```
Internet
    │
  ngrok
    │
NGINX (Puerto 80) ← Balanceador de carga + Proxy inverso
    │
    ├── API Node.js #1 (Puerto 3000)
    ├── API Node.js #2 (Puerto 3000)
    └── API Node.js #3 (Puerto 3000)
              │
    ┌─────────┴──────────┐
    │                    │
PostgreSQL Master   PostgreSQL Replica
    │                    │
  LVM Storage       LVM Storage
```

### Componentes

| Componente | Tecnología | Función |
|---|---|---|
| Proxy Inverso | NGINX Alpine | Balanceo de carga round-robin |
| Backend | Node.js 20 + Express | API REST |
| Base de datos | PostgreSQL 15 | Persistencia de datos |
| Replicación | PostgreSQL Streaming | Alta disponibilidad de datos |
| Contenedores | Docker + Compose | Orquestación de servicios |
| Monitoreo | Netdata | Métricas en tiempo real |
| Tunnel | ngrok | Acceso externo seguro |

---

##  Tecnologías

### Backend
- **Node.js 20** — Runtime de JavaScript
- **Express** — Framework web
- **JWT** — Autenticación stateless
- **bcryptjs** — Hashing de contraseñas
- **Multer** — Manejo de archivos
- **pg** — Cliente PostgreSQL

### Frontend
- **HTML5 + Tailwind CSS** — Interfaz responsive
- **JavaScript vanilla** — Lógica del cliente
- **Google Fonts** — Tipografía (Manrope + Inter)
- **Material Symbols** — Iconografía

### Infraestructura
- **Debian 12** — Sistema operativo base
- **Docker + Docker Compose** — Contenedores
- **NGINX** — Proxy inverso y balanceador
- **PostgreSQL 15** — Base de datos relacional
- **LVM** — Gestión de almacenamiento
- **Netdata** — Monitoreo en tiempo real
- **ngrok** — Tunnel seguro

---

##  Funcionalidades

### Usuarios
- Registro con correo institucional
- Login con JWT
- Perfil con foto y descripción
- Filtro de materias por carrera

### Material Académico
- Subir archivos (PDF, PPTX, DOCX, TXT)
- Descargar material de otros usuarios
- Sistema de likes
- Comentarios por material
- Contador de descargas y vistas

### Búsqueda
- Buscador global por título, descripción, materia y autor
- Filtro de materias por carrera del usuario
- Biblioteca completa de materias

### Infraestructura
- Balanceo de carga entre 3 instancias
- Replicación PostgreSQL Master/Replica
- Monitoreo en tiempo real
- Pruebas de Chaos Engineering

---

##  Estructura del Proyecto

```
Uni-Share/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.js       # Conexión PostgreSQL
│   │   │   └── schema.sql        # Esquema de la base de datos
│   │   ├── controllers/
│   │   │   ├── auth.controller.js
│   │   │   ├── material.controller.js
│   │   │   ├── materia.controller.js
│   │   │   └── comentario.controller.js
│   │   ├── middlewares/
│   │   │   └── auth.middleware.js  # Verificación JWT
│   │   ├── routes/
│   │   │   ├── auth.routes.js
│   │   │   ├── user.routes.js
│   │   │   ├── material.routes.js
│   │   │   ├── materia.routes.js
│   │   │   └── comentario.routes.js
│   │   └── index.js              # Punto de entrada
│   ├── uploads/                  # Archivos subidos
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── index.html                # Redirección al login
│   ├── login.html
│   ├── registro.html
│   ├── dashboard.html
│   ├── materias.html
│   ├── perfil.html
│   └── configuracion.html
└── infra/
    ├── docker-compose.yml        # Orquestación completa
    └── nginx/
        └── nginx.conf            # Configuración NGINX
```

---

## Instalación y Despliegue

### Requisitos previos

- Debian 12
- Docker + Docker Compose
- Node.js 20
- Git

### 1. Clonar el repositorio

```bash
git clone https://github.com/gabolirca/Uni-Share.git
cd Uni-Share
git checkout develop
```

### 2. Levantar la infraestructura

```bash
docker compose -f infra/docker-compose.yml up -d
```

### 3. Inicializar la base de datos

```bash
# Esperar que PostgreSQL inicie
sleep 10

docker exec -i unishare_db_master psql -U unishare_user -d unishare_db < backend/src/config/schema.sql
```

### 4. Configurar replicación PostgreSQL

```bash
# Crear usuario de replicación
docker exec -it unishare_db_master psql -U unishare_user -d unishare_db -c \
  "CREATE USER replicator WITH REPLICATION PASSWORD 'replicator_pass';"

# Autorizar replicación
docker exec -it unishare_db_master bash -c \
  "echo 'host replication replicator all md5' >> /var/lib/postgresql/data/pg_hba.conf"

docker exec -it unishare_db_master psql -U unishare_user -d unishare_db -c \
  "SELECT pg_reload_conf();"
```

### 5. Verificar servicios

```bash
docker ps
# Deberías ver: nginx, api_1, api_2, api_3, db_master, db_replica, netdata

curl http://localhost/health
# {"status":"OK","timestamp":"..."}
```

### 6. Acceso externo con ngrok

```bash
ngrok config add-authtoken TU_TOKEN
ngrok http 80

# Actualizar URL en el frontend
sed -i "s|http://192.168.56.101|https://TU_URL.ngrok-free.dev|g" frontend/*.html

# Recargar NGINX
docker compose -f infra/docker-compose.yml up -d --force-recreate nginx
```

---

## API REST

### Autenticación

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/auth/register` | Registrar usuario |
| POST | `/api/auth/login` | Iniciar sesión |

### Usuarios

| Método | Endpoint | Auth | Descripción |
|--------|----------|------|-------------|
| GET | `/api/users/me` | ✅ | Obtener perfil propio |
| PUT | `/api/users/me` | ✅ | Actualizar perfil + foto |

### Materias

| Método | Endpoint | Auth | Descripción |
|--------|----------|------|-------------|
| GET | `/api/materias` | ❌ | Listar todas |
| GET | `/api/materias/:id` | ❌ | Obtener una |
| POST | `/api/materias` | ✅ | Crear materia |
| PUT | `/api/materias/:id` | ✅ | Actualizar |
| DELETE | `/api/materias/:id` | ✅ | Eliminar |

### Materiales

| Método | Endpoint | Auth | Descripción |
|--------|----------|------|-------------|
| GET | `/api/materiales` | ❌ | Listar (filtro por `?materia_id=`) |
| GET | `/api/materiales/:id` | ❌ | Obtener uno |
| POST | `/api/materiales` | ✅ | Subir material + archivo |
| DELETE | `/api/materiales/:id` | ✅ | Eliminar propio |
| POST | `/api/materiales/:id/like` | ✅ | Dar like |
| GET | `/api/materiales/:id/descargar` | ❌ | Descargar archivo |

### Comentarios

| Método | Endpoint | Auth | Descripción |
|--------|----------|------|-------------|
| GET | `/api/materiales/:id/comentarios` | ❌ | Ver comentarios |
| POST | `/api/materiales/:id/comentarios` | ✅ | Comentar |
| DELETE | `/api/materiales/:mid/comentarios/:id` | ✅ | Eliminar comentario |

### Ejemplo de uso

```bash
# Registro
curl -X POST http://localhost/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"nombre":"Juan","correo":"juan@uni.edu","carrera":"Ingeniería de Software","cuatrimestre":4,"password":"123456"}'

# Login
curl -X POST http://localhost/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"correo":"juan@uni.edu","password":"123456"}'

# Subir material
curl -X POST http://localhost/api/materiales \
  -H "Authorization: Bearer TU_TOKEN" \
  -F "titulo=Apuntes SQL" \
  -F "materia_id=1" \
  -F "archivo=@apuntes.pdf"
```

---

## Alta Disponibilidad

### Nivel de Aplicación
NGINX distribuye el tráfico entre 3 instancias del backend mediante **round-robin**. Si una instancia falla, las demás continúan respondiendo.

```nginx
upstream backend {
    server api_1:3000;
    server api_2:3000;
    server api_3:3000;
}
```

### Nivel de Base de Datos
PostgreSQL configurado con **Streaming Replication** asíncrona.

```bash
# Verificar replicación activa
docker exec -it unishare_db_master psql -U unishare_user -d unishare_db \
  -c "SELECT client_addr, state, sync_state FROM pg_stat_replication;"
```

### Nivel de Red
ngrok proporciona tunnel HTTPS con reconexión automática.

---

## Chaos Engineering

Pruebas de resiliencia implementadas para validar la alta disponibilidad:

### Prueba 1 — Caída de instancia API

```bash
# En terminal 1: monitorear el servicio
while true; do curl -s http://localhost/health; echo ""; sleep 0.5; done

# En terminal 2: eliminar una instancia
docker rm -f unishare_api_1
```

**Resultado esperado:** El servicio continúa respondiendo con api_2 y api_3. NGINX detecta el fallo y redirige automáticamente.

### Prueba 2 — Saturación de disco

```bash
fallocate -l 5G /tmp/archivo_prueba
```

### Prueba 3 — Restauración automática

```bash
docker compose -f infra/docker-compose.yml up -d
```

**Resultado:** Los contenedores caídos se restauran automáticamente gracias a `restart: unless-stopped`.

---

## Monitoreo

Netdata disponible en: `http://192.168.56.101:19999`

Métricas monitoreadas:
- Uso de CPU por contenedor
- Consumo de RAM
- I/O de disco
- Tráfico de red
- Estado de contenedores Docker
- Conexiones activas NGINX

---

## Equipo

| Rol | Responsabilidades |
|-----|-------------------|
| **DevOps Lead** | Infraestructura, coordinación, documentación |
| **Célula Infraestructura** | Docker, NGINX, LVM, replicación, monitoreo |
| **Célula Desarrollo** | API REST, frontend, base de datos |

---

## Variables de Entorno

```env
# Servidor
PORT=3000
NODE_ENV=development

# Base de datos
DB_HOST=postgres_master
DB_PORT=5432
DB_NAME=unishare_db
DB_USER=unishare_user
DB_PASSWORD=unishare_pass

# JWT
JWT_SECRET=tu_secreto_seguro
JWT_EXPIRES_IN=7d

# Archivos
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=10485760
```

---

## Licencia
MIT © 2026 UniShare — UPT

MIT © 2026 UniShare Team
