import type { UpdateSecretSantaInputDto } from '@wishlist/common-types'

import { zodResolver } from '@hookform/resolvers/zod'
import CloseIcon from '@mui/icons-material/Close'
import SaveIcon from '@mui/icons-material/Save'
import {
  AppBar,
  Box,
  Button,
  Container,
  Dialog,
  IconButton,
  Slide,
  Stack,
  TextField,
  Toolbar,
  Typography,
} from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { TransitionProps } from '@mui/material/transitions'
import useMediaQuery from '@mui/material/useMediaQuery'
import React, { forwardRef, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { InputLabel } from '../common/InputLabel'

const Transition = forwardRef(function Transition(
  props: TransitionProps & { children: React.ReactElement },
  ref: React.Ref<unknown>,
) {
  const { children, ...other } = props
  return <Slide direction="up" ref={ref} {...other} children={children} />
})

const schema = z.object({
  // TODO: fix why this value is mandatory even if it's optional
  budget: z.coerce.number().gt(0, 'Le budget doit être supérieur à 0').optional(),
  description: z.string().max(2000, 'Nombre de caractères maximum 2000').optional(),
})

type FormFields = z.infer<typeof schema>

export type EditSecretSantaFormDialogProps = {
  open: boolean
  title: string
  saveButtonText: string
  input: UpdateSecretSantaInputDto
  handleSubmit: (output: FormFields) => void
  handleClose: () => void
}

export const EditSecretSantaFormDialog = ({
  open,
  input,
  title,
  saveButtonText,
  handleSubmit,
  handleClose,
}: EditSecretSantaFormDialogProps) => {
  const theme = useTheme()
  const smallScreen = useMediaQuery(theme.breakpoints.down('md'))
  const {
    register,
    handleSubmit: handleFormSubmit,
    formState: { errors: formErrors },
    setValue,
    reset,
  } = useForm<FormFields>({
    resolver: zodResolver(schema),
    defaultValues: {
      budget: input.budget,
      description: input.description,
    },
  })

  const onSubmit = (data: FormFields) => {
    handleSubmit(data)
  }

  const onClose = () => {
    reset()
    handleClose()
  }

  useEffect(() => {
    if (!input) return

    setValue('description', input.description)
    setValue('budget', input.budget)
  }, [input])

  return (
    <Dialog fullScreen open={open} onClose={onClose} TransitionComponent={Transition}>
      <AppBar sx={{ position: 'relative' }}>
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Typography sx={{ ml: 2, flex: 1, textTransform: 'uppercase' }} variant="h6" component="div">
            {title}
          </Typography>
          <IconButton edge="start" color="inherit" onClick={onClose} aria-label="close">
            <CloseIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      <Container maxWidth="sm" sx={{ marginTop: '40px' }}>
        <Stack component="form" onSubmit={handleFormSubmit(onSubmit)} noValidate gap={smallScreen ? 2 : 3}>
          <Box>
            <InputLabel>Budget Max</InputLabel>
            <TextField
              {...register('budget')}
              fullWidth
              type="number"
              placeholder="Budget Max"
              error={!!formErrors.budget}
              helperText={formErrors.budget?.message}
            />
          </Box>

          <Box>
            <InputLabel>Description</InputLabel>
            <TextField
              {...register('description')}
              autoComplete="off"
              fullWidth
              multiline
              minRows={4}
              placeholder="Une petite description ..."
              error={!!formErrors.description}
              helperText={formErrors.description?.message}
            />
          </Box>

          <Button type="submit" fullWidth variant="contained" size="large" color="secondary" startIcon={<SaveIcon />}>
            {saveButtonText}
          </Button>
        </Stack>
      </Container>
    </Dialog>
  )
}
