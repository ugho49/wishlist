import { uuid } from '@wishlist/common';
import { useCallback } from 'react';
import toast from 'react-hot-toast';
import { match } from 'ts-pattern';

type VariantType = 'default' | 'error' | 'success' | 'warning' | 'info';

type AddToastInput = {
  message: string | React.ReactNode;
  variant?: VariantType;
};

type AddToastOutput = {
  closeToast: () => void;
};

export function useToast() {
  const addToast = useCallback((params: AddToastInput): AddToastOutput => {
    const toastId = uuid();
    const message = () => <>{params.message}</>;

    match(params.variant ?? 'default')
      .with('error', () => toast.error(message, { id: toastId }))
      .with('success', () => toast.success(message, { id: toastId }))
      .with('warning', () => toast(message, { id: toastId, icon: '⚠️' }))
      .with('info', () => toast(message, { id: toastId, icon: 'ℹ️' }))
      .with('default', () => toast(message, { id: toastId }))
      .exhaustive();

    return {
      closeToast: () => {
        toast.dismiss(toastId);
      },
    };
  }, []);

  return { addToast };
}
