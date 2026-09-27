# Sistema de Pedidos y Pagos – Panadería Emanuel (Tacna)

Aplicación web (React + Node.js/Express + MySQL) que digitaliza el cuaderno
de pedidos: por cada pedido registra cuánto se pagó, cuánto falta y si fue
reserva, adelanto o pago completo.

## 1. Estructura del proyecto
```
panaderia-emanuel/
├── backend/     API REST (Node.js + Express) + conexión a RDS
│   ├── sql/schema.sql
│   └── src/...
└── frontend/    Interfaz web (React + Vite)
    └── src/...
```
El backend, además de exponer la API, sirve el **build ya compilado** del
frontend (`frontend/dist`) como archivos estáticos. Así una sola EC2
atiende tanto la interfaz como la API — no hace falta S3 ni CloudFront.

## 2. Requisitos previos
- Cuenta de AWS
- Node.js 18+ instalado en tu máquina (para compilar y probar localmente)
- Cliente MySQL (`mysql` CLI o MySQL Workbench)

## 3. Paso 1 — Crear la base de datos en RDS
1. Consola AWS → **RDS** → *Create database*.
2. Método: *Standard create*. Motor: **MySQL 8.0**.
3. Plantilla: **Free tier**.
4. Identificador de instancia: `panaderia-emanuel-db`.
5. Usuario maestro: `admin`, con una contraseña segura (anótala).
6. Clase de instancia: `db.t3.micro`. Almacenamiento: 20 GB.
7. Conectividad: misma VPC donde lanzarás la EC2.
8. Grupo de seguridad: crea uno nuevo, por ejemplo `sg-rds-panaderia`.
9. Crea la base y espera a que el estado sea **Available** (5–10 min).
10. Copia el **Endpoint**.

## 4. Paso 2 — Permitir que la EC2 hable con la RDS
En el grupo de seguridad de la RDS (`sg-rds-panaderia`), agrega una regla de
entrada: puerto **3306**, origen = el *security group* de tu EC2.

## 5. Paso 3 — Cargar el esquema (`backend/sql/schema.sql`)
```bash
mysql -h <ENDPOINT_RDS> -u admin -p < backend/sql/schema.sql
```
Crea las 8 tablas, la vista `vista_estado_pedidos` y los métodos de pago base.

## 6. Paso 4 — Compilar el frontend (React)
En tu máquina local (o en la EC2, más adelante):
```bash
cd frontend
npm install
npm run build
```
Esto genera `frontend/dist`, que el backend servirá directamente.

## 7. Paso 5 — Lanzar la instancia EC2
1. Consola AWS → **EC2** → *Launch instance*.
2. AMI: **Ubuntu Server 22.04 LTS**. Tipo: `t2.micro` (free tier).
3. Crea o reutiliza un par de claves (`.pem`).
4. Grupo de seguridad `sg-ec2-panaderia`: permite **SSH (22)** desde tu IP y
   el puerto de la app (por ejemplo **3000**) desde `0.0.0.0/0`.
5. Lanza la instancia y anota su **IP pública**.

## 8. Paso 6 — Preparar la EC2
```bash
ssh -i tu-llave.pem ubuntu@<IP_PUBLICA_EC2>

curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
sudo npm install -g pm2
```

## 9. Paso 7 — Subir y ejecutar el proyecto
Desde tu máquina local, sube el proyecto completo (backend + frontend ya compilado):
```bash
scp -i tu-llave.pem -r panaderia-emanuel ubuntu@<IP_PUBLICA_EC2>:~/
```
Ya en la EC2:
```bash
cd panaderia-emanuel/backend
npm install
cp .env.example .env
nano .env   # completa DB_HOST (endpoint de RDS), DB_USER y DB_PASSWORD

pm2 start src/app.js --name panaderia-api
pm2 save
pm2 startup   # sigue la instrucción que imprime para que arranque solo
```
Si prefieres compilar el frontend directamente en la EC2 en vez de subir
`frontend/dist` ya generado:
```bash
cd ~/panaderia-emanuel/frontend
npm install
npm run build
```

## 10. Paso 8 — Probar que todo funciona
- Abre `http://<IP_PUBLICA_EC2>:3000/` en el navegador → deberías ver la
  interfaz de React (pestañas Caja, Pedidos, Pagos, Clientes, Productos).
- La API queda disponible bajo el mismo dominio en `/api/...`.

## 11. Endpoints principales de la API

| Método | Ruta | Descripción |
|---|---|---|
| POST | `/api/clientes` | Registrar cliente |
| POST | `/api/productos` | Registrar producto |
| POST | `/api/usuarios` | Registrar personal |
| POST | `/api/pedidos` | Crear pedido con su detalle (calcula el total) |
| GET  | `/api/pedidos/:id/estado` | Ver si está reservado, con adelanto o pagado |
| POST | `/api/pagos` | Registrar un abono (parcial o total) |
| GET  | `/api/caja/resumen?fecha=YYYY-MM-DD` | Cuadre del día: vendido, cobrado, pendiente |
| POST | `/api/caja/cerrar` | Guardar el cierre de caja del día |

## 12. Desarrollo local (antes de desplegar)
```bash
# Terminal 1: backend
cd backend
npm install
cp .env.example .env   # apunta a tu RDS o a un MySQL local
npm run dev             # http://localhost:3000

# Terminal 2: frontend
cd frontend
npm install
npm run dev              # http://localhost:5173 (con proxy a /api)
```

## 13. Evidencias sugeridas para la entrega
- Captura de la RDS en estado **Available**.
- Captura de la EC2 en estado **Running** con su IP pública.
- Captura de la interfaz de React funcionando en `http://<IP>:3000`.
- Captura de un pedido creado desde el formulario, un pago parcial
  registrado, y cómo el estado cambia de "adelanto_parcial" a
  "pagado_completo" al completar el pago.
- Captura de la pestaña "Caja del día" mostrando el cuadre.
