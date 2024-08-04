import type { AxiosInstance } from 'axios'

import { beforeEach } from '@jest/globals'
import axios from 'axios'

import { MailsAssert } from './mail-assert'

export function useTestMail() {
  const http: AxiosInstance = axios.create({
    baseURL: `http://localhost:${process.env['DOCKER_MAIL_PORT_1080']}`,
  })

  beforeEach(async () => {
    // clear all mails
    await http.delete('/email/all')
  })

  return {
    expectMail: () => new MailsAssert(http),
  }
}
