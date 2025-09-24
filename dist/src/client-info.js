"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getClientInfo = getClientInfo;
exports.clientInfoToHeader = clientInfoToHeader;
exports.getClientHeader = getClientHeader;
const NODE_CLIENT_NAME = 'n8n';
const NODE_CLIENT_CHANNEL = 'n8n';
const NODE_VERSION = '1.0.2';
function getClientEnv(apiUrl) {
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
    return 'prod';
}
function getClientInfo(apiUrl) {
    return {
        name: NODE_CLIENT_NAME,
        version: NODE_VERSION,
        channel: NODE_CLIENT_CHANNEL,
        env: getClientEnv(apiUrl),
    };
}
function clientInfoToHeader(clientInfo) {
    return `${clientInfo.name}/${clientInfo.version} (${clientInfo.channel}; ${clientInfo.env})`;
}
function getClientHeader(apiUrl) {
    const clientInfo = getClientInfo(apiUrl);
    return clientInfoToHeader(clientInfo);
}
//# sourceMappingURL=client-info.js.map