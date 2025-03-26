module.exports = {
  apps: [{
    name: "student-management",
    script: "./server.js",
    env: {
      NODE_ENV: "development",
      PORT: 3000
    },
    watch: true,
    ignore_watch: ["node_modules", "uploads"],
    max_memory_restart: "1G",
    env_production: {
      NODE_ENV: "production"
    }
  }]
} 