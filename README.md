# Plataforma Interna de Artículos

Aplicación web full-stack para gestión de artículos internos, con soporte para creación manual, generación automática de contenido, carga de imágenes de portada y despliegue flexible (Docker Compose, VMs con systemd, almacenamiento local o S3, base de datos local o RDS).

---

## Descripción del proyecto

- **Backend**: API REST en Node.js + TypeScript (Express + Sequelize + MySQL)
- **Frontend**: SPA en React + TypeScript (Vite)
- **Almacenamiento**: local (disco) o Amazon S3 (configurable por variable de entorno)
- **Base de datos**: MySQL 8 (local via Docker o Amazon RDS)
- **Generador de contenido**: script que consume una API pública y crea artículos automáticamente

---

## Diagrama de arquitectura

```
┌─────────────────────────────────────────────────────────────┐
│                        Cliente (Browser)                     │
│                  React SPA  –  puerto 5173                   │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTP / REST
┌──────────────────────────▼──────────────────────────────────┐
│               Backend API  –  puerto 3001                    │
│         Express + Sequelize  (Node.js / TypeScript)          │
│                                                              │
│   ┌─────────────┐   ┌──────────────────────────────────┐    │
│   │  /articles  │   │  StorageProvider                  │    │
│   │  /health    │   │  ┌────────────┐  ┌─────────────┐ │    │
│   └─────────────┘   │  │   Local    │  │   AWS S3    │ │    │
│                      │  │  (./uploads│  │  (bucket)   │ │    │
│                      │  └────────────┘  └─────────────┘ │    │
│                      └──────────────────────────────────┘    │
└──────────────────────────┬──────────────────────────────────┘
                           │ Sequelize ORM
┌──────────────────────────▼──────────────────────────────────┐
│              MySQL 8  –  puerto 3306                         │
│          (Docker local  o  Amazon RDS)                       │
└─────────────────────────────────────────────────────────────┘
```

---

## Cómo ejecutar en desarrollo con Docker Compose

### Requisitos
- Docker >= 24
- Docker Compose >= 2

### Pasos

```bash
# Clonar el repositorio
git clone <url-del-repo>
cd obligatorio-infraestructura

# Levantar todos los servicios
docker compose up --build

# Acceder a:
#   Frontend:  http://localhost:5173
#   Backend:   http://localhost:3001
#   Health:    http://localhost:3001/health
```

Para detener:
```bash
docker compose down
# Para eliminar también los volúmenes (datos):
docker compose down -v
```

---

## Cómo configurar producción con RDS + S3

### 1. Crear archivo `.env` en `backend/`

```bash
cp backend/.env.example backend/.env
```

Editar `backend/.env`:

```env
NODE_ENV=production
PORT=3001
HOST=0.0.0.0

# RDS
DB_HOST=mi-instancia.xxxxxxxxx.us-east-1.rds.amazonaws.com
DB_PORT=3306
DB_NAME=articles_db
DB_USER=articles_user
DB_PASSWORD=SuperSecreta123!

# S3
STORAGE_PROVIDER=s3
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=xxxxxxxx
S3_BUCKET=mi-bucket-articulos
S3_BASE_URL=https://mi-bucket-articulos.s3.amazonaws.com
```

### 2. Compilar y ejecutar

```bash
cd backend
npm install
npm run build
node dist/server.js
```

---

## Uso de almacenamiento local

Configurar en `backend/.env`:

```env
STORAGE_PROVIDER=local
LOCAL_STORAGE_PATH=./uploads
LOCAL_STORAGE_BASE_URL=http://<IP-O-DOMINIO>:3001/uploads
```

Las imágenes se guardan en `backend/uploads/` y se sirven estáticamente en `/uploads/*`.

> **Nota para múltiples instancias**: si se despliegan varias instancias del backend, montar el directorio `uploads` como volumen compartido NFS (ver sección NFS).

---

## Uso de S3

Configurar en `backend/.env`:

```env
STORAGE_PROVIDER=s3
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=xxxxxxxx
S3_BUCKET=mi-bucket-articulos
S3_BASE_URL=https://mi-bucket-articulos.s3.amazonaws.com
```

