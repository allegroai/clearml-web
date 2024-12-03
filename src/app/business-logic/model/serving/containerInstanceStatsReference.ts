/**
 * serving
 * No description provided (generated by Openapi Generator https://github.com/openapitools/openapi-generator)
 *
 * OpenAPI spec version: 2.31
 *
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 */



export interface ContainerInstanceStatsReference {
    /**
     * The type of the reference item
     */
    type: ContainerInstanceStatsReference.TypeEnum;
    /**
     * The reference item value
     */
    value: string;
}
export namespace ContainerInstanceStatsReference {
    export type TypeEnum = 'app_id' | 'app_instance' | 'model' | 'task' | 'url';
    export const TypeEnum = {
        AppId: 'app_id' as TypeEnum,
        AppInstance: 'app_instance' as TypeEnum,
        Model: 'model' as TypeEnum,
        Task: 'task' as TypeEnum,
        Url: 'url' as TypeEnum
    }
}