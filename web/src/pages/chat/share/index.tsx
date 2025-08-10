import RenameModal from '@/components/rename-modal';
import { useSetModalState } from '@/hooks/common-hooks';
import { DeleteOutlined, EditOutlined, MoreOutlined } from '@ant-design/icons';
import {
  Button,
  Card,
  Divider,
  Dropdown,
  Flex,
  MenuProps,
  Space,
  Spin,
  Tag,
  Typography,
} from 'antd';
import { MenuItemProps } from 'antd/lib/menu/MenuItem';
import classNames from 'classnames';
import { Plus } from 'lucide-react';
import { useCallback, useState } from 'react';
import {
  useGetSharedChatSearchParams,
  useTemporaryChatList,
} from '../shared-hooks';
import SharedHeader from './SharedHeader';
import styles from './index.less';
import ChatContainer from './large';
const { Text } = Typography;

const SharedChat = () => {
  const { sharedId } = useGetSharedChatSearchParams();
  const {
    chatList,
    currentChatId,
    createNewChat,
    switchChat,
    deleteChat,
    renameChat,
    getCurrentChatMessages,
    setCurrentChatMessages,
    isInitialized,
    isCurrentChatNew,
  } = useTemporaryChatList(sharedId || ''); // 传入 sharedId

  const [activated, setActivated] = useState<string>('');
  const {
    visible: renameVisible,
    hideModal: hideRenameModal,
    showModal: showRenameModal,
  } = useSetModalState();
  const [renamingChatId, setRenamingChatId] = useState<string>('');
  const [initialName, setInitialName] = useState<string>('');

  const handleChatEnter = (id: string) => () => {
    setActivated(id);
  };

  const handleChatLeave = () => {
    setActivated('');
  };

  const handleChatClick = useCallback(
    (chatId: string) => () => {
      switchChat(chatId);
    },
    [switchChat],
  );

  const handleCreateNewChat = useCallback(() => {
    createNewChat();
  }, [createNewChat]);

  const handleDeleteChat =
    (chatId: string): MenuItemProps['onClick'] =>
    ({ domEvent }) => {
      domEvent?.preventDefault();
      domEvent?.stopPropagation();
      deleteChat(chatId);
    };

  const handleShowRenameModal =
    (chatId: string, currentName: string): MenuItemProps['onClick'] =>
    ({ domEvent }) => {
      domEvent?.preventDefault();
      domEvent?.stopPropagation();
      setRenamingChatId(chatId);
      setInitialName(currentName);
      showRenameModal();
    };

  const handleRenameOk = useCallback(
    (newName: string) => {
      if (renamingChatId) {
        renameChat(renamingChatId, newName);
        hideRenameModal();
        setRenamingChatId('');
      }
    },
    [renamingChatId, renameChat, hideRenameModal],
  );

  const buildChatMenuItems = (chat: {
    id: string;
    name: string;
  }): MenuProps['items'] => [
    {
      key: 'rename',
      onClick: handleShowRenameModal(chat.id, chat.name),
      label: (
        <Space>
          <EditOutlined />
          重命名
        </Space>
      ),
    },
    { type: 'divider' },
    {
      key: 'delete',
      onClick: handleDeleteChat(chat.id),
      label: (
        <Space>
          <DeleteOutlined />
          删除
        </Space>
      ),
    },
  ];

  // 如果未初始化完成，显示加载状态
  if (!isInitialized) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  return (
    <>
      <SharedHeader />

      <div className={styles.chatWrapper}>
        <Flex className={styles.shareLayoutWrapper}>
          <Flex className={styles.chatListPanel}>
            <div className={styles.chatListHeader}>
              <Button
                type="primary"
                onClick={handleCreateNewChat}
                className={styles.createChatButton}
                icon={<Plus size={16} />}
              >
                新建对话
              </Button>
            </div>
            <Divider className={styles.chatListDivider} />
            <Flex className={styles.chatListContent} vertical gap={8}>
              <div className={styles.chatListTitle}>
                <Space>
                  <Text strong>对话记录</Text>
                  <Tag className={styles.chatCount}>{chatList.length}</Tag>
                </Space>
              </div>
              <div className={styles.chatCards}>
                {chatList.map((chat) => (
                  <Card
                    key={chat.id}
                    hoverable
                    size="small"
                    className={classNames(styles.chatCard, {
                      [styles.chatCardSelected]: currentChatId === chat.id,
                    })}
                    onMouseEnter={handleChatEnter(chat.id)}
                    onMouseLeave={handleChatLeave}
                    onClick={handleChatClick(chat.id)}
                  >
                    <Flex justify="space-between" align="center">
                      <Text
                        ellipsis={{ tooltip: chat.name }}
                        className={styles.chatName}
                      >
                        {chat.name}
                      </Text>
                      {activated === chat.id && chatList.length > 1 && (
                        <div className={styles.chatActions}>
                          <Dropdown
                            menu={{ items: buildChatMenuItems(chat) }}
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
              </div>
            </Flex>
          </Flex>

          <Divider type="vertical" className={styles.divider} />

          <div className={styles.chatContainer}>
            <ChatContainer
              currentChatId={currentChatId}
              getCurrentChatMessages={getCurrentChatMessages}
              setCurrentChatMessages={setCurrentChatMessages}
              isCurrentChatNew={isCurrentChatNew} // 传递方法
            />
          </div>
        </Flex>

        <RenameModal
          visible={renameVisible}
          hideModal={hideRenameModal}
          onOk={handleRenameOk}
          initialName={initialName}
          loading={false}
        />
      </div>
    </>
  );
};

export default SharedChat;
