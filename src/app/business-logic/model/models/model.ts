/**
 * models
 * No description provided (generated by Openapi Generator https://github.com/openapitools/openapi-generator)
 *
 * OpenAPI spec version: 2.9
 *
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 */



export interface Model {
    /**
     * Model id
     */
    id?: string;
    /**
     * Model name
     */
    name?: string;
    /**
     * Associated user id
     */
    user?: string;
    /**
     * Company id
     */
    company?: string;
    /**
     * Model creation time
     */
    created?: Date;
    /**
     * Task ID of task in which the model was created
     */
    task?: string;
    /**
     * Parent model ID
     */
    parent?: string;
    /**
     * Associated project ID
     */
    project?: string;
    /**
     * Model comment
     */
    comment?: string;
    /**
     * User-defined tags
     */
    tags?: Array<string>;
    /**
     * System tags. This field is reserved for system use, please don\'t use it.
     */
    system_tags?: Array<string>;
    /**
     * Framework on which the model is based. Should be identical to the framework of the task which created the model
     */
    framework?: string;
    /**
     * Json object representing the model design. Should be identical to the network design of the task which created the model
     */
    design?: object;
    /**
     * Json object representing the ids of the labels in the model. The keys are the layers\' names and the values are the ids.
     */
    labels?: { [key: string]: number; };
    /**
     * URI for the model, pointing to the destination storage.
     */
    uri?: string;
    /**
     * Indication if the model is final and can be used by other tasks
     */
    ready?: boolean;
    /**
     * UI cache for this model
     */
    ui_cache?: object;
}