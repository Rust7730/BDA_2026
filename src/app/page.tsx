import Image from "next/image";

import { DashboardCard } from "@/app/Card"
export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-7xl flex-col items-center justify-between py-50 px-20 bg-white dark:bg-black sm:items-start">

        <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
          <h1 className="max-w- text-5xl font-bold leading-10 tracking-tight text-black dark:text-zinc-50">
            Bienvenido ViewTester.
          </h1>

        </div>
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
        
        <DashboardCard 
          title="Top Productos"
          description="Los 7 productos con mayor recaudación histórica y su impacto."
          href="/reports/TopProducts"
          href2="/Podio2.jpg"
        />

        <DashboardCard 
          title="Productos no vendidos"
          description="Identifica los productos que no han generado ventas."
          href="/reports/UnsoldProducts"
          href2="/Unsoled.jpg"
        />
        <DashboardCard 
          title="Mejores Clientes"
          description="Análisis de los clientes con mayores compras."
          href="/reports/GreaterBuyers"
          href2="/VIP.jpg"
        />
        <DashboardCard 
          title="Total de stock por categoría"
          description="Consulta el inventario disponible seguén por categoría."
          href="/reports/StockCategories"
          href2="/Stock.jpg"
        />
        <DashboardCard 
          title="Porcentaje de participación de productos"
          description="Visualiza el porcentaje de participación de cada producto en las ventas totales."
          href="/reports/ParticipationProduct"
          href2="/producto-estrella.jpg"
        />

        </div>
      </main>
    </div>
  );
}
