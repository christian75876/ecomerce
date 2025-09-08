import Box from '@atoms/box/SimpleBox';
import Icon from '@atoms/icon/SimpleIcon';
import Typography from '@atoms/typography/SimpleTypography';

export interface TimelineStep {
  label: string;
  status: 'completed' | 'current' | 'pending';
}

interface TimelineProps {
  steps: TimelineStep[];
}

const Timeline = ({ steps }: TimelineProps) => {
  return (
    <Box className='relative flex flex-col space-y-10'>
      {steps.map((step, index) => (
        <Box key={index} className='flex items-start space-x-4 relative'>
          {/* Círculo de estado */}
          <Box
            className={`w-5 h-5 flex items-center justify-center rounded-full relative z-10
              ${step.status === 'completed' ? 'bg-primary' : 'border border-gray-400'}
              ${step.status === 'current' ? 'border-2 bg-white border-primary' : ''}
            `}
          >
            {step.status === 'completed' && (
              <Icon name='bx-check' className='text-white text-sm' />
            )}
          </Box>

          {/* Texto */}
          <Box>
            <Typography
              variant='p'
              className={`font-semibold ${
                step.status === 'current' ? 'text-primary' : 'text-gray-900'
              }`}
            >
              {step.label}
            </Typography>
          </Box>

          {/* Línea punteada (excepto en el último item) */}
          {index < steps.length - 1 && (
            <div className='absolute z-0 left-[10px] top-7 h-8 border-l border-dashed border-gray-400'></div>
          )}
        </Box>
      ))}
    </Box>
  );
};

export default Timeline;
