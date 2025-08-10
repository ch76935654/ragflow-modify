import { MessageType, SharedFrom } from '@/constants/chat';
import { useCreateNextSharedConversation } from '@/hooks/chat-hooks';
import {
  useSelectDerivedMessages,
  useSendMessageWithSse,
} from '@/hooks/logic-hooks';
import { Message } from '@/interfaces/database/chat';
import { IMessage } from '@/pages/chat/interface';
import { message } from 'antd';
import { get } from 'lodash';
import trim from 'lodash/trim';
import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'umi';
import { v4 as uuid } from 'uuid';
import { useHandleMessageInputChange } from './hooks';

const isCompletionError = (res: any) =>
  res && (res?.response.status !== 200 || res?.data?.code !== 0);

export const useSendButtonDisabled = (value: string) => {
  return trim(value) === '';
};

export const useGetSharedChatSearchParams = () => {
  const [searchParams] = useSearchParams();
  const data_prefix = 'data_';
  const data = Object.fromEntries(
    searchParams
      .entries()
      .filter(([key, value]) => key.startsWith(data_prefix))
      .map(([key, value]) => [key.replace(data_prefix, ''), value]),
  );
  return {
    from: searchParams.get('from') as SharedFrom,
    sharedId: searchParams.get('shared_id'),
    locale: searchParams.get('locale'),
    data: data,
    visibleAvatar: searchParams.get('visible_avatar')
      ? searchParams.get('visible_avatar') !== '1'
      : true,
  };
};

// 临时聊天记录接口
interface ITemporaryChat {
  id: string;
  name: string;
  messages: IMessage[];
  createdAt: number;
  isNew?: boolean; // 新增标识
}

// 浏览器存储的键名
const SHARED_CHAT_STORAGE_KEY = 'shared-chat-list';
const CURRENT_CHAT_STORAGE_KEY = 'shared-current-chat-id';

// 在文件开头修改存储键名生成函数
const getSharedChatStorageKey = (sharedId: string) =>
  `shared-chat-list-${sharedId}`;
const getCurrentChatStorageKey = (sharedId: string) =>
  `shared-current-chat-id-${sharedId}`;

// 修改加载函数，添加 sharedId 参数
const loadChatListFromStorage = (sharedId: string): ITemporaryChat[] => {
  try {
    const stored = localStorage.getItem(getSharedChatStorageKey(sharedId));
    if (stored) {
      const parsedData = JSON.parse(stored);
      if (Array.isArray(parsedData)) {
        return parsedData
          .filter(
            (chat) =>
              chat.id &&
              chat.name &&
              Array.isArray(chat.messages) &&
              typeof chat.createdAt === 'number',
          )
          .map((chat) => ({
            ...chat,
            isNew: false, // 从存储加载的都标记为非新对话
          }));
      }
    }
  } catch (error) {
    console.warn('加载聊天列表失败:', error);
  }
  return [];
};

// 修改保存函数，添加 sharedId 参数
const saveChatListToStorage = (
  chatList: ITemporaryChat[],
  sharedId: string,
) => {
  try {
    localStorage.setItem(
      getSharedChatStorageKey(sharedId),
      JSON.stringify(chatList),
    );
  } catch (error) {
    console.warn('保存聊天列表失败:', error);
  }
};

// 修改加载当前聊天ID函数，添加 sharedId 参数
const loadCurrentChatIdFromStorage = (sharedId: string): string => {
  try {
    return localStorage.getItem(getCurrentChatStorageKey(sharedId)) || '';
  } catch (error) {
    console.warn('加载当前聊天ID失败:', error);
    return '';
  }
};

// 修改保存当前聊天ID函数，添加 sharedId 参数
const saveCurrentChatIdToStorage = (chatId: string, sharedId: string) => {
  try {
    localStorage.setItem(getCurrentChatStorageKey(sharedId), chatId);
  } catch (error) {
    console.warn('保存当前聊天ID失败:', error);
  }
};

// 获取聊天的显示名称
const getChatDisplayName = (
  chat: ITemporaryChat,
  messages: IMessage[],
): string => {
  if (!chat.name.startsWith('新对话')) {
    return chat.name;
  }

  const firstUserMessage = messages.find(
    (msg) => msg.role === MessageType.User,
  );

  if (firstUserMessage && firstUserMessage.content) {
    const content = firstUserMessage.content.trim();
    return content.length > 20 ? content.slice(0, 20) + '...' : content;
  }

  return chat.name;
};

