import type { SQL } from 'bun';
import type { TableAssertSortOptions } from './table-assert';

import { sleep } from '@wishlist/common';
import { HttpPlugin } from '@znight/http';
import { getLogger } from '@znight/observability';
import { TestApp } from '@znight/testing';
import axios, { type AxiosInstance } from 'axios';
import request from 'supertest';

import { metadata } from '../src/.znight/container.generated';
import { createPlugins } from '../src/app';
import { Fixtures } from './fixtures';
import { MailsAssert } from './mail-assert';
import { TableAssert } from './table-assert';
import { afterAll, beforeAll, beforeEach } from 'bun:test';

export type RequestApp = InstanceType<(typeof request)['agent']>;

export type SignedAs = 'BASE_USER' | 'ADMIN_USER' | 'SUPERADMIN_USER';

export function useTestApp() {
  let app: TestApp;
  let baseUrl: string;
  let sql: SQL;
  let logger: ReturnType<typeof getLogger>;
  let fixtures: Fixtures;
  let needToClearMails = false;
  let http: AxiosInstance;

  beforeAll(async () => {
    // only: 'all' so that every provider with lifecycle hooks (QueueService) starts like in production
    app = await TestApp.create({ metadata, plugins: createPlugins({ port: 0, logLevel: 'silent' }), only: 'all' });
    const address = app.get(HttpPlugin).address;
    if (!address) throw new Error('The HTTP server is not listening');
    baseUrl = `http://127.0.0.1:${address.port}`;
    logger = getLogger('UseTestApp');

    // the Postgres pool provided by DatabaseFactory (canonical token of Bun's SQL class)
    sql = app.get<SQL>('bun#SQL');
    http = axios.create({
      baseURL: `http://localhost:${process.env['DOCKER_MAIL_PORT_1080']}`,
    });
    await clearMails();

    fixtures = new Fixtures(sql);
  });

  beforeEach(async () => {
    const promises = [truncateDatabase()];
    if (needToClearMails) promises.push(clearMails());
    await Promise.all(promises);
    needToClearMails = false;
  });

  afterAll(async () => {
    await app.close();
  });

  async function truncateDatabase(): Promise<void> {
    logger.info('Truncating database ...');

    const allTables = await sql<{ schemaname: string; tablename: string }[]>`
      SELECT schemaname, tablename FROM pg_catalog.pg_tables WHERE schemaname = 'public'
    `;
    const tables = allTables.map(row => `${row.schemaname}.${row.tablename}`);

    for (const table of tables) {
      await sql.unsafe(`TRUNCATE TABLE ${table} CASCADE`);
    }

    logger.info(`Database truncated (${tables.length} tables) ✅`);
  }

  async function clearMails(): Promise<void> {
    await sleep(100);
    await http.delete('/api/email/all');
    logger.info('Mails cleared ✅');
  }

  return {
    expectTable: (table: string, sortOptions?: TableAssertSortOptions) => new TableAssert(sql, table, sortOptions),
    expectMail: () => {
      needToClearMails = true;
      return new MailsAssert(http);
    },
    getFixtures: () => fixtures,
    getRequest: async (options?: { signedAs?: SignedAs }): Promise<RequestApp> => {
      const requestAppServer = request.agent(baseUrl);
      let token = '';

      const loginViaGraphql = async (email: string, password: string) => {
        const res = await requestAppServer.post('/graphql').send({
          query: /* GraphQL */ `
            mutation Login($input: LoginInput!) {
              login(input: $input) {
                __typename
                ... on LoginOutput {
                  accessToken
                }
              }
            }
          `,
          variables: { input: { email, password } },
        });
        return res.body.data.login.accessToken as string;
      };

      if (options?.signedAs === 'BASE_USER') {
        await fixtures.insertBaseUser();
        token = await loginViaGraphql(Fixtures.BASE_USER_EMAIL, Fixtures.DEFAULT_USER_PASSWORD);
      }

      if (options?.signedAs === 'ADMIN_USER') {
        await fixtures.insertAdminUser();
        token = await loginViaGraphql(Fixtures.ADMIN_USER_EMAIL, Fixtures.DEFAULT_USER_PASSWORD);
      }

      if (options?.signedAs === 'SUPERADMIN_USER') {
        await fixtures.insertSuperAdminUser();
        token = await loginViaGraphql(Fixtures.SUPERADMIN_USER_EMAIL, Fixtures.DEFAULT_USER_PASSWORD);
      }

      return token ? requestAppServer.auth(token, { type: 'bearer' }) : requestAppServer;
    },
  };
}
