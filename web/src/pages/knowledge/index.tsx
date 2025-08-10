import { KnowledgeRouteKey } from '@/constants/knowledge';
import {
  useDeleteKnowledge,
  useInfiniteFetchKnowledgeList,
} from '@/hooks/knowledge-hooks';
import { useFetchUserInfo } from '@/hooks/user-setting-hooks';
import { IKnowledge } from '@/interfaces/database/knowledge';
import {
  EyeOutlined,
  FileTextOutlined,
  MoreOutlined,
  PlusOutlined,
  SearchOutlined,
  TeamOutlined,
  UserOutlined,
} from '@ant-design/icons';
import {
  Button,
  Divider,
  Dropdown,
  Empty,
  Input,
  MenuProps,
  Skeleton,
  Spin,
} from 'antd';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useNavigate } from 'umi';
import { useSaveKnowledge } from './hooks';
import styles from './index.less';
import KnowledgeCreatingModal from './knowledge-creating-modal';

const KnowledgeList = () => {
  const navigate = useNavigate();
  const { data: userInfo } = useFetchUserInfo();
  const { t } = useTranslation('translation', { keyPrefix: 'knowledgeList' });
  const { deleteKnowledge } = useDeleteKnowledge();
  const {
    visible,
    hideModal,
    showModal,
    onCreateOk,
    loading: creatingLoading,
  } = useSaveKnowledge();
  const {
    fetchNextPage,
    data,
    hasNextPage,
    searchString,
    handleInputChange,
    loading,
  } = useInfiniteFetchKnowledgeList();

  const knowledgeList = useMemo(() => {
    const list =
      data?.pages?.flatMap((x) => (Array.isArray(x.kbs) ? x.kbs : [])) ?? [];
    return list;
  }, [data?.pages]);

  const total = useMemo(() => {
    return data?.pages.at(-1)?.total ?? 0;
  }, [data?.pages]);

  // 格式化时间为中国用户习惯的显示方式
  const formatChineseTime = useCallback((timeString: string) => {
    const date = new Date(timeString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    // 相对时间显示
    if (diffMinutes < 1) return '刚刚';
    if (diffMinutes < 60) return `${diffMinutes}分钟前`;
    if (diffHours < 24) return `${diffHours}小时前`;
    if (diffDays === 1) return '昨天';
    if (diffDays === 2) return '前天';
    if (diffDays < 7) return `${diffDays}天前`;

    // 超过一周显示具体日期
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const currentYear = now.getFullYear();

    // 同年份不显示年份
    if (year === currentYear) {
      return `${month}月${day}日`;
    }

    return `${year}年${month}月${day}日`;
  }, []);

  const handleItemClick = useCallback(
    (item: IKnowledge) => (e: React.MouseEvent) => {
      if ((e.target as HTMLElement).closest(`.${styles.operateButton}`)) {
        return;
      }

      navigate(`/knowledge/${KnowledgeRouteKey.Dataset}?id=${item.id}`, {
        state: { from: 'list' },
      });
    },
    [navigate],
  );

  const handleDeleteKnowledge = useCallback(
    (itemId: string) => async () => {
      await deleteKnowledge(itemId);
    },
    [deleteKnowledge],
  );

  const getDropdownItems = useCallback(
    (item: IKnowledge): MenuProps['items'] => [
      {
        key: 'view',
        icon: <EyeOutlined />,
        label: '查看详情',
        onClick: () => {
          navigate(`/knowledge/${KnowledgeRouteKey.Dataset}?id=${item.id}`);
        },
      },
      {
        key: 'config',
        icon: <UserOutlined />,
        label: '配置管理',
        onClick: () => {
          navigate(
            `/knowledge/${KnowledgeRouteKey.Configuration}?id=${item.id}`,
          );
        },
      },
      {
        type: 'divider',
      },
      {
        key: 'delete',
        icon: <FileTextOutlined />,
        label: '删除知识库',
        danger: true,
        onClick: handleDeleteKnowledge(item.id),
      },
    ],
    [navigate, handleDeleteKnowledge],
  );

  const renderKnowledgeItem = useCallback(
    (item: IKnowledge, index: number) => {
      const isTeamKnowledge = item.permission === 'team';
      const isOwner = userInfo?.nickname === item?.nickname;

      return (
        <div
          key={`${item.id}-${index}`}
          className={styles.knowledgeItem}
          onClick={handleItemClick(item)}
        >
          <div className={styles.infoSection}>
            <div className={styles.title}>
              {item.name}
              {isTeamKnowledge && (
                <span
                  className={`${styles.teamBadge} ${isOwner ? '' : styles.teamBadgeOther}`}
                >
                  <TeamOutlined
                    style={{ marginRight: '2px', fontSize: '10px' }}
                  />
                  {item.nickname}
                </span>
              )}
            </div>
            {item.description && (
              <div className={styles.description}>{item.description}</div>
            )}
          </div>

          <div className={styles.docCount}>{item.doc_num}</div>

          <div className={styles.updateTime}>
            {formatChineseTime(item.update_time)}
          </div>

          <div className={styles.operateSection}>
            <div className={styles.operateDropdown}>
              <Dropdown
                menu={{ items: getDropdownItems(item) }}
                trigger={['click']}
                placement="bottomRight"
              >
                <div
                  className={styles.operateButtonNew}
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreOutlined className={styles.operateIcon} />
                </div>
              </Dropdown>
            </div>
          </div>
        </div>
      );
    },
    [userInfo, handleItemClick, getDropdownItems, formatChineseTime],
  );

  const renderLoadingSkeleton = useCallback(
    () => (
      <div className={styles.listSkeleton}>
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className={styles.skeletonItem}>
            <Skeleton.Input style={{ width: '100%', height: '20px' }} active />
            <Skeleton.Input style={{ width: '60px', height: '16px' }} active />
            <Skeleton.Input style={{ width: '80px', height: '16px' }} active />
            <Skeleton.Button size="small" shape="circle" active />
          </div>
        ))}
      </div>
    ),
    [],
  );

  const renderEmptyState = useCallback(
    () => (
      <div className={styles.emptyState}>
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            <div>
              <p style={{ fontSize: '16px', marginBottom: '8px' }}>
                {searchString ? '未找到匹配的知识库' : '暂无知识库'}
              </p>
              <p style={{ fontSize: '14px', color: '#666' }}>
                {searchString
                  ? '请尝试使用不同的关键词搜索'
                  : '创建您的第一个知识库开始使用'}
              </p>
            </div>
          }
        >
          {!searchString && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={showModal}
              size="large"
              style={{ marginTop: '16px' }}
            >
              {t('createKnowledgeBase')}
            </Button>
          )}
        </Empty>
      </div>
    ),
    [searchString, t, showModal],
  );

  return (
    <div className={styles.knowledge}>
      <div className={styles.knowledgeContent}>
        <div className={styles.headerSection}>
          <div className={styles.actionSection}>
            <div className={styles.leftSection}>
              <Input
                className={styles.searchInput}
                placeholder={t('searchKnowledgePlaceholder')}
                value={searchString}
                onChange={handleInputChange}
                prefix={<SearchOutlined />}
                allowClear
                size="large"
              />
              <div className={styles.statInfo}>共 {total} 个知识库</div>
            </div>

            <div className={styles.rightSection}>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={showModal}
                className={styles.createButton}
                size="large"
              >
                {t('createKnowledgeBase')}
              </Button>
            </div>
          </div>
        </div>

        <div className={styles.contentSection}>
          <Spin spinning={loading && knowledgeList.length === 0}>
            <div className={styles.loadingWrapper}>
              {loading && knowledgeList.length === 0 ? (
                renderLoadingSkeleton()
              ) : knowledgeList.length > 0 ? (
                <div className={styles.scrollContainer}>
                  <div className={styles.knowledgeList}>
                    <div className={styles.listHeader}>
                      <div>名称</div>
                      <div>文档数量</div>
                      <div>更新时间</div>
                      <div>操作</div>
                    </div>

                    <InfiniteScroll
                      dataLength={knowledgeList.length}
                      next={fetchNextPage}
                      hasMore={hasNextPage}
                      loader={
                        <div className={styles.loadingMore}>
                          <Skeleton
                            avatar={{ size: 40, shape: 'square' }}
                            title={{ width: '60%' }}
                            paragraph={{ rows: 1, width: ['40%'] }}
                            active
                          />
                        </div>
                      }
                      endMessage={
                        total > 0 && (
                          <div className={styles.endMessage}>
                            <Divider plain>已全部加载完成 ✨</Divider>
                          </div>
                        )
                      }
                      scrollThreshold="300px"
                    >
                      {knowledgeList.map((item, index) =>
                        renderKnowledgeItem(item, index),
                      )}
                    </InfiniteScroll>
                  </div>
                </div>
              ) : (
                renderEmptyState()
              )}
            </div>
          </Spin>
        </div>
      </div>

      <KnowledgeCreatingModal
        loading={creatingLoading}
        visible={visible}
        hideModal={hideModal}
        onOk={onCreateOk}
      />
    </div>
  );
};

export default KnowledgeList;
