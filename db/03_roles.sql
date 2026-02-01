DO $$ 
BEGIN 
  -- Si el rol existe, primero le quitamos todo lo que tiene asignado
  IF EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'app_reporter') THEN
    REVOKE ALL PRIVILEGES ON DATABASE actividad_db FROM app_reporter;
    REVOKE USAGE ON SCHEMA public FROM app_reporter;
    -- Esta es la línea clave: Borra cualquier permiso residual
    DROP OWNED BY app_reporter;
    -- Ahora sí, lo borramos limpio
    DROP ROLE app_reporter;
  END IF;
END 
$$;
CREATE ROLE app_reporter WITH LOGIN PASSWORD 'Rust127754';

GRANT CONNECT ON DATABASE actividad_db TO app_reporter;

GRANT USAGE ON SCHEMA public TO app_reporter;

GRANT SELECT ON vw_Topn_prodcuts TO app_reporter;
GRANT SELECT ON vw_unsold_products TO app_reporter;
GRANT SELECT ON vw_greater_buyers TO app_reporter;
GRANT SELECT ON vw_Stock_Categories TO app_reporter;
GRANT SELECT ON vw_participacion_producto TO app_reporter;