import { TrendingUp, Settings } from "lucide-react";
import { useThemeContext } from "@hooks/useThemeContext";

function Header() {
  const { theme, toggleTheme } = useThemeContext();
  console.log(theme);

  return (
    <div className='flex justify-between items-center mb-8'>
      <div>
        <h1 className='text-3xl font-bold text-gray-900 dark:text-[#F3F4F6]'>
          Dashboard
        </h1>
        <p className='text-gray-600 dark:text-gray-400 mt-1'>
          Here is your application report and performances
        </p>
      </div>
      <div className='flex items-center gap-1'>
        <button
          className='p-2 text-gray-400 hover:text-gray-600 transition-colors'
          onClick={toggleTheme}
        >
          <Settings className='w-5 h-5' />
        </button>
        <button className='p-2 text-gray-400 hover:text-gray-600 transition-colors'>
          <TrendingUp className='w-5 h-5' />
        </button>
        <div className='flex items-center gap-3'>
          <img
            src='https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=40&h=40&fit=crop&crop=face'
            alt='Brooklyn Simmons'
            className='w-10 h-10 rounded-full'
          />
          <div className='text-right'>
            <div className='text-sm font-medium text-gray-900 dark:text-gray-400 '>
              Brooklyn Simmons
            </div>
            <div className='text-xs text-gray-500'>simmons@gmail.com</div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default Header;
