type LabelProps = React.LabelHTMLAttributes<HTMLLabelElement>;

const Label = ({ children, className, ...props }: LabelProps) => {
  return (
    <label
      className={`block text-sm font-medium text-neutral-dark ${className}`}
      {...props}
    >
      {children}
    </label>
  );
};

export default Label;