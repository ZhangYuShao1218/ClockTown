import { makeAutoObservable } from 'mobx';
import { DEFAULT_LANGUAGE, isSupportedLanguage, normalizeLanguage, SUPPORTED_LANGUAGES, type Language } from '../utils/languages';
import type { JinxVersion, JinxVersionMap } from '../data';
import { toZhCanonicalCharacterId } from '../data/utils/characterIdMapping';

export interface AppConfig {
  language: Language;
  officialIdParseMode: boolean; // Whether official ID parse mode is enabled
  hideDuplicateJinx: boolean; // Whether to show jinx on only one character card
  jinxVersion: JinxVersionMap; // Per-character jinx rule version ('legacy'|'modern'), default: modern (empty)
}

const DEFAULT_CONFIG: AppConfig = {
  language: DEFAULT_LANGUAGE,
  officialIdParseMode: false, // Official ID parse mode is disabled by default
  hideDuplicateJinx: true, // Hide duplicate jinx by default
  jinxVersion: {}, // All modern by default (only legacy entries stored)
};

const STORAGE_KEY = 'botc-app-config';

class ConfigStore {
  config: AppConfig = DEFAULT_CONFIG;

  constructor() {
    makeAutoObservable(this);
    this.loadConfig();
    this.detectLanguageFromUrl();
    this.setupUrlListener(); // Listen for URL changes
  }

  // Load config from localStorage
  loadConfig() {
    try {
      const savedConfig = localStorage.getItem(STORAGE_KEY);
      if (savedConfig) {
        const parsed = JSON.parse(savedConfig);
        this.config = {
          ...DEFAULT_CONFIG,
          ...parsed,
          language: normalizeLanguage(parsed.language),
        };
      }
    } catch (error) {
      console.error('Failed to load config from localStorage:', error);
    }
  }

  // Save config to localStorage
  saveConfig() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.config));
    } catch (error) {
      console.error('Failed to save config to localStorage:', error);
    }
  }

  // Set up URL listener (listen for hash changes)
  setupUrlListener() {
    window.addEventListener('hashchange', () => {
      this.detectLanguageFromUrl();
    });
  }

  // Detect browser language and match to supported language
  detectBrowserLanguage(): Language {
    const browserLang = (navigator.language || (navigator as any).userLanguage || '').toLowerCase();
    // Exact match (e.g. en-US → en, zh-CN → zh-CN)
    for (const lang of SUPPORTED_LANGUAGES) {
      if (browserLang === lang.toLowerCase()) return lang;
    }
    // Prefix match (e.g. fr → no match, zh → zh-CN)
    for (const lang of SUPPORTED_LANGUAGES) {
      if (browserLang.startsWith(lang.split('-')[0])) return lang;
    }
    return DEFAULT_LANGUAGE;
  }

  // Detect and set language from local storage or default
  detectLanguageFromUrl() {
    // Clean any ?lang= param from search or hash to keep URL clean
    if (window.location.search && window.location.search.includes('lang=')) {
      const newUrl = window.location.pathname + window.location.hash;
      window.history.replaceState({}, '', newUrl);
    }
    const hash = window.location.hash;
    const questionMarkIndex = hash.indexOf('?');
    if (questionMarkIndex !== -1 && hash.includes('lang=')) {
      const hashPath = hash.substring(0, questionMarkIndex);
      window.history.replaceState({}, '', window.location.pathname + hashPath);
    }
  }

  // Update language param in URL (disabled: keeps clean URL)
  updateUrlLanguage(_lang: Language) {
    // No-op: keep URL clean without ?lang=
  }

  // Set language
  setLanguage(language: Language) {
    this.config.language = language;
    this.saveConfig();
  }

  // Set official ID parse mode
  setOfficialIdParseMode(enabled: boolean) {
    this.config.officialIdParseMode = enabled;
    this.saveConfig();
  }

  // Set hide duplicate jinx mode
  setHideDuplicateJinx(enabled: boolean) {
    this.config.hideDuplicateJinx = enabled;
    this.saveConfig();
  }

  // Get jinx version for a character (defaults to 'modern')
  getJinxVersion(characterId: string): JinxVersion {
    const normalizedId = toZhCanonicalCharacterId(characterId);
    return this.config.jinxVersion[normalizedId] ?? 'modern';
  }

  // Set jinx version for a character (modern removes from map to keep it sparse)
  setJinxVersion(characterId: string, version: JinxVersion) {
    const normalizedId = toZhCanonicalCharacterId(characterId);
    const newMap = { ...this.config.jinxVersion };
    if (version === 'modern') {
      delete newMap[normalizedId];
    } else {
      newMap[normalizedId] = version;
    }
    this.config.jinxVersion = newMap;
    this.saveConfig();
  }

  // Reset to default settings
  resetToDefault() {
    this.config = { ...DEFAULT_CONFIG };
    // Remove config from localStorage instead of saving defaults
    try {
      localStorage.removeItem(STORAGE_KEY);
      console.log('Deleted localStorage key:', STORAGE_KEY);
    } catch (error) {
      console.error('Failed to delete config:', error);
    }
    this.updateUrlLanguage(DEFAULT_CONFIG.language);
  }

  // Get current language
  get language() {
    return this.config.language;
  }
}

// Create singleton
export const configStore = new ConfigStore();
