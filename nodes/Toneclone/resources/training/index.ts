import type { IExecuteSingleFunctions, IHttpRequestOptions, INodeProperties } from 'n8n-workflow';
import { NodeApiError } from 'n8n-workflow';

import { getClientHeader } from '../../../../src/client-info';

async function addClientHeader(this: IExecuteSingleFunctions, requestOptions: IHttpRequestOptions): Promise<IHttpRequestOptions> {
	const credentials = await this.getCredentials('tonecloneApi');
	requestOptions.headers = {
		...requestOptions.headers,
		'X-Client': getClientHeader(credentials.apiUrl as string),
	};
	return requestOptions;
}

async function prepareTrainingFileUpload(this: IExecuteSingleFunctions, requestOptions: IHttpRequestOptions): Promise<IHttpRequestOptions> {
	const itemIndex = this.getItemIndex();
	const rawBinaryProperty = this.getNodeParameter('binaryProperty');
	const personaId = this.getNodeParameter('personaId') as string;
	const binaryProperty = typeof rawBinaryProperty === 'string' ? rawBinaryProperty : String(rawBinaryProperty);

	let binaryData;
	try {
		binaryData = this.helpers.assertBinaryData(binaryProperty, itemIndex);
	} catch (error) {
		throw new NodeApiError(this.getNode(), error, { itemIndex });
	}

	const fileBuffer = await this.helpers.getBinaryDataBuffer(binaryProperty, itemIndex);

	const requestWithFormData = requestOptions as IHttpRequestOptions & { formData?: Record<string, unknown> };
	requestWithFormData.formData = {
		personaId,
		source: 'n8n',
		file: {
			value: fileBuffer,
			options: {
				filename: binaryData.fileName ?? 'upload',
				contentType: binaryData.mimeType ?? 'application/octet-stream',
			},
		},
	};

	return addClientHeader.call(this, requestWithFormData);
}

export const trainingDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['training'],
			},
		},
		options: [
			{
				name: 'Upload Text',
				value: 'uploadText',
				action: 'Upload text for training',
				description: 'Upload text content for persona training',
				routing: {
					request: {
						method: 'POST',
						url: '/files/text',
						headers: {
							'Content-Type': 'application/json',
						},
						body: {
							content: '={{$parameter.content}}',
							filename: '={{$parameter.filename}}',
							personaId: '={{$parameter.personaId}}',
							source: 'n8n',
						},
					},
					send: {
						preSend: [addClientHeader],
					},
				},
			},
			{
				name: 'Upload File',
				value: 'uploadFile',
				action: 'Upload file for training',
				description: 'Upload binary files (documents, text files, etc.)',
				routing: {
					request: {
						method: 'POST',
						url: '/files',
					},
					send: {
						preSend: [prepareTrainingFileUpload],
					},
				},
			},
		],
		default: 'uploadText',
	},
	{
		displayName: 'Persona Name or ID',
		name: 'personaId',
		type: 'options',
		required: true,
		typeOptions: {
			loadOptionsMethod: 'getPersonas',
		},
		displayOptions: {
			show: {
				resource: ['training'],
			},
		},
		default: '',
		description: 'Select the persona to train with this content (built-in personas cannot be trained). Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
	},
	{
		displayName: 'Content',
		name: 'content',
		type: 'string',
		required: true,
		typeOptions: {
			rows: 5,
		},
		displayOptions: {
			show: {
				resource: ['training'],
				operation: ['uploadText'],
			},
		},
		default: '',
		description: 'The text content to upload for training',
		placeholder: 'Enter the text content you want to use for training your persona...',
	},
	{
		displayName: 'Filename',
		name: 'filename',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['training'],
				operation: ['uploadText'],
			},
		},
		default: '',
		description: 'Name for the training file',
		placeholder: 'my-training-content',
	},
	{
		displayName: 'Input Binary Field',
		name: 'binaryProperty',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['training'],
				operation: ['uploadFile'],
			},
		},
		default: 'data',
		description: 'The name of the input binary field containing the file to upload',
	},
];
