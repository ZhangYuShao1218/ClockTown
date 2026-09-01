import React from 'react';
import OfficialApp from './official/App';
import { I18nProvider } from './official/utils/i18n';
import './official/index.css';
import './official/print.css';

export const ScriptTool: React.FC = () => {
  return (
    <I18nProvider>
      <OfficialApp />
    </I18nProvider>
  );
};

export default ScriptTool;
