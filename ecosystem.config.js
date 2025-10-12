// PM2 Ecosystem Configuration for AECOIN Store
// This file configures how PM2 manages your application

module.exports = {
  apps: [{
    name: 'aecoin-store',
    script: './dist/index.js',
    instances: 1,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    // Logging
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    
    // Advanced features
    watch: false,
    max_memory_restart: '1G',
    
    // Restart configuration
    autorestart: true,
    max_restarts: 10,
    min_uptime: '10s',
    
    // Graceful shutdown
    kill_timeout: 5000,
    wait_ready: true,
    listen_timeout: 10000
  }]
};
