import { DocumentParserType } from '@/constants/knowledge';
import { useTranslate } from '@/hooks/common-hooks';
import { Button, Col, Divider, Form, Input, Row, Space } from 'antd';
import { FormInstance } from 'antd/lib';
import { useEffect, useMemo, useState } from 'react';
import {
  useFetchKnowledgeConfigurationOnMount,
  useSubmitKnowledgeConfiguration,
} from '../hooks';
import { AudioConfiguration } from './audio';
import { BookConfiguration } from './book';
import { EmailConfiguration } from './email';
import { KnowledgeGraphConfiguration } from './knowledge-graph';
import { LawsConfiguration } from './laws';
import { ManualConfiguration } from './manual';
import { NaiveConfiguration } from './naive';
import { OneConfiguration } from './one';
import { PaperConfiguration } from './paper';
import { PictureConfiguration } from './picture';
import { PresentationConfiguration } from './presentation';
import { QAConfiguration } from './qa';
import { ResumeConfiguration } from './resume';
import { TableConfiguration } from './table';
import { TagConfiguration } from './tag';

import styles from '../index.less';

const ConfigurationComponentMap = {
  [DocumentParserType.Naive]: NaiveConfiguration,
  [DocumentParserType.Qa]: QAConfiguration,
  [DocumentParserType.Resume]: ResumeConfiguration,
  [DocumentParserType.Manual]: ManualConfiguration,
  [DocumentParserType.Table]: TableConfiguration,
  [DocumentParserType.Paper]: PaperConfiguration,
  [DocumentParserType.Book]: BookConfiguration,
  [DocumentParserType.Laws]: LawsConfiguration,
  [DocumentParserType.Presentation]: PresentationConfiguration,
  [DocumentParserType.Picture]: PictureConfiguration,
  [DocumentParserType.One]: OneConfiguration,
  [DocumentParserType.Audio]: AudioConfiguration,
  [DocumentParserType.Email]: EmailConfiguration,
  [DocumentParserType.Tag]: TagConfiguration,
  [DocumentParserType.KnowledgeGraph]: KnowledgeGraphConfiguration,
};

function EmptyComponent() {
  return null;
}

export const ConfigurationForm = ({ form }: { form: FormInstance }) => {
  const { submitKnowledgeConfiguration, submitLoading, navigateToDataset } =
    useSubmitKnowledgeConfiguration(form);
  const { t } = useTranslate('knowledgeConfiguration');

  const [finalParserId, setFinalParserId] = useState<DocumentParserType>();
  const knowledgeDetails = useFetchKnowledgeConfigurationOnMount(form);
  const parserId: DocumentParserType = Form.useWatch('parser_id', form);
  const ConfigurationComponent = useMemo(() => {
    return finalParserId
      ? ConfigurationComponentMap[finalParserId]
      : EmptyComponent;
  }, [finalParserId]);

  useEffect(() => {
    setFinalParserId(parserId);
  }, [parserId]);

  useEffect(() => {
    setFinalParserId(knowledgeDetails.parser_id as DocumentParserType);
  }, [knowledgeDetails.parser_id]);

  return (
    <Form
      form={form}
      name="validateOnly"
      layout="vertical"
      autoComplete="off"
      className={styles.configurationForm}
    >
      <Row gutter={[24, 0]}>
        <Col span={12}>
          <Form.Item name="name" label={t('name')} rules={[{ required: true }]}>
            <Input placeholder={t('namePlaceholder')} />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="description" label={t('description')}>
            <Input />
          </Form.Item>
        </Col>
      </Row>

      <Divider />

      <ConfigurationComponent />

      <div className={styles.buttonWrapper}>
        <Space size="middle">
          <Button size="large" onClick={navigateToDataset}>
            {t('cancel')}
          </Button>
          <Button
            type="primary"
            size="large"
            loading={submitLoading}
            onClick={submitKnowledgeConfiguration}
          >
            {t('save')}
          </Button>
        </Space>
      </div>
    </Form>
  );
};
