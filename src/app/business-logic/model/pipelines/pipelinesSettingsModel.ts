export interface pipelinesSettingsModel {
    /**
     * Pipeline name. Unique within the company.
     */
    emailList: string;
    /**
     * User-defined tags list
     */
    emailAlert?: boolean;
    /**
     * User-defined tags list
     */
    scheduling?: boolean;
    /**
     * Free text comment
     */
    expression?: string;
    /**
     * Project ID of the project to which this report is assigned Must exist[ab]
     */
    interval?: string;

    parameters?: Array<object>
}
