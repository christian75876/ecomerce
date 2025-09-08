interface ErrorMessageProps {
  message?: string;
}

const ErrorMessage = ({ message }: ErrorMessageProps) => {
  if (!message) return null;
  return <p className='text-xs text-red-500 mt-1 absolute'>{message}</p>;
};

export default ErrorMessage;
