import { uuid } from '@wishlist/common'
import { useCallback } from 'react'
import toast from 'react-hot-toast'

type VariantType = 'default' | 'error' | 'success' | 'warning' | 'info'

type AddToastInput = {
  message: string | React.ReactNode
  variant?: VariantType
}

type AddToastOutput = {
  closeToast: () => void
}

export function useToast() {
  const addToast = useCallback((params: AddToastInput): AddToastOutput => {
    const toastId = uuid()
    const message = () => <>{params.message}</>

    if (params.variant === 'error') {
      toast.error(message, { id: toastId })
    } else if (params.variant === 'success') {
      toast.success(message, { id: toastId })
    } else if (params.variant === 'warning') {
      toast(message, { id: toastId, icon: '⚠️' })
    } else if (params.variant === 'info') {
      toast(message, { id: toastId, icon: 'ℹ️' })
    } else {
      toast(message, { id: toastId })
    }

    return {
      closeToast: () => {
        toast.dismiss(toastId)
      },
    }
  }, [])

  return { addToast }
}
