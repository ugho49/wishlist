import { Box, Button, Modal, Slider, Theme, Typography } from '@mui/material'
import { makeStyles } from '@mui/styles'
import React, { useCallback, useState } from 'react'
import Cropper, { Area } from 'react-easy-crop'

import { useToast } from '../../hooks/useToast'
import { getCroppedImg } from '../../utils/canvas.utils'

export type AvatarCropperModalProps = {
  imageSrc: string
  handleSave: (file: File) => void
  handleClose: () => void
}

const useStyles = makeStyles((theme: Theme) => ({
  modal: {
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
  },
  cropContainer: {
    position: 'relative',
    background: '#333',
    width: '100%',
    height: '100%',
  },
  controls: {
    display: 'flex',
    flexDirection: 'column',
    padding: 16,
    alignItems: 'stretch',
    [theme.breakpoints.up('sm')]: {
      flexDirection: 'row',
      alignItems: 'center',
    },
  },
  sliderContainer: {
    display: 'flex',
    flex: '1',
    alignItems: 'center',
  },
  sliderLabel: {
    [theme.breakpoints.down('xs')]: {
      minWidth: 65,
    },
  },
  slider: {
    padding: '22px 0px',
    marginLeft: 16,
    [theme.breakpoints.up('sm')]: {
      flexDirection: 'row',
      alignItems: 'center',
      margin: '0 16px',
    },
  },
  cropButton: {
    flexShrink: 0,
  },
}))

export const AvatarCropperModal = ({ handleClose, imageSrc, handleSave }: AvatarCropperModalProps) => {
  const classes = useStyles()
  const { addToast } = useToast()
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [rotation, setRotation] = useState(0)
  const [zoom, setZoom] = useState<number>(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area>({ width: 0, height: 0, x: 0, y: 0 })
  const [loading, setLoading] = useState(false)

  const onCropComplete = useCallback((croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels)
  }, [])

  const getCroppedImage = useCallback(async () => {
    setLoading(true)
    try {
      const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels, rotation)
      handleSave(croppedImage)
    } catch (e) {
      addToast({ message: "Une erreur s'est produite lors du redimensionnement de l'image", variant: 'error' })
      handleClose()
    } finally {
      setLoading(false)
    }
  }, [imageSrc, croppedAreaPixels, rotation, handleSave, addToast, handleClose])

  return (
    <Modal open onClose={handleClose}>
      <Box className={classes.modal}>
        <div className={classes.cropContainer}>
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
        </div>
        <div className={classes.controls}>
          <div className={classes.sliderContainer}>
            <Typography variant="overline" classes={{ root: classes.sliderLabel }}>
              Zoom
            </Typography>
            <Slider
              value={zoom}
              min={1}
              max={3}
              step={0.1}
              aria-labelledby="Zoom"
              classes={{ root: classes.slider }}
              onChange={(e, zoom) => {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                setZoom(zoom)
              }}
            />
          </div>
          <div className={classes.sliderContainer}>
            <Typography variant="overline" classes={{ root: classes.sliderLabel }}>
              Rotation
            </Typography>
            <Slider
              value={rotation}
              min={0}
              max={360}
              step={1}
              aria-labelledby="Rotation"
              classes={{ root: classes.slider }}
              onChange={(e, rotation) => {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                setRotation(rotation)
              }}
            />
          </div>
          <Button
            variant="contained"
            color="primary"
            classes={{ root: classes.cropButton }}
            onClick={() => getCroppedImage()}
            disabled={loading}
          >
            Sauvegarder
          </Button>
          <Button
            variant="contained"
            color="inherit"
            sx={{ margin: 2, display: { sm: 'none' } }}
            onClick={() => handleClose()}
            disabled={loading}
          >
            Annuler
          </Button>
        </div>
      </Box>
    </Modal>
  )
}
