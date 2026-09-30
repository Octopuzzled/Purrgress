import { useState, useEffect } from 'react';
import { CATS, CAT_ORDER } from '../../constants/game.js';
import { statLevel } from '../../lib/progress.js';
import { Avatar } from '../avatar/Avatar.jsx';
import { CoinBadge } from '../ui/Coin.jsx';
import { Icon } from '../ui/Icon.jsx';
import { XpBar } from '../ui/XpBar.jsx';
import { iconBtn, inputCls } from '../ui/styles.js';
import { useI18n } from '../../i18n/useI18n.js';

export function HeroCard({ data, lvl, todayCount, cheering, cheerTick, line, onRename }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(data.hero.name);
  useEffect(() => { if (!editing) setName(data.hero.name); }, [data.hero.name, editing]);

  const { t } = useI18n();
  const commit = () => {
    const n = name.trim().slice(0, 20);
    if (n) onRename(n); else setName(data.hero.name);
    setEditing(false);
  };
  const goal = data.settings.dailyGoal;
  const reached = todayCount >= goal;

  return (
    <section className="rounded-[32px] bg-white p-4 shadow-[0px_12px_40px_-16px_rgba(51,65,85,0.25)] ring-1 ring-slate-900/5 dark:bg-nightcard dark:ring-white/5 lg:p-6" aria-label={t('hero.yours')}>
      <div className="flex items-center gap-4 lg:flex-col lg:items-stretch">
        <div className="h-[108px] w-[108px] shrink-0 sm:h-[132px] sm:w-[132px] lg:mx-auto lg:h-[224px] lg:w-[224px]">
          <Avatar key={cheerTick} equip={data.hero.equip} mood={cheering ? 'cheer' : 'idle'} title={t('hero.title', { name: data.hero.name })} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1">
            {editing ? (
              <input autoFocus value={name} maxLength={20} aria-label={t('hero.nameField')}
                onChange={(e) => setName(e.target.value)} onBlur={commit}
                onKeyDown={(e) => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') { setName(data.hero.name); setEditing(false); } }}
                className={`${inputCls} py-1.5 font-display text-xl font-semibold`} />
            ) : (
              <>
                <h1 className="truncate font-display text-2xl font-semibold leading-tight text-slate-800 dark:text-slate-50 lg:text-3xl">{data.hero.name}</h1>
                <button type="button" className={iconBtn} onClick={() => setEditing(true)} aria-label={t('hero.rename')}><Icon name="pencil" size={16} /></button>
              </>
            )}
          </div>
          <div className="mt-1 flex items-baseline justify-between text-sm">
            <span className="font-display text-base font-semibold text-violet-700 dark:text-violet-300">{t('hero.level', { level: lvl.level })}</span>
            <span className="tabular-nums text-slate-500 dark:text-slate-400">{lvl.current} / {lvl.need} XP</span>
          </div>
          <XpBar pct={lvl.pct} />
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
            <CoinBadge coins={data.coins} />
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-500 dark:text-slate-400" aria-label={t('hero.dailyGoal', { done: Math.min(todayCount, goal), goal })}>
              <span className="flex gap-1" aria-hidden="true">
                {Array.from({ length: goal }).map((_, i) => (
                  <span key={i} className={`h-2.5 w-2.5 rounded-full ${i < todayCount ? 'bg-emerald-300' : 'bg-slate-200 dark:bg-slate-600'}`} />
                ))}
              </span>
              <span className="tabular-nums">{Math.min(todayCount, goal)}/{goal}</span>
            </div>
          </div>
        </div>
      </div>

      <p className={`mt-3 rounded-2xl px-3.5 py-2 text-sm lg:mt-4 ${reached ? 'bg-emerald-50 text-emerald-900 dark:bg-emerald-400/10 dark:text-emerald-100' : 'bg-violet-50 text-violet-900 dark:bg-violet-400/10 dark:text-violet-100'}`} aria-live="polite">
        {line}
      </p>

      <div className="mt-5 hidden grid-cols-2 gap-x-4 gap-y-3 lg:grid">
        {CAT_ORDER.map((c) => {
          const s = statLevel(data.stats[c] || 0);
          return (
            <div key={c}>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-200"><Icon name={CATS[c].icon} size={15} />{t(`category.${c}.stat`)}</span>
                <span className="tabular-nums text-slate-500 dark:text-slate-400">{s.stufe}</span>
              </div>
              <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
                <div className={`h-full rounded-full ${CATS[c].bar} transition-[width] duration-700`} style={{ width: `${Math.max(4, s.pct * 100)}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
