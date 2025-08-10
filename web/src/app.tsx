import { Toaster as Sonner } from '@/components/ui/sonner';
import { Toaster } from '@/components/ui/toaster';
import i18n from '@/locales/config';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { App, ConfigProvider, ConfigProviderProps, theme } from 'antd';
import pt_BR from 'antd/lib/locale/pt_BR';
import deDE from 'antd/locale/de_DE';
import enUS from 'antd/locale/en_US';
import vi_VN from 'antd/locale/vi_VN';
import zhCN from 'antd/locale/zh_CN';
import zh_HK from 'antd/locale/zh_HK';
import dayjs from 'dayjs';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import localeData from 'dayjs/plugin/localeData';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import weekYear from 'dayjs/plugin/weekYear';
import weekday from 'dayjs/plugin/weekday';
import React, { ReactNode, useEffect, useState } from 'react';
import { ThemeProvider, useTheme } from './components/theme-provider';
import { SidebarProvider } from './components/ui/sidebar';
import { TooltipProvider } from './components/ui/tooltip';
import storage from './utils/authorization-util';

dayjs.extend(customParseFormat);
dayjs.extend(advancedFormat);
dayjs.extend(weekday);
dayjs.extend(localeData);
dayjs.extend(weekOfYear);
dayjs.extend(weekYear);

const AntLanguageMap = {
  en: enUS,
  zh: zhCN,
  'zh-TRADITIONAL': zh_HK,
  vi: vi_VN,
  'pt-BR': pt_BR,
  de: deDE,
};

const queryClient = new QueryClient();

type Locale = ConfigProviderProps['locale'];

function Root({ children }: React.PropsWithChildren) {
  const { theme: themeragflow } = useTheme();
  const getLocale = (lng: string) => zhCN; // 强制返回中文

  const [locale, setLocal] = useState<Locale>(zhCN); // 强制初始化为中文

  i18n.on('languageChanged', function (lng: string) {
    storage.setLanguage('zh'); // 强制设置为中文
    setLocal(zhCN); // 强制设置为中文
  });

  return (
    <>
      <ConfigProvider
        theme={{
          token: {
            fontFamily: 'Inter',
          },
          algorithm:
            themeragflow === 'dark'
              ? theme.darkAlgorithm
              : theme.defaultAlgorithm,
        }}
        locale={locale}
      >
        <SidebarProvider>
          <App>{children}</App>
        </SidebarProvider>
        <Sonner position={'top-right'} expand richColors closeButton></Sonner>
        <Toaster />
      </ConfigProvider>
      <ReactQueryDevtools buttonPosition={'top-left'} />
    </>
  );
}

const RootProvider = ({ children }: React.PropsWithChildren) => {
  useEffect(() => {
    // 强制设置语言为中文，忽略后端设置
    storage.setLanguage('zh');
    i18n.changeLanguage('zh');

    // 定期检查并强制设置为中文，防止被后端覆盖
    const forceChineseInterval = setInterval(() => {
      if (storage.getLanguage() !== 'zh' || i18n.language !== 'zh') {
        storage.setLanguage('zh');
        i18n.changeLanguage('zh');
      }
    }, 2000);

    return () => clearInterval(forceChineseInterval);
  }, []);

  return (
    <TooltipProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider defaultTheme="light" storageKey="ragflow-ui-theme">
          <Root>{children}</Root>
        </ThemeProvider>
      </QueryClientProvider>
    </TooltipProvider>
  );
};
export function rootContainer(container: ReactNode) {
  return <RootProvider>{container}</RootProvider>;
}
