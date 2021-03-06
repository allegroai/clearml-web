/**
 * auth
 * No description provided (generated by Openapi Generator https://github.com/openapitools/openapi-generator)
 *
 * OpenAPI spec version: 2.11
 *
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 */



export interface AuthSetCredentialsRequest {
    /**
     * Credentials key. Must be identical to the user\'s ID (this is the only value   supported in on-premises deployments)
     */
    access_key: string;
    /**
     * New secret key
     */
    secret_key: string;
}
