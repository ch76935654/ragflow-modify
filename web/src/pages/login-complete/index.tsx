import SvgIcon from '@/components/svg-icon';
import { useAuth } from '@/hooks/auth-hooks';
import {
  useLogin,
  useLoginChannels,
  useLoginWithChannel,
  useRegister,
} from '@/hooks/login-hooks';
import { useSystemConfig } from '@/hooks/system-hooks';
import { rsaPsw } from '@/utils';
import { Button, Checkbox, Form, Input, Tabs } from 'antd';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'umi';

import styles from './index.less';

const LoginComplete = () => {
  const navigate = useNavigate();
  const { login, loading: signLoading } = useLogin();
  const { register, loading: registerLoading } = useRegister();
  const { channels, loading: channelsLoading } = useLoginChannels();
  const { login: loginWithChannel, loading: loginWithChannelLoading } =
    useLoginWithChannel();
  const { t } = useTranslation('translation', { keyPrefix: 'login' });
  const loading =
    signLoading ||
    registerLoading ||
    channelsLoading ||
    loginWithChannelLoading;
  const { config } = useSystemConfig();
  const registerEnabled = config?.registerEnabled !== 0;

  const { isLogin } = useAuth();
  useEffect(() => {
    if (isLogin) {
      navigate('/knowledge');
    }
  }, [isLogin, navigate]);

  const handleLoginWithChannel = async (channel: string) => {
    await loginWithChannel(channel);
  };

  const [loginForm] = Form.useForm();
  const [registerForm] = Form.useForm();

  const onLogin = async () => {
    try {
      const params = await loginForm.validateFields();
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

  const onRegister = async () => {
    try {
      const params = await registerForm.validateFields();
      const rsaPassWord = rsaPsw(params.password) as string;

      const code = await register({
        nickname: params.nickname,
        email: params.email,
        password: rsaPassWord,
      });

      if (code === 0) {
        // 注册成功后可以选择自动切换到登录标签页
        // 或者显示成功消息
      }
    } catch (errorInfo) {
      console.log('Failed:', errorInfo);
    }
  };

  const renderLoginForm = () => (
    <Form
      form={loginForm}
      layout="vertical"
      className={styles.authForm}
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
          onPressEnter={onLogin}
        />
      </Form.Item>

      <Form.Item name="remember" valuePropName="checked">
        <Checkbox>{t('rememberMe')}</Checkbox>
      </Form.Item>

      <Button
        type="primary"
        block
        size="large"
        onClick={onLogin}
        loading={loading}
      >
        {t('login')}
      </Button>
    </Form>
  );

  const renderRegisterForm = () => (
    <Form
      form={registerForm}
      layout="vertical"
      className={styles.authForm}
      name="register_form"
    >
      <Form.Item
        name="email"
        label={t('emailLabel')}
        rules={[
          { required: true, message: t('emailPlaceholder') },
          { type: 'email', message: '请输入有效的邮箱地址' },
        ]}
      >
        <Input size="large" placeholder={t('emailPlaceholder')} />
      </Form.Item>

      <Form.Item
        name="nickname"
        label={t('nicknameLabel')}
        rules={[{ required: true, message: t('nicknamePlaceholder') }]}
      >
        <Input size="large" placeholder={t('nicknamePlaceholder')} />
      </Form.Item>

      <Form.Item
        name="password"
        label={t('passwordLabel')}
        rules={[
          { required: true, message: t('passwordPlaceholder') },
          { min: 2, message: '密码至少需要2个字符' },
        ]}
      >
        <Input.Password size="large" placeholder={t('passwordPlaceholder')} />
      </Form.Item>

      <Form.Item
        name="confirmPassword"
        label="确认密码"
        dependencies={['password']}
        rules={[
          { required: true, message: '请确认您的密码' },
          ({ getFieldValue }) => ({
            validator(_, value) {
              if (!value || getFieldValue('password') === value) {
                return Promise.resolve();
              }
              return Promise.reject(new Error('两次输入的密码不一致'));
            },
          }),
        ]}
      >
        <Input.Password
          size="large"
          placeholder="请再次输入密码"
          onPressEnter={onRegister}
        />
      </Form.Item>

      <Button
        type="primary"
        block
        size="large"
        onClick={onRegister}
        loading={loading}
      >
        {t('register')}
      </Button>
    </Form>
  );

  const tabItems = [
    {
      key: 'login',
      label: t('login'),
      children: renderLoginForm(),
    },
  ];

  if (registerEnabled) {
    tabItems.push({
      key: 'register',
      label: t('register'),
      children: renderRegisterForm(),
    });
  }

  return (
    <div className={styles.modernLoginPage}>
      <div className={styles.loginContainer}>
        <div className={styles.loginContent}>
          <div className={styles.loginHeader}>
            <h1 className={styles.loginTitle}>欢迎使用</h1>
            <p className={styles.loginDescription}>
              请登录您的账户或创建新账户
            </p>
          </div>

          <Tabs
            defaultActiveKey="login"
            centered
            className={styles.authTabs}
            items={tabItems}
          />

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
        </div>
      </div>
    </div>
  );
};

export default LoginComplete;
