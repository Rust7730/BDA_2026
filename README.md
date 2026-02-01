# ViewTester — Dashboard de Reportes SQL

## Qué es este proyecto

ViewTester es una aplicación web que muestra reportes basados en consultas SQL. Los reportes se definen como vistas en PostgreSQL y la aplicación solo las lee, sin poder modificar datos ni acceder a las tablas directamente. Todo el sistema se levanta con un solo comando usando Docker Compose.

El objetivo es demostrar que se puede conectar un frontend moderno a una base de datos de forma segura, sin exponer credenciales ni permitir que el usuario escriba SQL libremente.

---

## Cómo levantarlo

Tener instalado Docker y Docker Compose. Desde la carpeta raíz del proyecto:

```bash
docker compose up --build
```

Eso levanta la base de datos, ejecuta el esquema, los datos de prueba y las vistas automáticamente, y luego inicia la aplicación. Una vez que ambos contenedores estén activos, la aplicación se puede ver en:

```
http://localhost:3000
```

Para detener todo:

```bash
docker compose down
```

---

## Estructura del proyecto

```
├── db/
│   ├── 00_schema.sql          Definición de tablas
│   ├── 01_seed.sql            Datos de prueba
│   ├── 02_reports_vw.sql      Vistas SQL de los reportes
│   ├── 03_roles.sql           Usuario y permisos de la aplicación
│   ├── indexes.sql            Índices para rendimiento
│   └── migrate.sql            Placeholder de migraciones
├── src/
│   ├── app/
│   │   ├── page.tsx           Dashboard principal
│   │   ├── Card.tsx           Componente de tarjeta del dashboard
│   │   ├── layout.tsx         Layout global
│   │   └── reports/
│   │       ├── TopProducts/page.tsx
│   │       ├── UnsoldProducts/page.tsx
│   │       ├── GreaterBuyers/page.tsx
│   │       ├── StockCategories/page.tsx
│   │       └── ParticipationProduct/page.tsx
│   └── lib/
│       ├── db.ts              Conexión a PostgreSQL
│       └── schemas.ts         Validación de datos con Zod
├── docker-compose.yml
└── README.md
```

---

## Base de datos

### Tablas

El esquema tiene cinco tablas. Las tres primeras son catálogos o entidades principales y las dos últimas representan transacciones.

**categorias** almacena las categorías de producto. Cada producto pertenece a una sola categoría.

**usuarios** contiene las cuentas del sistema. El campo activo permite deshabilitar cuentas sin borrarlas.

**productos** es el catálogo de artículos. Cada producto tiene un precio, un stock y una categoría asignada. El precio y el stock tienen restricciones de valor mínimo definidas directamente en la tabla.

**ordenes** representa cada pedido que hace un usuario. Tiene un estado que puede ser pendiente, pagado, enviado, entregado o cancelado.

**orden_detalles** es la línea de detalle de cada orden: qué producto, cuántas unidades y a qué precio. El subtotal se calcula automáticamente como cantidad por precio unitario, así que no es posible que ese dato quede inconsistente.

### Vistas (reportes)

Cada vista está documentada directamente en el archivo SQL con un bloque de comentarios que explica qué devuelve, qué representa cada fila, qué métricas calcula y por qué usa las cláusulas que usa.

**vw_Topn_prodcuts — Top 7 productos por ventas**

Muestra los siete productos que han generado más dinero en total. Para cada uno calcula qué porcentaje representa eso respecto a todas las ventas del sistema. Esa participación se usa para clasificar cada producto como Líder, Importante o Relevante, según si supera el 10% o el 5% del total global respectivamente.

Técnicamente, agrupa por producto y suma los subtotales de orden_detalles. La participación se calcula dividiendo el total del producto entre el total global usando una función de ventana que suma todos los productos sin necesidad de una consulta separada. El LIMIT 7 se aplica al final, pero el denominador del porcentaje sigue siendo el total real de todas las ventas, lo cual es correcto porque la intención es mostrar cuánto peso tiene cada producto dentro del universo completo.

**vw_unsold_products — Productos sin ventas**

Lista los productos que nunca han sido parte de ninguna orden. Para cada uno calcula el "capital estancado", es decir, cuánto dinero representa ese producto en inventario si se vendiera todo al precio actual.

Se usa un LEFT JOIN con orden_detalles para incluir productos aunque no tengan registros de venta, y luego HAVING filtra solo los que tienen cero ventas. Esto no se puede hacer en WHERE porque COUNT es una función agregada y WHERE se ejecuta antes de la agregación.

**vw_Greater_Buyers — Clientes frecuentes**

Muestra usuarios que han realizado al menos cuatro órdenes. Cada usuario recibe una clasificación: Cliente VIP si tiene 10 o más órdenes, Cliente Leal si tiene 7 o más, y Cliente Frecuente si tiene entre 4 y 6.

El filtro de "al menos 4 órdenes" se hace con HAVING porque se basa en un conteo, que es un valor calculado después de agrupar. Si se pusiera en WHERE no funcionaría porque en ese punto aún no existe ese valor.

**vw_Stock_Categories — Stock por categoría**

Resume el inventario disponible agrupado por categoría. Muestra el total de unidades, el precio promedio de los productos de esa categoría y un ratio que indica cuántas piezas hay por cada producto distinto dentro de la categoría.

Se usa LEFT JOIN para que aparezcan categorías aunque no tengan productos, y COALESCE para que en esos casos los valores sean cero en lugar de NULL.

**vw_participacion_producto — Participación de ventas por producto dentro de su categoría**

