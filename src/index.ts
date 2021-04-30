import { URL } from 'url';
import { get, getClientSecretCredential, JSONable } from './lib';

export async function execCheck(
    tenentId: string,
    clientId: string,
    clientSecret: string,
    url: string
): Promise<JSONable> {
    try {
        const credential = await getClientSecretCredential(
            tenentId,
            clientId,
            clientSecret
        );
        const result = await get(credential, new URL(url));
        console.log(result);
    } catch (error) {
        console.error(error);
    }
    return null;
}

export function execIn(): Promise<JSONable> {
    // TODO: add implementation for the in script
    return null;
}

export function execOut(): Promise<JSONable> {
    // TODO: add implementation for the out script
    return null;
}
