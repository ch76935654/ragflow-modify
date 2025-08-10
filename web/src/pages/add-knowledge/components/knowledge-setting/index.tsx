import { Spin } from 'antd';
import { ConfigurationForm } from './configuration';
import {
  useHandleChunkMethodChange,
  useSelectKnowledgeDetailsLoading,
} from './hooks';

import styles from './index.less';

const Configuration = () => {
  const loading = useSelectKnowledgeDetailsLoading();
  const { form } = useHandleChunkMethodChange();

  return (
    <div className={styles.configurationWrapper}>
      <Spin spinning={loading}>
        <ConfigurationForm form={form} />
      </Spin>
    </div>
  );
};

export default Configuration;
