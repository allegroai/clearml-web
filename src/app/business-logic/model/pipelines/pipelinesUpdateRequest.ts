import { Pipeline } from "./pipeline";



export interface PipelinesUpdateRequest extends Pipeline {
    flow_display?: unknown;
    pipeline_id?: string;
}
