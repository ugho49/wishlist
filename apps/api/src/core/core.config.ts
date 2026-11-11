import { Config, Env } from '@znight/config';

/** Global settings of the API. */
@Config()
export class CoreConfig {
  @Env('PORT') port = 3000;
  @Env('API_VERSION') apiVersion!: string;
  @Env('FRONTEND_BASE_URL') frontendBaseUrl!: string;
}
