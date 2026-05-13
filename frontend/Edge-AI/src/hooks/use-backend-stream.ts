import { useEffect, useMemo, useState } from "react";
import type { SystemProcess } from "@/data/mockData";

type BackendLevel = "LOW" | "MEDIUM" | "HIGH";
type BackendState = "SAFE" | "WARNING" | "CRITICAL";

interface ProcessInput {
  cpu?: number;
  memory?: number;
  temperature?: number;
  log?: string;
}

interface ProcessOutput {
  metrics?: {
    cpu?: number;
    memory?: number;
  };
  log?: {
    is_anomaly?: boolean;
    cleaned_log?: string;
  };
  decision?: {
    state?: BackendState;
    level?: BackendLevel;
    reason?: string;
  };
  ai_explanation?: string;
  timestamp?: string;
}

interface ProcessHistoryItem {
  input?: ProcessInput;
  output?: ProcessOutput;
  created_at?: string;
}

interface ProcessHistoryResponse {
  count: number;
  items: ProcessHistoryItem[];
}

interface BackendStreamData {
  latestCpu: number;
  latestMemory: number;
  latestTemperature: number;
  latestWarningEventId: string | null;
  totalProcessed: number;
  anomalyCount: number;
  warningCount: number;
  criticalCount: number;
  processes: SystemProcess[];
  timeSeries: Array<{
    time: string;
    cpu: number;
    memory: number;
    anomaly: boolean;
    process?: string;
    severity: "Low" | "Medium" | "High";
  }>;
}

const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_URL ?? "http://127.0.0.1:8000";

const processNames = [
  "VSCode.exe", "chrome.exe", "node.exe", "python.exe", "docker.exe",
  "slack.exe", "spotify.exe", "explorer.exe", "svchost.exe", "system.exe",
  "webpack.exe", "typescript.exe", "java.exe", "postgres.exe", "nginx.exe",
  "redis.exe", "mongod.exe", "git.exe", "ssh-agent.exe", "powershell.exe",
  "teams.exe", "outlook.exe", "antimalware.exe", "WindowsUpdate.exe",
  "OneDrive.exe", "SearchIndexer.exe", "RuntimeBroker.exe", "dwm.exe",
];

function severityFromBackend(anomaly: boolean, state?: string): "Low" | "Medium" | "High" {
  if (!anomaly) return "Low";

  // User-requested mapping: SAFE->Low, CRITICAL->Medium, WARNING->High.
  if (state === "CRITICAL") return "Medium";
  if (state === "WARNING") return "High";
  return "Medium";
}

function parseProcess(item: ProcessHistoryItem, idx: number): SystemProcess {
  const output = item.output ?? {};
  const input = item.input ?? {};

  const cpu = Number(output.metrics?.cpu ?? input.cpu ?? 0);
  const memory = Number(output.metrics?.memory ?? input.memory ?? 0);
  const disk = Number(input.temperature ?? 0);
  const anomaly = Boolean(output.log?.is_anomaly);
  const severity = severityFromBackend(anomaly, output.decision?.state);
  const timestamp = output.timestamp ?? item.created_at ?? new Date().toISOString();

  return {
    id: idx + 1,
    file_name: processNames[idx % processNames.length],
    cpu,
    memory,
    disk,
    network: 0,
    timestamp,
    anomaly,
    severity,
    status: anomaly ? "Suspended" : "Running",
    explanation: output.ai_explanation ?? output.decision?.reason ?? "No backend reason provided.",
  };
}

function toShortTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

export function useBackendStream(refreshMs = 2000): BackendStreamData {
  const [items, setItems] = useState<ProcessHistoryItem[]>([]);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const response = await fetch(`${BACKEND_BASE_URL}/api/process-history`);
        if (!response.ok) return;

        const data: ProcessHistoryResponse = await response.json();
        if (mounted) {
          setItems(Array.isArray(data.items) ? data.items : []);
        }
      } catch {
        // Keep prior UI state when backend is unavailable.
      }
    };

    void load();
    const id = setInterval(() => {
      void load();
    }, refreshMs);

    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, [refreshMs]);

  return useMemo(() => {
    const processes = items.map(parseProcess);
    const latest = items[0];
    const latestWarningItem = items.find((item) => item.output?.decision?.state === "WARNING");
    const latestWarningEventId = latestWarningItem
      ? [
          latestWarningItem.output?.timestamp,
          latestWarningItem.created_at,
          latestWarningItem.input?.cpu,
          latestWarningItem.input?.memory,
          latestWarningItem.input?.temperature,
        ]
          .filter((value) => value !== undefined && value !== null)
          .join("|")
      : null;

    const latestCpu = Number(latest?.output?.metrics?.cpu ?? latest?.input?.cpu ?? 0);
    const latestMemory = Number(latest?.output?.metrics?.memory ?? latest?.input?.memory ?? 0);
    const latestTemperature = Number(latest?.input?.temperature ?? 0);

    const anomalyCount = processes.filter((p) => p.anomaly).length;

    const warningCount = items.filter((item) => {
      const anomaly = Boolean(item.output?.log?.is_anomaly);
      return anomaly && item.output?.decision?.state === "WARNING";
    }).length;

    const criticalCount = items.filter((item) => {
      const anomaly = Boolean(item.output?.log?.is_anomaly);
      return anomaly && item.output?.decision?.state === "CRITICAL";
    }).length;

    const timeSeries = items
      .slice()
      .reverse()
      .map((item, idx) => {
        const anomaly = Boolean(item.output?.log?.is_anomaly);
        const state = item.output?.decision?.state;
        const severity = severityFromBackend(anomaly, state);
        const timestamp = item.output?.timestamp ?? item.created_at ?? `${idx}`;

        return {
          time: toShortTime(timestamp),
          cpu: Number(item.output?.metrics?.cpu ?? item.input?.cpu ?? 0),
          memory: Number(item.output?.metrics?.memory ?? item.input?.memory ?? 0),
          anomaly,
          process: anomaly ? processNames[idx % processNames.length] : undefined,
          severity,
        };
      });

    return {
      latestCpu,
      latestMemory,
      latestTemperature,
      latestWarningEventId,
      totalProcessed: items.length,
      anomalyCount,
      warningCount,
      criticalCount,
      processes,
      timeSeries,
    };
  }, [items]);
}
