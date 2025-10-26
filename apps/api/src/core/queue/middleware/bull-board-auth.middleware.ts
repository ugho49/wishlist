import type { UserRepository } from '@wishlist/api/user'
import type { NextFunction, Request, Response } from 'express'

import { Inject, Injectable, NestMiddleware } from '@nestjs/common'

// Keep abolsute path to avoid circular dependencies
import { PasswordManager } from '../../../auth/infrastructure/util/password-manager'
// Keep abolsute path to avoid circular dependencies
import { REPOSITORIES } from '../../../repositories/repositories.constants'

@Injectable()
export class BullBoardAuthMiddleware implements NestMiddleware {
  constructor(
    @Inject(REPOSITORIES.USER)
    private readonly userRepository: UserRepository,
  ) {}

  async use(req: Request, res: Response, next: NextFunction): Promise<void> {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Basic ')) {
      this.setHeaders(res, { message: 'Authentication required', status: 401 })
      return
    }

    try {
      // Extract and decode credentials
      const base64Credentials = authHeader.split(' ')[1]

      if (!base64Credentials) {
        this.setHeaders(res, { message: 'Invalid authorization header', status: 401 })
        return
      }

      const credentials = Buffer.from(base64Credentials, 'base64').toString('utf-8')
      const [email, password] = credentials.split(':')

      if (!email || !password) {
        this.setHeaders(res, { message: 'Invalid credentials format', status: 401 })
        return
      }

      // Find user by email
      const user = await this.userRepository.findByEmail(email.toLowerCase())

      if (!user) {
        this.setHeaders(res, { message: 'Invalid credentials', status: 401 })
        return
      }

      // Verify password
      const isPasswordValid = await PasswordManager.verify({
        hash: user.passwordEnc,
        plainPassword: password,
      })

      if (!isPasswordValid) {
        this.setHeaders(res, { message: 'Invalid credentials', status: 401 })
        return
      }

      // Check if user is admin
      if (!user.isAdmin()) {
        this.setHeaders(res, { message: 'Insufficient permissions', status: 403 })
        return
      }

      // Authentication and authorization successful
      next()
    } catch (_error) {
      this.setHeaders(res, { message: 'Authentication failed', status: 401 })
      return
    }
  }

  private setHeaders(res: Response, { message, status }: { message: string; status: number }) {
    res.setHeader('WWW-Authenticate', 'Basic realm="BullBoard"')
    res.status(status).json({ message })
  }
}
