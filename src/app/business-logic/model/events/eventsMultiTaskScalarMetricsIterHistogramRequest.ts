/**
 * events
 * No description provided (generated by Openapi Generator https://github.com/openapitools/openapi-generator)
 *
 * OpenAPI spec version: 2.14
 *
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 */

import { ScalarKeyEnum } from '././scalarKeyEnum';
import { MetricVariants } from '././metricVariants';


export interface EventsMultiTaskScalarMetricsIterHistogramRequest {
    /**
     * List of task Task IDs. Maximum amount of tasks is 10
     */
    tasks: Array<string>;
    /**
     * The amount of histogram points to return. Optional, the default value is 6000
     */
    samples?: number;
    key?: ScalarKeyEnum;
    model_events?: boolean;
  /**
   * List of metrics and variants
   */
  metrics?: Array<MetricVariants>;
}
