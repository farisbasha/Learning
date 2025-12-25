# Phase 153: PM2 Process Manager
## Agent Instructions

**Phase**: 153 | **Part**: M - Production & DevOps | **Language**: TypeScript

## Topics
1. What is PM2 — production process manager
2. Installation
3. Starting apps: `pm2 start`
4. Cluster mode
5. Configuration: `ecosystem.config.js`
6. Monitoring: `pm2 monit`
7. Logs: `pm2 logs`
8. Restart strategies
9. Graceful shutdown
10. PM2 with TypeScript

## Example
```javascript
// ecosystem.config.js
module.exports = {
    apps: [{
        name: 'api',
        script: './dist/server.js',
        instances: 'max',
        exec_mode: 'cluster',
        watch: false,
        max_memory_restart: '500M',
        env: {
            NODE_ENV: 'production',
            PORT: 3000
        },
        env_staging: {
            NODE_ENV: 'staging'
        }
    }]
};
```

```bash
pm2 start ecosystem.config.js
pm2 status
pm2 logs api
pm2 reload api
pm2 save  # Save for auto-restart
pm2 startup  # Configure system startup
```

## Content Instructions
**Notes**: PM2 production deployment guide
**Summary**: PM2 commands reference
