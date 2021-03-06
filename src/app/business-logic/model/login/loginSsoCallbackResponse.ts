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

import { SignupInfo } from '././signupInfo';


export interface LoginSsoCallbackResponse {
    user_id?: string;
    /**
     * The id of the company that the user logged into
     */
    company_id?: string;
    token?: string;
    /**
     * The status of the login. Indicates whether the user was logged in or sign up required
     */
    login_status?: LoginSsoCallbackResponse.LoginStatusEnum;
    signup_info?: SignupInfo;
}
export namespace LoginSsoCallbackResponse {
    export type LoginStatusEnum = 'logged_in' | 'signup_required';
    export const LoginStatusEnum = {
        LoggedIn: 'logged_in' as LoginStatusEnum,
        SignupRequired: 'signup_required' as LoginStatusEnum
    };
}
