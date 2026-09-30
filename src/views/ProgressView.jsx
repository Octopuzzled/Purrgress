import { CATS, CAT_ORDER, DAILY_GOAL_BONUS } from '../constants/game.js';
import { CHIME_CHOICES } from '../constants/timebox.js';
import { DICTIONARIES, LANGUAGES } from '../i18n/index.js';
import { useI18n } from '../i18n/useI18n.js';
import { dayKey, lastDays, streakFrom } from '../lib/date.js';
import { statLevel } from '../lib/progress.js';
import { DataSection } from '../components/settings/DataSection.jsx';
import { AccountSection } from '../components/sync/AccountSection.jsx';
import { Icon } from '../components/ui/Icon.jsx';
import { SegmentedControl } from '../components/ui/SegmentedControl.jsx';
import { SettingRow } from '../components/ui/SettingRow.jsx';
import { Toggle } from '../components/ui/Toggle.jsx';
import { btnSoft, sheet } from '../components/ui/styles.js';

export function ProgressView({ data, sync, onSettings, onRestore, onReset }) {
  const { t, duration } = useI18n();

  const weekdays = t('weekdays');
  const days = lastDays(7).map((d) => ({ ...d, label: weekdays[d.weekday] }));
  const counts = days.map((d) => data.history[d.key] || 0);
  const max = Math.max(1, ...counts);
  const streak = streakFrom(data.history);
  const total = Object.values(data.history).reduce((a, b) => a + (Number(b) || 0), 0);

  const s = data.settings;
  const setGoal = (g) => onSettings({ dailyGoal: Math.min(10, Math.max(1, g)) });

  const focusLog = data.focusLog || {};
  const todayFocus = Math.floor((focusLog[dayKey()] || 0) / 60);
  const weekFocus = Math.floor(days.reduce((sum, d) => sum + (focusLog[d.key] || 0), 0) / 60);
  const focusText = weekFocus === 0
    ? t('progress.focusNone')
    : todayFocus > 0
      ? t('progress.focusToday', { today: duration(todayFocus), week: duration(weekFocus) })
      : t('progress.focusWeek', { week: duration(weekFocus) });

  // Sprachnamen immer in ihrer eigenen Sprache anzeigen („Deutsch“, „English“)
  const languageOptions = [
    { value: 'system', label: t('settings.auto') },
    ...LANGUAGES.map((l) => ({ value: l, label: DICTIONARIES[l].meta.name })),
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-semibold text-slate-800 dark:text-slate-50">{t('progress.heading')}</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">{t('progress.intro')}</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {CAT_ORDER.map((c) => {
          const points = data.stats[c] || 0;
          const st = statLevel(points);
          return (
            <div key={c} className={`${sheet} p-4`}>
              <div className="flex items-center gap-3">
                <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-2xl ${CATS[c].chip}`}><Icon name={CATS[c].icon} size={20} /></span>
                <div className="min-w-0 flex-1">
                  <p className="font-display text-lg font-semibold leading-tight text-slate-800 dark:text-slate-100">{t(`category.${c}.stat`)}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{t('progress.growsWith', { category: t(`category.${c}.label`) })}</p>
                </div>
                <span className="text-right">
                  <span className="block text-xs text-slate-500 dark:text-slate-400">{t('progress.stage')}</span>
                  <span className="block font-display text-2xl font-semibold leading-none text-slate-800 dark:text-slate-100">{st.stufe}</span>
                </span>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
                <div className={`h-full rounded-full ${CATS[c].bar} transition-[width] duration-700`} style={{ width: `${Math.max(4, st.pct * 100)}%` }} />
              </div>
              <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                {t('progress.stageProgress', { points, missing: 10 - (points % 10), next: st.stufe + 1 })}
              </p>
            </div>
          );
        })}
      </div>

      <section className={`${sheet} p-4 sm:p-5`} aria-labelledby="week-title">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h3 id="week-title" className="font-display text-lg font-semibold text-slate-800 dark:text-slate-100">{t('progress.week')}</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">{t('progress.total', { count: total })}</p>
        </div>
        <div className="mt-4 flex h-[136px] items-end gap-2" role="img"
          aria-label={t('progress.chartLabel', { list: days.map((d, i) => `${d.label} ${counts[i]}`).join(', ') })}>
          {days.map((d, i) => {
            const n = counts[i];
            const h = n === 0 ? 6 : 14 + (n / max) * 86;
            return (
              <div key={d.key} className="flex h-full flex-1 flex-col items-center justify-end gap-1.5">
                <span className="text-xs font-bold tabular-nums text-slate-500 dark:text-slate-400">{n > 0 ? n : ''}</span>
                <div className={`w-full max-w-[36px] rounded-xl transition-[height] duration-700 ${d.isToday ? 'bg-violet-300' : 'bg-violet-100 dark:bg-violet-400/25'}`} style={{ height: h }} />
                <span className={`text-xs font-bold ${d.isToday ? 'text-slate-800 dark:text-slate-100' : 'text-slate-400'}`}>{d.label}</span>
              </div>
            );
          })}
        </div>
        <p className="mt-4 flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
          <Icon name="flame" size={18} className="text-orange-300" />
          {t('progress.streak', { count: streak })}
        </p>
        <p className="mt-2 flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
          <Icon name="timer" size={18} className="text-violet-400" />
          {focusText}
        </p>
      </section>

      <AccountSection sync={sync} />

      <section className={`${sheet} divide-y divide-slate-100 px-4 dark:divide-white/5 sm:px-5`} aria-labelledby="settings-title">
        <h3 id="settings-title" className="py-4 font-display text-lg font-semibold text-slate-800 dark:text-slate-100">{t('settings.heading')}</h3>

        <SettingRow title={t('settings.language')} hint={t('settings.languageHint')}>
          <SegmentedControl label={t('settings.language')} options={languageOptions}
            value={s.language || 'system'} onChange={(language) => onSettings({ language })} />
        </SettingRow>

        <SettingRow title={t('settings.theme')} hint={t('settings.themeHint')}>
          <SegmentedControl label={t('settings.theme')} value={s.theme} onChange={(theme) => onSettings({ theme })}
            options={[
              { value: 'system', label: t('settings.auto') },
              { value: 'light', label: t('settings.light') },
              { value: 'dark', label: t('settings.dark') },
            ]} />
        </SettingRow>

        <Toggle checked={s.sound} onChange={(v) => onSettings({ sound: v })} label={t('settings.sound')} hint={t('settings.soundHint')} />

        <SettingRow title={t('settings.chime')} hint={t('settings.chimeHint')}>
          <SegmentedControl label={t('settings.chime')} value={s.chimeEvery || 0} onChange={(chimeEvery) => onSettings({ chimeEvery })}
            options={CHIME_CHOICES.map((m) => ({ value: m, label: m ? duration(m) : t('settings.chimeOff') }))} />
        </SettingRow>

        <Toggle checked={s.reduceMotion} onChange={(v) => onSettings({ reduceMotion: v })} label={t('settings.motion')} hint={t('settings.motionHint')} />

        <SettingRow title={t('settings.goal')} hint={t('settings.goalHint', { coins: DAILY_GOAL_BONUS })}>
          <div className="flex items-center gap-2">
            <button type="button" className={`${btnSoft} h-9 w-9 p-0`} onClick={() => setGoal(s.dailyGoal - 1)} disabled={s.dailyGoal <= 1} aria-label={t('settings.goalLess')}><Icon name="minus" size={16} /></button>
            <span className="w-8 text-center font-display text-xl font-semibold tabular-nums text-slate-800 dark:text-slate-100" aria-live="polite">{s.dailyGoal}</span>
            <button type="button" className={`${btnSoft} h-9 w-9 p-0`} onClick={() => setGoal(s.dailyGoal + 1)} disabled={s.dailyGoal >= 10} aria-label={t('settings.goalMore')}><Icon name="plus" size={16} /></button>
          </div>
        </SettingRow>

        <DataSection state={data} signedIn={!!sync.session} onRestore={onRestore} onReset={onReset} />
      </section>
    </div>
  );
}
