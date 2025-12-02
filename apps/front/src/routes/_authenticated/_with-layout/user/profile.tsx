import { createFileRoute } from '@tanstack/react-router'
import { SEO } from '@wishlist/front-components/SEO'
import z from 'zod'

import { TabValues, UserProfilePage } from '../../../../components/user/UserProfilePage'

export const Route = createFileRoute('/_authenticated/_with-layout/user/profile')({
  component: () => (
    <>
      <SEO
        title="Mon profil"
        description="Gérez vos informations personnelles, vos paramètres de notifications et votre vie privée."
        canonical="/user/profile"
      />
      <UserProfilePage />
    </>
  ),
  validateSearch: z.object({
    tab: z.enum(TabValues).optional().catch(TabValues.informations).default(TabValues.informations),
  }),
})
