import { execSync } from 'node:child_process';

const port = process.argv[2] ?? '3000';

try {
  const output = execSync(`lsof -ti :${port}`, { encoding: 'utf8' }).trim();
  if (!output) {
    process.exit(0);
  }

  const pids = [...new Set(output.split('\n').filter(Boolean))];
  for (const pid of pids) {
    console.log(`[free-port] Encerrando PID ${pid} na porta ${port}...`);
    try {
      process.kill(Number(pid), 'SIGTERM');
    } catch {
      execSync(`kill -9 ${pid}`);
    }
  }

  execSync('sleep 0.3');
} catch {
  // Porta livre — nada a fazer.
}
