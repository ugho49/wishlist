import type { AxiosInstance } from 'axios'

import axios from 'axios'
import { beforeEach } from 'vitest'

import { MailsAssert } from './mail-assert'

export function useTestMail() {
  const http: AxiosInstance = axios.create({
    baseURL: `http://localhost:${process.env['DOCKER_MAIL_PORT_1080']}`,
  })

  beforeEach(async () => {
    await new Promise(resolve => setTimeout(resolve, 100))
    await clearMails()
  })

  const clearMails = async () => {
    await new Promise(resolve => setTimeout(resolve, 100))
    await http.delete('/email/all')
  }

  return {
    expectMail: () => new MailsAssert(http),
  }
}