Para cada producto que ha tenido al menos una venta, muestra cuánto representa ese producto en dinero respecto al total de ventas de su propia categoría. No compara contra el total global sino contra la categoría a la que pertenece.

Se usa una función de ventana con PARTITION BY para calcular el total de cada categoría sin necesidad de una subconsulta separada. El HAVING excluye productos sin ventas para que el porcentaje tenga sentido. El CASE clasifica cada producto como Estrella si representa 30% o más de su categoría, Medio si supera el 15%, y Débil si está por debajo.

### Índices

Los índices son estructuras que acelera las búsquedas en la base de datos. PostgreSQL los usa automáticamente cuando ejecuta consultas que involucran las columnas indexadas, especialmente en JOINs, filtros y agrupaciones.

**idx_orden_detalles_producto_id** sobre orden_detalles(producto_id)

Este índice es el más importante del sistema. La tabla orden_detalles es la más grande porque tiene una fila por cada producto en cada orden. Tres de las cinco vistas necesitan hacer un JOIN contra esta tabla usando producto_id: la vista de Top Productos, la de Productos sin ventas y la de Participación por producto. Sin este índice, cada una de esas consultas tendría que revisar toda la tabla para encontrar las filas que corresponden a cada producto.

**idx_orden_usuario_id** sobre ordenes(usuario_id)

La vista de Clientes Frecuentes hace un JOIN entre usuarios y ordenes usando usuario_id para contar cuántas órdenes tiene cada usuario. Este índice permite que PostgreSQL encuentre rápidamente todas las órdenes de un usuario dado sin revisar la tabla completa de órdenes.

**idx_productos_categoria_id** sobre productos(categoria_id)

Dos vistas necesitan agrupar o relacionar productos por categoría: la vista de Stock por Categoría y la de Participación por producto. Ambas hacen un JOIN entre productos y categorias usando categoria_id. Este índice acelera esa búsqueda especialmente cuando hay muchos productos.

### Rol de la aplicación

La aplicación no se conecta como el usuario administrador de PostgreSQL. En su lugar existe un rol llamado app_reporter que tiene permisos muy limitados: puede conectarse a la base de datos y puede hacer SELECT solo sobre las cinco vistas. No puede ver ni consultar las tablas directamente, no puede insertar, actualizar ni borrar datos, y no puede crear ni modificar objetos en la base de datos.

Esto significa que aunque la aplicación tuviera alguna vulnerabilidad, un atacante solo podría leer los mismos datos que ya muestran los reportes.

---

## Aplicación Next.js

### Cómo funciona

La aplicación usa App Router, que significa que cada página vive en una carpeta dentro de src/app. Todas las páginas de reportes son componentes del servidor, lo cual es importante porque es donde se ejecuta la conexión a la base de datos. El usuario que visita la página nunca ve ni tiene acceso a las credenciales de conexión, esas solo existen en el servidor.

El dashboard principal en la ruta raíz muestra cinco tarjetas, una por cada reporte. Cada tarjeta es un enlace que lleva a la página correspondiente.

Cada página de reporte hace lo mismo: consulta la vista correspondiente, valida que los datos tengan el formato esperado, y los muestra en una tabla. Si algo falla, se muestra un mensaje de error en lugar de crashear la página.

### Seguridad y validación

La conexión a la base de datos se configura mediante una variable de entorno llamada DATABASE_URL. Esta variable solo existe dentro del contenedor del servidor, nunca se envía al navegador del usuario.

Todas las consultas que van a la base de datos son SELECT contra las vistas. Ninguna consulta escribe datos. Las dos páginas que reciben parámetros del usuario (UnsoldProducts y GreaterBuyers reciben el número de página) usan consultas parametrizadas, es decir, el valor del parámetro se envía separado de la consulta y PostgreSQL lo trata como un dato, no como parte del SQL. Esto impide que alguien inyecte código SQL a través de la URL.

Además de eso, cada página valida la estructura de los datos que regresa la base de datos usando Zod. Si la base de datos devuelve un campo con un tipo inesperado o un valor que no encaja con lo que la aplicación espera, la validación falla y se muestra el error en lugar de intentar mostrar datos mal formados.

### Paginación

Los reportes de Productos sin ventas y Mejores Clientes incluyen paginación. La paginación se hace en el servidor: la aplicación le pide a PostgreSQL que devuelva solo un grupo pequeño de filas a la vez usando LIMIT y OFFSET, así no se carga toda la tabla de una sola vez. El número de página viene de la URL y se convierte a un número antes de usarlo en la consulta.

---

## Decisiones de diseño

Las vistas se diseñaron para que cada una tenga un propósito analítico concreto en lugar de ser consultas genéricas. Por ejemplo, la vista de Productos sin ventas no devuelve simplemente una lista de nombres, sino que calcula el capital estancado para que sea inmediatamente útil a la hora de tomar decisiones sobre inventario.

Se usaron funciones de ventana en lugar de subconsultas cuando se necesitaba calcular un total global o por grupo sin romper la estructura de la consulta principal. Esto hace que las vistas sean más fáciles de leer porque todo el cálculo ocurre en un mismo nivel.

Los índices se eligieron basándose en qué columnas se usan en los JOINs de las vistas, no al azar. Cada uno responde a una necesidad concreta de búsqueda que las consultas hacen repetidamente.

El rol de la aplicación tiene permisos mínimos por diseño. Si en el futuro se agregan más vistas, el rol necesita recibir permiso explícitamente sobre cada una. Eso es intencional, porque es mejor tener que agregar un permiso que descubrir después que la aplicación puede ver datos que no debería.
