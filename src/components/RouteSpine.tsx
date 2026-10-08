import React, { useEffect, useMemo, useRef, useState } from "react";
import { VarnaArrival, VarnaStop, shortPlaceName } from "../utils/varnaFormat";

type SpineLabels = {
  here: string;
  next: string;
  yours: string;
  stops: (count: number) => string;
  showAll: string;
  showBrief: string;
};

type SpineStop = {
  kind: "stop";
  stop: VarnaStop;
  index: number;
  role: "here" | "next" | "yours" | "end" | "";
  passed: boolean;
};

type SpineGap = { kind: "gap"; count: number; passed: boolean };

type SpineNode = SpineStop | SpineGap;

function buildSpine(
  stations: VarnaStop[],
  vehicle: VarnaArrival | null,
  yourStopId: number | null,
  expanded: boolean
): SpineNode[] {
  const hereIdx = vehicle
    ? stations.findIndex((stop) => Number(stop.id) === Number(vehicle.stop_id))
    : -1;
  const nextIdx =
    vehicle && vehicle.next_stop_id != null
      ? stations.findIndex((stop) => Number(stop.id) === Number(vehicle.next_stop_id))
      : hereIdx >= 0
        ? hereIdx + 1
        : -1;
  const yourIdx =
    yourStopId != null ? stations.findIndex((stop) => Number(stop.id) === Number(yourStopId)) : -1;
  const last = stations.length - 1;
  const keep = new Set<number>();
  [0, last, hereIdx, nextIdx, yourIdx, hereIdx > 0 ? hereIdx - 1 : -1].forEach((idx) => {
    if (idx >= 0 && idx <= last) keep.add(idx);
  });

  const nodes: SpineNode[] = [];
  const pushStop = (index: number) => {
    const role: SpineStop["role"] =
      index === hereIdx
        ? "here"
        : index === nextIdx
          ? "next"
          : index === yourIdx && index !== hereIdx
            ? "yours"
            : index === 0 || index === last
              ? "end"
              : "";
    nodes.push({
      kind: "stop",
      stop: stations[index],
      index,
      role,
      passed: hereIdx >= 0 && index < hereIdx,
    });
  };

  if (expanded || stations.length <= 10) {
    stations.forEach((_, index) => pushStop(index));
    return nodes;
  }

  let i = 0;
  while (i < stations.length) {
    if (keep.has(i)) {
      pushStop(i);
      i += 1;
      continue;
    }
    let j = i;
    while (j < stations.length && !keep.has(j)) j += 1;
    const count = j - i;
    if (count <= 1) pushStop(i);
    else nodes.push({ kind: "gap", count, passed: hereIdx >= 0 && j - 1 < hereIdx });
    i = j;
  }
  return nodes;
}

const RouteSpine: React.FC<{
  stations: VarnaStop[];
  vehicle: VarnaArrival | null;
  yourStopId?: number | null;
  labels: SpineLabels;
  onPickStop: (stopId: number) => void;
}> = ({ stations, vehicle, yourStopId = null, labels, onPickStop }) => {
  const [expanded, setExpanded] = useState(false);
  const hereRef = useRef<HTMLLIElement | null>(null);
  const nodes = useMemo(
    () => buildSpine(stations, vehicle, yourStopId, expanded),
    [stations, vehicle, yourStopId, expanded]
  );
  const canFold = stations.length > 10;

  useEffect(() => {
    hereRef.current?.scrollIntoView({ block: "nearest" });
  }, [vehicle?.device, vehicle?.stop_id, expanded]);

  return (
    <div className="mt-1 mb-2 rounded-2xl bg-slate-50 px-3 py-3 dark:bg-slate-900/60">
      <ol className="relative space-y-0.5">
        {nodes.map((node, idx) => {
          if (node.kind === "gap") {
            return (
              <li key={`gap-${idx}`} className="relative flex items-center gap-3 py-1.5 pl-7">
                <span
                  className={`absolute left-[7px] top-0 h-full w-px ${
                    node.passed ? "bg-slate-200 dark:bg-slate-700" : "bg-slate-300 dark:bg-slate-600"
                  }`}
                  aria-hidden
                />
                <span className="text-xs tracking-wide text-slate-400">{labels.stops(node.count)}</span>
              </li>
            );
          }
          const title = shortPlaceName(node.stop.name);
          const tag =
            node.role === "here"
              ? labels.here
              : node.role === "next"
                ? labels.next
                : node.role === "yours"
                  ? labels.yours
                  : "";
          const isHere = node.role === "here";
          return (
            <li key={node.stop.id} ref={isHere ? hereRef : undefined} className="relative">
              <span
                className={`absolute left-[7px] top-0 h-full w-px ${
                  node.passed ? "bg-slate-200 dark:bg-slate-700" : "bg-teal-600/50"
                }`}
                aria-hidden
              />
              <button
                type="button"
                onClick={() => onPickStop(node.stop.id)}
                className={`relative flex w-full items-center gap-3 rounded-xl py-1.5 pl-7 pr-2 text-left transition-colors hover:bg-white/80 dark:hover:bg-slate-800 ${
                  node.passed ? "text-slate-400" : "text-slate-800 dark:text-slate-100"
                }`}
              >
                <span
                  className={`absolute left-[3px] top-1/2 h-[9px] w-[9px] -translate-y-1/2 rounded-full ${
                    isHere
                      ? "bg-teal-500 ring-4 ring-teal-500/25"
                      : node.role === "next" || node.role === "yours"
                        ? "border-2 border-teal-500 bg-white dark:bg-slate-900"
                        : node.passed
                          ? "bg-slate-300 dark:bg-slate-600"
                          : "bg-slate-500 dark:bg-slate-300"
                  }`}
                  aria-hidden
                />
                <span className={`min-w-0 flex-1 truncate ${isHere ? "font-semibold" : "font-medium"} ${node.role === "end" ? "" : "text-[15px]"}`}>
                  {title}
                </span>
                {tag && (
                  <span
                    className={`shrink-0 text-[11px] font-semibold uppercase tracking-wide ${
                      isHere ? "text-teal-600 dark:text-teal-400" : "text-slate-400"
                    }`}
                  >
                    {tag}
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ol>
      {canFold && (
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          className="mt-2 pl-7 text-xs font-medium text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
        >
          {expanded ? labels.showBrief : labels.showAll}
        </button>
      )}
    </div>
  );
};

export default RouteSpine;
