import type { LinkComponent } from '@tanstack/react-router'

import { Link } from '@mui/material'
import { Link as TanStackLink } from '@tanstack/react-router'

/**
 * RouterLink component that combines MUI Link styling with TanStack Router navigation.
 * Provides full TypeScript autocompletion for routes, params, and search parameters.
 * The `search` and `params` props are typed based on the `to` route.
 *
 * @example
 * // Simple navigation
 * <RouterLink to="/events">Events</RouterLink>
 *
 * @example
 * // With route parameters - params are typed based on the route
 * <RouterLink to="/events/$eventId" params={{ eventId: '123' }}>View Event</RouterLink>
 *
 * @example
 * // With search parameters - search is typed based on the route definition
 * <RouterLink to="/login" search={{ redirectUrl: '/events' }}>Login</RouterLink>
 */
export const RouterLink: LinkComponent<typeof Link> = props => {
  // biome-ignore lint/suspicious/noExplicitAny: MUI component prop type incompatibility with TanStack Router Link
  return <Link {...(props as any)} component={TanStackLink} />
}
