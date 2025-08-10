import ChunkMethodModal from '@/components/chunk-method-modal';
import SvgIcon from '@/components/svg-icon';
import {
  useFetchNextDocumentList,
  useSetNextDocumentStatus,
} from '@/hooks/document-hooks';
import { useSetSelectedRecord } from '@/hooks/logic-hooks';
import { useSelectParserList } from '@/hooks/user-setting-hooks';
import { getExtension } from '@/utils/document-util';
import { Switch, Table, Tooltip, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useTranslation } from 'react-i18next';
import { getParserLabel } from '../../utils/parser-label-map';
import CreateFileModal from './create-file-modal';
import DocumentToolbar from './document-toolbar';
import {
  useChangeDocumentParser,
  useCreateEmptyDocument,
  useGetRowSelection,
  useHandleUploadDocument,
  useHandleWebCrawl,
  useNavigateToOtherPage,
  useRenameDocument,
  useShowMetaModal,
} from './hooks';
import ParsingActionCell from './parsing-action-cell';
import ParsingStatusCell from './parsing-status-cell';
import RenameModal from './rename-modal';
import WebCrawlModal from './web-crawl-modal';

import FileUploadModal from '@/components/file-upload-modal';
import { RunningStatus } from '@/constants/knowledge';
import { IDocumentInfo } from '@/interfaces/database/document';
import { CircleHelp } from 'lucide-react';
import styles from './index.less';
import { SetMetaModal } from './set-meta-modal';

const { Text } = Typography;

