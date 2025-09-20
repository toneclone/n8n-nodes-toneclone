import {
	NodeConnectionType,
	NodeApiError,
	type IExecuteFunctions,
	type ILoadOptionsFunctions,
	type IDataObject,
	type INodeExecutionData,
	type INodePropertyOptions,
	type INodeType,
	type INodeTypeDescription,
	type JsonObject,
} from 'n8n-workflow';
import { queryDescription } from './resources/query';
import { trainingDescription } from './resources/training';
import { getClientHeader } from '../../src/client-info';

function ensureJsonObject(data: unknown): JsonObject {
	if (typeof data === 'string') {
		try {
			return JSON.parse(data) as JsonObject;
		} catch {
			return { raw: data } as JsonObject;
		}
	}
	return (data ?? {}) as JsonObject;
}

function tryParseJson(value: string): unknown {
	try {
		return JSON.parse(value);
	} catch {
		return value;
	}
}

function extractFileId(payload: JsonObject): string | undefined {
	const maybeDirect = payload.fileId;
	if (typeof maybeDirect === 'string') {
		return maybeDirect;
	}
	const maybeUpper = (payload as { FileID?: unknown }).FileID;
	if (typeof maybeUpper === 'string') {
		return maybeUpper;
	}
	const nested = payload.file as JsonObject | undefined;
	if (nested && typeof nested === 'object') {
		const nestedId = (nested as { fileId?: unknown }).fileId;
		if (typeof nestedId === 'string') {
			return nestedId;
		}
	}
	return undefined;
}

