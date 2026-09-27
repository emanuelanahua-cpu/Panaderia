-- =========================================================
-- Base de datos: panaderia_emanuel
-- Sistema de gestión de pedidos y pagos - Panadería Emanuel (Tacna)
-- Ejecutar contra la instancia RDS MySQL 8.0
-- =========================================================

CREATE DATABASE IF NOT EXISTS panaderia_emanuel CHARACTER SET utf8mb4;
USE panaderia_emanuel;

-- 1. Usuarios: personal que registra pedidos y cobra
CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    usuario VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    rol ENUM('admin','vendedor') NOT NULL DEFAULT 'vendedor',
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Clientes
CREATE TABLE clientes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(120) NOT NULL,
    telefono VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Productos
CREATE TABLE productos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(120) NOT NULL,
    descripcion VARCHAR(255),
    precio DECIMAL(10,2) NOT NULL,
    stock INT NOT NULL DEFAULT 0,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Métodos de pago (catálogo)
CREATE TABLE metodos_pago (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(40) NOT NULL UNIQUE
);

-- 5. Pedidos (cabecera)
CREATE TABLE pedidos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cliente_id INT NOT NULL,
    usuario_id INT NOT NULL,
    fecha_pedido DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_entrega DATETIME,
    estado ENUM('reservado','en_preparacion','entregado','cancelado') NOT NULL DEFAULT 'reservado',
    total DECIMAL(10,2) NOT NULL DEFAULT 0,
    observaciones VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cliente_id) REFERENCES clientes(id),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

-- 6. Detalle del pedido (productos y cantidades)
CREATE TABLE detalle_pedido (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pedido_id INT NOT NULL,
    producto_id INT NOT NULL,
    cantidad INT NOT NULL,
    precio_unitario DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE,
    FOREIGN KEY (producto_id) REFERENCES productos(id)
);

-- 7. Pagos: permite VARIOS abonos por pedido (resuelve el problema del cuaderno)
CREATE TABLE pagos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pedido_id INT NOT NULL,
    metodo_pago_id INT NOT NULL,
    usuario_id INT NOT NULL,
    monto DECIMAL(10,2) NOT NULL,
    fecha_pago DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE,
    FOREIGN KEY (metodo_pago_id) REFERENCES metodos_pago(id),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

-- 8. Cierre de caja diario: reemplaza el "cuadre a mano" del cuaderno
CREATE TABLE cierre_caja (
    id INT AUTO_INCREMENT PRIMARY KEY,
    fecha DATE NOT NULL UNIQUE,
    total_vendido DECIMAL(10,2) NOT NULL DEFAULT 0,
    total_cobrado DECIMAL(10,2) NOT NULL DEFAULT 0,
    total_pendiente DECIMAL(10,2) NOT NULL DEFAULT 0,
    usuario_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

-- =========================================================
-- VISTA CLAVE: dice si un pedido está reservado, con adelanto
-- o pagado por completo, sumando todos sus pagos.
-- Esto es exactamente lo que hoy se pierde al tachar en el cuaderno.
-- =========================================================
CREATE OR REPLACE VIEW vista_estado_pedidos AS
SELECT
    p.id AS pedido_id,
    p.cliente_id,
    c.nombre AS cliente,
    p.estado,
    p.total,
    IFNULL(SUM(pg.monto), 0) AS total_pagado,
    (p.total - IFNULL(SUM(pg.monto), 0)) AS saldo,
    CASE
        WHEN IFNULL(SUM(pg.monto), 0) = 0 THEN 'reservado_sin_pago'
        WHEN IFNULL(SUM(pg.monto), 0) < p.total THEN 'adelanto_parcial'
        ELSE 'pagado_completo'
    END AS estado_pago
FROM pedidos p
LEFT JOIN pagos pg ON pg.pedido_id = p.id
LEFT JOIN clientes c ON c.id = p.cliente_id
GROUP BY p.id, p.cliente_id, c.nombre, p.estado, p.total;

-- Datos base
INSERT INTO metodos_pago (nombre) VALUES ('Efectivo'), ('Yape'), ('Plin'), ('Tarjeta');
