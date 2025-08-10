import { DocumentParserType } from '@/constants/knowledge';
import { useHandleChunkMethodSelectChange } from '@/hooks/logic-hooks';
import { useSelectParserList } from '@/hooks/user-setting-hooks';
import { mapParserListLabels } from '@/pages/add-knowledge/utils/parser-label-map';
import { FormInstance } from 'antd';
import { useCallback, useEffect, useMemo, useState } from 'react';
const ParserListMap = new Map([
  [
    ['pdf'],
    [
      DocumentParserType.Naive,
      DocumentParserType.Manual,

      DocumentParserType.One,
      DocumentParserType.Qa,
    ],
  ],
  [
    ['doc', 'docx'],
    [
      DocumentParserType.Naive,

      DocumentParserType.One,
      DocumentParserType.Qa,
      DocumentParserType.Manual,
    ],
  ],
  [
    ['xlsx', 'xls'],
    [
      DocumentParserType.Naive,
      DocumentParserType.Qa,
      DocumentParserType.Table,
      DocumentParserType.One,
    ],
  ],
  [['ppt', 'pptx'], [DocumentParserType.Presentation]],
  [
    ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'tif', 'tiff', 'webp', 'svg', 'ico'],
    [DocumentParserType.Picture],
  ],
  [
    ['txt'],
    [
      DocumentParserType.Naive,

      DocumentParserType.One,
      DocumentParserType.Qa,
      DocumentParserType.Table,
    ],
  ],
  [
    ['csv'],
    [
      DocumentParserType.Naive,
      DocumentParserType.One,
      DocumentParserType.Qa,
      DocumentParserType.Table,
    ],
  ],
  [['md'], [DocumentParserType.Naive, DocumentParserType.Qa]],
  [['json'], [DocumentParserType.Naive, DocumentParserType.KnowledgeGraph]],
  [['eml'], [DocumentParserType.Email]],
]);

const getParserList = (
  values: string[],
  parserList: Array<{
    value: string;
    label: string;
  }>,
) => {
  return parserList.filter((x) => values?.some((y) => y === x.value));
};

export const useFetchParserListOnMount = (
  documentId: string,
  parserId: DocumentParserType,
  documentExtension: string,
  form: FormInstance,
) => {
  const [selectedTag, setSelectedTag] = useState<DocumentParserType>();
  const parserList = useSelectParserList();
  const handleChunkMethodSelectChange = useHandleChunkMethodSelectChange(form);

  const nextParserList = useMemo(() => {
    const key = [...ParserListMap.keys()].find((x) =>
      x.some((y) => y === documentExtension),
    );

    let filteredList;
    if (key) {
      const values = ParserListMap.get(key);
      filteredList = getParserList(values ?? [], parserList);
    } else {
      filteredList = getParserList(
        [
          DocumentParserType.Naive,
          DocumentParserType.Resume,
          DocumentParserType.Book,
          DocumentParserType.Laws,
          DocumentParserType.One,
          DocumentParserType.Qa,
          DocumentParserType.Table,
        ],
        parserList,
      );
    }

    // 应用中文标签映射
    return mapParserListLabels(filteredList);
  }, [parserList, documentExtension]);

  useEffect(() => {
    setSelectedTag(parserId);
  }, [parserId, documentId]);

  const handleChange = (tag: string) => {
    handleChunkMethodSelectChange(tag);
    setSelectedTag(tag as DocumentParserType);
  };

  return { parserList: nextParserList, handleChange, selectedTag };
};

const hideAutoKeywords = [
  DocumentParserType.Qa,
  DocumentParserType.Table,
  DocumentParserType.Resume,
  DocumentParserType.KnowledgeGraph,
  DocumentParserType.Tag,
];

export const useShowAutoKeywords = () => {
  const showAutoKeywords = useCallback(
    (selectedTag: DocumentParserType | undefined) => {
      return hideAutoKeywords.every((x) => selectedTag !== x);
    },
    [],
  );

  return showAutoKeywords;
};
