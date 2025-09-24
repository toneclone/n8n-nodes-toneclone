import { type IExecuteFunctions, type ILoadOptionsFunctions, type INodeExecutionData, type INodePropertyOptions, type INodeType, type INodeTypeDescription } from 'n8n-workflow';
export declare class ToneClone implements INodeType {
    description: INodeTypeDescription;
    methods: {
        loadOptions: {
            getPersonas(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]>;
            getKnowledgeCards(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]>;
        };
    };
    execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]>;
}
