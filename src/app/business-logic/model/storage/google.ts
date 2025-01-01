/**
 * storage
 * No description provided (generated by Openapi Generator https://github.com/openapitools/openapi-generator)
 *
 * OpenAPI spec version: 999.0
 *
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 */

import { GoogleBucket } from '././googleBucket';


/**
 * Google storage settings
 */
export interface Google {
    /**
     * Project name
     */
    project?: string;
    /**
     * The contents of the credentials json file
     */
    credentials_json?: string;
    /**
     * Credentials per bucket
     */
    buckets?: Array<GoogleBucket>;
}