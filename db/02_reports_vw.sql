/*
REPORTE 1: Top 7 productos por monto total vendido (Top N personalizado)
Qué devuelve: Los 7 productos con mayor monto total vendido.
Grain (una fila representa): Un producto.
Métrica(s): SUM(od.subtotal)
Por qué GROUP BY / HAVING / subconsulta:
- GROUP BY para agregar por producto
- ORDER BY + LIMIT para construir el Top N
*/
CREATE OR REPLACE VIEW vw_Topn_prodcuts AS 

SELECT
  p.id AS producto_id,
  p.nombre AS producto_nombre,
  SUM(od.subtotal) AS monto_total_vendido
FROM productos p
JOIN orden_detalles od ON od.producto_id = p.id
GROUP BY p.id, p.nombre
ORDER BY monto_total_vendido DESC
LIMIT 7;

/*
REPORTE 2: Productos sin ventas (Stock Inactivo)
Qué devuelve: Listado de productos que nunca han sido incluidos en ninguna orden.
Grain (una fila representa): Un Producto.
Métrica(s): No aplica (listado de Productos).
Por qué GROUP BY / HAVING / subconsulta: Se usa NOT EXISTS para detectar ausencia en ventana.
*/

CREATE OR REPLACE VIEW vw_unsold_products AS
SELECT 
    p.id AS producto_id, 
    p.nombre AS producto_nombre, 
    p.stock,
    (p.precio * p.stock) AS capital_estancado,
    COUNT(od.id) AS total_ventas
FROM productos p  
LEFT JOIN orden_detalles od ON p.id = od.producto_id
GROUP BY p.id, p.nombre, p.stock, p.precio
HAVING COUNT(od.id) = 0
ORDER BY capital_estancado DESC;

/*
REPORTE 3: Usuarios frecuentes
Qué devuelve: Usuarios con al menos 4 ordenes.
Grain (una fila representa): Un usuario.
Métrica(s): COUNT(ordenes.id)
Por qué GROUP BY / HAVING:
- GROUP BY define el grain a nivel usuario.
- HAVING se usa para filtrar por una métrica agregada (conteo de órdenes),
  lo cual no puede hacerse en WHERE.
*/


CREATE OR REPLACE VIEW vw_Greater_Buyers AS


SELECT
  u.id AS usuario_id,
  u.nombre AS usuario_nombre,
  u.email,
  COUNT(o.id) AS ordenes_count,
  CASE 
    WHEN COUNT(o.id) >= 10 THEN 'Cliente VIP'
    WHEN COUNT(o.id) >= 7 THEN 'Cliente Leal'
    ELSE 'Cliente Frecuente'
  END AS nivel_lealtad
FROM usuarios u
JOIN ordenes o ON o.usuario_id = u.id
GROUP BY u.id, u.nombre, u.email
HAVING COUNT(o.id) >= 4
ORDER BY ordenes_count DESC, u.id;


/* REPORTE 4: Stock Total por Categoría
Qué devuelve: El total de piezas (stock) que tenemos en bodega por cada categoría.
Grain (una fila representa): Una categoría.
Métrica(s): SUM(p.stock)
Por qué GROUP BY / HAVING / subconsulta: Usamos GROUP BY para juntar los productos 
de una misma categoría y sumar sus existencias.
*/
CREATE OR REPLACE VIEW vw_Stock_Categories AS


SELECT 
    c.nombre AS categoria, 
    COALESCE(SUM(p.stock), 0) AS unidades_totales,
    COALESCE(AVG(p.precio), 0) AS precio_promedio_categoria, 
    ROUND(SUM(p.stock) * 1.0 / COUNT(p.id), 2) AS ratio_piezas_por_sku 
FROM categorias c
LEFT JOIN productos p ON c.id = p.categoria_id
GROUP BY c.id, c.nombre
ORDER BY unidades_totales DESC;


/*  REPORTE 7: Participación de ventas por producto dentro de su categoría
Qué devuelve:porcentaje de participacion de cada producto en las ventas totales de su categoría.
-- Grain (una fila representa): Un producto.
-- Métrica(s): SUM(od.subtotal) por producto y por categoría.
-- Por qué GROUP BY: Necesario para agregar ventas por producto y categoría.
*/

CREATE OR REPLACE VIEW vw_participacion_producto AS
SELECT
    p.id AS producto_id,
    p.nombre AS producto_nombre,
    c.nombre AS categoria,
    SUM(od.cantidad * od.precio_unitario) AS ventas_producto,
    SUM(SUM(od.cantidad * od.precio_unitario)) OVER (PARTITION BY c.id) AS ventas_categoria,
    ROUND(
        (SUM(od.cantidad * od.precio_unitario) * 100.0)
        / NULLIF(SUM(SUM(od.cantidad * od.precio_unitario)) OVER (PARTITION BY c.id), 0)
    , 2) AS participacion_pct,
    CASE
        WHEN (SUM(od.cantidad * od.precio_unitario) * 100.0)
             / NULLIF(SUM(SUM(od.cantidad * od.precio_unitario)) OVER (PARTITION BY c.id), 0) >= 30
             THEN 'Producto Estrella'
        WHEN (SUM(od.cantidad * od.precio_unitario) * 100.0)
             / NULLIF(SUM(SUM(od.cantidad * od.precio_unitario)) OVER (PARTITION BY c.id), 0) >= 15
             THEN 'Producto Medio'
        ELSE      'Producto Débil'
    END AS clasificacion
FROM productos p
JOIN categorias c ON p.categoria_id = c.id
JOIN orden_detalles od ON od.producto_id = p.id
GROUP BY p.id, p.nombre, c.id, c.nombre
HAVING SUM(od.cantidad * od.precio_unitario) > 0
ORDER BY c.nombre, participacion_pct DESC;

