export interface SystemProcess {
  id: number;
  file_name: string;
  cpu: number;
  memory: number;
  disk: number;
  network: number;
  timestamp: string;
  anomaly: boolean;
  severity: "Low" | "Medium" | "High";
  status: "Running" | "Idle" | "Suspended";
  explanation: string;
}

const processNames = [
  "VSCode.exe", "chrome.exe", "node.exe", "python.exe", "docker.exe",
  "slack.exe", "spotify.exe", "explorer.exe", "svchost.exe", "system.exe",
  "webpack.exe", "typescript.exe", "java.exe", "postgres.exe", "nginx.exe",
  "redis.exe", "mongod.exe", "git.exe", "ssh-agent.exe", "powershell.exe",
  "teams.exe", "outlook.exe", "antimalware.exe", "WindowsUpdate.exe",
  "OneDrive.exe", "SearchIndexer.exe", "RuntimeBroker.exe", "dwm.exe",
  "csrss.exe", "lsass.exe", "winlogon.exe", "taskhostw.exe",
  "audiodg.exe", "spoolsv.exe", "wuauserv.exe", "msbuild.exe",
  "devenv.exe", "firefox.exe", "edge.exe", "notepad++.exe",
];

const explanations: Record<string, string> = {
  High: "High CPU usage caused by heavy computation or potential memory leak. Immediate investigation recommended.",
  Medium: "Moderate resource consumption detected. Process is using more resources than typical baseline.",
  Low: "Minor fluctuation in resource usage. Within acceptable operational parameters.",
};

function generateTimestamp(minutesAgo: number): string {
  const d = new Date();
  d.setMinutes(d.getMinutes() - minutesAgo);
  return d.toISOString();
}

function rand(min: number, max: number) {
  return Math.round((Math.random() * (max - min) + min) * 10) / 10;
}

export function generateMockData(): SystemProcess[] {
  const data: SystemProcess[] = [];
  for (let i = 0; i < 45; i++) {
    const isAnomaly = Math.random() < 0.3;
    const isCritical = isAnomaly && Math.random() < 0.4;
    const cpu = isCritical ? rand(75, 99) : isAnomaly ? rand(50, 80) : rand(1, 45);
    const memory = isCritical ? rand(60, 95) : isAnomaly ? rand(40, 70) : rand(5, 40);
    const severity: SystemProcess["severity"] = isCritical ? "High" : isAnomaly ? "Medium" : "Low";

    data.push({
      id: i + 1,
      file_name: processNames[i % processNames.length],
      cpu,
      memory,
      disk: rand(0, 60),
      network: rand(0, 100),
      timestamp: generateTimestamp(i * 3),
      anomaly: isAnomaly,
      severity,
      status: isCritical ? "Running" : Math.random() > 0.2 ? "Running" : "Idle",
      explanation: explanations[severity],
    });
  }
  return data;
}

export function generateTimeSeriesData(points = 24) {
  return Array.from({ length: points }, (_, i) => {
    const hour = `${String(i).padStart(2, "0")}:00`;
    const cpu = rand(15, 55);
    const isSpike = Math.random() < 0.15;
    const spikedCpu = isSpike ? rand(75, 98) : cpu;
    return {
      time: hour,
      cpu: spikedCpu,
      memory: rand(30, 70),
      disk: rand(10, 40),
      network: rand(5, 80),
      anomaly: isSpike,
      process: isSpike ? processNames[Math.floor(Math.random() * 5)] : undefined,
      severity: isSpike ? (spikedCpu > 85 ? "High" : "Medium") : "Low",
    };
  });
}

export const systemOverview = {
  cpu: 42,
  memory: 58,
  disk: 35,
  activeProcesses: 127,
  uptime: "14d 6h 32m",
  os: "Windows 11 Pro",
  hostname: "EDGE-AI-NODE-01",
};

export const initialProcesses = generateMockData();
export const initialTimeSeries = generateTimeSeriesData();
