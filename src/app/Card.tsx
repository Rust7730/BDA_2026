import Link from 'next/link';
import React, { useState } from 'react';

interface DashboardCardProps {
  title: string;
  description: string;
  href: string; 
  href2: string;
}

export const DashboardCard = ({ 
  title, 
  description, 
  href, 
    href2
}: DashboardCardProps) => {
      const [isHovered, setIsHovered] = useState(false);

  return (
    <Link 
      href={href} 
      className="block group" 
            onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
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

        <h3 className="mb-2 text-xl font-bold text-gray-900 group-hover:text-green-500">
          {title}
        </h3>

        <p className="font-normal text-gray-700 mb-4">
          {description}
        </p>
        <div className="mt-4 flex items-center text-green-500 font-medium text-sm group-hover:underline">
          Ver reporte &rarr;
        </div>
        <div 
        className={`absolute inset-0 flex items-center justify-center bg-white/90 transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
          <img src={href2} alt="Report Icon" className="w-24 h-24 object-contain" />
        </div>
      </div>
    </Link>
  );
};