// 中国日期格式化函数
const formatChineseDate = (dateString: string | Date): string => {
  try {
    const date = new Date(dateString);

    if (isNaN(date.getTime())) {
      return '-';
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${year}年${month}月${day}日 ${hours}:${minutes}`;
  } catch (error) {
    return '-';
  }
};

const KnowledgeFile = () => {
  const { searchString, documents, pagination, handleInputChange } =
    useFetchNextDocumentList();
  const parserList = useSelectParserList();
  const { setDocumentStatus } = useSetNextDocumentStatus();
  const { toChunk } = useNavigateToOtherPage();
  const { currentRecord, setRecord } = useSetSelectedRecord<IDocumentInfo>();
  const {
    renameLoading,
    onRenameOk,
    renameVisible,
    hideRenameModal,
    showRenameModal,
  } = useRenameDocument(currentRecord.id);
  const {
    createLoading,
    onCreateOk,
    createVisible,
    hideCreateModal,
    showCreateModal,
  } = useCreateEmptyDocument();
  const {
    changeParserLoading,
    onChangeParserOk,
    changeParserVisible,
    hideChangeParserModal,
    showChangeParserModal,
  } = useChangeDocumentParser(currentRecord.id);
  const {
    documentUploadVisible,
    hideDocumentUploadModal,
    showDocumentUploadModal,
    onDocumentUploadOk,
    documentUploadLoading,
    uploadFileList,
    setUploadFileList,
    uploadProgress,
    setUploadProgress,
  } = useHandleUploadDocument();
  const {
    webCrawlUploadVisible,
    hideWebCrawlUploadModal,
    showWebCrawlUploadModal,
    onWebCrawlUploadOk,
    webCrawlUploadLoading,
  } = useHandleWebCrawl();
  const { t } = useTranslation('translation', {
    keyPrefix: 'knowledgeDetails',
  });

  const {
    showSetMetaModal,
    hideSetMetaModal,
    setMetaVisible,
    setMetaLoading,
    onSetMetaModalOk,
  } = useShowMetaModal(currentRecord.id);

  const rowSelection = useGetRowSelection();

  const columns: ColumnsType<IDocumentInfo> = [
    {
      title: t('name'),
      dataIndex: 'name',
      key: 'name',
      fixed: 'left',
      render: (text: any, { id, thumbnail, name }) => (
        <div className={styles.fileNameCell} onClick={() => toChunk(id)}>
          <div className={styles.fileIcon}>
            {thumbnail ? (
              <img className={styles.thumbnail} src={thumbnail} alt="" />
            ) : (
              <SvgIcon
                name={`file-icon/${getExtension(name)}`}
                width={24}
              ></SvgIcon>
            )}
          </div>
          <Text ellipsis={{ tooltip: text }} className={styles.fileName}>
            {text}
          </Text>
        </div>
      ),
    },
    {
      title: t('chunkNumber'),
      dataIndex: 'chunk_num',
      key: 'chunk_num',
      render: (value) => <span className={styles.chunkCount}>{value}</span>,
    },
    {
      title: t('uploadDate'),
      dataIndex: 'create_time',
      key: 'create_time',
      render(value) {
        return (
          <span className={styles.dateText}>{formatChineseDate(value)}</span>
        );
      },
    },
    {
      title: t('chunkMethod'),
      dataIndex: 'parser_id',
      key: 'parser_id',
      render: (text) => {
        const method = getParserLabel(text);
        return <span className={styles.methodTag}>{method}</span>;
      },
    },

    {
      title: t('enabled'),
      key: 'status',
      dataIndex: 'status',
      render: (_, { status, id }) => (
        <Switch
          checked={status === '1'}
          onChange={(e) => {
            setDocumentStatus({ status: e, documentId: id });
          }}
          className={styles.statusSwitch}
        />
      ),
    },
    {
      title: (
        <span className={styles.columnTitle}>
          {t('parsingStatus')}
          <Tooltip title={t('parsingStatusTip')}>
            <CircleHelp className={styles.helpIcon} />
          </Tooltip>
        </span>
      ),
      dataIndex: 'run',
      key: 'run',
      filters: Object.entries(RunningStatus).map(([key, value]) => ({
        text: t(`runningStatus${value}`),
        value: value,
      })),
      onFilter: (value, record: IDocumentInfo) => record.run === value,
      render: (text, record) => {
        return <ParsingStatusCell record={record}></ParsingStatusCell>;
      },
    },
    {
      title: t('action'),
      key: 'action',
      render: (_, record) => (
        <ParsingActionCell
          setCurrentRecord={setRecord}
          showRenameModal={showRenameModal}
          showChangeParserModal={showChangeParserModal}
          showSetMetaModal={showSetMetaModal}
          record={record}
        ></ParsingActionCell>
      ),
    },
  ];

  const finalColumns = columns.map((x) => ({
    ...x,
    className: styles.tableColumn,
  }));

  return (
    <div className={styles.datasetWrapper}>
      <DocumentToolbar
        selectedRowKeys={rowSelection.selectedRowKeys as string[]}
        showCreateModal={showCreateModal}
        showWebCrawlModal={showWebCrawlUploadModal}
        showDocumentUploadModal={showDocumentUploadModal}
        searchString={searchString}
        handleInputChange={handleInputChange}
        documents={documents}
      ></DocumentToolbar>
      <div className={styles.tableContainer}>
        <Table
          rowKey="id"
          columns={finalColumns}
          dataSource={documents}
          pagination={pagination}
          rowSelection={rowSelection}
          className={styles.modernTable}
          scroll={{ scrollToFirstRowOnChange: true, x: 1300 }}
        />
      </div>
      <CreateFileModal
        visible={createVisible}
        hideModal={hideCreateModal}
        loading={createLoading}
        onOk={onCreateOk}
      />
      <ChunkMethodModal
        documentId={currentRecord.id}
        parserId={currentRecord.parser_id}
        parserConfig={currentRecord.parser_config}
        documentExtension={getExtension(currentRecord.name)}
        onOk={onChangeParserOk}
        visible={changeParserVisible}
        hideModal={hideChangeParserModal}
        loading={changeParserLoading}
      />
      <RenameModal
        visible={renameVisible}
        onOk={onRenameOk}
        loading={renameLoading}
        hideModal={hideRenameModal}
        initialName={currentRecord.name}
      ></RenameModal>
      <FileUploadModal
        visible={documentUploadVisible}
        hideModal={hideDocumentUploadModal}
        loading={documentUploadLoading}
        onOk={onDocumentUploadOk}
        uploadFileList={uploadFileList}
        setUploadFileList={setUploadFileList}
        uploadProgress={uploadProgress}
        setUploadProgress={setUploadProgress}
      ></FileUploadModal>
      <WebCrawlModal
        visible={webCrawlUploadVisible}
        hideModal={hideWebCrawlUploadModal}
        loading={webCrawlUploadLoading}
        onOk={onWebCrawlUploadOk}
      ></WebCrawlModal>
      {setMetaVisible && (
        <SetMetaModal
          visible={setMetaVisible}
          hideModal={hideSetMetaModal}
          onOk={onSetMetaModalOk}
          loading={setMetaLoading}
          initialMetaData={currentRecord.meta_fields}
        ></SetMetaModal>
      )}
    </div>
  );
};

export default KnowledgeFile;
