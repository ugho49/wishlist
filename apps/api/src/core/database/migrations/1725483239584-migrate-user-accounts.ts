import { uuid } from '@wishlist/common'
import { UserAccountProviderTypes } from '@wishlist/common-types'
import { MigrationInterface, QueryRunner } from 'typeorm'

export class MigrateUserAccounts1725483239584 implements MigrationInterface {
  public async up(runner: QueryRunner): Promise<void> {
    const usersWithPassword = await runner.query(
      `select id, email, password_enc, picture_url, created_at, updated_at from "user" where password_enc is not null`,
    )

    for (const user of usersWithPassword) {
      const { id, email, password_enc, picture_url, created_at, updated_at } = user

      let picture = null

      if (picture_url && (picture_url as string).startsWith('https://storage.googleapis.com/wishlist-')) {
        picture = `'${picture_url}'`
      }

      await runner.query(
        `insert into user_account (id, user_id, email, provider_type, provider_data, picture_url, created_at, updated_at) values ('${uuid()}', '${id}', '${email}', '${UserAccountProviderTypes.LOCAL}', '${password_enc}', ${picture}, '${new Date(created_at).toISOString()}', '${new Date(updated_at).toISOString()}')`,
      )
    }

    const usersSocials = await runner.query(
      `select user_id, social_id, social_type, picture_url, created_at, updated_at from user_social`,
    )

    for (const social of usersSocials) {
      const { user_id, social_id, social_type, picture_url, created_at, updated_at } = social
      const user = await runner.query(`select email from "user" where id = '${user_id}'`)
      const email = user[0].email
      const picture = picture_url ? `'${picture_url}'` : null

      await runner.query(
        `insert into user_account (id, user_id, email, provider_type, provider_data, picture_url, created_at, updated_at) values ('${uuid()}', '${user_id}', '${email}', '${social_type}', '${social_id}', ${picture}, '${new Date(created_at).toISOString()}', '${new Date(updated_at).toISOString()}')`,
      )
    }

    await runner.query(`ALTER TABLE "user" ADD COLUMN preferred_account_id UUID REFERENCES user_account(id)`)

    const allUsers = await runner.query(`select id, picture_url from "user"`)

    for (const user of allUsers) {
      const accounts = await runner.query(`select id, picture_url from user_account where user_id = '${user.id}'`)
      const preferredAccount = accounts.find((a: any) => a.picture_url === user.picture_url)

      if (!preferredAccount) {
        throw new Error(`User ${user.id} has no preferred account`)
      }

      await runner.query(`update "user" set preferred_account_id = '${preferredAccount.id}' where id = '${user.id}'`)
    }

    await runner.query(`ALTER TABLE "user" ALTER COLUMN preferred_account_id SET NOT NULL`)

    await runner.dropColumns(`user`, ['password_enc', 'picture_url'])
    await runner.dropTable('user_social')
  }

  public down(): Promise<void> {
    throw new Error('This migration cannot be reverted')
  }
}
