// main.tsx loads reflect-metadata before anything else; tests need it too for
// modules that transitively import @wishlist/common decorated DTOs
import 'reflect-metadata'
