interface DeviceHints {
  width: number;
  devicePixelRatio?: number;
  hardwareConcurrency?: number;
  deviceMemory?: number;
  connection?: { saveData?: boolean; effectiveType?: string };
}

export function renderPixelRatio(hints: DeviceHints): number {
  const constrained = hints.width <= 860 || (hints.deviceMemory !== undefined && hints.deviceMemory <= 4);
  return Math.max(1, Math.min(hints.devicePixelRatio ?? 1, constrained ? 1.25 : 1.5));
}

/** The original HDR is an optional enhancement; the NASA photographic sky stays visible. */
export function allowHdrSky(hints: DeviceHints): boolean {
  return hints.width > 860 && !hints.connection?.saveData && !/^(slow-2g|2g|3g)$/.test(hints.connection?.effectiveType ?? '') &&
    !(hints.deviceMemory !== undefined && hints.deviceMemory <= 4) &&
    !(hints.hardwareConcurrency !== undefined && hints.hardwareConcurrency <= 4);
}
