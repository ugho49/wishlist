# Frontend (`apps/front`)

React app (Vite, MUI, TanStack Router). Server data comes from GraphQL; REST is only used for the four multipart uploads.

## Running
- `bun serve:front` — React frontend (port 4200)
- `bun serve:front:with-codegen` — Frontend + GraphQL codegen in watch mode

## Architecture

- **Server state**: React Query via GraphQL codegen (`typescript-react-query`) from colocated `*.graphql` documents
- **Client state**: Redux Toolkit (auth token, profile, drawer — not API resources)
- **UI**: Material-UI with custom theming
- **Styling**: Prefer `styled()` over `sx` for reusable styles
- **Routing**: TanStack Router, file-based, type-safe
- **Forms**: React Hook Form + Zod
- **Build**: Vite + SWC, SVGR for SVG imports
- **Uploads**: `src/api/upload.ts` for the remaining multipart REST calls

## GraphQL

- Colocate operations next to the UI: `src/components/**/*.graphql`
- Generated hooks (`useCreateEventMutation`, …) from `src/gql`
- After changing documents or the API schema: `bun nx run front:codegen` (repo root), or `bun serve:front:with-codegen`
- Schema source: `apps/api/schema.graphql`

### Result unions

Every query/mutation returns a discriminated union (success type + typed rejections). GraphQL always responds with HTTP 200, so rejections arrive as **data**, not errors. Call sites **must** narrow `__typename` with ts-pattern.

Helpers: `src/gql/rejection.ts` (`rejectionPattern`, `rejectionMessage`, `isRejection`).

```typescript
match(res.changeUserPassword)
  .with({ __typename: 'VoidOutput' }, () => ...)
  .with({ __typename: 'ValidationRejection' }, () => ...)
  .with(rejectionPattern, rejection => addToast({ message: rejectionMessage(rejection), variant: 'error' }))
  .exhaustive()
```

Rejection typenames: `ValidationRejection`, `BusinessRuleRejection`, `UnauthorizedRejection`, `ForbiddenRejection`, `NotFoundRejection`, `InternalErrorRejection`.

Frontend uses GraphQL-generated enums, not API domain enums.

## REST uploads

GraphQL is JSON-only here. File uploads stay on REST (`src/api/upload.ts`):

- `POST /user/upload-picture`
- `POST /admin/user/:id/upload-picture`
- `POST /wishlist` (create with optional logo)
- `POST /wishlist/:id/upload-logo`

Do not add new REST helpers unless the operation needs a file.

## Styling

- **Use `styled()`** whenever possible instead of `sx`
- **Reserve `sx`** for one-off styles or rapid prototyping
- Always use theme values via the `theme` parameter
- Breakpoints: `theme.breakpoints.up('md')`
- Naming: descriptive names with `Styled` suffix (`HeaderStyled`, `ContainerWrapper`)

## MUI (important)

- Be careful with `component` prop — it often causes TypeScript errors
- Button navigation: `component={Link}` may need type assertions. Prefer `onClick={() => navigate('/')}` with `useNavigate()`
- Lists: avoid `<Typography component="ul">`; use `<Box component="ul">`
- For simple navigation, `useNavigate()` is more reliable than `component` prop

## DOM structure

Avoid wrapper-only containers. Before adding a div, ask whether it adds unique structural, semantic, or styling value.

Problematic:

```jsx
<OuterContainer>
  <InnerList>
    {items.map(item => <Item key={item.id} />)}
  </InnerList>
</OuterContainer>
```

If `OuterContainer` only contains `InnerList`, merge their styles into one component.

Nested containers are fine when they differ by semantics (`<section><ul>`), animation/positioning, reusability, state, or responsive behavior.

## Tests

Vitest. Run `bun test:unit` from the repo root, or `bun nx test front`.
