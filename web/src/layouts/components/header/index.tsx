import { useTheme } from '@/components/theme-provider';
import { LanguageList, LanguageMap } from '@/constants/common';
import { useTranslate } from '@/hooks/common-hooks';
import { useChangeLanguage, useFetchAppConf } from '@/hooks/logic-hooks';
import { useNavigateWithFromState } from '@/hooks/route-hook';
import { useFetchUserInfo } from '@/hooks/user-setting-hooks';
import {
  BookOutlined,
  CommentOutlined,
  DatabaseOutlined,
} from '@ant-design/icons';
import { Layout } from 'antd';
import { MouseEventHandler, useCallback, useMemo } from 'react';
import { useLocation } from 'umi';
import styles from './index.less';
const { Header } = Layout;

const RagHeader = () => {
  const navigate = useNavigateWithFromState();
  const { pathname } = useLocation();
  const { t } = useTranslate('header');
  const appConf = useFetchAppConf();
  const { theme: themeRag, setTheme } = useTheme();
  const changeLanguage = useChangeLanguage();
  const { data: userInfo } = useFetchUserInfo();

  const navigationItems = useMemo(
    () => [
      { path: '/knowledge', name: t('knowledgeBase'), icon: DatabaseOutlined },
      { path: '/chat', name: t('chat'), icon: CommentOutlined },
    ],
    [t],
  );

  const isActivePath = useCallback(
    (path: string) => {
      return pathname.startsWith(path);
    },
    [pathname],
  );

  const handleNavClick = useCallback(
    (path: string): MouseEventHandler =>
      (e) => {
        e.preventDefault();
        navigate(path);
      },
    [navigate],
  );

  const handleLogoClick = useCallback(() => {
    navigate('/');
  }, [navigate]);

  const handleThemeToggle = useCallback(() => {
    setTheme(themeRag === 'dark' ? 'light' : 'dark');
  }, [themeRag, setTheme]);

  const handleUserClick = useCallback(() => {
    navigate('/user-setting');
  }, [navigate]);

  // 语言切换菜单
  const languageMenuItems = LanguageList.map((lang) => ({
    key: lang,
    label: LanguageMap[lang as keyof typeof LanguageMap],
    onClick: () => changeLanguage(lang),
  }));

  return (
    <Header className={styles.modernHeader}>
      <div className={styles.headerContainer}>
        {/* 左侧区域：Logo + 导航 */}
        <div className={styles.leftSection}>
          {/* Logo 区域 */}
          <div className={styles.logoSection} onClick={handleLogoClick}>
            <BookOutlined
              className={styles.logoIcon}
              style={{ fontSize: '30px' }}
            />
            <span className={styles.logoText}>{appConf.appName}</span>
          </div>

          {/* 导航区域 */}
          <nav className={styles.navigationSection}>
            {navigationItems.map((item) => (
              <a
                key={item.path}
                href={item.path}
                className={`${styles.navItem} ${isActivePath(item.path) ? styles.navItemActive : ''}`}
                onClick={handleNavClick(item.path)}
              >
                {item.icon && <item.icon className={styles.navIcon} />}
                {item.name}
              </a>
            ))}
          </nav>
        </div>

        {/* 右侧工具区域 */}
        <div className={styles.userSection}>
          <span className={styles.userEmail}>{userInfo.email || '未登录'}</span>
        </div>
      </div>
    </Header>
  );
};

export default RagHeader;
