import type { MailConfig } from './mail.config'

import { ConfigurableModuleBuilder } from '@nestjs/common'

export const { ConfigurableModuleClass: ConfigurableMailModule, MODULE_OPTIONS_TOKEN: MAIL_CONFIG_TOKEN } =
  new ConfigurableModuleBuilder<MailConfig>().build()
