/**
 * tasks
 * No description provided (generated by Openapi Generator https://github.com/openapitools/openapi-generator)
 *
 * OpenAPI spec version: 999.0
 *
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 */



export interface TasksUpdateTagsRequest {
    /**
     * IDs of the tasks to update
     */
    ids?: Array<string>;
    /**
     * User tags to add
     */
    add_tags?: Array<string>;
    /**
     * User tags to remove
     */
    remove_tags?: Array<string>;
}
