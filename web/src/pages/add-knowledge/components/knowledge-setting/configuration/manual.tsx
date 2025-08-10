import {
  AutoKeywordsItem,
  AutoQuestionsItem,
} from '@/components/auto-keywords-item';
import LayoutRecognize from '@/components/layout-recognize';
import PageRank from '@/components/page-rank';
import ParseConfiguration from '@/components/parse-configuration';
import GraphRagItems from '@/components/parse-configuration/graph-rag-items';
import { TagItems } from '../tag-item';
import { ChunkMethodItem } from './common-item';

export function ManualConfiguration() {
  return (
    <>
      <ChunkMethodItem></ChunkMethodItem>
      <LayoutRecognize></LayoutRecognize>

      <PageRank></PageRank>

      <>
        <AutoKeywordsItem></AutoKeywordsItem>
        <AutoQuestionsItem></AutoQuestionsItem>
      </>

      <ParseConfiguration></ParseConfiguration>

      <GraphRagItems marginBottom></GraphRagItems>

      <TagItems></TagItems>
    </>
  );
}
