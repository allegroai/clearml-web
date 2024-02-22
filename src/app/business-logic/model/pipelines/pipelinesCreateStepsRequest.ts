export interface PipelinesCreateStepsRequest {
    /**
     * Pipeline step name. Unique within the company.
     */
    name: string;
    /**
     * Free text comment
     */
    description?: string;
    
    experiment?: string;

    parameters?: Array<object>,

    pipeline_id?: string;
}
