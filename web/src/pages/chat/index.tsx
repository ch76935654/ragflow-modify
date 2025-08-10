import EmbedModal from '@/components/api-service/embed-modal';
import { useShowEmbedModal } from '@/components/api-service/hooks';
import RenameModal from '@/components/rename-modal';
import SvgIcon from '@/components/svg-icon';
import { useTheme } from '@/components/theme-provider';
import { SharedFrom } from '@/constants/chat';
import {
  useClickConversationCard,
  useClickDialogCard,
  useFetchNextDialogList,
  useGetChatSearchParams,
} from '@/hooks/chat-hooks';
import { useTranslate } from '@/hooks/common-hooks';
import { useSetSelectedRecord } from '@/hooks/logic-hooks';
import { IDialog } from '@/interfaces/database/chat';
import { DeleteOutlined, EditOutlined, MoreOutlined } from '@ant-design/icons';
import {
  Avatar,
  Button,
  Card,
  Divider,
  Dropdown,
  Flex,
  MenuProps,
  Space,
  Spin,
  Tag,
  Tooltip,
  Typography,
} from 'antd';
import { MenuItemProps } from 'antd/lib/menu/MenuItem';
import classNames from 'classnames';
import { Share } from 'lucide-react';
import { useCallback, useState } from 'react';
import ChatConfigurationModal from './chat-configuration-modal';
import ChatContainer from './chat-container';
import {
  useDeleteConversation,
  useDeleteDialog,
  useEditDialog,
  useHandleItemHover,
  useRenameConversation,
  useSelectDerivedConversationList,
} from './hooks';
import styles from './index.less';

const { Text } = Typography;

