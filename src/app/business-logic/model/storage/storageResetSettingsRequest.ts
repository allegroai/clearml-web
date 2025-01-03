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



export interface StorageResetSettingsRequest {
    /**
     * The names of the settings to delete
     */
    keys?: Array<StorageResetSettingsRequest.KeysEnum>;
}
export namespace StorageResetSettingsRequest {
    export type KeysEnum = 'azure' | 'aws' | 'google';
    export const KeysEnum = {
        Azure: 'azure' as KeysEnum,
        Aws: 'aws' as KeysEnum,
        Google: 'google' as KeysEnum
    }
}
