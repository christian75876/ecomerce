import Box from '@/presentation/ui/atoms/box/SimpleBox';

interface FeatureScreenProps {
  children: React.ReactNode;
  className?: string;
}

const FeatureScreen = ({
  children,
  className = '',
}: FeatureScreenProps) => {
  return <Box className={`space-y-8 ${className}`.trim()}>{children}</Box>;
};

export default FeatureScreen;
