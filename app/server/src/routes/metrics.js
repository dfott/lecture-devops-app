const express = require('express');
const client = require('prom-client');
const routes = express.Router();

const register = new client.Registry();

register.setDefaultLabels({
    app: 'todo-app'
});

client.collectDefaultMetrics({ register });

const httpRequestDurationMicroseconds = new client.Histogram({
    name: 'http_request_duration_seconds',
    help: 'Duration of HTTP requests in microseconds',
    labelNames: ['methods', 'route', 'code'],
    buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10]
});

register.registerMetric(httpRequestDurationMicroseconds);

routes.get('/metrics', async (req, res) => {
    res.setHeader('Content-Type', register.contentType);
    res.send(await register.metrics());
});

module.exports = { 
    metricRoutes: routes, 
    httpRequestMetric: httpRequestDurationMicroseconds 
};