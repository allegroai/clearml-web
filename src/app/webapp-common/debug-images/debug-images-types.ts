export interface DebugSampleEvent {
    timestamp: number;
    type?: string;
    task?: string;
    iter?: number;
    metric?: string;
    variant?: string;
    key?: string;
    url?: string;
    // eslint-disable-next-line @typescript-eslint/naming-convention
    '@timestamp'?: string;
    worker?: string;
    variantAndMetric?: string;
}

export interface Iteration {
    events: DebugSampleEvent[];
    iter: number;
}

export interface DebugSamples {
    metrics: string[];
    metric: string;
    scrollId: string;
    data: Iteration[];
}
