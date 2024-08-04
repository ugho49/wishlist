import { ConfigurableModuleBuilder } from '@nestjs/common'

import { MailConfig } from './mail.config'

export const { ConfigurableModuleClass: ConfigurableMailModule, MODULE_OPTIONS_TOKEN: MAIL_CONFIG_TOKEN } =
  new ConfigurableModuleBuilder<MailConfig>()
    .setExtras({ isGlobal: false }, (definition, extras) => ({
      ...definition,
      global: extras.isGlobal,
    }))
    .build()
