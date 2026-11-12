import { Config, Env } from '@znight/config';

/** Global settings of the API. */
@Config()
export class CoreConfig {
  @Env('PORT') port = 3000;
  @Env('API_VERSION') apiVersion!: string;
  @Env('FRONTEND_BASE_URL') frontendBaseUrl!: string;
  /** Runtime environment: `development` locally, `test` in the integration tests; unset, the API runs as in production. */
  @Env('NODE_ENV') environment = 'production';

  /** Production (or `NODE_ENV` unset): JSON logs, no GraphiQL. */
  get isProduction(): boolean {
    return this.environment === 'production';
  }
}