// 修改 useTemporaryChatList hook 的函数签名和实现
export const useTemporaryChatList = (sharedId: string) => {
  const [chatList, setChatList] = useState<ITemporaryChat[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string>('');
  const [isInitialized, setIsInitialized] = useState(false);

  // 修改初始化逻辑
  useEffect(() => {
    if (!sharedId) return; // 如果没有 sharedId，不进行初始化

    const storedChatList = loadChatListFromStorage(sharedId);
    const storedCurrentChatId = loadCurrentChatIdFromStorage(sharedId);

    if (storedChatList.length > 0) {
      setChatList(storedChatList);
      const validCurrentChatId = storedChatList.some(
        (chat) => chat.id === storedCurrentChatId,
      )
        ? storedCurrentChatId
        : storedChatList[0].id;
      setCurrentChatId(validCurrentChatId);
      saveCurrentChatIdToStorage(validCurrentChatId, sharedId);
    }
    setIsInitialized(true);
  }, [sharedId]); // 添加 sharedId 作为依赖

  // 修改 persistChatList 函数
  const persistChatList = useCallback(
    (newChatList: ITemporaryChat[]) => {
      if (sharedId) {
        saveChatListToStorage(newChatList, sharedId);
      }
    },
    [sharedId],
  );

  // 修改 persistCurrentChatId 函数
  const persistCurrentChatId = useCallback(
    (chatId: string) => {
      if (sharedId) {
        saveCurrentChatIdToStorage(chatId, sharedId);
      }
    },
    [sharedId],
  );

  // 其他函数保持不变，但要确保在调用 persistChatList 和 persistCurrentChatId 时传入正确的参数
  const createNewChat = useCallback(() => {
    const newChatId = uuid();
    const newChat: ITemporaryChat = {
      id: newChatId,
      name: `新对话 ${chatList.length + 1}`,
      messages: [],
      createdAt: Date.now(),
      isNew: true,
    };

    const newChatList = [newChat, ...chatList];
    setChatList(newChatList);
    setCurrentChatId(newChatId);

    persistChatList(newChatList);
    persistCurrentChatId(newChatId);

    return newChatId;
  }, [chatList, persistChatList, persistCurrentChatId]);

  // 其他函数的实现保持不变...
  const switchChat = useCallback(
    (chatId: string) => {
      setCurrentChatId(chatId);
      persistCurrentChatId(chatId);
    },
    [persistCurrentChatId],
  );

  const deleteChat = useCallback(
    (chatId: string) => {
      setChatList((prev) => {
        const newList = prev.filter((chat) => chat.id !== chatId);
        let newCurrentChatId = currentChatId;

        if (chatId === currentChatId) {
          if (newList.length > 0) {
            newCurrentChatId = newList[0].id;
            setCurrentChatId(newCurrentChatId);
          } else {
            const newChatId = uuid();
            const newChat: ITemporaryChat = {
              id: newChatId,
              name: `新对话 1`,
              messages: [],
              createdAt: Date.now(),
              isNew: true,
            };
            newCurrentChatId = newChatId;
            setCurrentChatId(newChatId);
            const finalList = [newChat];
            persistChatList(finalList);
            persistCurrentChatId(newChatId);
            return finalList;
          }
        }

        persistChatList(newList);
        persistCurrentChatId(newCurrentChatId);
        return newList;
      });
    },
    [currentChatId, persistChatList, persistCurrentChatId],
  );

  const updateChatMessages = useCallback(
    (chatId: string, messages: IMessage[]) => {
      setChatList((prev) => {
        const newList = prev.map((chat) => {
          if (chat.id === chatId) {
            const updatedChat = {
              ...chat,
              messages,
              name: getChatDisplayName(chat, messages),
              isNew: false,
            };
            return updatedChat;
          }
          return chat;
        });

        persistChatList(newList);
        return newList;
      });
    },
    [persistChatList],
  );

  const renameChat = useCallback(
    (chatId: string, newName: string) => {
      setChatList((prev) => {
        const newList = prev.map((chat) =>
          chat.id === chatId ? { ...chat, name: newName } : chat,
        );
        persistChatList(newList);
        return newList;
      });
    },
    [persistChatList],
  );

  // 其他函数保持不变...
  const currentChat = chatList.find((chat) => chat.id === currentChatId);

  const getCurrentChatMessages = useCallback(() => {
    return currentChat?.messages || [];
  }, [currentChat]);

  const setCurrentChatMessages = useCallback(
    (messages: IMessage[]) => {
      if (currentChatId) {
        updateChatMessages(currentChatId, messages);
      }
    },
    [currentChatId, updateChatMessages],
  );

  const isCurrentChatNew = useCallback(() => {
    const chat = chatList.find((c) => c.id === currentChatId);
    if (!chat) return true;
    return chat.isNew === true || chat.messages.length === 0;
  }, [chatList, currentChatId]);

  useEffect(() => {
    if (isInitialized && chatList.length === 0 && sharedId) {
      createNewChat();
    }
  }, [isInitialized, chatList.length, createNewChat, sharedId]);

  return {
    chatList,
    currentChat,
    currentChatId,
    createNewChat,
    switchChat,
    deleteChat,
    updateChatMessages,
    renameChat,
    getCurrentChatMessages,
    setCurrentChatMessages,
    isInitialized,
    isCurrentChatNew,
  };
};

export const useSendSharedMessage = (
  currentChatId?: string,
  isCurrentChatNew?: () => boolean,
) => {
  const {
    from,
    sharedId: conversationId,
    data: data,
  } = useGetSharedChatSearchParams();
  const { createSharedConversation: setConversation } =
    useCreateNextSharedConversation();
  const { handleInputChange, value, setValue } = useHandleMessageInputChange();
  const { send, answer, done, stopOutputMessage } = useSendMessageWithSse(
    `/api/v1/${from === SharedFrom.Agent ? 'agentbots' : 'chatbots'}/${conversationId}/completions`,
  );
  const {
    derivedMessages,
    ref,
    removeLatestMessage,
    addNewestAnswer,
    addNewestQuestion,
    setDerivedMessages,
  } = useSelectDerivedMessages();
  const [hasError, setHasError] = useState(false);
  const [initializedChats, setInitializedChats] = useState<Set<string>>(
    new Set(),
  );

  // 跟踪聊天的消息加载状态
  const [chatMessagesLoaded, setChatMessagesLoaded] = useState<
    Map<string, boolean>
  >(new Map());
  // 跟踪哪些聊天应该接收回复
  const [chatsAcceptingAnswers, setChatsAcceptingAnswers] = useState<
    Set<string>
  >(new Set());

  const sendMessage = useCallback(
    async (message: Message, id?: string) => {
      const res = await send({
        conversation_id: id ?? conversationId,
        quote: true,
        question: message.content,
        session_id: get(derivedMessages, '0.session_id'),
      });

      if (isCompletionError(res)) {
        setValue(message.content);
        removeLatestMessage();
      }
    },
    [send, conversationId, derivedMessages, setValue, removeLatestMessage],
  );

  const handleSendMessage = useCallback(
    async (message: Message) => {
      // 用户发送消息时，允许接收回复
      if (currentChatId) {
        setChatsAcceptingAnswers((prev) => new Set([...prev, currentChatId]));
      }

      if (conversationId !== '') {
        sendMessage(message);
      } else {
        const data = await setConversation('user id');
        if (data.code === 0) {
          const id = data.data.id;
          sendMessage(message, id);
        }
      }
    },
    [conversationId, setConversation, sendMessage, currentChatId],
  );

  // 会话初始化函数
  const initializeSession = useCallback(async () => {
    if (!currentChatId || initializedChats.has(currentChatId)) {
      return;
    }

    const payload = { question: '' };
    const ret = await send({ ...payload, ...data });

    if (isCompletionError(ret)) {
      message.error(ret?.data.message);
      setHasError(true);
    } else {
      setInitializedChats((prev) => new Set([...prev, currentChatId]));
    }
  }, [currentChatId, initializedChats, send, data]);

  // 监听聊天切换进行初始化
  useEffect(() => {
    if (currentChatId && !initializedChats.has(currentChatId)) {
      const timeoutId = setTimeout(() => {
        initializeSession();
      }, 100);

      return () => clearTimeout(timeoutId);
    }
  }, [currentChatId, initializeSession, initializedChats]);

  // 处理服务器回复 - 修复后的版本
  useEffect(() => {
    if (answer.answer && currentChatId) {
      // 检查当前聊天是否应该接收回复
      const shouldAcceptAnswer = chatsAcceptingAnswers.has(currentChatId);

      // 检查是否为新对话（没有已加载的消息）
      const isNewChat =
        !chatMessagesLoaded.get(currentChatId) && derivedMessages.length === 0;

      if (shouldAcceptAnswer || isNewChat) {
        addNewestAnswer(answer);
        // 注意：这里不再立即移除接收标识，而是在回复完成时移除
      } else {
        console.log(
          '忽略开场白回复 - 聊天ID:',
          currentChatId,
          '回复内容:',
          answer.answer,
        );
      }
    }
  }, [
    answer,
    currentChatId,
    chatsAcceptingAnswers,
    chatMessagesLoaded,
    derivedMessages.length,
    addNewestAnswer,
  ]);

  // 监听回复完成状态，清理接收标识
  useEffect(() => {
    if (done && currentChatId && chatsAcceptingAnswers.has(currentChatId)) {
      // 回复完成后，从接收列表中移除
      setChatsAcceptingAnswers((prev) => {
        const newSet = new Set(prev);
        newSet.delete(currentChatId);
        return newSet;
      });
    }
  }, [done, currentChatId, chatsAcceptingAnswers]);

  const handlePressEnter = useCallback(
    (documentIds: string[]) => {
      if (trim(value) === '') return;
      const id = uuid();
      if (done) {
        setValue('');
        addNewestQuestion({
          content: value,
          doc_ids: documentIds,
          id,
          role: MessageType.User,
        });
        handleSendMessage({
          content: value.trim(),
          id,
          role: MessageType.User,
        });
      }
    },
    [addNewestQuestion, done, handleSendMessage, setValue, value],
  );

  // 标记聊天消息已加载的方法
  const markChatMessagesLoaded = useCallback(
    (chatId: string, hasMessages: boolean) => {
      setChatMessagesLoaded((prev) => new Map(prev.set(chatId, hasMessages)));

      // 如果是新对话（没有消息），允许接收开场白
      if (!hasMessages) {
        setChatsAcceptingAnswers((prev) => new Set([...prev, chatId]));
      }
    },
    [],
  );

  return {
    handlePressEnter,
    handleInputChange,
    value,
    sendLoading: !done,
    ref,
    loading: false,
    derivedMessages,
    setDerivedMessages,
    hasError,
    stopOutputMessage,
    markChatMessagesLoaded,
  };
};
