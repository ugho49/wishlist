import { Injectable } from '@nestjs/common'

import { MailService } from '../../core/mail/mail.service'

@Injectable()
export class SecretSantaMailer {
  constructor(private readonly mailService: MailService) {}
}
