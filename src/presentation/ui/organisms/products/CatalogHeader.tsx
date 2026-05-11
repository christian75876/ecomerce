import Box from '@atoms/box/SimpleBox';
import Input from '@atoms/input/SimpleInput';
import Typography from '@atoms/typography/SimpleTypography';

interface CatalogHeaderProps {
  search: string;
  onSearchChange: (value: string) => void;
}

const CatalogHeader = ({ search, onSearchChange }: CatalogHeaderProps) => {
  return (
    <Box className='rounded-[2rem] bg-[linear-gradient(135deg,_#fff7ed_0%,_#ffffff_35%,_#ecfeff_100%)] px-5 py-6 shadow-[0_20px_50px_rgba(15,23,42,0.08)] sm:px-7'>
      <Typography variant='span' className='uppercase tracking-[0.24em] text-primary/70'>
        Catálogo comercial
      </Typography>
      <Typography variant='h2' className='mt-3 text-3xl sm:text-4xl'>
        Explora productos de varias tiendas en un grid pensado para comprar.
      </Typography>
      <Typography className='mt-3 max-w-3xl text-sm leading-7 text-neutral-dark/65 sm:text-base'>
        Busca rápido, filtra por categoría, precio y tienda, y sigue navegando sin perder el contexto del catálogo.
      </Typography>
      <Input
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
        placeholder='Buscar por producto, referencia o SKU'
        className='mt-5 bg-white'
      />
    </Box>
  );
};

export default CatalogHeader;
