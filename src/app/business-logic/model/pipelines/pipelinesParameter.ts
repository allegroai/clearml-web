export interface PipelinesParameter {
    id?: string;
    /**
     * Name of the parameter. The combination of section and name should be unique
     */
    name?: string;
    /**
     * Value of the parameter
     */
    value?: string;
    /**
     * Type of the parameter. Optional
     */
    type?: string;
    /**
     * The parameter description. Optional
     */
    description?: string;

    default?:string;
}
