export interface PipelinesCreateRequest {
    /**
     * Pipeline name. Unique within the company.
     */
    name: string;
    /**
     * User-defined tags list
     */
    tags?: Array<string>;
    /**
     * Free text comment
     */
    description?: string;
    /**
     * Project ID of the project to which this report is assigned Must exist[ab]
     */
    project?: string;

    parameters?: Array<object>
}
