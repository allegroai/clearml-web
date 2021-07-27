/**
 * projects
 * No description provided (generated by Openapi Generator https://github.com/openapitools/openapi-generator)
 *
 * OpenAPI spec version: 2.12
 *
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 */



/**
 * Status counts
 */
export interface StatsStatusCountStatusCount {
    /**
     * Number of 'in_progress' tasks in project
     */
    in_progress?: number;
    /**
     * Number of 'stopped' tasks in project
     */
    stopped?: number;
    /**
     * Number of 'created' tasks in project
     */
    created?: number;
    /**
     * Number of 'queued' tasks in project
     */
    queued?: number;
    /**
     * Number of 'closed' tasks in project
     */
    closed?: number;
    /**
     * Number of 'published' tasks in project
     */
    published?: number;
    /**
     * Number of 'failed' tasks in project
     */
    failed?: number;
    /**
     * Number of 'unknown' tasks in project
     */
    unknown?: number;
}