### Política de bucket mínima (acceso público de lectura)

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::mi-bucket-articulos/*"
    }
  ]
}
```

### Permisos IAM mínimos para el backend

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["s3:PutObject", "s3:DeleteObject", "s3:GetObject"],
      "Resource": "arn:aws:s3:::mi-bucket-articulos/*"
    }
  ]
}
```

---

## Configuración de RDS

1. Crear instancia MySQL 8.0 en Amazon RDS (clase `db.t3.micro` para pruebas).
2. Crear base de datos `articles_db` y usuario `articles_user` con contraseña segura.
3. Configurar Security Group para permitir tráfico en puerto 3306 desde las IPs del backend.
4. Usar el endpoint RDS en `DB_HOST`.

```sql
-- Ejecutar en MySQL tras crear la instancia:
CREATE DATABASE IF NOT EXISTS articles_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'articles_user'@'%' IDENTIFIED BY 'SuperSecreta123!';
GRANT ALL PRIVILEGES ON articles_db.* TO 'articles_user'@'%';
FLUSH PRIVILEGES;
```

El backend ejecuta `sequelize.sync()` al arrancar y crea las tablas automáticamente.

---

## Configuración con systemd

### Instalar el backend como servicio

```bash
# Copiar archivos compilados al servidor
scp -r backend/dist backend/package.json backend/.env usuario@servidor:/opt/articles/backend/

# En el servidor, instalar dependencias de producción
cd /opt/articles/backend
npm install --omit=dev

# Copiar el archivo de servicio
sudo cp systemd/articles-backend.service /etc/systemd/system/

# Crear usuario de sistema
sudo useradd --system --no-create-home articles

# Dar permisos
sudo chown -R articles:articles /opt/articles

# Habilitar e iniciar el servicio
sudo systemctl daemon-reload
sudo systemctl enable articles-backend
sudo systemctl start articles-backend

# Verificar estado
sudo systemctl status articles-backend
sudo journalctl -u articles-backend -f
```

---

## Compartir directorio NFS

Para que múltiples instancias del backend compartan el almacenamiento local de imágenes:

### En el servidor NFS (nodo de almacenamiento)

```bash
sudo apt install nfs-kernel-server -y

# Crear y exportar el directorio
sudo mkdir -p /srv/articles-uploads
sudo chown nobody:nogroup /srv/articles-uploads

# Agregar a /etc/exports:
echo "/srv/articles-uploads  *(rw,sync,no_subtree_check,no_root_squash)" | sudo tee -a /etc/exports

sudo exportfs -ra
sudo systemctl restart nfs-kernel-server
```

### En cada nodo backend

```bash
sudo apt install nfs-common -y

# Montar el directorio compartido
sudo mkdir -p /opt/articles/backend/uploads
sudo mount <IP-NFS>:/srv/articles-uploads /opt/articles/backend/uploads

# Para montaje permanente, agregar a /etc/fstab:
echo "<IP-NFS>:/srv/articles-uploads /opt/articles/backend/uploads nfs defaults 0 0" | sudo tee -a /etc/fstab
```

Configurar en `.env`:
```env
STORAGE_PROVIDER=local
LOCAL_STORAGE_PATH=/opt/articles/backend/uploads
LOCAL_STORAGE_BASE_URL=http://<IP-LOAD-BALANCER>:3001/uploads
```

---

## Uso del generador de contenido

El generador obtiene posts de `https://jsonplaceholder.typicode.com/posts` y los inserta como artículos con `source='generated'`.

### Ejecución manual

```bash
cd backend
npm run generate
```

### Variables de entorno del generador

```env
GENERATOR_API_URL=https://jsonplaceholder.typicode.com/posts
GENERATOR_COUNT=5
```

### Programar con cron

```bash
# Ejecutar cada día a las 2:00 AM
0 2 * * * cd /opt/articles/backend && node dist/services/contentGeneratorService.js >> /var/log/articles-generator.log 2>&1
```

### Programar con systemd timer

```ini
# /etc/systemd/system/articles-generator.timer
[Unit]
Description=Generador de artículos automáticos

[Timer]
OnCalendar=daily
Persistent=true

[Install]
WantedBy=timers.target
```

```ini
# /etc/systemd/system/articles-generator.service
[Unit]
Description=Ejecutar generador de artículos

[Service]
Type=oneshot
User=articles
WorkingDirectory=/opt/articles/backend
EnvironmentFile=/opt/articles/backend/.env
ExecStart=/usr/bin/node /opt/articles/backend/dist/services/contentGeneratorService.js
```

---

## Documentación de endpoints de la API

Base URL: `http://localhost:3001`

### Health

| Método | Ruta      | Descripción              |
|--------|-----------|--------------------------|
| GET    | /health   | Estado del servidor      |

**Respuesta:**
```json
{ "status": "ok", "env": "development" }
```

---

### Artículos

| Método | Ruta                    | Descripción                          |
|--------|-------------------------|--------------------------------------|
| GET    | /articles               | Listar artículos (con paginación)    |
| GET    | /articles/:id           | Obtener artículo por ID              |
| POST   | /articles               | Crear artículo manual                |
| PUT    | /articles/:id           | Actualizar artículo                  |
| DELETE | /articles/:id           | Eliminar artículo                    |
| POST   | /articles/:id/cover     | Subir imagen de portada              |
| POST   | /articles/generate      | Generar artículos automáticamente    |

---

#### GET /articles

Query params opcionales:

| Parámetro | Tipo   | Descripción                          |
|-----------|--------|--------------------------------------|
| page      | number | Página (default: 1)                  |
| limit     | number | Resultados por página (default: 20)  |
| source    | string | Filtrar por `manual` o `generated`   |
| status    | string | Filtrar por `draft` o `published`    |
| search    | string | Buscar por título (LIKE)             |

**Respuesta 200:**
```json
{
  "articles": [...],
  "total": 42,
  "page": 1,
  "limit": 20
}
```

---

#### GET /articles/:id

**Respuesta 200:** objeto Article completo  
**Respuesta 404:** `{ "error": "Article not found" }`

---

#### POST /articles

**Body JSON:**
```json
{
  "title": "Mi artículo",
  "content": "Contenido del artículo...",
  "summary": "Resumen opcional",
  "status": "published"
}
```

**Respuesta 201:** objeto Article creado

---

#### PUT /articles/:id

**Body JSON:** igual que POST (todos los campos son opcionales)

**Respuesta 200:** objeto Article actualizado

---

#### DELETE /articles/:id

**Respuesta 204:** sin cuerpo  
**Respuesta 404:** `{ "error": "Article not found" }`

---

#### POST /articles/:id/cover

**Content-Type:** `multipart/form-data`  
**Campo:** `cover` (archivo imagen: jpeg, png, webp, gif — máx. 10 MB)

**Respuesta 200:** objeto Article con `coverImageUrl` actualizado

---

#### POST /articles/generate

**Body JSON (opcional):**
```json
{ "count": 10 }
```

**Respuesta 200:**
```json
{ "message": "Created 5 articles", "count": 5 }
```

---

### Estructura del objeto Article

```json
{
  "id": 1,
  "title": "Título del artículo",
  "content": "Contenido completo...",
  "summary": "Resumen breve",
  "coverImageUrl": "http://localhost:3001/uploads/cover-1-uuid.jpg",
  "coverImageKey": "cover-1-uuid.jpg",
  "source": "manual",
  "status": "published",
  "externalSourceUrl": null,
  "publishedAt": "2024-01-15T10:30:00.000Z",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

---

## Referencia de variables de entorno

### Backend (`backend/.env`)

| Variable                | Default                                      | Descripción                              |
|-------------------------|----------------------------------------------|------------------------------------------|
| NODE_ENV                | development                                  | Entorno de ejecución                     |
| PORT                    | 3001                                         | Puerto del servidor                      |
| HOST                    | 0.0.0.0                                      | Interfaz de escucha                      |
| DB_HOST                 | localhost                                    | Host de la base de datos                 |
| DB_PORT                 | 3306                                         | Puerto de la base de datos               |
| DB_NAME                 | articles_db                                  | Nombre de la base de datos               |
| DB_USER                 | articles_user                                | Usuario de la base de datos              |
| DB_PASSWORD             | articles_pass                                | Contraseña de la base de datos           |
| STORAGE_PROVIDER        | local                                        | Proveedor de almacenamiento: local o s3  |
| LOCAL_STORAGE_PATH      | ./uploads                                    | Ruta local para imágenes                 |
| LOCAL_STORAGE_BASE_URL  | http://localhost:3001/uploads                | URL base para servir imágenes locales    |
| AWS_REGION              | us-east-1                                    | Región de AWS                            |
| AWS_ACCESS_KEY_ID       | -                                            | Access Key ID de AWS                     |
| AWS_SECRET_ACCESS_KEY   | -                                            | Secret Access Key de AWS                 |
| S3_BUCKET               | -                                            | Nombre del bucket S3                     |
| S3_BASE_URL             | -                                            | URL base del bucket S3                   |
| GENERATOR_API_URL       | https://jsonplaceholder.typicode.com/posts   | URL de la API fuente del generador       |
| GENERATOR_COUNT         | 5                                            | Cantidad de artículos a generar          |

### Frontend (`frontend/.env`)

| Variable      | Default                  | Descripción                    |
|---------------|--------------------------|--------------------------------|
| VITE_API_URL  | http://localhost:3001    | URL base del backend           |

---

## Decisiones técnicas

### Node.js + TypeScript para el backend
Ecosistema maduro para APIs REST, tipado estático que reduce errores en tiempo de ejecución, excelente soporte para async/await.

### React + Vite para el frontend
Vite provee HMR ultrarrápido en desarrollo. React es el estándar de la industria para SPAs. Sin CSS framework para mantener la simplicidad y evitar dependencias innecesarias.

### Sequelize como ORM
Abstracción de la base de datos que facilita el cambio entre motores (MySQL en desarrollo, RDS en producción). Las migraciones automáticas con `sync({ alter: true })` simplifican el desarrollo.

### Patrón Repository + Service
Separa la lógica de acceso a datos (repository) de la lógica de negocio (service), facilitando el testing unitario y el mantenimiento.

### StorageProvider como interfaz
Permite cambiar entre almacenamiento local y S3 con una sola variable de entorno, sin modificar el código de negocio. El patrón Strategy facilita agregar nuevos proveedores (Azure Blob, GCS, etc.).

### Docker Compose para desarrollo
Orquesta los tres servicios (DB, backend, frontend) con un solo comando. El healthcheck de MySQL garantiza que el backend no arranque hasta que la base de datos esté lista.

### systemd para producción en VMs
Gestión nativa del sistema operativo, reinicio automático, logs integrados con journald. Más ligero que Docker en VMs dedicadas.

### Almacenamiento NFS para múltiples instancias
Cuando se escala horizontalmente con almacenamiento local, NFS permite que todas las instancias lean y escriban en el mismo directorio compartido, manteniendo la consistencia de las URLs de imágenes.
