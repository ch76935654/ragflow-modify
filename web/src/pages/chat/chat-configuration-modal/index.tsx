import { IModalManagerChildrenProps } from '@/components/modal-manager';
import {
  ModelVariableType,
  settledModelVariableMap,
} from '@/constants/knowledge';
import { useTranslate } from '@/hooks/common-hooks';
import { useFetchModelId } from '@/hooks/logic-hooks';
import { IDialog } from '@/interfaces/database/chat';
import { getBase64FromUploadFileList } from '@/utils/file-util';
import { removeUselessFieldsFromValues } from '@/utils/form';
import { SettingOutlined } from '@ant-design/icons';
import { Divider, Form, Modal, Segmented, UploadFile } from 'antd';
import { SegmentedValue } from 'antd/es/segmented';
import camelCase from 'lodash/camelCase';
import { useEffect, useRef, useState } from 'react';
import { HIDDEN_SYSTEM_PROMPT } from '../constants';
import { IPromptConfigParameters } from '../interface';
import AssistantSetting from './assistant-setting';
import styles from './index.less';
import ModelSetting from './model-setting';
import PromptEngine from './prompt-engine';
const layout = {
  labelCol: { span: 9 },
  wrapperCol: { span: 15 },
};

const validateMessages = {
  required: '${label} is required!',
  types: {
    email: '${label} is not a valid email!',
    number: '${label} is not a valid number!',
  },
  number: {
    range: '${label} must be between ${min} and ${max}',
  },
};

enum ConfigurationSegmented {
  AssistantSetting = 'Assistant Setting',
  PromptEngine = 'Prompt Engine',
  ModelSetting = 'Model Setting',
}

const segmentedMap = {
  [ConfigurationSegmented.AssistantSetting]: AssistantSetting,
  [ConfigurationSegmented.ModelSetting]: ModelSetting,
  [ConfigurationSegmented.PromptEngine]: PromptEngine,
};

interface IProps extends IModalManagerChildrenProps {
  initialDialog: IDialog;
  loading: boolean;
  onOk: (dialog: IDialog) => void;
  clearDialog: () => void;
}

const ChatConfigurationModal = ({
  visible,
  hideModal,
  initialDialog,
  loading,
  onOk,
  clearDialog,
}: IProps) => {
  const [form] = Form.useForm();
  const [hasError, setHasError] = useState(false);

  const [value, setValue] = useState<ConfigurationSegmented>(
    ConfigurationSegmented.AssistantSetting,
  );
  const promptEngineRef = useRef<Array<IPromptConfigParameters>>([]);
  const modelId = useFetchModelId();
  const { t } = useTranslate('chat');

  const handleOk = async () => {
    const values = await form.validateFields();
    if (hasError) {
      return;
    }

    // 确保系统提示词始终以隐藏提示词开头
    const userCustomPrompt = values.prompt_config?.user_custom_prompt || '';
    const finalSystemPrompt = HIDDEN_SYSTEM_PROMPT + userCustomPrompt;

    const nextValues: any = removeUselessFieldsFromValues(
      values,
      'llm_setting.',
    );
    const emptyResponse = nextValues.prompt_config?.empty_response ?? '';
    const icon = await getBase64FromUploadFileList(values.icon);

    const finalValues = {
      dialog_id: initialDialog.id,
      ...nextValues,
      vector_similarity_weight: 1 - nextValues.vector_similarity_weight,
      prompt_config: {
        ...nextValues.prompt_config,
        parameters: promptEngineRef.current,
        empty_response: emptyResponse,
        system: finalSystemPrompt, // 使用拼接后的完整系统提示词
      },
      icon,
    };
    onOk(finalValues);
  };

  const handleSegmentedChange = (val: SegmentedValue) => {
    setValue(val as ConfigurationSegmented);
  };

  const handleModalAfterClose = () => {
    clearDialog();
    form.resetFields();
  };

  const title = (
    <div className={styles.headerContent}>
      <div className={styles.headerLeft}>
        <div className={styles.iconWrapper}>
          <SettingOutlined className={styles.headerIcon} />
        </div>
        <div className={styles.headerText}>
          <div className={styles.headerTitle}>{t('chatConfiguration')}</div>
          <div className={styles.headerDescription}>
            {t('chatConfigurationDescription')}
          </div>
        </div>
      </div>
    </div>
  );

  useEffect(() => {
    if (visible) {
      const icon = initialDialog.icon;
      let fileList: UploadFile[] = [];

      if (icon) {
        fileList = [{ uid: '1', name: 'file', thumbUrl: icon, status: 'done' }];
      }

      let existingSystemPrompt = initialDialog.prompt_config?.system || '';
      let userCustomPrompt = '';

      if (existingSystemPrompt.startsWith(HIDDEN_SYSTEM_PROMPT)) {
        userCustomPrompt = existingSystemPrompt.substring(
          HIDDEN_SYSTEM_PROMPT.length,
        );
      } else if (existingSystemPrompt) {
        userCustomPrompt = existingSystemPrompt;
      }

      // 如果没有现有的用户自定义提示词，使用默认值
      if (!userCustomPrompt && !initialDialog.id) {
        userCustomPrompt = t('systemInitialValue');
      }

      const finalSystemPrompt = HIDDEN_SYSTEM_PROMPT + userCustomPrompt;

      form.setFieldsValue({
        ...initialDialog,
        llm_setting:
          initialDialog.llm_setting ??
          settledModelVariableMap[ModelVariableType.Precise],
        icon: fileList,
        llm_id: initialDialog.llm_id ?? modelId,
        vector_similarity_weight:
          1 - (initialDialog.vector_similarity_weight ?? 0.3),
        prompt_config: {
          ...initialDialog.prompt_config,
          system: finalSystemPrompt,
          user_custom_prompt: userCustomPrompt,
        },
      });
    }
  }, [initialDialog, form, visible, modelId, t]);
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Allow Enter in textareas
    if (e.target instanceof HTMLTextAreaElement) {
      return;
    }

    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleOk();
    }
  };

  return (
    <Modal
      title={title}
      width={688}
      open={visible}
      onOk={handleOk}
      onCancel={hideModal}
      confirmLoading={loading}
      destroyOnClose
      afterClose={handleModalAfterClose}
      className={styles.chatConfigurationModal}
      closeIcon={null}
    >
      <div className={styles.modernSegmented}>
        <Segmented
          size={'large'}
          value={value}
          onChange={handleSegmentedChange}
          options={Object.values(ConfigurationSegmented).map((x) => ({
            label: t(camelCase(x)),
            value: x,
          }))}
          block
        />
      </div>
      <Divider style={{ margin: '24px 0' }} />
      <div className={styles.formSection}>
        <Form
          {...layout}
          name="nest-messages"
          form={form}
          style={{ maxWidth: 600 }}
          validateMessages={validateMessages}
          colon={false}
          onKeyDown={handleKeyDown}
        >
          {Object.entries(segmentedMap).map(([key, Element]) => (
            <Element
              key={key}
              show={key === value}
              form={form}
              setHasError={setHasError}
              {...(key === ConfigurationSegmented.ModelSetting
                ? { initialLlmSetting: initialDialog.llm_setting, visible }
                : {})}
              {...(key === ConfigurationSegmented.PromptEngine
                ? { ref: promptEngineRef }
                : {})}
            ></Element>
          ))}
        </Form>
      </div>
    </Modal>
  );
};

export default ChatConfigurationModal;
