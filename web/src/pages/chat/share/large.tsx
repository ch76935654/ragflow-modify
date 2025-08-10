import MessageInput from '@/components/message-input';
import MessageItem from '@/components/message-item';
import { useClickDrawer } from '@/components/pdf-drawer/hooks';
import { MessageType, SharedFrom } from '@/constants/chat';
import { useSendButtonDisabled } from '@/pages/chat/hooks';
import { Flex, Spin } from 'antd';
import React, { forwardRef, useEffect, useMemo, useRef } from 'react';
import {
  useGetSharedChatSearchParams,
  useSendSharedMessage,
} from '../shared-hooks';
import { buildMessageItemReference } from '../utils';

import PdfDrawer from '@/components/pdf-drawer';
import { useFetchNextConversationSSE } from '@/hooks/chat-hooks';
import { useFetchFlowSSE } from '@/hooks/flow-hooks';
import i18n from '@/locales/config';
import { IMessage } from '@/pages/chat/interface';
import { buildMessageUuidWithRole } from '@/utils/chat';
import styles from './index.less';

interface ChatContainerProps {
  currentChatId: string;
  getCurrentChatMessages: () => IMessage[];
  setCurrentChatMessages: (messages: IMessage[]) => void;
  isCurrentChatNew: () => boolean;
}

const ChatContainer = ({
  currentChatId,
  getCurrentChatMessages,
  setCurrentChatMessages,
  isCurrentChatNew,
}: ChatContainerProps) => {
  const {
    sharedId: conversationId,
    from,
    locale,
    visibleAvatar,
  } = useGetSharedChatSearchParams();

  const { visible, hideModal, documentId, selectedChunk, clickDocumentButton } =
    useClickDrawer();

  const {
    handlePressEnter,
    handleInputChange,
    value,
    sendLoading,
    loading,
    ref,
    derivedMessages,
    setDerivedMessages,
    hasError,
    stopOutputMessage,
    markChatMessagesLoaded, // 新增
  } = useSendSharedMessage(currentChatId, isCurrentChatNew);

  const sendDisabled = useSendButtonDisabled(value);
  const prevSendLoadingRef = useRef(sendLoading);
  const syncTimeoutRef = useRef<NodeJS.Timeout>();
  const messagesLoadedRef = useRef<Set<string>>(new Set());

  const useFetchAvatar = useMemo(() => {
    return from === SharedFrom.Agent
      ? useFetchFlowSSE
      : useFetchNextConversationSSE;
  }, [from]);

  React.useEffect(() => {
    if (locale && i18n.language !== locale) {
      i18n.changeLanguage(locale);
    }
  }, [locale, visibleAvatar]);

  const { data: avatarData } = useFetchAvatar();

  // 优化的消息加载逻辑
  useEffect(() => {
    if (currentChatId) {
      const chatMessages = getCurrentChatMessages();
      const hasMessages = chatMessages.length > 0;

      // 标记消息加载状态
      if (!messagesLoadedRef.current.has(currentChatId)) {
        markChatMessagesLoaded(currentChatId, hasMessages);
        messagesLoadedRef.current.add(currentChatId);
      }

      // 设置消息到界面
      setDerivedMessages(chatMessages);
    }
  }, [
    currentChatId,
    getCurrentChatMessages,
    setDerivedMessages,
    markChatMessagesLoaded,
  ]);

  // 重置已加载标记当聊天ID变化时
  useEffect(() => {
    messagesLoadedRef.current.clear();
  }, [currentChatId]);

  // 消息同步逻辑
  useEffect(() => {
    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }

    if (currentChatId && derivedMessages.length > 0) {
      if (sendLoading) {
        return;
      }

      if (prevSendLoadingRef.current && !sendLoading) {
        setCurrentChatMessages(derivedMessages);
      } else {
        syncTimeoutRef.current = setTimeout(() => {
          setCurrentChatMessages(derivedMessages);
        }, 500);
      }
    }

    prevSendLoadingRef.current = sendLoading;

    return () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
    };
  }, [derivedMessages, currentChatId, sendLoading, setCurrentChatMessages]);

  useEffect(() => {
    return () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
    };
  }, []);

  if (!conversationId) {
    return <div className={styles.emptyState}>暂无对话内容</div>;
  }

  return (
    <>
      <Flex flex={1} className={styles.chatMainContainer} vertical>
        <Flex flex={1} vertical className={styles.messageContainer}>
          <div>
            <Spin spinning={loading}>
              {derivedMessages?.map((message, i) => {
                return (
                  <MessageItem
                    visibleAvatar={visibleAvatar}
                    key={buildMessageUuidWithRole(message)}
                    avatarDialog={avatarData?.avatar}
                    item={message}
                    nickname="You"
                    reference={buildMessageItemReference(
                      {
                        message: derivedMessages,
                        reference: [],
                      },
                      message,
                    )}
                    loading={
                      message.role === MessageType.Assistant &&
                      sendLoading &&
                      derivedMessages?.length - 1 === i
                    }
                    index={i}
                    clickDocumentButton={clickDocumentButton}
                    showLikeButton={false}
                    showLoudspeaker={false}
                  ></MessageItem>
                );
              })}
            </Spin>
          </div>
          <div ref={ref} />
        </Flex>

        <MessageInput
          isShared
          value={value}
          disabled={hasError}
          sendDisabled={sendDisabled}
          conversationId={conversationId}
          onInputChange={handleInputChange}
          onPressEnter={handlePressEnter}
          sendLoading={sendLoading}
          uploadMethod="external_upload_and_parse"
          showUploadIcon={false}
          stopOutputMessage={stopOutputMessage}
        ></MessageInput>
      </Flex>
      {visible && (
        <PdfDrawer
          visible={visible}
          hideModal={hideModal}
          documentId={documentId}
          chunk={selectedChunk}
        />
      )}
    </>
  );
};

export default forwardRef(ChatContainer);
