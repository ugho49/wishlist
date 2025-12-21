import tracer from 'dd-trace'

tracer.init({
  logInjection: true,
  runtimeMetrics: true,
  sampleRate: 1,
  version: process.env.API_VERSION,
})

tracer.use('pino')
tracer.use('express', { middleware: false })

// remove healthcheck traces
tracer.use('http', { blocklist: ['/health'] })

// Remove middleware spans to avoid trace pollution
tracer.use('dns', { enabled: false })
tracer.use('net', { enabled: false })

export default tracer
