/**
 * projects
 * No description provided (generated by Openapi Generator https://github.com/openapitools/openapi-generator)
 *
 * OpenAPI spec version: 2.14
 *
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 */



export interface ProjectsValidateDeleteResponse {
    /**
     * The total number of tasks under the project and all its children
     */
    tasks?: number;
    /**
     * The total number of non-archived tasks under the project and all its children
     */
    non_archived_tasks?: number;
    /**
     * The total number of models under the project and all its children
     */
    models?: number;
    /**
     * The total number of non-archived models under the project and all its children
     */
    non_archived_models?: number;
    /**
     * The total number of non-empty datasets under the project and all its children
     */
    datasets?: number;
    /**
     * The total number of reports under the project and all its children
     */
    reports?: number;
    /**
     * The total number of non-archived reports under the project and all its children
     */
    non_archived_reports?: number;
    /**
     * The total number of pipelines with active controllers under the project and all   its children
     */
    pipelines?: number;
}
