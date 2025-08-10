import PageRank from '@/components/page-rank';
import { TagItems } from '../tag-item';
import { ChunkMethodItem, EmbeddingModelItem } from './common-item';

export function ResumeConfiguration() {
  return (
    <>
      <ChunkMethodItem></ChunkMethodItem>
      <EmbeddingModelItem></EmbeddingModelItem>
      <PageRank></PageRank>

      <TagItems></TagItems>
    </>
  );
}
