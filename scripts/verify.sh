#!/bin/bash
echo "========================================="
echo "Verificando Vistas de la Base de Datos..."
echo "========================================="

# Listar las vistas
docker exec -it store_postgres psql -U store_app -d store_db -c "\dv"

echo "========================================="
echo "Probando lectura de las vistas (Top 1 de cada una)..."

docker exec -it store_postgres psql -U store_app -d store_db -c "SELECT * FROM vw_Topn_prodcuts LIMIT 1;"
docker exec -it store_postgres psql -U store_app -d store_db -c "SELECT * FROM vw_unsold_products LIMIT 1;"
docker exec -it store_postgres psql -U store_app -d store_db -c "SELECT * FROM vw_Greater_Buyers LIMIT 1;"
docker exec -it store_postgres psql -U store_app -d store_db -c "SELECT * FROM vw_Stock_Categories LIMIT 1;"
docker exec -it store_postgres psql -U store_app -d store_db -c "SELECT * FROM vw_participacion_producto LIMIT 1;"

echo "¡Verificación Completada!"