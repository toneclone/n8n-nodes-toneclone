/**
 * Client tracking utilities for n8n ToneClone node
 */

export interface ClientInfo {
    name: string;
    version: string;
    channel: string;
    env: string;
}

const NODE_CLIENT_NAME = 'n8n';
const NODE_CLIENT_CHANNEL = 'n8n';
const NODE_VERSION = '1.0.2'; // Keep in sync with package.json version

/**
 * Get the environment based on the API URL
 */
function getClientEnv(apiUrl: string): string {
    const url = apiUrl.toLowerCase();

    if (url.includes('localhost') || url.includes('127.0.0.1')) {
        return 'dev';
    }
    if (url.includes('staging')) {
        return 'staging';
    }
    if (url.includes('api.toneclone.ai')) {
        return 'prod';
    }

    // Default to prod for unknown URLs
    return 'prod';
}

/**
 * Get client information for the n8n node
 */
export function getClientInfo(apiUrl: string): ClientInfo {
    return {
        name: NODE_CLIENT_NAME,
        version: NODE_VERSION,
        channel: NODE_CLIENT_CHANNEL,
        env: getClientEnv(apiUrl),
    };
}

/**
 * Convert client info to X-Client header format
 * Format: "name/version (channel; env)"
 */
export function clientInfoToHeader(clientInfo: ClientInfo): string {
    return `${clientInfo.name}/${clientInfo.version} (${clientInfo.channel}; ${clientInfo.env})`;
}

/**
 * Get the X-Client header value
 */
export function getClientHeader(apiUrl: string): string {
    const clientInfo = getClientInfo(apiUrl);
    return clientInfoToHeader(clientInfo);
}
