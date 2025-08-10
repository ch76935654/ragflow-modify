import { KnowledgeRouteKey } from '@/constants/knowledge';

export const routeMap = {
  [KnowledgeRouteKey.Dataset]: 'Dataset',
  [KnowledgeRouteKey.Configuration]: 'Configuration',
  [KnowledgeRouteKey.Testing]: 'Testing', // 添加这一行
};

export enum KnowledgeDatasetRouteKey {
  Chunk = 'chunk',
  File = 'file',
  Testing = 'testing',
}

export const datasetRouteMap = {
  [KnowledgeDatasetRouteKey.Chunk]: 'Chunk',
  [KnowledgeDatasetRouteKey.File]: 'File Upload',
};

export * from '@/constants/knowledge';

export const TagRenameId = 'tagRename';
