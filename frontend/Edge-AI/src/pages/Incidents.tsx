import { useState } from "react";
import { Filter, X, AlertTriangle, Shield, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import Layout from "@/components/Layout";
import type { SystemProcess } from "@/data/mockData";
import { useBackendStream } from "@/hooks/use-backend-stream";

function SeverityBadge({ severity }: { severity: string }) {
  const cls = severity === "High"
    ? "bg-critical/15 text-critical"
    : severity === "Medium"
    ? "bg-warning/15 text-warning"
    : "bg-success/15 text-success";
  return <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${cls}`}>{severity}</span>;
}

function StatusBadge({ anomaly }: { anomaly: boolean }) {
  return anomaly
    ? <span className="inline-block rounded-full bg-critical/15 px-2.5 py-0.5 text-xs font-semibold text-critical">Anomaly</span>
    : <span className="inline-block rounded-full bg-success/15 px-2.5 py-0.5 text-xs font-semibold text-success">Safe</span>;
}

function DetailModal({ process, onClose }: { process: SystemProcess; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="glass-card w-full max-w-lg p-6 shadow-2xl animate-fade-in" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-foreground">Process Details</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Shield className={`h-10 w-10 ${
              process.severity === "High" ? "text-critical" : process.severity === "Medium" ? "text-warning" : "text-success"
            }`} />
            <div>
              <p className="text-lg font-semibold text-foreground">{process.file_name}</p>
              <div className="flex gap-2 mt-1">
                <SeverityBadge severity={process.severity} />
                <StatusBadge anomaly={process.anomaly} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 rounded-lg bg-secondary/50 p-4">
            <div>
              <p className="text-xs text-muted-foreground">CPU Usage</p>
              <p className="text-2xl font-bold text-foreground">{process.cpu}%</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Memory Usage</p>
              <p className="text-2xl font-bold text-foreground">{process.memory}%</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Disk Usage</p>
              <p className="text-lg font-semibold text-foreground">{process.disk}%</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Status</p>
              <p className="text-lg font-semibold text-foreground">{process.status}</p>
            </div>
          </div>

          <div className="flex items-start gap-2 text-xs text-muted-foreground">
            <Clock className="h-4 w-4 mt-0.5 shrink-0" />
            {new Date(process.timestamp).toLocaleString()}
          </div>

          {process.anomaly && (
            <div className={`rounded-lg p-4 ${
              process.severity === "High" ? "bg-critical/10 border border-critical/20" : "bg-warning/10 border border-warning/20"
            }`}>
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className={`h-4 w-4 ${process.severity === "High" ? "text-critical" : "text-warning"}`} />
                <p className={`text-sm font-semibold ${process.severity === "High" ? "text-critical" : "text-warning"}`}>
                  AI Analysis
                </p>
              </div>
              <p className="text-sm text-foreground">{process.explanation}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Incidents() {
  const { processes, anomalyCount, warningCount, criticalCount, totalProcessed } = useBackendStream();
  const [filter, setFilter] = useState<"all" | "anomaly" | "critical">("all");
  const [selected, setSelected] = useState<SystemProcess | null>(null);

  const filtered = processes.filter(p => {
    if (filter === "anomaly") return p.anomaly;
    if (filter === "critical") return p.anomaly && p.severity === "High";
    return true;
  });

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Incidents & Anomalies</h1>
        <p className="text-sm text-muted-foreground">
          Backend output log stream — {anomalyCount} anomalies, {warningCount} warning, {criticalCount} critical
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <div className="glass-card p-4 text-center">
          <p className="text-3xl font-bold text-foreground">{totalProcessed}</p>
          <p className="text-sm text-muted-foreground">Total Backend Processed</p>
        </div>
        <div className="glass-card p-4 text-center border-warning/30">
          <p className="text-3xl font-bold text-warning">{anomalyCount}</p>
          <p className="text-sm text-muted-foreground">Anomalies</p>
        </div>
        <div className="glass-card p-4 text-center border-warning/30">
          <p className="text-3xl font-bold text-warning">{warningCount}</p>
          <p className="text-sm text-muted-foreground">Warning</p>
        </div>
        <div className="glass-card p-4 text-center border-critical/30">
          <p className="text-3xl font-bold text-critical">{criticalCount}</p>
          <p className="text-sm text-muted-foreground">Critical</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 mb-4">
        <Filter className="h-4 w-4 text-muted-foreground" />
        {(["all", "anomaly", "critical"] as const).map(f => (
          <Button
            key={f}
            variant={filter === f ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(f)}
            className="capitalize"
          >
            {f === "all" ? "All" : f === "anomaly" ? "Anomalies Only" : "Critical Only"}
          </Button>
        ))}
      </div>

      {/* Table */}
      <div className="glass-card p-4 sm:p-6">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="pb-3 font-medium text-muted-foreground">Process</th>
                <th className="pb-3 font-medium text-muted-foreground">CPU %</th>
                <th className="pb-3 font-medium text-muted-foreground">Memory %</th>
                <th className="pb-3 font-medium text-muted-foreground">Status</th>
                <th className="pb-3 font-medium text-muted-foreground">Severity</th>
                <th className="pb-3 font-medium text-muted-foreground hidden sm:table-cell">Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr
                  key={p.id}
                  onClick={() => setSelected(p)}
                  className={`border-b border-border/50 cursor-pointer transition-colors hover:bg-card-hover ${
                    p.anomaly && p.severity === "High" ? "bg-critical/5" : ""
                  }`}
                >
                  <td className="py-3 font-medium text-foreground">{p.file_name}</td>
                  <td className={`py-3 ${p.cpu >= 75 ? "text-critical font-semibold" : "text-foreground"}`}>{p.cpu}%</td>
                  <td className={`py-3 ${p.memory >= 70 ? "text-warning font-semibold" : "text-foreground"}`}>{p.memory}%</td>
                  <td className="py-3"><StatusBadge anomaly={p.anomaly} /></td>
                  <td className="py-3"><SeverityBadge severity={p.severity} /></td>
                  <td className="py-3 text-muted-foreground hidden sm:table-cell text-xs">
                    {new Date(p.timestamp).toLocaleTimeString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <p className="text-center py-8 text-muted-foreground">No incidents matching current filter.</p>
        )}
      </div>

      {selected && <DetailModal process={selected} onClose={() => setSelected(null)} />}
    </Layout>
  );
}
