/**
 * tasks
 * No description provided (generated by Openapi Generator https://github.com/openapitools/openapi-generator)
 *
 * OpenAPI spec version: 2.13
 *
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 */



export interface TasksDeleteRequest {
    /**
     * Move task to trash instead of deleting it. For internal use only, tasks in the   trash are not visible from the API and cannot be restored!
     */
    move_to_trash?: boolean;
    /**
     * If not true, call fails if the task status is \'in_progress\'
     */
    force?: boolean;
    /**
     * Task ID
     */
    task: string;
    /**
     * Reason for status change
     */
    status_reason?: string;
    /**
     * Extra information regarding status change
     */
    status_message?: string;
    /**
     * If set to \'true\' then return the urls of the files that were uploaded for this   task. Default value is \'false\'
     */
    return_file_urls?: boolean;
}