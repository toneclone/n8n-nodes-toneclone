"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TonecloneApi = void 0;
class TonecloneApi {
    constructor() {
        this.name = 'tonecloneApi';
        this.displayName = 'ToneClone API';
        this.documentationUrl = 'https://docs.toneclone.ai/api/authentication';
        this.properties = [
            {
                displayName: 'API Key',
                name: 'apiKey',
                type: 'string',
                typeOptions: {
                    password: true,
                },
                default: '',
                required: true,
                description: 'Your ToneClone API key (starts with tc_)',
            },
            {
                displayName: 'API URL',
                name: 'apiUrl',
                type: 'string',
                default: 'https://api.toneclone.ai',
                description: 'ToneClone API base URL',
            },
        ];
        this.authenticate = {
            type: 'generic',
            properties: {
                headers: {
                    'Authorization': '=Bearer {{$credentials.apiKey}}',
                },
            },
        };
        this.test = {
            request: {
                baseURL: '={{$credentials.apiUrl}}',
                url: '/user',
                method: 'GET',
            },
        };
    }
}
exports.TonecloneApi = TonecloneApi;
//# sourceMappingURL=TonecloneApi.credentials.js.map