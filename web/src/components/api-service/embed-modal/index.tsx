import CopyToClipboard from '@/components/copy-to-clipboard';
import { SharedFrom } from '@/constants/chat';
import { useTranslate } from '@/hooks/common-hooks';
import { IModalProps } from '@/interfaces/common';
import { Button, Input, Modal, Space, Typography } from 'antd';
import { useMemo } from 'react';

const { Text, Title } = Typography;

const EmbedModal = ({
  visible,
  hideModal,
  token = '',
  form,
  beta = '',
  isAgent,
}: IModalProps<any> & {
  token: string;
  form: SharedFrom;
  beta: string;
  isAgent: boolean;
}) => {
  const { t } = useTranslate('chat');

  const shareUrl = useMemo(() => {
    let url = `${location.origin}/chat/share?shared_id=${token}&from=${form}`;
    if (beta) {
      url += `&auth=${beta}`;
    }
    url += '&visible_avatar=0';
    return url;
  }, [token, form, beta]);

  return (
    <Modal
      title="分享助手"
      open={visible}
      onCancel={hideModal}
      footer={[
        <Button key="close" onClick={hideModal}>
          关闭
        </Button>,
      ]}
      width={500}
      centered
    >
      <div style={{ padding: '20px 0' }}>
        <Text type="secondary" style={{ marginBottom: 16, display: 'block' }}>
          通过此链接，其他人可以与您的助手进行对话
        </Text>

        <Space.Compact style={{ width: '100%', marginBottom: 20 }}>
          <Input
            value={shareUrl}
            readOnly
            style={{ flex: 1, marginRight: 10 }}
            placeholder="分享链接"
          />
          <CopyToClipboard text={shareUrl}>
            <Button type="primary">复制链接</Button>
          </CopyToClipboard>
        </Space.Compact>

        <Text type="secondary" style={{ fontSize: '12px' }}>
          提示：分享链接永久有效，请妥善保管
        </Text>
      </div>
    </Modal>
  );
};

export default EmbedModal;
