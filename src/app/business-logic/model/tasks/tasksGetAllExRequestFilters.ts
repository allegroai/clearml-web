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

import { TasksGetAllExRequestAll } from '././tasksGetAllExRequestAll';
import { TasksGetAllExRequestAny } from '././tasksGetAllExRequestAny';


/**
 * Filter on a field that includes combination of \'any\' or \'all\' included and excluded terms
 */
export interface TasksGetAllExRequestFilters {
    any?: TasksGetAllExRequestAny;
    all?: TasksGetAllExRequestAll;
    /**
     * The operation between \'any\' and \'all\' parts of the filter if both are provided
     */
    op?: TasksGetAllExRequestFilters.OpEnum;
}
export namespace TasksGetAllExRequestFilters {
    export type OpEnum = 'and' | 'or';
    export const OpEnum = {
        And: 'and' as OpEnum,
        Or: 'or' as OpEnum
    }
}
