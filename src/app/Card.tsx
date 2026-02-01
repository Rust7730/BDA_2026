import Link from 'next/link';

interface DashboardCardProps {
  title: string;
  description: string;
  href: string; 
  href2: string; // Sugerencia: renombrar a 'imageSrc' para mayor claridad
}

export const DashboardCard = ({ 
  title, 
  description, 
  href, 
  href2
}: DashboardCardProps) => {

  return (
    <Link 
      href={href} 
      className="block group" 
    >
      <div className="
        h-full 
        p-8 
        bg-white 
        border 
        border-gray-200 
        rounded-lg 
        shadow-sm 
        transition-all 
        duration-200 
        hover:shadow-md 
        hover:border-green-300
        hover:-translate-y-1
        relative        
        overflow-hidden 
        group           
      ">

     
        <div className="relative z-10"> 
            <h3 className="mb-2 text-xl font-bold text-gray-900 group-hover:text-green-500">
            {title}
            </h3>

            <p className="font-normal text-gray-700 mb-4">
            {description}
            </p>
            <div className="mt-4 flex items-center text-green-500 font-medium text-sm group-hover:underline">
            Ver reporte &rarr;
            </div>
        </div>

        <img 
          src={href2} 
          alt="Report Icon" 
          className="
            absolute 
            inset-0 
            w-full 
            h-full 
            object-cover 
            opacity-0 
            group-hover:opacity-100 
            transition-opacity 
            duration-300
            z-10 
          " 
        />
        
      </div>
    </Link>
  );
};