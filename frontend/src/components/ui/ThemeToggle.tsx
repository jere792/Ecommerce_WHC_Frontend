import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../../hooks/ThemeContext';

const ThemeToggle = () => {
  const { dark, toggle } = useTheme();

  return (
    <button
      onClick={toggle}
      className="fixed bottom-4 left-4 bg-white dark:bg-gray-800 text-gray-800 dark:text-yellow-400 rounded-full shadow-lg z-50 cursor-pointer
                 w-12 h-12 flex items-center justify-center hover:bg-blue-600 dark:hover:bg-gray-700 transition-colors duration-300"
      aria-label={dark ? 'Activar modo claro' : 'Activar modo oscuro'}
    >
      {dark ? <Sun className="h-6 w-6" /> : <Moon className="h-6 w-6" />}
    </button>
  );
};

export default ThemeToggle;
