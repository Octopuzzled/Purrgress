import { Icon } from '../ui/Icon.jsx';
import { iconBtn } from '../ui/styles.js';
import { useI18n } from '../../i18n/useI18n.js';

export function AppHeader({ sound, isDark, onToggleSound, onToggleTheme }) {
  const { t } = useI18n();
  return (
    <header className="mb-3 flex items-center justify-between px-1">
      <p className="font-display text-lg font-semibold text-slate-800 dark:text-slate-100">{t('app.name')}</p>
      <div className="flex items-center gap-1">
        <button type="button" className={iconBtn} onClick={onToggleSound}
          aria-label={t(sound ? 'header.soundOff' : 'header.soundOn')} aria-pressed={sound}>
          <Icon name={sound ? 'volume' : 'mute'} size={18} />
        </button>
        <button type="button" className={iconBtn} onClick={onToggleTheme}
          aria-label={t(isDark ? 'header.themeLight' : 'header.themeDark')}>
          <Icon name={isDark ? 'sun' : 'moon'} size={18} />
        </button>
      </div>
    </header>
  );
}
