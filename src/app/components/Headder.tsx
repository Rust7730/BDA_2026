import Link from 'next/link';

interface HeaderProps {
  title: string;
  backUrl?: string;
  backText?: string;
}

export default function Header({ title, backUrl = '/', backText = 'Volver' }: HeaderProps) {
  return (
    <header className="bg-gradient-to-r from-emerald-600 to-green-600 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-10">
            <Link 
              href={backUrl}
              className="flex items-center gap-2 text-white/90 hover:text-white transition-colors group"
            >
                
              <span className="text-sm font-medium">{backText}</span>
            </Link>
            
            <div className="h-6 w-px bg-white/30"></div>
            
            <h1 className="text-xl font-semibold text-white">
              {title}
            </h1>
          </div>

          <div className="flex items-center gap-3">
          </div>
        </div>
      </div>
    </header>
  );
}