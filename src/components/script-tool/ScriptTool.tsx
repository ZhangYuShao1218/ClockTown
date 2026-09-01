import React, { useEffect } from 'react';
import OfficialApp from './official/App';
import { I18nProvider } from './official/utils/i18n';
import './official/index.css';
import './official/print.css';

export const ScriptTool: React.FC = () => {
  useEffect(() => {
    const prevTitle = document.title;
    document.title = '血染鐘樓 - 劇本工具';
    return () => {
      document.title = prevTitle || '血染鐘樓';
    };
  }, []);

  return (
    <I18nProvider>
      <OfficialApp />
    </I18nProvider>
  );
};

export default ScriptTool;
