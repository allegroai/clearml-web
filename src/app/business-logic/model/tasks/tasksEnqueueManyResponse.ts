/**
 * tasks
 * No description provided (generated by Openapi Generator https://github.com/openapitools/openapi-generator)
 *
 * OpenAPI spec version: 2.14
 *
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 */

import { TasksEnqueueManyResponseSucceeded } from '././tasksEnqueueManyResponseSucceeded';
import { TasksResetManyResponseFailed } from '././tasksResetManyResponseFailed';


export interface TasksEnqueueManyResponse {
    succeeded?: Array<TasksEnqueueManyResponseSucceeded>;
    failed?: Array<TasksResetManyResponseFailed>;
  /**
   * Returns Trueif there are workers or autscalers working with the queue
   */
  queue_watched?: boolean;
}
