import { useState, useRef, ReactNode, useEffect } from 'react';
import { useClickAway } from '@shared/hooks/useClickAway';

import Box from '@atoms/box/SimpleBox';
import IconButton, { IconButtonProps } from '@atoms/button/IconButton';

interface DropdownMenuProps extends Omit<IconButtonProps, 'onClick' | 'icon'> {
  children: ReactNode;
  icon?: string;
}

/**
 * A flexible dropdown menu that adjusts dynamically based on screen space.
 */
const DropdownMenu = ({ children, ...iconButtonProps }: DropdownMenuProps) => {
  const [open, setOpen] = useState(false);
  const [alignment, setAlignment] = useState<'left' | 'right'>('right');

  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  useClickAway(dropdownRef, () => setOpen(false));

  useEffect(() => {
    if (!open || !buttonRef.current || !dropdownRef.current) return;

    const buttonRect = buttonRef.current.getBoundingClientRect();
    const dropdownWidth = dropdownRef.current.offsetWidth;
    const screenWidth = window.innerWidth;

    // Detect if dropdown overflows on the right
    if (buttonRect.left + dropdownWidth < screenWidth) {
      setAlignment('left');
    } else {
      setAlignment('right');
    }
  }, [open]);

  return (
    <Box ref={dropdownRef} className='relative'>
      <IconButton
        ref={buttonRef}
        {...iconButtonProps}
        onClick={() => setOpen(prev => !prev)}
      />
      {open && (
        <Box
          className={`
            absolute top-full mt-2 w-72 bg-white shadow-md p-4 rounded-lg z-50
            ${alignment === 'left' ? 'right-0' : 'left-0'}
          `}
        >
          {children}
        </Box>
      )}
    </Box>
  );
};

export default DropdownMenu;
