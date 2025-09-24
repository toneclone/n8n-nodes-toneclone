import type { INodePropertyOptions } from 'n8n-workflow';
import { ToneClone } from '../ToneClone.node';

describe('ToneClone Node', () => {
	let node: ToneClone;

	beforeEach(() => {
		node = new ToneClone();
	});

	describe('Node Instantiation', () => {
		test('should instantiate successfully', () => {
			expect(node).toBeDefined();
			expect(node).toBeInstanceOf(ToneClone);
		});

		test('should have description property', () => {
			expect(node.description).toBeDefined();
			expect(typeof node.description).toBe('object');
		});

		test('should have methods property', () => {
			expect(node.methods).toBeDefined();
			expect(typeof node.methods).toBe('object');
		});
	});

	describe('Node Description Configuration', () => {
		test('should have correct node metadata', () => {
			expect(node.description.displayName).toBe('ToneClone');
			expect(node.description.name).toBe('toneClone');
			expect(node.description.version).toBe(1);
			expect(node.description.group).toEqual(['output']);
		});

		test('should have proper branding', () => {
			expect(node.description.icon).toBe('file:toneclone.svg');
			expect(node.description.description).toContain('Write with AI in your voice and style');
		});

		test('should have correct connection configuration', () => {
			expect(node.description.inputs).toBeDefined();
			expect(node.description.outputs).toBeDefined();
			expect(Array.isArray(node.description.inputs)).toBe(true);
			expect(Array.isArray(node.description.outputs)).toBe(true);
		});

		test('should require tonecloneApi credentials', () => {
			expect(node.description.credentials).toBeDefined();
			expect(Array.isArray(node.description.credentials)).toBe(true);

			const credentials = node.description.credentials ?? [];
			expect(credentials.length).toBeGreaterThan(0);

			const credential = credentials[0];
			if (!credential) {
				throw new Error('tonecloneApi credential not found');
			}
			expect(credential.name).toBe('tonecloneApi');
			expect(credential.required).toBe(true);
		});

		test('should have requestDefaults configured', () => {
			expect(node.description.requestDefaults).toBeDefined();

			const requestDefaults = node.description.requestDefaults;
			if (!requestDefaults) {
				throw new Error('requestDefaults not configured');
			}
			expect(requestDefaults.baseURL).toBe('={{$credentials.apiUrl}}');
			// Should NOT have Content-Type in defaults (allows multipart uploads)
			expect(requestDefaults.headers).toBeUndefined();
		});
	});

	describe('Resource Configuration', () => {
		test('should have resource parameter', () => {
			const resourceParam = node.description.properties.find(prop => prop.name === 'resource');

			expect(resourceParam).toBeDefined();
			expect(resourceParam?.type).toBe('options');
			expect(resourceParam?.options).toBeDefined();
			expect(Array.isArray(resourceParam?.options)).toBe(true);
		});

		test('should have query and training resources', () => {
			const resourceParam = node.description.properties.find(prop => prop.name === 'resource');
			const options = (resourceParam?.options ?? []) as INodePropertyOptions[];

			const queryOption = options.find(opt => opt.value === 'query');
			const trainingOption = options.find(opt => opt.value === 'training');

			expect(queryOption).toBeDefined();
			if (!queryOption) {
				throw new Error('query option not found');
			}
			expect(queryOption.name).toBe('Write with Your Persona');

			expect(trainingOption).toBeDefined();
			if (!trainingOption) {
				throw new Error('training option not found');
			}
			expect(trainingOption.name).toBe('Training');
		});

		test('should default to query resource', () => {
			const resourceParam = node.description.properties.find(prop => prop.name === 'resource');
			expect(resourceParam?.default).toBe('query');
		});
	});

	describe('Load Options Methods', () => {
		test('should have loadOptions methods defined', () => {
			expect(node.methods.loadOptions).toBeDefined();
			expect(typeof node.methods.loadOptions).toBe('object');
		});

		test('should have getPersonas method', () => {
			expect(node.methods.loadOptions.getPersonas).toBeDefined();
			expect(typeof node.methods.loadOptions.getPersonas).toBe('function');
		});

		test('should have getKnowledgeCards method', () => {
			expect(node.methods.loadOptions.getKnowledgeCards).toBeDefined();
			expect(typeof node.methods.loadOptions.getKnowledgeCards).toBe('function');
		});
	});

	describe('Property Validation', () => {
		test('should have all required properties', () => {
			const properties = node.description.properties;
			expect(Array.isArray(properties)).toBe(true);
			expect(properties.length).toBeGreaterThan(0);
		});

		test('should have persona selection for both resources', () => {
			const personaParams = node.description.properties.filter(prop => prop.name === 'personaId');
			expect(personaParams.length).toBeGreaterThanOrEqual(1);

			const personaParam = personaParams[0];
			expect(personaParam.type).toBe('options');
			expect(personaParam.typeOptions?.loadOptionsMethod).toBe('getPersonas');
		});

		test('should have prompt parameter for writing with persona', () => {
			const promptParam = node.description.properties.find(prop => prop.name === 'prompt');
			expect(promptParam).toBeDefined();
			expect(promptParam?.type).toBe('string');
			expect(promptParam?.required).toBe(true);
		});

		test('should have knowledge cards parameter with multi-select', () => {
			const knowledgeParam = node.description.properties.find(prop => prop.name === 'knowledgeCardIds');
			expect(knowledgeParam).toBeDefined();
			expect(knowledgeParam?.type).toBe('multiOptions');
			expect(knowledgeParam?.typeOptions?.loadOptionsMethod).toBe('getKnowledgeCards');
			expect(knowledgeParam?.default).toEqual([]);
		});
	});

	describe('Node Compliance', () => {
		test('should have subtitle for debugging', () => {
			expect(node.description.subtitle).toBeDefined();
			expect(typeof node.description.subtitle).toBe('string');
		});

		test('should have defaults for initial state', () => {
			expect(node.description.defaults).toBeDefined();
			expect(node.description.defaults.name).toBe('ToneClone');
		});

		test('should have version specified', () => {
			expect(node.description.version).toBe(1);
		});
	});
});