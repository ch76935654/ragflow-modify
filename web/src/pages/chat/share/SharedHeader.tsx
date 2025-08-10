import { SharedFrom } from '@/constants/chat';
import { useFetchNextConversationSSE } from '@/hooks/chat-hooks';
import { useFetchFlowSSE } from '@/hooks/flow-hooks';
import { useFetchAppConf } from '@/hooks/logic-hooks';
import { BookOutlined } from '@ant-design/icons';
import { Layout } from 'antd';
import { useMemo } from 'react';
import { useGetSharedChatSearchParams } from '../shared-hooks';
import styles from './SharedHeader.less';

const { Header } = Layout;

const SharedHeader = () => {
  const appConf = useFetchAppConf();
  const { from } = useGetSharedChatSearchParams();

  // 使用现有的钩子获取助理信息
  const useFetchAvatar = useMemo(() => {
    return from === SharedFrom.Agent
      ? useFetchFlowSSE
      : useFetchNextConversationSSE;
  }, [from]);

  const { data: avatarData } = useFetchAvatar();

  // 获取助理名称
  const assistantName =
    avatarData?.name ||
    avatarData?.title ||
    avatarData?.dialog_name ||
    '智能助理';

  return (
    <Header className={styles.sharedHeader}>
      <div className={styles.headerContainer}>
        {/* Logo 区域 */}
        <div className={styles.logoSection}>
          <BookOutlined
            className={styles.logoIcon}
            style={{ fontSize: '30px' }}
          />
          <span className={styles.logoText}>{appConf.appName}</span>
        </div>

        {/* 助理名称区域 */}
        <div className={styles.assistantNameSection}>
          <span className={styles.assistantName}>{assistantName}</span>
        </div>

        {/* 占位区域，用于平衡布局 */}
        <div className={styles.placeholderSection}></div>
      </div>
    </Header>
  );
};

export default SharedHeader;
