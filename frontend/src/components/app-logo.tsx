// App logo component displaying the official EasyCart brand logo
import { Link } from 'react-router-dom';
import logoImg from '@/assets/easycart-logo.png';

interface AppLogoProps {
  className?: string;
  showTagline?: boolean;
}

export function AppLogo({ className = '' }: AppLogoProps) {
  return (
    <Link to="/" className={`inline-flex items-center group ${className}`}>
      <img
        src={logoImg}
        alt="Easy Cart - Your Effortless Shopping Companion"
        className="h-11 sm:h-13 w-auto object-contain transition-transform group-hover:scale-102"
      />
    </Link>
  );
}
