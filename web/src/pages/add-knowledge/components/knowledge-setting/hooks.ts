import { LlmModelType } from '@/constants/knowledge';
import { useSetModalState } from '@/hooks/common-hooks';
import {
  useFetchKnowledgeBaseConfiguration,
  useUpdateKnowledge,
} from '@/hooks/knowledge-hooks';
import { useSelectLlmOptionsByModelType } from '@/hooks/llm-hooks';
import { useNavigateToDataset } from '@/hooks/route-hook';
import { useSelectParserList } from '@/hooks/user-setting-hooks';
import {
  getBase64FromUploadFileList,
  getUploadFileListFromBase64,
} from '@/utils/file-util';
import { useIsFetching } from '@tanstack/react-query';
import { Form, UploadFile } from 'antd';
import { FormInstance } from 'antd/lib';
import pick from 'lodash/pick';
import { useCallback, useEffect, useState } from 'react';

export const useSubmitKnowledgeConfiguration = (form: FormInstance) => {
  const { saveKnowledgeConfiguration, loading } = useUpdateKnowledge();
  const navigateToDataset = useNavigateToDataset();

  const submitKnowledgeConfiguration = useCallback(async () => {
    const values = await form.validateFields();
    const avatar = await getBase64FromUploadFileList(values.avatar);
    saveKnowledgeConfiguration({
      ...values,
      avatar,
    });
    navigateToDataset();
  }, [saveKnowledgeConfiguration, form, navigateToDataset]);

  return {
    submitKnowledgeConfiguration,
    submitLoading: loading,
    navigateToDataset,
  };
};

const AllowedFields = ['naive', 'manual', 'table', 'one', 'qa'];

export function useSelectChunkMethodList() {
  const parserList = useSelectParserList();

  // 先过滤出允许的字段
  const filteredList = parserList.filter((x) =>
    AllowedFields.includes(x.value),
  );

  // 重新映射标签文本
  return filteredList.map((item) => {
    const labelMap = {
      naive: '通用文档：支持文档、图片等主流格式',
      manual: '复合文档：适合文本、表格、图片复合结构的文档，仅支持PDF',
      table: '表格：适合严格的表格结构，仅支持 EXCEL 文档',
      one: '深度理解：适合需要深度分析的文档，文件大小控制在2M以内，仅支持DOCX、EXCEL、PDF、TXT',
      qa: '问答对：一问一答两列组成的问答结构文档，仅支持 EXCEL，TXT',
    };

    return {
      ...item,
      label: labelMap[item.value as keyof typeof labelMap] || item.label,
    };
  });
}

export function useSelectEmbeddingModelOptions() {
  const allOptions = useSelectLlmOptionsByModelType();
  return allOptions[LlmModelType.Embedding];
}

export function useHasParsedDocument() {
  const { data: knowledgeDetails } = useFetchKnowledgeBaseConfiguration();
  return knowledgeDetails.chunk_num > 0;
}

export const useFetchKnowledgeConfigurationOnMount = (form: FormInstance) => {
  const { data: knowledgeDetails } = useFetchKnowledgeBaseConfiguration();

  useEffect(() => {
    const fileList: UploadFile[] = getUploadFileListFromBase64(
      knowledgeDetails.avatar,
    );
    form.setFieldsValue({
      ...pick(knowledgeDetails, [
        'description',
        'name',
        'permission',
        'embd_id',
        'parser_id',
        'language',
        'parser_config',
        'pagerank',
      ]),
      avatar: fileList,
    });
  }, [form, knowledgeDetails]);

  return knowledgeDetails;
};

export const useSelectKnowledgeDetailsLoading = () =>
  useIsFetching({ queryKey: ['fetchKnowledgeDetail'] }) > 0;

export const useHandleChunkMethodChange = () => {
  const [form] = Form.useForm();
  const chunkMethod = Form.useWatch('parser_id', form);

  useEffect(() => {
    console.log('🚀 ~ useHandleChunkMethodChange ~ chunkMethod:', chunkMethod);
  }, [chunkMethod]);

  return { form, chunkMethod };
};

export const useRenameKnowledgeTag = () => {
  const [tag, setTag] = useState<string>('');
  const {
    visible: tagRenameVisible,
    hideModal: hideTagRenameModal,
    showModal: showFileRenameModal,
  } = useSetModalState();

  const handleShowTagRenameModal = useCallback(
    (record: string) => {
      setTag(record);
      showFileRenameModal();
    },
    [showFileRenameModal],
  );

  return {
    initialName: tag,
    tagRenameVisible,
    hideTagRenameModal,
    showTagRenameModal: handleShowTagRenameModal,
  };
};
