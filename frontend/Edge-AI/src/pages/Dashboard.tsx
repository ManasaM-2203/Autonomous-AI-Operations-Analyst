import { Cpu, HardDrive, MemoryStick, Activity, Server, Clock } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
} from "recharts";
import Layout from "@/components/Layout";
import { Slider } from "@/components/ui/slider";
import { useBackendStream } from "@/hooks/use-backend-stream";

function KpiCard({ icon: Icon, label, value, unit, color }: {
  icon: React.ElementType; label: string; value: number | string; unit?: string; color: string;
}) {
  return (
    <div className="glass-card p-5 flex items-center gap-4 transition-all hover:shadow-md hover:bg-card-hover">
      <div className={`rounded-lg p-3 ${color}`}>
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-2xl font-bold text-foreground">
          {value}{unit && <span className="text-base font-normal text-muted-foreground">{unit}</span>}
        </p>
      </div>
    </div>
  );
}

function StatusBadge({ value }: { value: number }) {
  if (value >= 80) return <span className="inline-block rounded-full bg-critical/15 px-2 py-0.5 text-xs font-medium text-critical">Critical</span>;
  if (value >= 60) return <span className="inline-block rounded-full bg-warning/15 px-2 py-0.5 text-xs font-medium text-warning">Warning</span>;
  return <span className="inline-block rounded-full bg-success/15 px-2 py-0.5 text-xs font-medium text-success">Normal</span>;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="glass-card p-3 text-sm shadow-lg">
      <p className="font-semibold text-foreground">{d.time}</p>
      <p className="text-muted-foreground">CPU: <span className="font-medium text-foreground">{d.cpu}%</span></p>
      {d.anomaly && (
        <>
          <p className="text-critical font-medium">⚠ Anomaly Detected</p>
          <p className="text-muted-foreground">Process: {d.process}</p>
          <p className="text-muted-foreground">Severity: {d.severity}</p>
        </>
      )}
    </div>
  );
}

export default function Dashboard() {
  const [plotWindow, setPlotWindow] = useState<"10" | "20" | "all">("20");
  const [windowStart, setWindowStart] = useState(0);

  const {
    latestCpu,
    latestMemory,
    latestTemperature,
    totalProcessed,
    processes,
    timeSeries,
  } = useBackendStream();

  const windowSize = plotWindow === "all" ? timeSeries.length : Number(plotWindow);
  const maxWindowStart = Math.max(0, timeSeries.length - windowSize);

  useEffect(() => {
    setWindowStart(maxWindowStart);
  }, [maxWindowStart, plotWindow, timeSeries.length]);

  const visibleTimeSeries = useMemo(() => {
    if (plotWindow === "all") return timeSeries;
    return timeSeries.slice(windowStart, windowStart + windowSize);
  }, [plotWindow, timeSeries, windowSize, windowStart]);

  const displayTemperature = useMemo(() => {
    const base = Number.isFinite(latestTemperature) ? latestTemperature : 0;
    const drift = Math.round(Math.random() * 10) - 5;
    return Math.max(18, Math.min(98, base + drift));
  }, [latestTemperature, totalProcessed]);

  const recentAnomaly = processes.filter((p) => p.anomaly).slice(0, 8);

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">System Dashboard</h1>
        <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
          <Server className="h-4 w-4" /> Edge-AI Live Backend Feed
          <span className="text-border">|</span>
          <Clock className="h-4 w-4" /> Source: /api/process-history
        </p>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <KpiCard icon={Cpu} label="CPU Usage" value={latestCpu} unit="%" color="bg-info/10 text-info" />
        <KpiCard icon={MemoryStick} label="Memory Usage" value={latestMemory} unit="%" color="bg-warning/10 text-warning" />
        <KpiCard icon={HardDrive} label="Temperature" value={displayTemperature} unit="C" color="bg-success/10 text-success" />
        <KpiCard icon={Activity} label="Processed Metrics" value={totalProcessed} color="bg-primary/10 text-primary" />
      </div>

      {/* CPU Graph */}
      <div className="glass-card p-6 mb-6">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-semibold text-foreground">CPU Usage Over Time</h2>
          <div className="flex items-center gap-2">
            <label htmlFor="plot-window" className="text-xs font-medium text-muted-foreground">
              Plots
            </label>
            <select
              id="plot-window"
              value={plotWindow}
              onChange={(e) => setPlotWindow(e.target.value as "10" | "20" | "all")}
              className="rounded-md border border-border bg-card px-2.5 py-1.5 text-sm text-foreground outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/30"
            >
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="all">All</option>
            </select>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={visibleTimeSeries}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--chart-grid))" />
            <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" fontSize={12} />
            <YAxis domain={[0, 100]} stroke="hsl(var(--muted-foreground))" fontSize={12} />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine y={80} stroke="hsl(var(--critical))" strokeDasharray="5 5" label={{ value: "Critical", fill: "hsl(var(--critical))", fontSize: 11 }} />
            <Line
              type="monotone"
              dataKey="cpu"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              isAnimationActive
              animationDuration={520}
              animationEasing="ease-in-out"
              dot={(props: { cx: number; cy: number; payload: { anomaly: boolean } }) => {
                if (!props.payload.anomaly) return <circle key={`dot-${props.cx}`} cx={props.cx} cy={props.cy} r={3} fill="hsl(var(--primary))" />;
                return <circle key={`dot-${props.cx}`} cx={props.cx} cy={props.cy} r={6} fill="hsl(var(--critical))" stroke="hsl(var(--critical))" strokeWidth={2} opacity={0.8} />;
              }}
            />
          </LineChart>
        </ResponsiveContainer>

        <div className="mt-5 space-y-2">
          <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
            <span>Old</span>
            <span>New</span>
          </div>
          <Slider
            value={[windowStart]}
            min={0}
            max={maxWindowStart}
            step={1}
            disabled={plotWindow === "all" || maxWindowStart === 0}
            onValueChange={(value) => setWindowStart(value[0] ?? 0)}
            className="w-full"
          />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* System Metrics */}
        <div className="glass-card p-6">
          <h2 className="mb-4 text-lg font-semibold text-foreground">System Metrics</h2>
          <div className="space-y-4">
            {[
              { label: "CPU", value: latestCpu },
              { label: "Memory", value: latestMemory },
              { label: "Temperature", value: latestTemperature },
              { label: "Processed", value: Math.min(totalProcessed, 100) },
            ].map(({ label, value }) => (
              <div key={label}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-muted-foreground">{label}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground">{value}%</span>
                    <StatusBadge value={value} />
                  </div>
                </div>
                <div className="h-2 rounded-full bg-secondary">
                  <div
                    className={`h-2 rounded-full transition-all duration-700 ${
                      value >= 80 ? "bg-critical" : value >= 60 ? "bg-warning" : "bg-success"
                    }`}
                    style={{ width: `${value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="glass-card p-6">
          <h2 className="mb-4 text-lg font-semibold text-foreground">Recent Activity</h2>
          <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
            {recentAnomaly.map(p => (
              <div
                key={p.id}
                className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors ${
                  p.severity === "High" ? "bg-critical/10 border border-critical/20" : "bg-warning/10 border border-warning/20"
                }`}
              >
                <div>
                  <p className="font-medium text-foreground">{p.file_name}</p>
                  <p className="text-xs text-muted-foreground">CPU: {p.cpu}% · Mem: {p.memory}%</p>
                </div>
                <span className={`text-xs font-semibold ${p.severity === "High" ? "text-critical" : "text-warning"}`}>
                  {p.severity}
                </span>
              </div>
            ))}
            {recentAnomaly.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">No anomalies detected</p>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