export class ToneClone implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'ToneClone',
		name: 'toneClone',
		icon: 'file:toneclone.svg',
		group: ['output'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Write with AI in your voice and style - Generate content that sounds like you, not a robot',
		defaults: {
			name: 'ToneClone',
		},
		inputs: [NodeConnectionType.Main],
		outputs: [NodeConnectionType.Main],
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
						name: 'Content Generation',
						value: 'query',
						description: 'Generate content using your writing personas',
					},
					{
						name: 'Training',
						value: 'training',
						description: 'Submit content to train your personas',
					},
				],
				default: 'query',
			},
			...queryDescription,
			...trainingDescription,
		],
	};

	methods = {
		loadOptions: {
			async getPersonas(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const credentials = await this.getCredentials('tonecloneApi');
				const headers = {
					'X-Client': getClientHeader(credentials.apiUrl as string),
				};

				try {
					const userPersonasResponse = await this.helpers.httpRequestWithAuthentication.call(
						this,
						'tonecloneApi',
						{
							method: 'GET',
							url: '/personas',
							headers,
							json: true,
						},
					);

					const userPersonas = Array.isArray(userPersonasResponse) ? userPersonasResponse : [];

					let builtInPersonas: { name: string; personaId: string }[] = [];
					try {
						const builtInResponse = await this.helpers.httpRequestWithAuthentication.call(
							this,
							'tonecloneApi',
							{
								method: 'GET',
								url: '/personas/builtin',
								headers,
								json: true,
							},
						);
						builtInPersonas = Array.isArray(builtInResponse) ? builtInResponse : [];
					} catch {
						// Built-in personas are optional; ignore lookup failures.
					}

					const markedBuiltInPersonas = builtInPersonas.map((persona: { name: string; personaId: string }) => ({
						...persona,
						isBuiltIn: true,
					}));
					const allPersonas = [...userPersonas, ...markedBuiltInPersonas];

					return allPersonas.map(
						(persona: { name: string; personaId: string; isBuiltIn?: boolean; trainingStatus?: string }) => ({
							name: persona.name,
							value: persona.personaId,
							description: persona.isBuiltIn
								? 'Built-in persona'
								: `Status: ${persona.trainingStatus || 'unknown'}`,
						}),
					);
				} catch (error) {
					throw new NodeApiError(this.getNode(), {
						message: `Failed to load personas: ${(error as Error).message}`,
					} as JsonObject);
				}
			},

			async getKnowledgeCards(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const credentials = await this.getCredentials('tonecloneApi');
				const headers = {
					'X-Client': getClientHeader(credentials.apiUrl as string),
				};

				try {
					const response = await this.helpers.httpRequestWithAuthentication.call(this, 'tonecloneApi', {
						method: 'GET',
						url: '/knowledge',
						headers,
						json: true,
					});

					const knowledgeCards = Array.isArray(response) ? response : [];

					return knowledgeCards.map((card: { name: string; knowledgeCardId: string; description?: string }) => ({
						name: card.name,
						value: card.knowledgeCardId,
						description: card.description || '',
					}));
				} catch (error) {
					throw new NodeApiError(this.getNode(), {
						message: `Failed to load knowledge cards: ${(error as Error).message}`,
					} as JsonObject);
				}
			},
		},
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let i = 0; i < items.length; i++) {
			const resource = this.getNodeParameter('resource', i) as string;
			const operation = this.getNodeParameter('operation', i) as string;

			try {
				if (resource === 'query' && operation === 'generate') {
					const credentials = await this.getCredentials('tonecloneApi');
					const personaId = this.getNodeParameter('personaId', i) as string;
					const prompt = this.getNodeParameter('prompt', i) as string;
					const knowledgeCardIdsRaw = this.getNodeParameter('knowledgeCardIds', i, []) as string[] | string;
					const knowledgeCardIds = Array.isArray(knowledgeCardIdsRaw)
						? knowledgeCardIdsRaw
						: knowledgeCardIdsRaw
							? [knowledgeCardIdsRaw]
							: [];
					const additionalOptions = this.getNodeParameter('additionalOptions', i, {}) as {
						context?: string;
						formality?: number;
						readingLevel?: number;
						length?: number;
					};

					let isBuiltInPersona = false;
					if (Array.isArray(knowledgeCardIds) && knowledgeCardIds.length > 0) {
						try {
							const builtInResponse = await this.helpers.httpRequestWithAuthentication.call(
								this,
								'tonecloneApi',
								{
									method: 'GET',
									url: '/personas/builtin',
									headers: {
										'X-Client': getClientHeader(credentials.apiUrl as string),
									},
									json: true,
								},
							);
							const builtInList = Array.isArray(builtInResponse) ? builtInResponse : [];
							isBuiltInPersona = builtInList.some((persona: { personaId: string }) => persona.personaId === personaId);
						} catch {
							isBuiltInPersona = false;
						}
					}

					const requestBody: Record<string, unknown> = {
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
						headers: {
							'Content-Type': 'application/json',
							'X-Client': getClientHeader(credentials.apiUrl as string),
						},
						body: requestBody,
					});

					const normalizedResponse = ensureJsonObject(response);
					const candidateContent = normalizedResponse.content ?? normalizedResponse.result ?? normalizedResponse;
					const parsedCandidate = typeof candidateContent === 'string' ? tryParseJson(candidateContent) : candidateContent;
					let contentText: string;
					let doneFlag: boolean | undefined;

					if (typeof parsedCandidate === 'string') {
						contentText = parsedCandidate;
					} else if (parsedCandidate && typeof parsedCandidate === 'object') {
						const candidateObject = parsedCandidate as JsonObject;
						const nestedContent = candidateObject.content;
						if (typeof nestedContent === 'string') {
							contentText = nestedContent;
						} else {
							contentText = JSON.stringify(candidateObject);
						}
						if (typeof candidateObject.done === 'boolean') {
							doneFlag = candidateObject.done;
						}
					} else {
						contentText = String(candidateContent ?? '');
					}

					const itemJson: JsonObject = {
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
				} else if (resource === 'training' && operation === 'uploadText') {
					const credentials = await this.getCredentials('tonecloneApi');

					const personaId = this.getNodeParameter('personaId', i) as string;
					const content = this.getNodeParameter('content', i) as string;
					const filename = this.getNodeParameter('filename', i) as string;

					const requestBody = {
						content,
						filename: filename.endsWith('.txt') ? filename : `${filename}.txt`,
						source: 'n8n',
					};

					const uploadResponse = await this.helpers.httpRequestWithAuthentication.call(this, 'tonecloneApi', {
						method: 'POST',
						url: '/files/text',
						headers: {
							'Content-Type': 'application/json',
							'X-Client': getClientHeader(credentials.apiUrl as string),
						},
						body: requestBody,
						json: true,
					});

					const uploadJson = ensureJsonObject(uploadResponse);
					const fileId = extractFileId(uploadJson);
					if (!fileId) {
						const detail = (uploadJson.error as string) ?? (uploadJson.message as string) ?? (uploadJson.raw as string);
						throw new NodeApiError(this.getNode(), {
							message: 'ToneClone API did not return a fileId for uploaded text.',
							description: detail,
						} as JsonObject);
					}

					await this.helpers.httpRequestWithAuthentication.call(this, 'tonecloneApi', {
						method: 'POST',
						url: `/personas/${personaId}/files`,
						headers: {
							'Content-Type': 'application/json',
							'X-Client': getClientHeader(credentials.apiUrl as string),
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
				} else if (resource === 'training' && operation === 'uploadFile') {
					const credentials = await this.getCredentials('tonecloneApi');

					const personaId = this.getNodeParameter('personaId', i) as string;
					const binaryPropertyName = this.getNodeParameter('binaryProperty', i) as string;

					const binaryData = items[i].binary?.[binaryPropertyName];
					if (!binaryData) {
						throw new NodeApiError(this.getNode(), {
							message: `No binary data found in property "${binaryPropertyName}"`,
						} as JsonObject);
					}

					const buffer = await this.helpers.getBinaryDataBuffer(i, binaryPropertyName);

					const formData: IDataObject = {
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
							'X-Client': getClientHeader(credentials.apiUrl as string),
						},
						formData,
						json: true,
					});

					const uploadJson = ensureJsonObject(uploadResponse);
					const fileId = extractFileId(uploadJson);
					if (!fileId) {
						const detail = (uploadJson.error as string) ?? (uploadJson.message as string) ?? (uploadJson.raw as string);
						throw new NodeApiError(this.getNode(), {
							message: 'ToneClone API did not return a fileId for uploaded binary data.',
							description: detail,
						} as JsonObject);
					}

					await this.helpers.httpRequestWithAuthentication.call(this, 'tonecloneApi', {
						method: 'POST',
						url: `/personas/${personaId}/files`,
						headers: {
							'Content-Type': 'application/json',
							'X-Client': getClientHeader(credentials.apiUrl as string),
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
				} else {
					throw new NodeApiError(this.getNode(), {
						message: `Unsupported operation: ${resource}.${operation}`,
					} as JsonObject);
				}
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: {
							error: (error as Error).message,
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
