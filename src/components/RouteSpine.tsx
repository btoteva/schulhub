import React, { useLayoutEffect, useMemo, useRef, useState } from "react";
import { VarnaArrival, VarnaStop, routeCursor, shortPlaceName } from "../utils/varnaFormat";

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
  hereIdx: number,
  nextIdx: number,
  yourStopId: number | null,
  expanded: boolean
): SpineNode[] {
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

function rowCenter(origin: HTMLElement, index: number): number | null {
  const row = origin.querySelector<HTMLElement>(`[data-stop-index="${index}"]`);
  if (!row) return null;
  const originBox = origin.getBoundingClientRect();
  const rowBox = row.getBoundingClientRect();
  return rowBox.top - originBox.top + rowBox.height / 2;
}

const RouteSpine: React.FC<{
  stations: VarnaStop[];
  vehicle: VarnaArrival | null;
  yourStopId?: number | null;
  labels: SpineLabels;
  focusNonce?: number;
  onPickStop: (stopId: number) => void;
}> = ({ stations, vehicle, yourStopId = null, labels, focusNonce = 0, onPickStop }) => {
  const [expanded, setExpanded] = useState(false);
  const listRef = useRef<HTMLOListElement | null>(null);
  const markerRef = useRef<HTMLSpanElement | null>(null);
  const labelRef = useRef<HTMLSpanElement | null>(null);
  const placed = useRef(false);
  const hereIdxRef = useRef(-1);
  const cursor = useMemo(() => routeCursor(stations, vehicle), [stations, vehicle]);
  hereIdxRef.current = cursor.hereIdx;
  const nodes = useMemo(
    () => buildSpine(stations, cursor.hereIdx, cursor.nextIdx, yourStopId, expanded),
    [stations, cursor.hereIdx, cursor.nextIdx, yourStopId, expanded]
  );
  const canFold = stations.length > 10;

  useLayoutEffect(() => {
    const marker = markerRef.current;
    const label = labelRef.current;
    const origin = marker?.offsetParent instanceof HTMLElement ? marker.offsetParent : null;
    if (!marker || !origin) return;
    if (cursor.hereIdx < 0) {
      marker.style.opacity = "0";
      if (label) label.style.opacity = "0";
      return;
    }
    const hereTop = rowCenter(origin, cursor.hereIdx);
    const nextTop = cursor.nextIdx > cursor.hereIdx ? rowCenter(origin, cursor.nextIdx) : null;
    if (hereTop == null) return;
    const top = nextTop == null ? hereTop : hereTop + (nextTop - hereTop) * cursor.progress;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const previous = Number.parseFloat(marker.style.top || "");
    const delta = Number.isFinite(previous) ? Math.abs(previous - top) : 0;
    const duration = !placed.current || reduce || delta > 72 ? "0ms" : "5000ms";
    placed.current = true;
    marker.style.transitionDuration = duration;
    marker.style.opacity = "1";
    marker.style.top = `${top}px`;
    if (label) {
      label.style.transitionDuration = duration;
      label.style.opacity = "1";
      label.style.top = `${top}px`;
    }
  }, [cursor.hereIdx, cursor.nextIdx, cursor.progress, expanded, nodes]);

  useLayoutEffect(() => {
    if (!focusNonce) return;
    listRef.current
      ?.querySelector<HTMLElement>(`[data-stop-index="${hereIdxRef.current}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [focusNonce]);

  return (
    <div className="relative mt-1 mb-2 rounded-2xl bg-slate-50 px-3 py-3 dark:bg-slate-900/60">
      <ol ref={listRef} className="relative space-y-0.5">
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
            node.role === "next" ? labels.next : node.role === "yours" ? labels.yours : "";
          return (
            <li key={node.stop.id} data-stop-index={node.index} className="relative">
              <span
                className={`absolute left-[7px] top-0 h-full w-px ${
                  node.passed ? "bg-slate-200 dark:bg-slate-700" : "bg-teal-600/50"
                }`}
                aria-hidden
              />
              <button
                type="button"
                onClick={() => onPickStop(node.stop.id)}
                className={`relative flex w-full items-center gap-3 rounded-xl py-1.5 pl-7 pr-2 text-left hover:bg-white/80 dark:hover:bg-slate-800 ${
                  node.passed ? "text-slate-400" : "text-slate-800 dark:text-slate-100"
                }`}
              >
                <span
                  className={`absolute left-[3px] top-1/2 h-[9px] w-[9px] -translate-y-1/2 rounded-full ${
                    node.role === "next" || node.role === "yours"
                      ? "border-2 border-teal-500 bg-white dark:bg-slate-900"
                      : node.passed
                        ? "bg-slate-300 dark:bg-slate-600"
                        : "bg-slate-500 dark:bg-slate-300"
                  }`}
                  aria-hidden
                />
                <span className="min-w-0 flex-1 truncate text-[15px] font-medium">
                  {title}
                </span>
                {tag && (
                  <span className="shrink-0 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                    {tag}
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ol>
      <span
        ref={markerRef}
        className="pointer-events-none absolute left-[12px] z-10 h-3.5 w-3.5 -translate-y-1/2 rounded-full bg-teal-500 opacity-0 ring-4 ring-teal-500/30 transition-[top] ease-linear motion-reduce:transition-none"
        aria-hidden
      />
      <span
        ref={labelRef}
        className="pointer-events-none absolute right-5 z-10 -translate-y-1/2 text-[11px] font-semibold uppercase tracking-wide text-teal-600 opacity-0 transition-[top] ease-linear motion-reduce:transition-none dark:text-teal-400"
      >
        {labels.here}
      </span>
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
