import { useSnackbar, VariantType, ProviderContext } from 'notistack';

let useSnackbarRef: ProviderContext;
export const SnackbarUtilitiesConfigurator: React.FC = () => {
  useSnackbarRef = useSnackbar();
  return null;
};

export const SnackbarUtilities = {
  toast(
    msg: string,
    variant: VariantType = 'default',
    vertical: 'top' | 'bottom' = 'top',
    horizontal: 'left' | 'center' | 'right' = 'right'
  ) {
    useSnackbarRef.enqueueSnackbar(msg, {
      variant,
      anchorOrigin: { vertical, horizontal }
    });
  },
  success(
    msg: string,
    vertical: 'top' | 'bottom' = 'top',
    horizontal: 'left' | 'center' | 'right' = 'right'
  ) {
    this.toast(msg, 'success', vertical, horizontal);
  },
  error(
    msg: string,
    vertical: 'top' | 'bottom' = 'top',
    horizontal: 'left' | 'center' | 'right' = 'right'
  ) {
    this.toast(msg, 'error', vertical, horizontal);
  },
  info(
    msg: string,
    vertical: 'top' | 'bottom' = 'top',
    horizontal: 'left' | 'center' | 'right' = 'right'
  ) {
    this.toast(msg, 'info', vertical, horizontal);
  },
  warning(
    msg: string,
    vertical: 'top' | 'bottom' = 'top',
    horizontal: 'left' | 'center' | 'right' = 'right'
  ) {
    this.toast(msg, 'warning', vertical, horizontal);
  }
};
