export interface PipelinesCreateStepsRequest {
    /**
     * Pipeline name. Unique within the company.
     */
    name: string;
    /**
     * Free text comment
     */
    description?: string;
    
    experiment?: string;

    parameters?: Array<object>
}
