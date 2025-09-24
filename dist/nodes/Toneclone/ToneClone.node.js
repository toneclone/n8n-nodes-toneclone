"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ToneClone = void 0;
const n8n_workflow_1 = require("n8n-workflow");
const query_1 = require("./resources/query");
const training_1 = require("./resources/training");
const client_info_1 = require("../../src/client-info");
function ensureJsonObject(data) {
    if (typeof data === 'string') {
        try {
            return JSON.parse(data);
        }
        catch {
            return { raw: data };
        }
    }
    return (data !== null && data !== void 0 ? data : {});
}
function tryParseJson(value) {
    try {
        return JSON.parse(value);
    }
    catch {
        return value;
    }
}
function extractFileId(payload) {
    const maybeDirect = payload.fileId;
    if (typeof maybeDirect === 'string') {
        return maybeDirect;
    }
    const maybeUpper = payload.FileID;
    if (typeof maybeUpper === 'string') {
        return maybeUpper;
    }
    const nested = payload.file;
    if (nested && typeof nested === 'object') {
        const nestedId = nested.fileId;
        if (typeof nestedId === 'string') {
            return nestedId;
        }
    }
    return undefined;
}
class ToneClone {
    constructor() {
        this.description = {
            displayName: 'ToneClone',
            name: 'toneClone',
            icon: 'file:toneclone.svg',
            group: ['output'],
            version: 1,
            subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
            description: 'Write with AI in your voice and style - Generate writing that sounds like you, not a robot',
            defaults: {
                name: 'ToneClone',
            },
            inputs: ["main"],
            outputs: ["main"],
            credentials: [
                {
                    name: 'tonecloneApi',
                    required: true,
                },
            ],
            requestDefaults: {
                baseURL: '={{$credentials.apiUrl}}',
            },
            properties: [
                {
                    displayName: 'Resource',
                    name: 'resource',
                    type: 'options',
                    noDataExpression: true,
                    options: [
                        {
                            name: 'Write with your persona',
                            value: 'query',
                            description: 'Write with your ToneClone persona',
                        },
                        {
                            name: 'Training',
                            value: 'training',
                            description: 'Submit content to train your personas',
                        },
                    ],
                    default: 'query',
                },
                ...query_1.queryDescription,
                ...training_1.trainingDescription,
            ],
        };
        this.methods = {
            loadOptions: {
                async getPersonas() {
                    try {
                        let credentials;
                        try {
                            credentials = await this.getCredentials('tonecloneApi');
                        }
                        catch (credError) {
                            return [{
                                    name: 'Please configure credentials first',
                                    value: '',
                                    description: 'Set up your ToneClone API credentials to load personas',
                                }];
                        }
                        if (!credentials) {
                            return [{
                                    name: 'Please configure credentials first',
                                    value: '',
                                    description: 'Set up your ToneClone API credentials to load personas',
                                }];
                        }
                        const apiKey = String(credentials.apiKey || credentials.api_key || credentials.key || '');
                        const apiUrl = String(credentials.apiUrl || credentials.api_url || credentials.url || 'https://api.toneclone.ai');
                        if (!apiKey || apiKey === 'your_api_key_here' || apiKey === 'undefined' || apiKey === 'null') {
                            return [{
                                    name: 'Please configure API key',
                                    value: '',
                                    description: `Set up your ToneClone API key to load personas. Current value: ${apiKey}`,
                                }];
                        }
                        const finalApiUrl = apiUrl.startsWith('http') ? apiUrl : `https://${apiUrl}`;
                        const headers = {
                            'X-Client': (0, client_info_1.getClientHeader)(finalApiUrl),
                        };
                        let userPersonas = [];
                        try {
                            const userPersonasResponse = await this.helpers.httpRequestWithAuthentication.call(this, 'tonecloneApi', {
                                method: 'GET',
                                url: '/personas',
                                baseURL: finalApiUrl,
                                headers,
                                json: true,
                            });
                            userPersonas = Array.isArray(userPersonasResponse) ? userPersonasResponse : [];
                        }
                        catch (userError) {
                            console.error('Failed to load user personas:', userError);
                        }
                        let builtInPersonas = [];
                        try {
                            const builtInResponse = await this.helpers.httpRequestWithAuthentication.call(this, 'tonecloneApi', {
                                method: 'GET',
                                url: '/personas/builtin',
                                baseURL: finalApiUrl,
                                headers,
                                json: true,
                            });
                            builtInPersonas = Array.isArray(builtInResponse) ? builtInResponse : [];
                        }
                        catch (builtInError) {
                            console.error('Failed to load built-in personas:', builtInError);
                        }
                        if (userPersonas.length === 0 && builtInPersonas.length === 0) {
                            throw new Error('No personas found. Please create a persona at https://app.toneclone.ai or check your API credentials.');
                        }
                        const markedBuiltInPersonas = builtInPersonas.map((persona) => ({
                            ...persona,
                            isBuiltIn: true,
                        }));
                        const allPersonas = [...userPersonas, ...markedBuiltInPersonas];
                        return allPersonas.map((persona) => ({
                            name: persona.name,
                            value: persona.personaId,
                            description: persona.isBuiltIn
                                ? 'Built-in persona'
                                : `Status: ${persona.trainingStatus || 'unknown'}`,
                        }));
                    }
                    catch (error) {
                        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
                        const errorDetails = error instanceof Error ? error.stack : String(error);
                        console.error('getPersonas error:', errorDetails);
                        throw new n8n_workflow_1.NodeApiError(this.getNode(), {
                            message: `Failed to load personas: ${errorMessage}`,
                            description: 'Please check your API credentials and ensure you have personas created at https://app.toneclone.ai',
                        });
                    }
                },
                async getKnowledgeCards() {
                    try {
                        let credentials;
                        try {
                            credentials = await this.getCredentials('tonecloneApi');
                        }
                        catch (credError) {
                            return [{
                                    name: 'Please configure credentials first',
                                    value: '',
                                    description: 'Set up your ToneClone API credentials to load knowledge cards',
                                }];
                        }
                        if (!credentials) {
                            return [{
                                    name: 'Please configure credentials first',
                                    value: '',
                                    description: 'Set up your ToneClone API credentials to load knowledge cards',
                                }];
                        }
                        const apiKey = String(credentials.apiKey || credentials.api_key || credentials.key || '');
                        const apiUrl = String(credentials.apiUrl || credentials.api_url || credentials.url || 'https://api.toneclone.ai');
                        if (!apiKey || apiKey === 'your_api_key_here' || apiKey === 'undefined' || apiKey === 'null') {
                            return [{
                                    name: 'Please configure API key',
                                    value: '',
                                    description: `Set up your ToneClone API key to load knowledge cards. Current value: ${apiKey}`,
                                }];
                        }
                        const finalApiUrl = apiUrl.startsWith('http') ? apiUrl : `https://${apiUrl}`;
                        const headers = {
                            'X-Client': (0, client_info_1.getClientHeader)(finalApiUrl),
                        };
                        const response = await this.helpers.httpRequestWithAuthentication.call(this, 'tonecloneApi', {
                            method: 'GET',
                            url: '/knowledge',
                            baseURL: finalApiUrl,
                            headers,
                            json: true,
                        });
                        const knowledgeCards = Array.isArray(response) ? response : [];
                        return knowledgeCards.map((card) => ({
                            name: card.name,
                            value: card.knowledgeCardId,
                            description: card.description || '',
                        }));
                    }
                    catch (error) {
                        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
                        const errorDetails = error instanceof Error ? error.stack : String(error);
                        console.error('getKnowledgeCards error:', errorDetails);
                        throw new n8n_workflow_1.NodeApiError(this.getNode(), {
                            message: `Failed to load knowledge cards: ${errorMessage}`,
                            description: 'Please check your API credentials and ensure you have knowledge cards created at https://app.toneclone.ai',
                        });
                    }
                },
            },
        };
    }
    async execute() {
        var _a, _b, _c, _d, _e, _f, _g;
        const items = this.getInputData();
        const returnData = [];
        for (let i = 0; i < items.length; i++) {
            const resource = this.getNodeParameter('resource', i);
            const operation = this.getNodeParameter('operation', i);
            try {
                if (resource === 'query' && operation === 'generate') {
                    const credentials = await this.getCredentials('tonecloneApi');
                    const personaId = this.getNodeParameter('personaId', i);
                    const prompt = this.getNodeParameter('prompt', i);
                    const knowledgeCardIdsRaw = this.getNodeParameter('knowledgeCardIds', i, []);
                    const knowledgeCardIds = Array.isArray(knowledgeCardIdsRaw)
                        ? knowledgeCardIdsRaw
                        : knowledgeCardIdsRaw
                            ? [knowledgeCardIdsRaw]
                            : [];
                    const additionalOptions = this.getNodeParameter('additionalOptions', i, {});
                    let isBuiltInPersona = false;
                    if (Array.isArray(knowledgeCardIds) && knowledgeCardIds.length > 0) {
                        try {
                            const builtInResponse = await this.helpers.httpRequestWithAuthentication.call(this, 'tonecloneApi', {
                                method: 'GET',
                                url: '/personas/builtin',
                                baseURL: credentials.apiUrl,
                                headers: {
                                    'X-Client': (0, client_info_1.getClientHeader)(credentials.apiUrl),
                                },
                                json: true,
                            });
                            const builtInList = Array.isArray(builtInResponse) ? builtInResponse : [];
                            isBuiltInPersona = builtInList.some((persona) => persona.personaId === personaId);
                        }
                        catch {
                            isBuiltInPersona = false;
                        }
                    }
                    const requestBody = {
                        personaId,
                        prompt,
                        streaming: false,
                    };
                    if (!isBuiltInPersona && Array.isArray(knowledgeCardIds) && knowledgeCardIds.length > 0) {
                        requestBody.knowledgeCardIds = knowledgeCardIds;
                    }
                    if (additionalOptions.context) {
                        requestBody.context = additionalOptions.context;
                    }
                    if (additionalOptions.formality !== undefined) {
                        requestBody.formality = additionalOptions.formality;
                    }
                    if (additionalOptions.readingLevel !== undefined) {
                        requestBody.readingLevel = additionalOptions.readingLevel;
                    }
                    if (additionalOptions.length !== undefined) {
                        requestBody.length = additionalOptions.length;
                    }
                    const response = await this.helpers.httpRequestWithAuthentication.call(this, 'tonecloneApi', {
                        method: 'POST',
                        url: '/query',
                        baseURL: credentials.apiUrl,
                        headers: {
                            'Content-Type': 'application/json',
                            'X-Client': (0, client_info_1.getClientHeader)(credentials.apiUrl),
                        },
                        body: requestBody,
                    });
                    const normalizedResponse = ensureJsonObject(response);
                    const candidateContent = (_b = (_a = normalizedResponse.content) !== null && _a !== void 0 ? _a : normalizedResponse.result) !== null && _b !== void 0 ? _b : normalizedResponse;
                    const parsedCandidate = typeof candidateContent === 'string' ? tryParseJson(candidateContent) : candidateContent;
                    let contentText;
                    let doneFlag;
                    if (typeof parsedCandidate === 'string') {
                        contentText = parsedCandidate;
                    }
                    else if (parsedCandidate && typeof parsedCandidate === 'object') {
                        const candidateObject = parsedCandidate;
                        const nestedContent = candidateObject.content;
                        if (typeof nestedContent === 'string') {
                            contentText = nestedContent;
                        }
                        else {
                            contentText = JSON.stringify(candidateObject);
                        }
                        if (typeof candidateObject.done === 'boolean') {
                            doneFlag = candidateObject.done;
                        }
                    }
                    else {
                        contentText = String(candidateContent !== null && candidateContent !== void 0 ? candidateContent : '');
                    }
                    const itemJson = {
                        content: contentText,
                        personaId,
                        prompt,
                        knowledgeCardIds: !isBuiltInPersona ? knowledgeCardIds : [],
                        isBuiltInPersona,
                        ...additionalOptions,
                    };
                    if (doneFlag !== undefined) {
                        itemJson.done = doneFlag;
                    }
                    returnData.push({
                        json: itemJson,
                        pairedItem: { item: i },
                    });
                }
                else if (resource === 'training' && operation === 'uploadText') {
                    const credentials = await this.getCredentials('tonecloneApi');
                    const personaId = this.getNodeParameter('personaId', i);
                    const content = this.getNodeParameter('content', i);
                    const filename = this.getNodeParameter('filename', i);
                    const requestBody = {
                        content,
                        filename: filename.endsWith('.txt') ? filename : `${filename}.txt`,
                        source: 'n8n',
                    };
                    const uploadResponse = await this.helpers.httpRequestWithAuthentication.call(this, 'tonecloneApi', {
                        method: 'POST',
                        url: '/files/text',
                        baseURL: credentials.apiUrl,
                        headers: {
                            'Content-Type': 'application/json',
                            'X-Client': (0, client_info_1.getClientHeader)(credentials.apiUrl),
                        },
                        body: requestBody,
                        json: true,
                    });
                    const uploadJson = ensureJsonObject(uploadResponse);
                    const fileId = extractFileId(uploadJson);
                    if (!fileId) {
                        const detail = (_d = (_c = uploadJson.error) !== null && _c !== void 0 ? _c : uploadJson.message) !== null && _d !== void 0 ? _d : uploadJson.raw;
                        throw new n8n_workflow_1.NodeApiError(this.getNode(), {
                            message: 'ToneClone API did not return a fileId for uploaded text.',
                            description: detail,
                        });
                    }
                    await this.helpers.httpRequestWithAuthentication.call(this, 'tonecloneApi', {
                        method: 'POST',
                        url: `/personas/${personaId}/files`,
                        baseURL: credentials.apiUrl,
                        headers: {
                            'Content-Type': 'application/json',
                            'X-Client': (0, client_info_1.getClientHeader)(credentials.apiUrl),
                        },
                        body: {
                            fileIds: [fileId],
                        },
                        json: true,
                    });
                    const cleanResponse = { ...uploadJson };
                    delete cleanResponse.PK;
                    delete cleanResponse.SK;
                    delete cleanResponse.userId;
                    delete cleanResponse.s3Key;
                    returnData.push({
                        json: {
                            ...cleanResponse,
                            personaId,
                            operation: 'uploadText',
                            associated: true,
                        },
                        pairedItem: { item: i },
                    });
                }
                else if (resource === 'training' && operation === 'uploadFile') {
                    const credentials = await this.getCredentials('tonecloneApi');
                    const personaId = this.getNodeParameter('personaId', i);
                    const binaryPropertyName = this.getNodeParameter('binaryProperty', i);
                    const binaryData = (_e = items[i].binary) === null || _e === void 0 ? void 0 : _e[binaryPropertyName];
                    if (!binaryData) {
                        throw new n8n_workflow_1.NodeApiError(this.getNode(), {
                            message: `No binary data found in property "${binaryPropertyName}"`,
                        });
                    }
                    const buffer = await this.helpers.getBinaryDataBuffer(i, binaryPropertyName);
                    const formData = {
                        file: {
                            value: buffer,
                            options: {
                                filename: binaryData.fileName || 'upload',
                                contentType: binaryData.mimeType || 'application/octet-stream',
                            },
                        },
                        source: 'n8n',
                    };
                    const uploadResponse = await this.helpers.requestWithAuthentication.call(this, 'tonecloneApi', {
                        method: 'POST',
                        url: `${credentials.apiUrl}/files`,
                        headers: {
                            'X-Client': (0, client_info_1.getClientHeader)(credentials.apiUrl),
                        },
                        formData,
                        json: true,
                    });
                    const uploadJson = ensureJsonObject(uploadResponse);
                    const fileId = extractFileId(uploadJson);
                    if (!fileId) {
                        const detail = (_g = (_f = uploadJson.error) !== null && _f !== void 0 ? _f : uploadJson.message) !== null && _g !== void 0 ? _g : uploadJson.raw;
                        throw new n8n_workflow_1.NodeApiError(this.getNode(), {
                            message: 'ToneClone API did not return a fileId for uploaded binary data.',
                            description: detail,
                        });
                    }
                    await this.helpers.httpRequestWithAuthentication.call(this, 'tonecloneApi', {
                        method: 'POST',
                        url: `/personas/${personaId}/files`,
                        baseURL: credentials.apiUrl,
                        headers: {
                            'Content-Type': 'application/json',
                            'X-Client': (0, client_info_1.getClientHeader)(credentials.apiUrl),
                        },
                        body: {
                            fileIds: [fileId],
                        },
                        json: true,
                    });
                    const cleanResponse = { ...uploadJson };
                    delete cleanResponse.PK;
                    delete cleanResponse.SK;
                    delete cleanResponse.userId;
                    delete cleanResponse.s3Key;
                    returnData.push({
                        json: {
                            ...cleanResponse,
                            personaId,
                            operation: 'uploadFile',
                            associated: true,
                        },
                        pairedItem: { item: i },
                    });
                }
                else {
                    throw new n8n_workflow_1.NodeApiError(this.getNode(), {
                        message: `Unsupported operation: ${resource}.${operation}`,
                    });
                }
            }
            catch (error) {
                if (this.continueOnFail()) {
                    returnData.push({
                        json: {
                            error: error.message,
                        },
                        pairedItem: { item: i },
                    });
                    continue;
                }
                throw error;
            }
        }
        return [returnData];
    }
}
exports.ToneClone = ToneClone;
//# sourceMappingURL=ToneClone.node.js.map