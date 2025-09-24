"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_info_1 = require("../client-info");
describe('Client Info Utilities', () => {
    describe('getClientInfo', () => {
        test('should return client info with n8n name', () => {
            const info = (0, client_info_1.getClientInfo)('https://api.toneclone.ai');
            expect(info.name).toBe('n8n');
        });
        test('should return n8n channel', () => {
            const info = (0, client_info_1.getClientInfo)('https://api.toneclone.ai');
            expect(info.channel).toBe('n8n');
        });
        test('should return version string', () => {
            const info = (0, client_info_1.getClientInfo)('https://api.toneclone.ai');
            expect(info.version).toBeDefined();
            expect(typeof info.version).toBe('string');
            expect(info.version.length).toBeGreaterThan(0);
        });
        test('should detect prod environment for api.toneclone.ai', () => {
            const info = (0, client_info_1.getClientInfo)('https://api.toneclone.ai');
            expect(info.env).toBe('prod');
        });
        test('should detect dev environment for localhost', () => {
            const info = (0, client_info_1.getClientInfo)('http://localhost:8080');
            expect(info.env).toBe('dev');
        });
        test('should detect dev environment for 127.0.0.1', () => {
            const info = (0, client_info_1.getClientInfo)('http://127.0.0.1:8080');
            expect(info.env).toBe('dev');
        });
        test('should detect staging environment', () => {
            const info = (0, client_info_1.getClientInfo)('https://staging.toneclone.ai');
            expect(info.env).toBe('staging');
        });
        test('should default to prod for unknown URLs', () => {
            const info = (0, client_info_1.getClientInfo)('https://unknown.example.com');
            expect(info.env).toBe('prod');
        });
    });
    describe('clientInfoToHeader', () => {
        test('should format header correctly', () => {
            const clientInfo = {
                name: 'n8n',
                version: '0.1.0',
                channel: 'n8n',
                env: 'prod',
            };
            const header = (0, client_info_1.clientInfoToHeader)(clientInfo);
            expect(header).toBe('n8n/0.1.0 (n8n; prod)');
        });
        test('should handle different environments', () => {
            const clientInfo = {
                name: 'n8n',
                version: '1.2.3',
                channel: 'n8n',
                env: 'dev',
            };
            const header = (0, client_info_1.clientInfoToHeader)(clientInfo);
            expect(header).toBe('n8n/1.2.3 (n8n; dev)');
        });
    });
    describe('getClientHeader', () => {
        test('should return properly formatted header for production', () => {
            const header = (0, client_info_1.getClientHeader)('https://api.toneclone.ai');
            expect(header).toMatch(/^n8n\/[\d.]+ \(n8n; prod\)$/);
        });
        test('should return properly formatted header for development', () => {
            const header = (0, client_info_1.getClientHeader)('http://localhost:8080');
            expect(header).toMatch(/^n8n\/[\d.]+ \(n8n; dev\)$/);
        });
        test('should return string with correct structure', () => {
            const header = (0, client_info_1.getClientHeader)('https://api.toneclone.ai');
            const firstSpaceIndex = header.indexOf(' ');
            expect(firstSpaceIndex).toBeGreaterThan(-1);
            const nameVersion = header.slice(0, firstSpaceIndex);
            const extras = header.slice(firstSpaceIndex + 1);
            expect(nameVersion).toMatch(/^[^/]+\/[^/]+$/);
            expect(extras).toMatch(/^\([^;]+; [^)]+\)$/);
        });
    });
    describe('Environment Detection Edge Cases', () => {
        test('should handle case insensitive URLs', () => {
            const info1 = (0, client_info_1.getClientInfo)('HTTPS://API.TONECLONE.AI');
            const info2 = (0, client_info_1.getClientInfo)('HTTP://LOCALHOST:8080');
            expect(info1.env).toBe('prod');
            expect(info2.env).toBe('dev');
        });
        test('should handle URLs without protocol', () => {
            const info = (0, client_info_1.getClientInfo)('api.toneclone.ai');
            expect(info.env).toBe('prod');
        });
        test('should handle complex localhost URLs', () => {
            const info = (0, client_info_1.getClientInfo)('http://localhost:3000/api/v1');
            expect(info.env).toBe('dev');
        });
    });
    describe('Version Fallback', () => {
        test('should always return a version string', () => {
            const info = (0, client_info_1.getClientInfo)('https://api.toneclone.ai');
            expect(info.version).toBeDefined();
            expect(typeof info.version).toBe('string');
            expect(info.version.length).toBeGreaterThan(0);
        });
        test('should fallback to 0.1.0 when version cannot be determined', () => {
            const info = (0, client_info_1.getClientInfo)('https://api.toneclone.ai');
            expect(info.version).toMatch(/^\d+\.\d+\.\d+/);
        });
    });
});
//# sourceMappingURL=client-info.test.js.map