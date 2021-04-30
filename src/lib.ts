import * as msRestNodeAuth from '@azure/ms-rest-nodeauth';
import axios, { AxiosRequestConfig } from 'axios';
import https from 'https';
import { URL } from 'url';

export type JSONObject = {
    [key in string | number]?:
        | string
        | number
        | boolean
        | JSONObject
        | JSONObject[];
};

export type JSONable = string | number | boolean | JSONObject | JSONObject[];

export function getClientSecretCredential(
    tenantId: string,
    clientId: string,
    clientSecret: string
): Promise<msRestNodeAuth.ApplicationTokenCredentials> {
    return msRestNodeAuth.loginWithServicePrincipalSecret(
        tenantId,
        clientId,
        clientSecret
    );
}

export async function get(
    credential: msRestNodeAuth.ApplicationTokenCredentials,
    url: URL
): Promise<JSONable> {
    const token = await credential.getToken();
    const options: AxiosRequestConfig = {
        method: 'GET',
        headers: {
            Accept: 'application/json',
            Authorization: `${token.tokenType} ${token.accessToken}`,
        },
        url: url.toString(),
        timeout: 30000,
        httpsAgent: new https.Agent({
            rejectUnauthorized: false,
        }), // resolve self signed certificate issue
    };
    const response = await axios(options);
    console.log(response);
    return response.data as JSONable;
}
