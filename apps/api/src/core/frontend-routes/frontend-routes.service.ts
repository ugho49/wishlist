import { Injectable } from '@znight/core';

import { CoreConfig } from '../core.config';
import { frontendRoutesBuilder } from './frontend-routes.builder';

@Injectable()
export class FrontendRoutesService {
  constructor(private readonly config: CoreConfig) {}

  get routes() {
    return frontendRoutesBuilder(this.config.frontendBaseUrl);
  }
}
