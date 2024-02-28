import { PipelinesParameter } from "./pipelinesParameter";

export interface PipelinesUpdateStepsRequest {
    /**
     * Pipeline step name. Unique within the company.
     */
    step?: string;
    
    parameters?: Array<PipelinesParameter>,
}