const Chat = () => {
  const { data: dialogList, loading: dialogLoading } = useFetchNextDialogList();
  const { onRemoveDialog } = useDeleteDialog();
  const { onRemoveConversation } = useDeleteConversation();
  const { handleClickDialog } = useClickDialogCard();
  const { handleClickConversation } = useClickConversationCard();
  const { dialogId, conversationId } = useGetChatSearchParams();
  const { theme } = useTheme();
  const {
    list: conversationList,
    addTemporaryConversation,
    loading: conversationLoading,
  } = useSelectDerivedConversationList();
  const { activated, handleItemEnter, handleItemLeave } = useHandleItemHover();
  const {
    activated: conversationActivated,
    handleItemEnter: handleConversationItemEnter,
    handleItemLeave: handleConversationItemLeave,
  } = useHandleItemHover();
  const {
    conversationRenameLoading,
    initialConversationName,
    onConversationRenameOk,
    conversationRenameVisible,
    hideConversationRenameModal,
    showConversationRenameModal,
  } = useRenameConversation();
  const {
    dialogSettingLoading,
    initialDialog,
    onDialogEditOk,
    dialogEditVisible,
    clearDialog,
    hideDialogEditModal,
    showDialogEditModal,
  } = useEditDialog();
  const { t } = useTranslate('chat');
  const { currentRecord, setRecord } = useSetSelectedRecord<IDialog>();
  const [controller, setController] = useState(new AbortController());
  const { showEmbedModal, hideEmbedModal, embedVisible, beta } =
    useShowEmbedModal();

  const handleAppCardEnter = (id: string) => () => {
    handleItemEnter(id);
  };

  const handleConversationCardEnter = (id: string) => () => {
    handleConversationItemEnter(id);
  };

  const handleShowChatConfigurationModal =
    (dialogId?: string): any =>
    (info: any) => {
      info?.domEvent?.preventDefault();
      info?.domEvent?.stopPropagation();
      showDialogEditModal(dialogId);
    };

  const handleRemoveDialog =
    (dialogId: string): MenuItemProps['onClick'] =>
    ({ domEvent }) => {
      domEvent.preventDefault();
      domEvent.stopPropagation();
      onRemoveDialog([dialogId]);
    };

  const handleShowOverviewModal =
    (dialog: IDialog): any =>
    (info: any) => {
      info?.domEvent?.preventDefault();
      info?.domEvent?.stopPropagation();
      setRecord(dialog);
      showEmbedModal();
    };

  const handleRemoveConversation =
    (conversationId: string): MenuItemProps['onClick'] =>
    ({ domEvent }) => {
      domEvent.preventDefault();
      domEvent.stopPropagation();
      onRemoveConversation([conversationId]);
    };

  const handleShowConversationRenameModal =
    (conversationId: string): MenuItemProps['onClick'] =>
    ({ domEvent }) => {
      domEvent.preventDefault();
      domEvent.stopPropagation();
      showConversationRenameModal(conversationId);
    };

  const handleDialogCardClick = useCallback(
    (dialogId: string) => () => {
      handleClickDialog(dialogId);
    },
    [handleClickDialog],
  );

  const handleConversationCardClick = useCallback(
    (conversationId: string, isNew: boolean) => () => {
      handleClickConversation(conversationId, isNew ? 'true' : '');
      setController((pre) => {
        pre.abort();
        return new AbortController();
      });
    },
    [handleClickConversation],
  );

  const handleCreateTemporaryConversation = useCallback(() => {
    addTemporaryConversation();
  }, [addTemporaryConversation]);

  const buildAppItems = (dialog: IDialog) => {
    const dialogId = dialog.id;

    const appItems: MenuProps['items'] = [
      {
        key: '1',
        onClick: handleShowChatConfigurationModal(dialogId),
        label: (
          <Space>
            <EditOutlined />
            {t('edit', { keyPrefix: 'common' })}
          </Space>
        ),
      },
      { type: 'divider' },
      {
        key: '2',
        onClick: handleRemoveDialog(dialogId),
        label: (
          <Space>
            <DeleteOutlined />
            {t('delete', { keyPrefix: 'common' })}
          </Space>
        ),
      },
      { type: 'divider' },
      {
        key: '3',
        onClick: handleShowOverviewModal(dialog),
        label: (
          <Space>
            <Share className="size-4" />
            分享助手
          </Space>
        ),
      },
    ];

    return appItems;
  };

  const buildConversationItems = (conversationId: string) => {
    const appItems: MenuProps['items'] = [
      {
        key: '1',
        onClick: handleShowConversationRenameModal(conversationId),
        label: (
          <Space>
            <EditOutlined />
            {t('rename', { keyPrefix: 'common' })}
          </Space>
        ),
      },
      { type: 'divider' },
      {
        key: '2',
        onClick: handleRemoveConversation(conversationId),
        label: (
          <Space>
            <DeleteOutlined />
            {t('delete', { keyPrefix: 'common' })}
          </Space>
        ),
      },
    ];

    return appItems;
  };

  return (
    <Flex className={styles.chatWrapper}>
      {/* 左侧助手列表面板 */}
      <Flex className={styles.chatAssistantPanel}>
        <div className={styles.chatAssistantHeader}>
          <Button
            type="primary"
            onClick={handleShowChatConfigurationModal()}
            className={styles.createAssistantButton}
          >
            {t('createAssistant')}
          </Button>
        </div>
        <Divider className={styles.assistantDivider} />
        <Flex className={styles.chatAssistantContent} vertical gap={12}>
          <Spin spinning={dialogLoading} wrapperClassName={styles.chatSpin}>
            {dialogList.map((x) => (
              <Card
                key={x.id}
                hoverable
                className={classNames(styles.chatAssistantCard, {
                  [theme === 'dark'
                    ? styles.chatAssistantCardSelectedDark
                    : styles.chatAssistantCardSelected]: dialogId === x.id,
                })}
                onMouseEnter={handleAppCardEnter(x.id)}
                onMouseLeave={handleItemLeave}
                onClick={handleDialogCardClick(x.id)}
              >
                <Flex justify="space-between" align="center">
                  <Space size={15}>
                    <Avatar src={x.icon} shape="square" size={40} />
                    <section className={styles.assistantInfo}>
                      <div className={styles.assistantName}>
                        <Text
                          ellipsis={{ tooltip: x.name }}
                          style={{ width: 140 }}
                        >
                          {x.name}
                        </Text>
                      </div>
                      <div className={styles.assistantDescription}>
                        <Text
                          ellipsis={{ tooltip: x.description }}
                          style={{ width: 140 }}
                        >
                          {x.description}
                        </Text>
                      </div>
                    </section>
                  </Space>
                  {activated === x.id && (
                    <div className={styles.assistantActions}>
                      <Dropdown
                        menu={{ items: buildAppItems(x) }}
                        trigger={['click']}
                      >
                        <Button
                          type="text"
                          size="small"
                          icon={<MoreOutlined />}
                          className={styles.actionButton}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </Dropdown>
                    </div>
                  )}
                </Flex>
              </Card>
            ))}
          </Spin>
        </Flex>
      </Flex>

      <Divider type="vertical" className={styles.divider} />

      {/* 右侧聊天面板 */}
      <Flex className={styles.chatRightPanel} vertical>
        {/* 聊天列表区域 */}
        <div className={styles.chatConversationPanel}>
          <div className={styles.chatConversationHeader}>
            <Space>
              <Text strong className={styles.chatTitle}>
                {t('chat')}
              </Text>
              <Tag className={styles.conversationCount}>
                {conversationList.length}
              </Tag>
              <Tooltip title={t('newChat')}>
                <Button
                  type="text"
                  onClick={handleCreateTemporaryConversation}
                  className={styles.newChatButton}
                >
                  <SvgIcon name="plus-circle-fill" width={18} />
                </Button>
              </Tooltip>
            </Space>
          </div>
          <div className={styles.chatConversationContent}>
            <Spin
              spinning={conversationLoading}
              wrapperClassName={styles.chatSpin}
            >
              <Flex gap={8}>
                {conversationList.map((x) => (
                  <Card
                    key={x.id}
                    hoverable
                    size="small"
                    onClick={handleConversationCardClick(x.id, x.is_new)}
                    onMouseEnter={handleConversationCardEnter(x.id)}
                    onMouseLeave={handleConversationItemLeave}
                    className={classNames(styles.chatConversationCard, {
                      [theme === 'dark'
                        ? styles.chatConversationCardSelectedDark
                        : styles.chatConversationCardSelected]:
                        x.id === conversationId,
                    })}
                  >
                    <Flex
                      justify="space-between"
                      align="center"
                      className={styles.conversationCardContent}
                    >
                      <Text
                        ellipsis={{ tooltip: x.name }}
                        className={styles.conversationName}
                      >
                        {x.name}
                      </Text>
                      {conversationActivated === x.id &&
                        x.id !== '' &&
                        !x.is_new && (
                          <div className={styles.conversationActions}>
                            <Dropdown
                              menu={{ items: buildConversationItems(x.id) }}
                              trigger={['click']}
                            >
                              <Button
                                type="text"
                                size="small"
                                icon={<MoreOutlined />}
                                className={styles.actionButton}
                                onClick={(e) => e.stopPropagation()}
                              />
                            </Dropdown>
                          </div>
                        )}
                    </Flex>
                  </Card>
                ))}
              </Flex>
            </Spin>
          </div>
        </div>

        <Divider className={styles.conversationDivider} />

        {/* 聊天容器区域 */}
        <div className={styles.chatMainContainer}>
          <ChatContainer controller={controller} />
        </div>
      </Flex>

      {dialogEditVisible && (
        <ChatConfigurationModal
          visible={dialogEditVisible}
          initialDialog={initialDialog}
          showModal={showDialogEditModal}
          hideModal={hideDialogEditModal}
          loading={dialogSettingLoading}
          onOk={onDialogEditOk}
          clearDialog={clearDialog}
        />
      )}
      <RenameModal
        visible={conversationRenameVisible}
        hideModal={hideConversationRenameModal}
        onOk={onConversationRenameOk}
        initialName={initialConversationName}
        loading={conversationRenameLoading}
      />

      {embedVisible && (
        <EmbedModal
          visible={embedVisible}
          hideModal={hideEmbedModal}
          token={currentRecord.id}
          form={SharedFrom.Chat}
          beta={beta}
          isAgent={false}
        />
      )}
    </Flex>
  );
};

export default Chat;
