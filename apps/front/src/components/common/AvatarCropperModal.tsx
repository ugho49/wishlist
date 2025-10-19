import type { Area } from 'react-easy-crop'

import { Box, Button, Modal, Slider as SliderBase, styled, Typography } from '@mui/material'
import { useCallback, useState } from 'react'
import Cropper from 'react-easy-crop'

import { useToast } from '../../hooks/useToast'
import { getCroppedImg } from '../../utils/canvas.utils'

export type AvatarCropperModalProps = {
  imageSrc: string
  handleSave: (file: File) => void | Promise<void>
  handleClose: () => void
}

const ModalContainer = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: theme.palette.background.paper,
  padding: 4,
  borderRadius: 5,
  height: '90vh',
  width: '90vw',
  [theme.breakpoints.up('sm')]: {
    height: 600,
    width: 600,
  },
}))

const CropContainer = styled('div')({
  position: 'relative',
  background: '#333',
  width: '100%',
  height: '100%',
})

const Controls = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  padding: 16,
  alignItems: 'stretch',
  [theme.breakpoints.up('sm')]: {
    flexDirection: 'row',
    alignItems: 'center',
  },
}))

const SliderContainer = styled(Box)({
  display: 'flex',
  flex: '1',
  alignItems: 'center',
})

const SliderLabel = styled(Typography)(({ theme }) => ({
  [theme.breakpoints.down('xs')]: {
    minWidth: 65,
  },
}))

const Slider = styled(SliderBase)(({ theme }) => ({
  padding: '22px 0px',
  marginLeft: 16,
  [theme.breakpoints.up('sm')]: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: '0 16px',
  },
}))

const CropButton = styled(Button)({
  flexShrink: 0,
})

export const AvatarCropperModal = ({ handleClose, imageSrc, handleSave }: AvatarCropperModalProps) => {
  const { addToast } = useToast()
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [rotation, setRotation] = useState(0)
  const [zoom, setZoom] = useState<number>(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area>({ width: 0, height: 0, x: 0, y: 0 })
  const [loading, setLoading] = useState(false)

  const onCropComplete = useCallback((_croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels)
  }, [])

  const getCroppedImage = useCallback(async () => {
    setLoading(true)
    try {
      const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels, rotation)
      await handleSave(croppedImage)
    } catch {
      addToast({ message: "Une erreur s'est produite lors du redimensionnement de l'image", variant: 'error' })
      handleClose()
    } finally {
      setLoading(false)
    }
  }, [imageSrc, croppedAreaPixels, rotation, handleSave, addToast, handleClose])

  return (
    <Modal open onClose={handleClose}>
      <ModalContainer>
        <CropContainer>
          <Cropper
            image={imageSrc}
            crop={crop}
            rotation={rotation}
            zoom={zoom}
            aspect={1}
            objectFit="contain"
            onCropChange={setCrop}
            onRotationChange={setRotation}
            onCropComplete={onCropComplete}
            onZoomChange={setZoom}
          />
        </CropContainer>
        <Controls>
          <SliderContainer>
            <SliderLabel variant="overline">Zoom</SliderLabel>
            <Slider
              value={zoom}
              min={1}
              max={3}
              step={0.1}
              aria-labelledby="Zoom"
              onChange={(_e, zoom) => {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-expect-error
                setZoom(zoom)
              }}
            />
          </SliderContainer>
          <SliderContainer>
            <SliderLabel variant="overline">Rotation</SliderLabel>
            <Slider
              value={rotation}
              min={0}
              max={360}
              step={1}
              aria-labelledby="Rotation"
              onChange={(_e, rotation) => {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-expect-error
                setRotation(rotation)
              }}
            />
          </SliderContainer>
          <CropButton variant="contained" color="primary" onClick={() => getCroppedImage()} disabled={loading}>
            Sauvegarder
          </CropButton>
          <Button
            variant="contained"
            color="inherit"
            sx={{ margin: 2, display: { sm: 'none' } }}
            onClick={() => handleClose()}
            disabled={loading}
          >
            Annuler
          </Button>
        </Controls>
      </ModalContainer>
    </Modal>
  )
}
