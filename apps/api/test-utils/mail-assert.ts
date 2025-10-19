import type { AxiosInstance } from 'axios'

import { sleep } from '@wishlist/common'
import { expect } from 'vitest'

type MailAssertion = () => Promise<unknown>

type MailContact = { address: string }

type Mail = {
  subject: string
  from: MailContact[]
  to: MailContact[]
}

type GetMailResult = {
  mail: Mail | undefined
  index: number
}

export class MailsAssert {
  private assertions = new Set<MailAssertion>()
  private mailsCached: Mail[] = []
  private dataFetched = false

  constructor(private readonly http: AxiosInstance) {}

  waitFor(ms: number): this {
    this.assertions.add(() => sleep(ms))

    return this
  }

  hasNumberOfEmails(expected: number): this {
    this.assertions.add(async () => {
      const mails = await this.getMails()

      expect(mails.length, 'Wrong number of length for mails').toEqual(expected)
    })

    return this
  }

  hasReceivers(expected: string[]): this {
    this.assertions.add(async () => {
      const mails = await this.getMails()

      expect(
        mails.flatMap(mail => mail.to.map(to => to.address)),
        'Wrong receivers for mails',
      ).toIncludeAllMembers(expected)
    })

    return this
  }

  hasSubject(subject: string): this {
    this.assertions.add(async () => {
      const mails = await this.getMails()

      for (const mail of mails) {
        expect(mail.subject, `Wrong subject for mail to ${mail.to.map(to => to.address).join(', ')}`).toEqual(subject)
      }
    })

    return this
  }

  mail(index = 0): MailAssert {
    return new MailAssert(
      this,
      () =>
        this.getMails()
          .then(mails => mails[index])
          .then(mail => ({ mail, index })),
      assertion => this.assertions.add(assertion),
    )
  }

  async check() {
    for (const assertion of this.assertions) {
      await assertion()
    }
  }

  // Thenable pattern: allow to chain assertions with await without a check() call
  // biome-ignore lint/suspicious/noThenProperty: Thenable pattern expected here
  then(onFulfilled: () => unknown, onRejected?: (error: unknown) => unknown): Promise<unknown> {
    return this.check().then(onFulfilled, onRejected)
  }

  private async getMails(): Promise<Mail[]> {
    if (this.dataFetched) {
      return this.mailsCached
    }

    const { data } = await this.http.get('/email')

    this.mailsCached = data
    this.dataFetched = true

    return data
  }
}

class MailAssert {
  constructor(
    private readonly parent: MailsAssert,
    private readonly getMail: () => Promise<GetMailResult>,
    private readonly addAssertion: (assertion: MailAssertion) => void,
  ) {}

  hasSubject(subject: string): this {
    this.addAssertion(async () => {
      const { mail, index } = await this.getMail()
      expect(mail?.subject, `Wrong value for subject of mail[${index}]`).toEqual(subject)
    })

    return this
  }

  hasReceiver(mailAddress: string[] | string): this {
    const receiverEmails = Array.isArray(mailAddress) ? mailAddress : [mailAddress]

    this.addAssertion(async () => {
      const { mail, index } = await this.getMail()
      expect(
        mail?.to?.map(value => value.address),
        `Wrong value for receiver of mail[${index}]`,
      ).toEqual(receiverEmails)
    })

    return this
  }

  hasSender(mailAddress: string[] | string): this {
    const senderEmails = Array.isArray(mailAddress) ? mailAddress : [mailAddress]

    this.addAssertion(async () => {
      const { mail, index } = await this.getMail()
      expect(
        mail?.from?.map(value => value.address),
        `Wrong value for sender of mail[${index}]`,
      ).toEqual(senderEmails)
    })

    return this
  }

  mail(index = 0): MailAssert {
    return this.parent.mail(index)
  }

  check() {
    return this.parent.check()
  }

  // Thenable pattern: allow to chain assertions with await without a check() call
  // biome-ignore lint/suspicious/noThenProperty: Thenable pattern expected here
  then(onFulfilled: () => unknown, onRejected?: (error: unknown) => unknown): Promise<unknown> {
    return this.check().then(onFulfilled, onRejected)
  }
}
