module.exports = {
  apps: [
    {
      name: 'webapp',
      script: 'npx',
      args: 'vite --host 0.0.0.0 --port 3000',
      cwd: '/home/user/webapp',
      env: {
        NODE_ENV: 'development',
        PORT: 3000
      },
      watch: false,
      instances: 1,
      exec_mode: 'fork',
      
      // 🛡️ 메모리 보호 설정
      max_memory_restart: '200M',  // 200MB 초과 시 자동 재시작
      
      // 🔄 자동 재시작 설정
      autorestart: true,            // 크래시 시 자동 재시작
      max_restarts: 10,             // 최대 재시작 횟수 (무한 재시작 방지)
      min_uptime: '10s',            // 최소 10초 가동 시 정상으로 간주
      restart_delay: 4000,          // 재시작 지연 4초
      
      // 📊 로그 설정
      error_file: '/home/user/.pm2/logs/webapp-error.log',
      out_file: '/home/user/.pm2/logs/webapp-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      
      // ⚡ 성능 설정
      kill_timeout: 5000,           // 종료 타임아웃 5초
      listen_timeout: 3000,         // 시작 타임아웃 3초
      shutdown_with_message: false
    }
  ]
}
