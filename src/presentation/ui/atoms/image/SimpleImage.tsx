interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  className?: string;
}

const Image = ({ src, alt, className, ...props }: ImageProps) => {
  return (
    <img
      src={src}
      alt={alt}
      className={`object-cover ${className}`}
      loading='lazy'
      {...props}
    />
  );
};

export default Image;
