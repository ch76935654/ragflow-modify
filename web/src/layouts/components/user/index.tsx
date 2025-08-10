import { useFetchUserInfo } from '@/hooks/user-setting-hooks';
import React from 'react';
import { history } from 'umi';

import styles from '../../index.less';

const App: React.FC = () => {
  const { data: userInfo } = useFetchUserInfo();

  const toSetting = () => {
    history.push('/user-setting');
  };

  return (
    <div
      onClick={toSetting}
      className={styles.clickAvailable}
      style={{
        height: '32px',
        padding: '0 12px',
        display: 'flex',
        alignItems: 'center',
        borderRadius: '16px',
        backgroundColor: 'rgba(242, 243, 245, 1)',
        cursor: 'pointer',
        fontSize: '14px',
        color: '#333',
      }}
    >
      {userInfo.email || '未设置邮箱'}
    </div>
  );
};

export default App;
