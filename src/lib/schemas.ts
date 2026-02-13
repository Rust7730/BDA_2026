import { z } from 'zod';

export const TopProductSchema = z.object({
  producto_id: z.number(),
  producto_nombre: z.string(),
  monto_total_vendido: z.coerce.number(),
  porcentaje_del_total: z.coerce.number().optional(), 
});

export const UnsoldProductSchema = z.object({
  producto_id: z.number(),
  producto_nombre: z.string(),
  stock: z.coerce.number(),
  capital_estancado: z.coerce.number(),
  total_ventas: z.coerce.number(),
});

export const GreaterBuyerSchema = z.object({
  usuario_id: z.number(),
  usuario_nombre: z.string(),
  email: z.string().email(),
  ordenes_count: z.coerce.number(),
  nivel_lealtad: z.string(),
});

export const StockCategorySchema = z.object({
  categoria: z.string(),
  unidades_totales: z.coerce.number(),
  precio_promedio_categoria: z.coerce.number(),
  ratio_piezas_por_sku: z.coerce.number(),
});

export const ProductParticipationSchema = z.object({
  producto_id: z.number(),
  producto_nombre: z.string(),
  categoria: z.string(),
  ventas_producto: z.coerce.number(),
  ventas_categoria: z.coerce.number(),
  participacion_pct: z.coerce.number(),
  clasificacion: z.string(),
});

export type TopProduct = z.infer<typeof TopProductSchema>;
export type UnsoldProduct = z.infer<typeof UnsoldProductSchema>;
export type GreaterBuyer = z.infer<typeof GreaterBuyerSchema>;
export type StockCategory = z.infer<typeof StockCategorySchema>;
export type ProductParticipation = z.infer<typeof ProductParticipationSchema>;