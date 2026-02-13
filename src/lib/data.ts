import { query } from './db'; 
import { z } from 'zod';
import { 
  TopProductSchema, 
  UnsoldProductSchema, 
  GreaterBuyerSchema, 
  StockCategorySchema, 
  ProductParticipationSchema 
} from './schemas';

export async function getTopProducts(search: string = '') {
  try {
    const result = await query(
      `SELECT * FROM vw_Topn_prodcuts 
       WHERE producto_nombre ILIKE $1
       ORDER BY monto_total_vendido DESC`,
      [`%${search}%`]
    );
    
    const data = z.array(TopProductSchema).parse(result.rows);
    return { data, error: null };
  } catch (err) {
    console.error("Database Error:", err);
    return { data: [], error: "Error al cargar los productos top." };
  }
}

export async function getUnsoldProducts(page: number = 1) {
  const ITEMS_PER_PAGE = 5;
  const offset = (page - 1) * ITEMS_PER_PAGE;

  try {
    const result = await query(
      `SELECT * FROM vw_unsold_products 
       ORDER BY capital_estancado DESC
       LIMIT $1 OFFSET $2`,
      [ITEMS_PER_PAGE, offset]
    );

    const countResult = await query(`SELECT COUNT(*) FROM vw_unsold_products`);

    const data = z.array(UnsoldProductSchema).parse(result.rows);
    const totalItems = Number(countResult.rows[0].count);
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

    return { data, totalPages, totalItems, error: null };
  } catch (err) {
    console.error(err);
    return { data: [], totalPages: 0, totalItems: 0, error: "Error al cargar productos estancados." };
  }
}

export async function getGreaterBuyers(search: string = '', page: number = 1) {
  const ITEMS_PER_PAGE = 5; 
  const offset = (page - 1) * ITEMS_PER_PAGE;

  try {
    const result = await query(
      `SELECT * FROM vw_Greater_Buyers 
       WHERE usuario_nombre ILIKE $1 OR email ILIKE $1
       ORDER BY ordenes_count DESC, usuario_id ASC
       LIMIT $2 OFFSET $3`,
      [`%${search}%`, ITEMS_PER_PAGE, offset]
    );

    const countResult = await query(
      `SELECT COUNT(*) FROM vw_Greater_Buyers WHERE usuario_nombre ILIKE $1 OR email ILIKE $1`,
      [`%${search}%`]
    );
    
    const data = z.array(GreaterBuyerSchema).parse(result.rows);
    const totalItems = Number(countResult.rows[0].count);
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

    return { data, totalPages, totalItems, error: null };
  } catch (err) {
    console.error("Database Error:", err);
    return { data: [], totalPages: 0, totalItems: 0, error: "Error al cargar clientes." };
  }
}

export async function getStockCategories() {
  try {
    const result = await query('SELECT * FROM vw_Stock_Categories ORDER BY unidades_totales DESC');
    const data = z.array(StockCategorySchema).parse(result.rows);
    return { data, error: null };
  } catch (err) {
    console.error(err);
    return { data: [], error: "Error al cargar el stock por categorías." };
  } 
}

export async function getProductParticipation(search: string = '') {
  try {
    const result = await query(
      `SELECT * FROM vw_participacion_producto 
       WHERE producto_nombre ILIKE $1 OR categoria ILIKE $1
       ORDER BY categoria, participacion_pct DESC`,
       [`%${search}%`]
      );
    const data = z.array(ProductParticipationSchema).parse(result.rows);
    return { data, error: null };
  } catch (err) {
    console.error(err);
    return { data: [], error: "Error al cargar la participación." };
  }
}