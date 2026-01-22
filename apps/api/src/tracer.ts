import tracer from 'dd-trace'

tracer.init()

tracer.use('pino')
tracer.use('pg', { service: 'wishlist-api-database' })
tracer.use('redis', { service: 'wishlist-api-redis' })
tracer.use('express', { middleware: false })

// remove healthcheck traces
tracer.use('http', { blocklist: ['/health'] })
tracer.use('graphql')

// Remove middleware spans to avoid trace pollution
tracer.use('dns', { enabled: false })
tracer.use('net', { enabled: false })

export default tracer
