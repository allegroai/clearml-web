/**
 * organization
 * No description provided (generated by Openapi Generator https://github.com/openapitools/openapi-generator)
 *
 * OpenAPI spec version: 999.0
 *
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 */



export interface OrganizationGetEntitiesCountRequest {
    /**
     * Search criteria for projects
     */
    projects?: object;
    /**
     * Search criteria for experiments
     */
    tasks?: object;
    /**
     * Search criteria for models
     */
    models?: object;
    /**
     * Search criteria for dataviews
     */
    dataviews?: object;
    /**
     * Search criteria for hyper datasets
     */
    hyper_datasets?: object;
    /**
     * Search criteria for pipelines
     */
    pipelines?: object;
    datasets: object;
}