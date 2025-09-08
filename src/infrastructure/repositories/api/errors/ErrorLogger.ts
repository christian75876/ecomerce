import { errorMessageStringifier } from '@/shared/utils/messageStringifier';
import { SnackbarUtilities } from '@/shared/utils/SnackbarManager';

/**
 * Logs errors based on type and context.
 * Displays toast notifications and prepares for external logging integration.
 *
 * @param {string} message - The error message.
 * @param {'client' | 'auth' | 'server' | 'network' | 'unknown'} type - The type of error.
 */
export const logError = (
  message: string,
  type: 'client' | 'auth' | 'server' | 'network' | 'unknown'
): void => {
  message =
    typeof message === 'object' ? errorMessageStringifier(message) : message;
  const formattedMessage = `[${type.toUpperCase()} ERROR]: ${message}`;

  switch (type) {
    case 'client':
      SnackbarUtilities.error(formattedMessage);
      break;
    case 'auth':
      SnackbarUtilities.error('Unauthorized: ' + message);
      break;
    case 'server':
      SnackbarUtilities.error('Server error: ' + message);
      break;
    case 'network':
      SnackbarUtilities.error('Network issue: ' + message);
      break;
    default:
      SnackbarUtilities.error('Unexpected error: ' + message);
  }

  // TODO: Integrate with a logging system (e.g., Sentry, Datadog, LogRocket)
};
