import { z } from 'zod';

export const TopProductSchema = z.object({
  producto_id: z.number(),
  producto_nombre: z.string(),
  monto_total_vendido: z.coerce.number(), 
});

export const UnsoldProductSchema = z.object({
  producto_id: z.number(),
  producto_nombre: z.string(),
  stock: z.number(),
  capital_estancado: z.coerce.number(),
});

export const BestBuyerSchema = z.object({
  usuario_id: z.number(),
  usuario_nombre: z.string(),
  email: z.string().email(), 
  ordenes_count: z.coerce.number(),
  nivel_lealtad: z.enum(['Cliente VIP', 'Cliente Leal', 'Cliente Frecuente', 'Cliente Nuevo']).optional(),
});
export const StockCategorySchema = z.object({
  categoria: z.string(),
  precio_promedio_categoria: z.coerce.number(),
  unidades_totales: z.coerce.number(),
  ratio_piezas_por_sku: z.coerce.number(),
});
export const ProductShareSchema = z.object({
  producto_id: z.number(),
  producto_nombre: z.string(),
  categoria: z.string(),
  ventas_producto: z.coerce.number(), 
  participacion_pct: z.coerce.number(),
  clasificacion: z.enum(['Producto Estrella', 'Producto Medio', 'Producto Débil']),
});



export type TopProduct = z.infer<typeof TopProductSchema>;
export type UnsoldProduct = z.infer<typeof UnsoldProductSchema>;
export type BestBuyer = z.infer<typeof BestBuyerSchema>;
export type StockCategories = z.infer<typeof StockCategorySchema>;
export type ProductShare = z.infer<typeof ProductShareSchema>;