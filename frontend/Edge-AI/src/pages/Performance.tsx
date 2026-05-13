import { useMemo } from "react";
import { Cpu, MemoryStick, HardDrive, Wifi, CheckCircle, AlertTriangle, XCircle } from "lucide-react";
import {
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Legend,
} from "recharts";
import Layout from "@/components/Layout";
import { useBackendStream } from "@/hooks/use-backend-stream";

interface LivePoint {
  time: string;
  cpu: number;
  memory: number;
  disk: number;
}

interface TrendPoint extends LivePoint {
  cpuTrend: number | null;
  memoryTrend: number | null;
  cpuForecast: number | null;
  memoryForecast: number | null;
}

function stableRandom(seed: string) {
  let hash = 0;
  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 31 + seed.charCodeAt(index)) >>> 0;
  }
  return (Math.sin(hash) + 1) / 2;
}

function clampPercentage(value: number) {
  return Math.max(0, Math.min(100, value));
}

function fitLinear(values: number[]) {
  const count = values.length;
  if (count === 0) return { intercept: 0, slope: 0 };
  if (count === 1) return { intercept: values[0], slope: 0 };

  const xValues = values.map((_, index) => index);
  const sumX = xValues.reduce((sum, value) => sum + value, 0);
  const sumY = values.reduce((sum, value) => sum + value, 0);
  const sumXY = values.reduce((sum, value, index) => sum + index * value, 0);
  const sumX2 = xValues.reduce((sum, value) => sum + value * value, 0);
  const denominator = count * sumX2 - sumX * sumX;

  if (denominator === 0) {
    return { intercept: sumY / count, slope: 0 };
  }

  const slope = (count * sumXY - sumX * sumY) / denominator;
  const intercept = (sumY - slope * sumX) / count;

  return { intercept, slope };
}

function predictLinear(model: { intercept: number; slope: number }, index: number) {
  return model.intercept + model.slope * index;
}

function HealthCard({ label, value, icon: Icon }: { label: string; value: number; icon: React.ElementType }) {
  const status = value >= 80 ? "Critical" : value >= 60 ? "Warning" : "Normal";
  const StatusIcon = value >= 80 ? XCircle : value >= 60 ? AlertTriangle : CheckCircle;
  const colorClass = value >= 80 ? "text-critical" : value >= 60 ? "text-warning" : "text-success";
  const bgClass = value >= 80 ? "bg-critical/10" : value >= 60 ? "bg-warning/10" : "bg-success/10";

  return (
    <div className={`glass-card p-5 flex items-center gap-4 ${bgClass} border-0`}>
      <Icon className={`h-8 w-8 ${colorClass}`} />
      <div className="flex-1">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-xl font-bold text-foreground">{value}%</p>
      </div>
      <div className="flex items-center gap-1.5">
        <StatusIcon className={`h-4 w-4 ${colorClass}`} />
        <span className={`text-sm font-medium ${colorClass}`}>{status}</span>
      </div>
    </div>
  );
}

