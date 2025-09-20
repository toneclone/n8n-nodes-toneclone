/**
 * Jest test setup file
 * Configures global test environment for ToneClone n8n node tests
 */

// Mock environment variables for testing
process.env.NODE_ENV = 'test';

// Global test timeout
jest.setTimeout(10000);

// Mock console methods to reduce noise in tests
global.console = {
	...console,
	// Uncomment below lines to silence console output during tests
	// log: jest.fn(),
	// debug: jest.fn(),
	// info: jest.fn(),
	// warn: jest.fn(),
	// error: jest.fn(),
};