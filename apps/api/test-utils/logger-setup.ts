import { Logger, setFallbackLogger } from '@znight/observability';

// Unit tests create no application: keep the static loggers (getLogger) quiet.
setFallbackLogger(new Logger({ level: 'silent' }));
