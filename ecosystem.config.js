module.exports = {
  apps: [{
    name: 'guesthouse',
    script: 'node_modules/.bin/next',
    args: 'start',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
    },
    // Auto-restart on crash
    autorestart: true,
    // Max memory before restart (200MB)
    max_memory_restart: '200M',
    // Number of instances (1 for SQLite — single process)
    instances: 1,
    // No clustering — SQLite doesn't support concurrent writes
    exec_mode: 'fork',
    // Log files
    error_file: './logs/error.log',
    out_file: './logs/out.log',
    merge_logs: true,
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
  }]
}
