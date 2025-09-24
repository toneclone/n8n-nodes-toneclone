export interface ClientInfo {
    name: string;
    version: string;
    channel: string;
    env: string;
}
export declare function getClientInfo(apiUrl: string): ClientInfo;
export declare function clientInfoToHeader(clientInfo: ClientInfo): string;
export declare function getClientHeader(apiUrl: string): string;
