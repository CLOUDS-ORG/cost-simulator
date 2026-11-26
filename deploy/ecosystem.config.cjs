// pm2 process definition. Secrets come from .env.production (Next.js loads it itself).
module.exports = {
  apps: [
    {
      name: "cost-simulator",
      cwd: "/opt/cost-simulator",
      script: "node_modules/next/dist/bin/next",
      args: "start -p 3100",
      env: { NODE_ENV: "production" },
      max_memory_restart: "1G",
    },
  ],
};
