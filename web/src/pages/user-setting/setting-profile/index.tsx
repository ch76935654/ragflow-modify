import { Flex, Typography } from 'antd';
import styles from './index.less';

const { Title } = Typography;

const UserSettingProfile = () => {
  return (
    <section className={styles.profileWrapper}>
      <Flex
        justify="center"
        align="center"
        style={{ height: '400px', width: '100%' }}
      >
        <Title level={3} type="secondary">
          正在更新，敬请期待
        </Title>
      </Flex>
    </section>
  );
};

export default UserSettingProfile;