export default function Performance() {
  const { latestCpu, latestMemory, latestTemperature, timeSeries, processes } = useBackendStream();

  const liveData = useMemo<LivePoint[]>(
    () => timeSeries.map((point) => ({
      time: point.time,
      cpu: point.cpu,
      memory: point.memory,
      disk: Math.round(15 + stableRandom(`${point.time}-${point.cpu}-${point.memory}`) * 70),
    })),
    [timeSeries],
  );

  const trendData = useMemo<TrendPoint[]>(() => {
    const smoothingFactor = 0.22;
    let previousCpu = timeSeries[0]?.cpu ?? 0;
    let previousMemory = timeSeries[0]?.memory ?? 0;

    const smoothedHistory = timeSeries.map((point) => {
      previousCpu = smoothingFactor * point.cpu + (1 - smoothingFactor) * previousCpu;
      previousMemory = smoothingFactor * point.memory + (1 - smoothingFactor) * previousMemory;

      return {
        time: point.time,
        cpu: point.cpu,
        memory: point.memory,
        disk: Math.round(15 + stableRandom(`disk-${point.time}-${point.cpu}`) * 70),
        cpuTrend: clampPercentage(previousCpu),
        memoryTrend: clampPercentage(previousMemory),
        cpuForecast: null,
        memoryForecast: null,
      };
    });

    const predictionWindow = Math.min(12, smoothedHistory.length);
    const cpuModel = fitLinear(smoothedHistory.slice(-predictionWindow).map((point) => point.cpuTrend ?? 0));
    const memoryModel = fitLinear(smoothedHistory.slice(-predictionWindow).map((point) => point.memoryTrend ?? 0));

    if (smoothedHistory.length > 0) {
      const lastIndex = smoothedHistory.length - 1;
      smoothedHistory[lastIndex] = {
        ...smoothedHistory[lastIndex],
        cpuForecast: clampPercentage(predictLinear(cpuModel, lastIndex)),
        memoryForecast: clampPercentage(predictLinear(memoryModel, lastIndex)),
      };

      const forecastHorizon = 6;
      for (let offset = 1; offset <= forecastHorizon; offset += 1) {
        const forecastIndex = lastIndex + offset;
        smoothedHistory.push({
          time: `+${offset}`,
          cpu: 0,
          memory: 0,
          disk: Math.round(15 + stableRandom(`forecast-disk-${offset}-${forecastIndex}`) * 70),
          cpuTrend: null,
          memoryTrend: null,
          cpuForecast: clampPercentage(predictLinear(cpuModel, forecastIndex)),
          memoryForecast: clampPercentage(predictLinear(memoryModel, forecastIndex)),
        });
      }
    }

    return smoothedHistory;
  }, [timeSeries]);

  const runningProcesses = processes.slice(0, 20);

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Performance Monitor</h1>
        <p className="text-sm text-muted-foreground">Live backend output performance stream</p>
      </div>

      {/* System Health */}
      <div className="grid gap-4 sm:grid-cols-3 mb-6">
        <HealthCard label="CPU" value={latestCpu} icon={Cpu} />
        <HealthCard label="Memory" value={latestMemory} icon={MemoryStick} />
        <HealthCard label="Temperature" value={latestTemperature} icon={HardDrive} />
      </div>

      {/* Live Graphs */}
      <div className="grid gap-6 lg:grid-cols-2 mb-6">
        {[
          { key: "cpuTrend" as const, forecastKey: "cpuForecast" as const, label: "CPU Trend + Prediction", color: "var(--primary)" },
          { key: "memoryTrend" as const, forecastKey: "memoryForecast" as const, label: "Memory Trend + Prediction", color: "var(--warning)" },
        ].map(({ key, forecastKey, label, color }) => (
          <div key={key} className="glass-card p-6">
            <h2 className="mb-4 text-lg font-semibold text-foreground">{label}</h2>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--chart-grid))" />
                <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <YAxis domain={[0, 100]} stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <ReferenceLine
                  y={80}
                  stroke="hsl(var(--critical))"
                  strokeDasharray="6 6"
                  strokeWidth={2}
                  label={{ value: "Crash chance", fill: "hsl(var(--critical))", fontSize: 11, position: "insideTopRight" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    color: "hsl(var(--foreground))",
                  }}
                />
                <Legend />
                <Line
                  type="basis"
                  dataKey={key}
                  name="Trend"
                  stroke={`hsl(${color})`}
                  strokeWidth={3}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  dot={false}
                />
                <Line
                  type="linear"
                  dataKey={forecastKey}
                  name="Prediction"
                  stroke="hsl(var(--critical))"
                  strokeWidth={2}
                  strokeDasharray="6 6"
                  dot={false}
                  connectNulls
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ))}
      </div>

      {/* Disk I/O Graph */}
      <div className="glass-card p-6 mb-6">
        <h2 className="mb-4 text-lg font-semibold text-foreground">Disk I/O</h2>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={liveData}>
            <defs>
              <linearGradient id="grad-disk" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--success))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--success))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--chart-grid))" />
            <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" fontSize={11} />
            <YAxis domain={[0, 100]} stroke="hsl(var(--muted-foreground))" fontSize={11} />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                color: "hsl(var(--foreground))",
              }}
            />
            <Area type="monotone" dataKey="disk" stroke="hsl(var(--success))" fillOpacity={1} fill="url(#grad-disk)" strokeWidth={2} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Processes Table */}
      <div className="glass-card p-6">
        <h2 className="mb-4 text-lg font-semibold text-foreground">Running Processes</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="pb-3 font-medium text-muted-foreground">Process Name</th>
                <th className="pb-3 font-medium text-muted-foreground">CPU %</th>
                <th className="pb-3 font-medium text-muted-foreground">Memory %</th>
                <th className="pb-3 font-medium text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody>
              {runningProcesses.map((p) => (
                <tr
                  key={p.id}
                  className={`border-b border-border/50 transition-colors hover:bg-card-hover ${
                    p.anomaly && p.severity === "High" ? "bg-critical/5" : ""
                  }`}
                >
                  <td className="py-3 font-medium text-foreground">{p.file_name}</td>
                  <td className={`py-3 ${p.cpu >= 75 ? "text-critical font-semibold" : "text-foreground"}`}>{p.cpu}%</td>
                  <td className={`py-3 ${p.memory >= 70 ? "text-warning font-semibold" : "text-foreground"}`}>{p.memory}%</td>
                  <td className="py-3">
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                        p.status === "Running" ? "bg-success/15 text-success"
                        : p.status === "Idle" ? "bg-muted text-muted-foreground"
                        : "bg-warning/15 text-warning"
                      }`}
                    >
                      {p.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}
