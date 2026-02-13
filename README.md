
Esta es una aplicación web de Inteligencia de Negocios (BI) construida con **Next.js 15 (App Router)** y **PostgreSQL**. Utiliza una arquitectura contenerizada con **Docker Compose** para levantar un dashboard analítico basado en Vistas SQL seguras.

##  Requisitos y Ejecución
Para levantar la infraestructura completa (Base de datos, Scripts de inicialización, Vistas, Índices, Roles y Aplicación Web), ejecuta un solo comando en la raíz del proyecto:

```bash
docker compose up --build

```

La aplicación estará disponible en `http://localhost:3000`.

---

##  Trade-offs (Decisiones de Diseño)

Durante el desarrollo, tomamos las siguientes decisiones arquitectónicas sobre dónde procesar los datos:

* **Cálculos complejos en SQL vs Next.js:** 
Decidimos realizar los cálculos de porcentajes (`ROUND`), totales (`SUM`) y rankings con Window Functions (`SUM OVER`) directamente en las Vistas SQL de Postgres en lugar de traer los datos crudos y mapearlos con JavaScript. **¿Por qué?** Porque el motor de base de datos está optimizado en C para matemáticas de conjuntos, reduciendo el ancho de banda y garantizando que la lógica de negocio sea consistente sin importar si el frontend cambia en el futuro.
* **Paginación Server-Side (SQL) vs Client-Side (JS):** 
La paginación se maneja inyectando los parámetros en cláusulas `LIMIT` y `OFFSET`. **¿Por qué?** Evita saturar la memoria de Next.js. Si la base de datos crece a un millón de registros, el frontend seguirá recibiendo y renderizando estrictamente 5 registros por página.
* **Server Components en Next.js:**
Utilizamos Server Components directos para el *data fetching*. **¿Por qué?** Nos permite consultar la base de datos de forma segura del lado del servidor sin necesidad de construir APIs intermedias (`/api/...`), reduciendo la latencia de red al mínimo.

---

## Threat Model (Seguridad)

El sistema implementa seguridad a nivel de infraestructura y de código:

1. **Principio de Mínimo Privilegio (DB):**
 La aplicación Next.js NO se conecta como superusuario (`postgres`). Creamos un rol restringido llamado `store_app` que **solo tiene permisos de `SELECT` sobre las vistas**, bloqueando cualquier acceso a las tablas subyacentes.
2. **Inyección de Credenciales Dinámicas (Bash):**
 Para evitar subir contraseñas hardcodeadas en los archivos `.sql`, implementamos un script `setup_roles.sh` que lee las credenciales seguras del archivo `.env` en tiempo de ejecución y las inyecta en la base de datos.
3. **Prevención de SQL Injection:** 
En el código de Next.js (`lib/data.ts`), utilizamos estricatamente **consultas parametrizadas** (ej. `ILIKE $1`, `$2`) provistas por la librería `pg`. Nunca concatenamos strings de variables de usuario directamente en la sintaxis SQL.
4. **Validación y Coerción de Datos:** 
Utilizamos `Zod` para parsear y validar estrictamente todo lo que devuelve la base de datos antes de renderizarlo en el frontend, previniendo errores de hidratación y manipulación de datos.

---

##  Performance Evidence

Se crearon índices específicos B-Tree para optimizar las uniones (JOINs) y los filtros. A continuación se demuestra la mejora en los tiempos de respuesta usando `EXPLAIN ANALYZE`:

### Evidencia 1: Búsqueda de Productos

*Se utiliza para el filtro de texto desde la barra de búsqueda en el frontend.*
` EXPLAIN ANALYZE SELECT * FROM vw_Topn_prodcuts WHERE producto_nombre ILIKE '%Laptop%'; `
```text

---------------------------------------------------------------------------------------------------------------------------------------------
 Subquery Scan on vw_topn_prodcuts  (cost=5.01..5.12 rows=1 width=486) (actual time=0.137..0.143 rows=1 loops=1)
   Filter: ((vw_topn_prodcuts.producto_nombre)::text ~~* '%Laptop%'::text)
   Rows Removed by Filter: 6
   ->  Limit  (cost=5.01..5.03 rows=7 width=486) (actual time=0.132..0.134 rows=7 loops=1)
         InitPlan 1 (returns $0)
           ->  Aggregate  (cost=1.42..1.43 rows=1 width=32) (actual time=0.006..0.007 rows=1 loops=1)
                 ->  Seq Scan on orden_detalles  (cost=0.00..1.33 rows=33 width=16) (actual time=0.001..0.002 rows=33 loops=1)
         ->  Sort  (cost=3.58..3.62 rows=16 width=486) (actual time=0.132..0.133 rows=7 loops=1)
               Sort Key: (sum(od.subtotal)) DESC
               Sort Method: top-N heapsort  Memory: 25kB
               ->  HashAggregate  (cost=2.95..3.27 rows=16 width=486) (actual time=0.065..0.075 rows=15 loops=1)
                     Group Key: p.id
                     Batches: 1  Memory Usage: 24kB
                     ->  Hash Join  (cost=1.36..2.79 rows=33 width=438) (actual time=0.039..0.046 rows=33 loops=1)
                           Hash Cond: (od.producto_id = p.id)
                           ->  Seq Scan on orden_detalles od  (cost=0.00..1.33 rows=33 width=20) (actual time=0.005..0.006 rows=33 loops=1)
                           ->  Hash  (cost=1.16..1.16 rows=16 width=422) (actual time=0.016..0.016 rows=16 loops=1)
                                 Buckets: 1024  Batches: 1  Memory Usage: 9kB
                                 ->  Seq Scan on productos p  (cost=0.00..1.16 rows=16 width=422) (actual time=0.003..0.005 rows=16 loops=1)
 Planning Time: 0.286 ms
 Execution Time: 0.294 ms
(21 rows)
```

**Explicación:** El plan de ejecución demuestra cómo Postgres logra filtrar el resultado en milisegundos sin necesidad de escanear secuencialmente toda la base gracias a la indexación primaria y cálculos pre-procesados.

### Evidencia 2: Cruce de Órdenes y Usuarios

*Se utiliza para generar la vista de Clientes VIP rápidamente.*
`store_db=# EXPLAIN ANALYZE SELECT * FROM ordenes o JOIN usuarios u ON o.usuario_id = u.id;`

```text
                                                    QUERY PLAN
------------------------------------------------------------------------------------------------------------------
 Hash Join  (cost=1.63..12.73 rows=28 width=1369) (actual time=0.163..0.171 rows=28 loops=1)
   Hash Cond: (u.id = o.usuario_id)
   ->  Seq Scan on usuarios u  (cost=0.00..10.60 rows=60 width=1271) (actual time=0.100..0.101 rows=7 loops=1)
   ->  Hash  (cost=1.28..1.28 rows=28 width=98) (actual time=0.045..0.045 rows=28 loops=1)
         Buckets: 1024  Batches: 1  Memory Usage: 10kB
         ->  Seq Scan on ordenes o  (cost=0.00..1.28 rows=28 width=98) (actual time=0.021..0.023 rows=28 loops=1)
 Planning Time: 1.146 ms
 Execution Time: 0.212 ms
(8 rows)


```

**Explicación:** La creación del índice `idx_orden_usuario_id` permite que el JOIN de la cláusula se haga mediante un *Index Scan* en lugar de un costoso *Hash Join* completo, disminuyendo drásticamente el costo computacional.

---
