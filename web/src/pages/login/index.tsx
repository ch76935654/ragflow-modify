import SvgIcon from '@/components/svg-icon';
import { useAuth } from '@/hooks/auth-hooks';
import {
  useLogin,
  useLoginChannels,
  useLoginWithChannel,
} from '@/hooks/login-hooks';
import { useSystemConfig } from '@/hooks/system-hooks';
import { rsaPsw } from '@/utils';
import { Button, Checkbox, Form, Input } from 'antd';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'umi';

import styles from './index.less';

const Login = () => {
  const navigate = useNavigate();
  const { login, loading: signLoading } = useLogin();
  const { channels, loading: channelsLoading } = useLoginChannels();
  const { login: loginWithChannel, loading: loginWithChannelLoading } =
    useLoginWithChannel();
  const { t } = useTranslation('translation', { keyPrefix: 'login' });
  const loading = signLoading || channelsLoading || loginWithChannelLoading;
  const { config } = useSystemConfig();

  const { isLogin } = useAuth();
  useEffect(() => {
    if (isLogin) {
      navigate('/knowledge');
    }
  }, [isLogin, navigate]);

  const handleLoginWithChannel = async (channel: string) => {
    await loginWithChannel(channel);
  };

  const [form] = Form.useForm();

  const onCheck = async () => {
    try {
      const params = await form.validateFields();
      const rsaPassWord = rsaPsw(params.password) as string;

      const code = await login({
        email: `${params.email}`.trim(),
        password: rsaPassWord,
      });

      if (code === 0) {
        navigate('/knowledge');
      }
    } catch (errorInfo) {
      console.log('Failed:', errorInfo);
    }
  };

  return (
    <div className={styles.modernLoginPage}>
      <div className={styles.loginContainer}>
        <div className={styles.loginContent}>
          <div className={styles.loginHeader}>
            <h1 className={styles.loginTitle}>{t('login')}</h1>
            <p className={styles.loginDescription}>{t('loginDescription')}</p>
          </div>

          <Form
            form={form}
            layout="vertical"
            className={styles.loginForm}
            name="login_form"
          >
            <Form.Item
              name="email"
              label={t('emailLabel')}
              rules={[{ required: true, message: t('emailPlaceholder') }]}
            >
              <Input size="large" placeholder={t('emailPlaceholder')} />
            </Form.Item>

            <Form.Item
              name="password"
              label={t('passwordLabel')}
              rules={[{ required: true, message: t('passwordPlaceholder') }]}
            >
              <Input.Password
                size="large"
                placeholder={t('passwordPlaceholder')}
                onPressEnter={onCheck}
              />
            </Form.Item>

            <Form.Item name="remember" valuePropName="checked">
              <Checkbox>{t('rememberMe')}</Checkbox>
            </Form.Item>

            <Button
              type="primary"
              block
              size="large"
              onClick={onCheck}
              loading={loading}
            >
              {t('login')}
            </Button>

            {channels && channels.length > 0 && (
              <div className={styles.thirdPartyLogin}>
                <div className={styles.thirdPartyTitle}>或使用以下方式登录</div>
                {channels.map((item) => (
                  <Button
                    key={item.channel}
                    block
                    size="large"
                    onClick={() => handleLoginWithChannel(item.channel)}
                  >
                    <div className="flex items-center">
                      <SvgIcon
                        name={item.icon || 'sso'}
                        width={20}
                        height={20}
                        style={{ marginRight: 8 }}
                      />
                      Sign in with {item.display_name}
                    </div>
                  </Button>
                ))}
              </div>
            )}
          </Form>
        </div>
      </div>
    </div>
  );
};

export default Login;
