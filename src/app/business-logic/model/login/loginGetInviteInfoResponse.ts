/**
 * login
 * No description provided (generated by Openapi Generator https://github.com/openapitools/openapi-generator)
 *
 * OpenAPI spec version: 2.13
 *
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 */



export interface LoginGetInviteInfoResponse {
    /**
     * The name of the user who issued the invite
     */
    user_name?: string;
    /**
     * The given name of the user who issued the invite
     */
    user_given_name?: string;
    /**
     * The family name of the user who issued the invite
     */
    user_family_name?: string;
    /**
     * The name of the company that the invite is issued for
     */
    company_name?: string;
    /**
     * The status of the invite
     */
    active?: boolean;
}
