/**
 * server
 * No description provided (generated by Openapi Generator https://github.com/openapitools/openapi-generator)
 *
 * OpenAPI spec version: 2.9
 *
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 */



export interface ServerReportStatsOptionResponse {
    /**
     * Returns the current report stats option value
     */
    enabled?: boolean;
    /**
     * If enabled, returns the time at which option was enabled
     */
    enabled_time?: Date;
    /**
     * If enabled, returns the server version at the time option was enabled
     */
    enabled_version?: string;
    /**
     * If enabled, returns Id of the user who enabled the option
     */
    enabled_user?: string;
    /**
     * Returns the current server version
     */
    current_version?: string;
}
