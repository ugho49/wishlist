import { Injectable } from '@nestjs/common'

import { MailService } from '../../core/mail/mail.service.js'

@Injectable()
export class SecretSantaMailer {
  constructor(private readonly mailService: MailService) {}
}
