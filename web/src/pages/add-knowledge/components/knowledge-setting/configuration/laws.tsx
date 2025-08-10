import {
  AutoKeywordsItem,
  AutoQuestionsItem,
} from '@/components/auto-keywords-item';
import LayoutRecognize from '@/components/layout-recognize';
import PageRank from '@/components/page-rank';
import ParseConfiguration from '@/components/parse-configuration';
import GraphRagItems from '@/components/parse-configuration/graph-rag-items';
import { TagItems } from '../tag-item';
import { ChunkMethodItem, EmbeddingModelItem } from './common-item';

export function LawsConfiguration() {
  return (
    <>
      <ChunkMethodItem></ChunkMethodItem>
      <LayoutRecognize></LayoutRecognize>
      <EmbeddingModelItem></EmbeddingModelItem>
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
