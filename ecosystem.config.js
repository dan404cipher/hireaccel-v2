module.exports = {
  apps: [
    {
      name: "hireaccel-api",
      script: "./api/dist/server.js",
      cwd: "/home/ubuntu/hireaccel-v2",
      instances: 1,
      exec_mode: "fork",
      env: {
        NODE_ENV: "production",
        PORT: 8080
      },
      env_file: "./api/.env",
      log_file: "./logs/hireaccel-api.log",
      out_file: "./logs/hireaccel-api-out.log",
      error_file: "./logs/hireaccel-api-error.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      merge_logs: true,
      max_memory_restart: "1G",
      restart_delay: 4000,
      max_restarts: 10,
      min_uptime: "10s",
      watch: false,
      ignore_watch: ["node_modules", "logs", "uploads"],
      kill_timeout: 5000,
      wait_ready: true,
      listen_timeout: 10000
    }
  ]
};
