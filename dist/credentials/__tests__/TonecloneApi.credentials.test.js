"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const TonecloneApi_credentials_1 = require("../TonecloneApi.credentials");
describe('TonecloneApi Credentials', () => {
    let credentials;
    beforeEach(() => {
        credentials = new TonecloneApi_credentials_1.TonecloneApi();
    });
    describe('Basic Configuration', () => {
        test('should have correct credential name', () => {
            expect(credentials.name).toBe('tonecloneApi');
        });
        test('should have correct display name', () => {
            expect(credentials.displayName).toBe('ToneClone API');
        });
        test('should have documentation URL', () => {
            expect(credentials.documentationUrl).toBe('https://docs.toneclone.ai/api/authentication');
        });
    });
    describe('Properties Configuration', () => {
        test('should have required properties defined', () => {
            expect(credentials.properties).toBeDefined();
            expect(Array.isArray(credentials.properties)).toBe(true);
            expect(credentials.properties.length).toBe(2);
        });
        test('should have API Key property configured correctly', () => {
            var _a;
            const apiKeyProperty = credentials.properties.find(prop => prop.name === 'apiKey');
            expect(apiKeyProperty).toBeDefined();
            expect(apiKeyProperty === null || apiKeyProperty === void 0 ? void 0 : apiKeyProperty.displayName).toBe('API Key');
            expect(apiKeyProperty === null || apiKeyProperty === void 0 ? void 0 : apiKeyProperty.type).toBe('string');
            expect(apiKeyProperty === null || apiKeyProperty === void 0 ? void 0 : apiKeyProperty.required).toBe(true);
            expect((_a = apiKeyProperty === null || apiKeyProperty === void 0 ? void 0 : apiKeyProperty.typeOptions) === null || _a === void 0 ? void 0 : _a.password).toBe(true);
            expect(apiKeyProperty === null || apiKeyProperty === void 0 ? void 0 : apiKeyProperty.description).toContain('tc_');
        });
        test('should have API URL property configured correctly', () => {
            const apiUrlProperty = credentials.properties.find(prop => prop.name === 'apiUrl');
            expect(apiUrlProperty).toBeDefined();
            expect(apiUrlProperty === null || apiUrlProperty === void 0 ? void 0 : apiUrlProperty.displayName).toBe('API URL');
            expect(apiUrlProperty === null || apiUrlProperty === void 0 ? void 0 : apiUrlProperty.type).toBe('string');
            expect(apiUrlProperty === null || apiUrlProperty === void 0 ? void 0 : apiUrlProperty.default).toBe('https://api.toneclone.ai');
        });
    });
    describe('Authentication Configuration', () => {
        test('should have generic authentication type', () => {
            expect(credentials.authenticate).toBeDefined();
            expect(credentials.authenticate.type).toBe('generic');
        });
        test('should configure Bearer token authentication', () => {
            var _a;
            expect(credentials.authenticate.properties).toBeDefined();
            expect(credentials.authenticate.properties.headers).toBeDefined();
            expect((_a = credentials.authenticate.properties.headers) === null || _a === void 0 ? void 0 : _a['Authorization']).toBe('=Bearer {{$credentials.apiKey}}');
        });
    });
    describe('Credential Test Configuration', () => {
        test('should have test request configured', () => {
            expect(credentials.test).toBeDefined();
            expect(credentials.test.request).toBeDefined();
        });
        test('should test against user endpoint', () => {
            expect(credentials.test.request.baseURL).toBe('={{$credentials.apiUrl}}');
            expect(credentials.test.request.url).toBe('/user');
            expect(credentials.test.request.method).toBe('GET');
        });
    });
    describe('Security Validation', () => {
        test('should require API key', () => {
            const apiKeyProperty = credentials.properties.find(prop => prop.name === 'apiKey');
            expect(apiKeyProperty === null || apiKeyProperty === void 0 ? void 0 : apiKeyProperty.required).toBe(true);
        });
        test('should mask API key input', () => {
            var _a;
            const apiKeyProperty = credentials.properties.find(prop => prop.name === 'apiKey');
            expect((_a = apiKeyProperty === null || apiKeyProperty === void 0 ? void 0 : apiKeyProperty.typeOptions) === null || _a === void 0 ? void 0 : _a.password).toBe(true);
        });
        test('should use secure Bearer token format', () => {
            var _a;
            const authHeader = (_a = credentials.authenticate.properties.headers) === null || _a === void 0 ? void 0 : _a['Authorization'];
            expect(authHeader).toMatch(/Bearer.*apiKey/);
        });
    });
});
//# sourceMappingURL=TonecloneApi.credentials.test.js.map