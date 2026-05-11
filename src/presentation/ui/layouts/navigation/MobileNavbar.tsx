import { NavLink } from 'react-router-dom';
import Box from '@atoms/box/SimpleBox';
import Icon from '@atoms/icon/SimpleIcon';
import Typography from '@atoms/typography/SimpleTypography';

interface MobileNavbarItem {
  label: string;
  path: string;
  icon: string;
}

interface MobileNavbarProps {
  items: MobileNavbarItem[];
  trailingButton?: React.ReactNode;
}

const MobileNavbar = ({ items, trailingButton }: MobileNavbarProps) => {
  return (
    <Box className='surface-card fixed inset-x-0 bottom-0 z-[70] mx-3 mb-3 rounded-[1.5rem] py-3 shadow-[0_-12px_40px_rgba(15,23,42,0.18)] [padding-bottom:calc(env(safe-area-inset-bottom,0px)+0.75rem)]'>
      <Box className='flex justify-around gap-2'>
        {items.map(({ label, path, icon }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              `flex min-w-0 flex-col items-center text-sm transition-all ${
                isActive ? 'text-primary' : 'text-gray-600'
              }`
            }
          >
            <Icon name={icon} className='text-2xl' />
            <Typography variant='p' className='mt-1 truncate text-[11px]'>
              {label}
            </Typography>
          </NavLink>
        ))}
        {trailingButton}
      </Box>
    </Box>
  );
};

export default MobileNavbar;
