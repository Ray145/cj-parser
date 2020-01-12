module.exports = {
    apps: [{
      name: 'cj-parser',
      script: 'index.js',
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      max_restarts: 5,
      restart_delay: 10 * 1000,
      error_file: '/Work/log/cj-parser.log', 
      out_file: '/Work/log/cj-parser.log', 
      combine_logs: true,
      env: {
        NODE_ENV: 'default'
      }
    }]
  };