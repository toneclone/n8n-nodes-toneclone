import type { INodeProperties } from 'n8n-workflow';

export const queryDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['query'],
			},
		},
		options: [
			{
				name: 'Write with Your Persona',
				value: 'generate',
				action: 'Write with your persona',
				description: 'Write with your ToneClone persona',
				routing: {
					request: {
						method: 'POST',
						url: '/query',
						headers: {
							'Content-Type': 'application/json',
						},
						body: {
							personaId: '={{$parameter.personaId}}',
							prompt: '={{$parameter.prompt}}',
							knowledgeCardIds: '={{$parameter.knowledgeCardIds}}',
							context: '={{$parameter.additionalOptions.context}}',
							formality: '={{$parameter.additionalOptions.formality}}',
							readingLevel: '={{$parameter.additionalOptions.readingLevel}}',
							length: '={{$parameter.additionalOptions.length}}',
							streaming: false,
						},
					},
				},
			},
		],
		default: 'generate',
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
				resource: ['query'],
				operation: ['generate'],
			},
		},
		default: '',
		description: 'Select the ToneClone persona to use for writing. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
	},
	{
		displayName: 'Prompt',
		name: 'prompt',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['query'],
				operation: ['generate'],
			},
		},
		default: '',
		description: 'The prompt or instruction for what to write',
		placeholder: 'Write a professional email to follow up on our meeting...',
	},
	{
		displayName: 'Knowledge Card Names or IDs',
		name: 'knowledgeCardIds',
		type: 'multiOptions',
		typeOptions: {
			loadOptionsMethod: 'getKnowledgeCards',
		},
		displayOptions: {
			show: {
				resource: ['query'],
				operation: ['generate'],
			},
		},
		default: [],
		description: 'Select additional context from your knowledge cards (0, 1, or multiple). Choose from the list, or specify IDs using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
	},
	{
		displayName: 'Additional Options',
		name: 'additionalOptions',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: ['query'],
				operation: ['generate'],
			},
		},
		options: [
			{
				displayName: 'Context',
				name: 'context',
				type: 'string',
				typeOptions: {
					rows: 3,
				},
				default: '',
				description: 'Additional context for the writing',
				placeholder: 'We discussed quarterly goals and budget allocation...',
			},
		],
	},
];