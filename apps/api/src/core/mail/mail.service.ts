import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import type { Transporter } from 'nodemailer'
import type * as SMTPTransport from 'nodemailer/lib/smtp-transport'

import { Inject, Injectable } from '@nestjs/common'
import * as Handlebars from 'handlebars'
import mjml2html from 'mjml'
import { createTransport } from 'nodemailer'

import { MailConfig } from './mail.config'
import { MAIL_CONFIG_TOKEN } from './mail.module-definitions'
import { helpers } from './mail.utils'

@Injectable()
export class MailService {
  private transporter: Transporter<SMTPTransport.SentMessageInfo>
  private templateCache: Map<string, string> = new Map()

  constructor(
    @Inject(MAIL_CONFIG_TOKEN)
    private readonly config: MailConfig,
  ) {
    this.transporter = createTransport({
      host: config.host,
      port: config.port,
      secure: false, // Use `true` for port 465, `false` for all other ports
      auth: {
        user: config.username,
        pass: config.password,
      },
    })
  }

  async sendMail(param: { to: string | string[]; subject: string; template: string; context?: Record<string, any> }) {
    const templatePath = join(this.config.templateDir, `${param.template}.mjml`)

    if (!this.templateCache.has(templatePath)) {
      const fileContent = await readFile(templatePath, 'utf8')
      const templatedContent = mjml2html(fileContent).html
      this.templateCache.set(templatePath, templatedContent)
    }

    const templateSource = this.templateCache.get(templatePath)
    const template = Handlebars.compile(templateSource, { strict: true })
    const html = template(param.context, { helpers })

    await this.transporter.sendMail({
      from: this.config.from,
      to: param.to,
      subject: param.subject,
      html,
    })
  }
}
