import { CrossLanguageItem } from '@/components/cross-language-item';
import Rerank from '@/components/rerank';
import SimilaritySlider from '@/components/similarity-slider';
import TopNItem from '@/components/top-n-item';
import { UseKnowledgeGraphItem } from '@/components/use-knowledge-graph-item';
import { useTranslate } from '@/hooks/common-hooks';
import { DeleteOutlined } from '@ant-design/icons';
import { Divider, Form, Input, TableProps } from 'antd';
import classNames from 'classnames';
import {
  ForwardedRef,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
} from 'react';
import { v4 as uuid } from 'uuid';
import { HIDDEN_SYSTEM_PROMPT } from '../constants';
import { useSelectPromptConfigParameters } from '../hooks';
import {
  VariableTableDataType as DataType,
  IPromptConfigParameters,
  ISegmentedContentProps,
} from '../interface';
import CustomSwitch from './custom-switch';
import { EditableCell, EditableRow } from './editable-cell';
import styles from './index.less';

const PromptEngine = (
  { show }: ISegmentedContentProps,
  ref: ForwardedRef<Array<IPromptConfigParameters>>,
) => {
  const [dataSource, setDataSource] = useState<DataType[]>([]);
  const parameters = useSelectPromptConfigParameters();
  const { t } = useTranslate('chat');
  const form = Form.useFormInstance(); // 获取表单实例
  const components = {
    body: {
      row: EditableRow,
      cell: EditableCell,
    },
  };
  // 监听用户自定义指令变化，实时更新隐藏的系统提示词
  useEffect(() => {
    const userCustomPrompt =
      form.getFieldValue(['prompt_config', 'user_custom_prompt']) ||
      t('systemInitialValue');
    const combinedSystemPrompt = HIDDEN_SYSTEM_PROMPT + userCustomPrompt;
    form.setFieldValue(['prompt_config', 'system'], combinedSystemPrompt);
  }, [form, t]);

  // 监听表单字段变化
  const handleUserPromptChange = () => {
    const userCustomPrompt =
      form.getFieldValue(['prompt_config', 'user_custom_prompt']) || '';
    const combinedSystemPrompt = HIDDEN_SYSTEM_PROMPT + userCustomPrompt;
    form.setFieldValue(['prompt_config', 'system'], combinedSystemPrompt);
  };
  const handleRemove = (key: string) => () => {
    const newData = dataSource.filter((item) => item.key !== key);
    setDataSource(newData);
  };

  const handleSave = (row: DataType) => {
    const newData = [...dataSource];
    const index = newData.findIndex((item) => row.key === item.key);
    const item = newData[index];
    newData.splice(index, 1, {
      ...item,
      ...row,
    });
    setDataSource(newData);
  };

  const handleAdd = () => {
    setDataSource((state) => [
      ...state,
      {
        key: uuid(),
        variable: '',
        optional: true,
      },
    ]);
  };

  const handleOptionalChange = (row: DataType) => (checked: boolean) => {
    const newData = [...dataSource];
    const index = newData.findIndex((item) => row.key === item.key);
    const item = newData[index];
    newData.splice(index, 1, {
      ...item,
      optional: checked,
    });
    setDataSource(newData);
  };

  useImperativeHandle(
    ref,
    () => {
      return dataSource
        .filter((x) => x.variable.trim() !== '')
        .map((x) => ({ key: x.variable, optional: x.optional }));
    },
    [dataSource],
  );

  const columns: TableProps<DataType>['columns'] = [
    {
      title: t('key'),
      dataIndex: 'variable',
      key: 'variable',
      width: '60%', // 设置合适的宽度
      onCell: (record: DataType) => ({
        record,
        editable: true,
        dataIndex: 'variable',
        title: 'key',
        handleSave,
      }),
    },
    {
      title: t('optional'),
      dataIndex: 'optional',
      key: 'optional',
      width: '20%', // 设置固定宽度
      align: 'center',
      render(text, record) {
        return (
          <CustomSwitch
            size="small"
            checked={text}
            onChange={handleOptionalChange(record)}
          />
        );
      },
    },
    {
      title: t('operation'),
      dataIndex: 'operation',
      key: 'operation',
      width: '20%', // 设置固定宽度
      align: 'center',
      render(_, record) {
        return <DeleteOutlined onClick={handleRemove(record.key)} />;
      },
    },
  ];

  useEffect(() => {
    setDataSource(parameters);
  }, [parameters]);

  return (
    <section
      className={classNames({
        [styles.segmentedHidden]: !show,
      })}
    >
      {/* 隐藏的系统提示词字段 - 用户不可见 */}
      <Form.Item
        name={['prompt_config', 'system']}
        style={{ display: 'none' }}
        initialValue={HIDDEN_SYSTEM_PROMPT + t('systemInitialValue')}
      >
        <Input.TextArea />
      </Form.Item>

      {/* 用户自定义指令字段 - 替代原有的系统提示词字段 */}
      <Form.Item
        label="系统提示词"
        rules={[{ required: true, message: t('customInstructionsMessage') }]}
        tooltip="修改系统提示词以完成你的功能专属助手"
        name={['prompt_config', 'user_custom_prompt']}
        initialValue={t('systemInitialValue')}
      >
        <Input.TextArea
          autoSize={{ maxRows: 8, minRows: 5 }}
          onChange={handleUserPromptChange}
          placeholder={t('customInstructionsPlaceholder')}
        />
      </Form.Item>
      <Divider></Divider>
      <SimilaritySlider isTooltipShown></SimilaritySlider>
      <TopNItem></TopNItem>
      <Form.Item
        label={t('multiTurn')}
        tooltip={t('multiTurnTip')}
        name={['prompt_config', 'refine_multiturn']}
        valuePropName="value" // 添加这行
        initialValue={false}
      >
        <CustomSwitch />
      </Form.Item>
      <UseKnowledgeGraphItem
        filedName={['prompt_config', 'use_kg']}
      ></UseKnowledgeGraphItem>
      <Form.Item
        label={t('reasoning')}
        tooltip={t('reasoningTip')}
        name={['prompt_config', 'reasoning']}
        valuePropName="value" // 添加这行
        initialValue={false}
      >
        <CustomSwitch />
      </Form.Item>
      <Rerank></Rerank>
      <CrossLanguageItem></CrossLanguageItem>
      {/* <section className={styles.variableContainer}>
        <Row
          align={'middle'}
          justify="space-between"
          className={styles.variableHeader}
        >
          <Col>
            <div className={styles.variableLabel}>
              {t('variable')}
              <Tooltip title={t('variableTip')}>
                <QuestionCircleOutlined className={styles.variableIcon} />
              </Tooltip>
            </div>
          </Col>
          <Col>
            <Button
              size="small"
              onClick={handleAdd}
              className={styles.addButton}
            >
              {t('add')}
            </Button>
          </Col>
        </Row>
        {dataSource.length > 0 && (
          <div className={styles.variableTableWrapper}>
            <Table
              dataSource={dataSource}
              columns={columns}
              rowKey={'key'}
              className={styles.variableTable}
              components={components}
              rowClassName={() => styles.editableRow}
              pagination={false}
            />
          </div>
        )}
      </section> */}
    </section>
  );
};

export default forwardRef(PromptEngine);
