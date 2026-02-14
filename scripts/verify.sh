#!/bin/sh
echo "========================================="
echo "Verificando Vistas de la Base de Datos..."
echo "========================================="


docker exec -it store_postgres sh -c 'PGPASSWORD=$DB_APP_PASSWORD psql -U "$DB_APP_USER" -d "$POSTGRES_DB" -c "\dv"'

echo "========================================="
echo "Probando lectura de las vistas (Top 1 de cada una)..."

docker exec -it store_postgres sh -c 'PGPASSWORD=$DB_APP_PASSWORD psql -U "$DB_APP_USER" -d "$POSTGRES_DB" -c "SELECT * FROM vw_Topn_prodcuts LIMIT 1;"'
docker exec -it store_postgres sh -c 'PGPASSWORD=$DB_APP_PASSWORD psql -U "$DB_APP_USER" -d "$POSTGRES_DB" -c "SELECT * FROM vw_unsold_products LIMIT 1;"'
docker exec -it store_postgres sh -c 'PGPASSWORD=$DB_APP_PASSWORD psql -U "$DB_APP_USER" -d "$POSTGRES_DB" -c "SELECT * FROM vw_Greater_Buyers LIMIT 1;"'
docker exec -it store_postgres sh -c 'PGPASSWORD=$DB_APP_PASSWORD psql -U "$DB_APP_USER" -d "$POSTGRES_DB" -c "SELECT * FROM vw_Stock_Categories LIMIT 1;"'
docker exec -it store_postgres sh -c 'PGPASSWORD=$DB_APP_PASSWORD psql -U "$DB_APP_USER" -d "$POSTGRES_DB" -c "SELECT * FROM vw_participacion_producto LIMIT 1;"'

echo "¡Verificación Completada!"