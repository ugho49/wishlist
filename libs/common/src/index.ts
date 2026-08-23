/** biome-ignore-all lint/performance/noBarrelFile: This is a library index file */

// class-validator / class-transformer call Reflect.getMetadata when DTO modules
// evaluate. Vite 8 (Rolldown) may load a split chunk with this barrel before
// the app entry, so the polyfill must be a real dependency of this module.
import 'reflect-metadata';

export * from './constants';
export * from './dtos/common.dto';
export * from './dtos/item.dto';
export * from './dtos/user.dto';
export * from './dtos/wishlist.dto';
export * from './enums/attendee.enum';
export * from './enums/auth.enum';
export * from './enums/secret-santa.enum';
export * from './enums/user-social.enum';
export * from './featureFlags';
export * from './ids';
export * from './interfaces/auth.interface';
export * from './services/secret-santa-draw.service';
export * from './utils/auth.utils';
export * from './utils/config.utils';
export * from './utils/id.utils';
export * from './utils/pagination.utils';
export * from './utils/string.utils';
export * from './utils/thread.utils';
