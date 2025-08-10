import PageRank from '@/components/page-rank';
import { TagItems } from '../tag-item';
import { ChunkMethodItem } from './common-item';

export function QAConfiguration() {
  return (
    <>
      <ChunkMethodItem></ChunkMethodItem>

      <PageRank></PageRank>

      <TagItems></TagItems>
    </>
  );
}
