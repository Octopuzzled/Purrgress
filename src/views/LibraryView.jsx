import { useEffect, useRef, useState } from 'react';
import { CATS, DIFF } from '../constants/game.js';
import { CUSTOM_GROUP, LIBRARY } from '../constants/library.js';
import { localizeTemplate } from '../i18n/index.js';
import { useI18n } from '../i18n/useI18n.js';
import { Coin } from '../components/ui/Coin.jsx';
import { Icon } from '../components/ui/Icon.jsx';
import { btnPrimary, btnSoft, focusRing, iconBtn, pill, sheet } from '../components/ui/styles.js';

const GROUPS = [...LIBRARY, CUSTOM_GROUP];

export function LibraryView({ tasks, customTemplates = [], onAdd, onRemoveCustom }) {
  const { t } = useI18n();
  const [groupId, setGroupId] = useState(LIBRARY[0].id);
  const [justAdded, setJustAdded] = useState({});
  const timers = useRef({});

  const group = GROUPS.find((g) => g.id === groupId) || LIBRARY[0];
  const isCustom = group.id === CUSTOM_GROUP.id;
  // Eingebaute Vorlagen kommen aus dem Wörterbuch, eigene stehen so da, wie sie geschrieben wurden
  const items = isCustom ? customTemplates : group.items.map((tpl) => localizeTemplate(t, tpl));
  const groupText = (field) => t(isCustom ? `libraryView.custom.${field}` : `library.groups.${group.id}.${field}`);

  useEffect(() => {
    const pending = timers.current;
    return () => Object.values(pending).forEach(clearTimeout);
  }, []);

  const add = (item) => {
    onAdd(item);
    setJustAdded((s) => ({ ...s, [item.id]: true }));
    clearTimeout(timers.current[item.id]);
    timers.current[item.id] = setTimeout(() => setJustAdded((s) => ({ ...s, [item.id]: false })), 1800);
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-display text-2xl font-semibold text-slate-800 dark:text-slate-50">{t('libraryView.heading')}</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">{t('libraryView.intro')}</p>
      </div>

      <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1" role="group" aria-label={t('libraryView.chooseGroup')}>
        {GROUPS.map((g) => (
          <button key={g.id} type="button" className={`${pill(groupId === g.id)} inline-flex items-center gap-1.5`}
            aria-pressed={groupId === g.id} onClick={() => setGroupId(g.id)}>
            <Icon name={g.icon} size={14} />
            {g.id === CUSTOM_GROUP.id ? t('libraryView.custom.label') : t(`library.groups.${g.id}.label`)}
            {g.id === CUSTOM_GROUP.id && customTemplates.length > 0 && <span className="tabular-nums opacity-60">{customTemplates.length}</span>}
          </button>
        ))}
      </div>

      <section className={`${sheet} overflow-hidden`} aria-labelledby={`lib-${group.id}`}>
        <div className="flex items-start gap-3 p-4 sm:p-5">
          <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl ${group.tone}`}><Icon name={group.icon} size={22} /></span>
          <div>
            <h3 id={`lib-${group.id}`} className="font-display text-xl font-semibold text-slate-800 dark:text-slate-50">{groupText('title')}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">{groupText('subtitle')}</p>
          </div>
        </div>

        {items.length === 0 ? (
          <div className="border-t border-slate-100 px-5 py-8 text-center dark:border-white/5">
            <p className="font-display text-lg font-semibold text-slate-800 dark:text-slate-100">{t('libraryView.custom.emptyTitle')}</p>
            <p className="mx-auto mt-1 max-w-[420px] text-sm text-slate-500 dark:text-slate-400">{t('libraryView.custom.emptyText')}</p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100 border-t border-slate-100 dark:divide-white/5 dark:border-white/5">
            {items.map((item) => (
              <TemplateRow key={item.id} item={item} removable={isCustom}
                inList={tasks.some((task) => task.templateId === item.id && !task.done)}
                added={!!justAdded[item.id]} onAdd={() => add(item)} onRemove={() => onRemoveCustom(item.id)} />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function TemplateRow({ item, removable, inList, added, onAdd, onRemove }) {
  const { t, duration } = useI18n();
  const [confirm, setConfirm] = useState(false);
  const cat = CATS[item.category];
  const diff = DIFF[item.difficulty];

  return (
    <li className="p-4 sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="min-w-0 flex-1">
          <p className="font-bold leading-snug text-slate-800 dark:text-slate-100">{item.title}</p>
          {item.desc && <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">{item.desc}</p>}
          <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs font-bold">
            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 ${cat.chip}`}><Icon name={cat.icon} size={12} />{t(`category.${item.category}.label`)}</span>
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-slate-600 dark:bg-slate-700 dark:text-slate-300">{t('common.reward', { label: t(`difficulty.${item.difficulty}`), xp: diff.xp })} <Coin size={12} />{diff.coins}</span>
            {item.repeat === 'daily' && <span className="inline-flex items-center gap-1 rounded-full bg-sky-100 px-2 py-0.5 text-sky-800 dark:bg-sky-400/15 dark:text-sky-200"><Icon name="repeat" size={12} />{t('task.daily')}</span>}
            {item.minutes && <span className="inline-flex items-center gap-1 rounded-full bg-violet-50 px-2 py-0.5 text-violet-800 dark:bg-violet-400/10 dark:text-violet-200"><Icon name="timer" size={12} />{duration(item.minutes)}</span>}
            {item.steps && item.steps.length > 0 && <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-amber-900 dark:bg-amber-400/15 dark:text-amber-100"><Icon name="steps" size={12} />{t('libraryView.steps', { count: item.steps.length })}</span>}
            {inList && !added && <span className="text-slate-400">{t('libraryView.inList')}</span>}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <button type="button" onClick={onAdd} aria-label={t('libraryView.add', { title: item.title })}
            className={`${added ? `${btnPrimary} bg-emerald-200 hover:bg-emerald-200` : btnSoft} flex-1 sm:w-[148px] sm:flex-none`}>
            {added
              ? <><Icon name="check" size={18} strokeWidth={3} />{t('libraryView.added')}</>
              : <><Icon name="plus" size={18} strokeWidth={2.5} />{t(inList ? 'libraryView.again' : 'libraryView.addShort')}</>}
          </button>
          {removable && (
            <button type="button" className={iconBtn} onClick={() => setConfirm(true)} aria-label={t('libraryView.custom.remove', { title: item.title })}>
              <Icon name="trash" size={17} />
            </button>
          )}
        </div>
      </div>

      {confirm && (
        <div className="anim-fade mt-3 flex flex-wrap items-center gap-2 rounded-2xl bg-rose-50 p-2.5 text-sm dark:bg-rose-400/10">
          <span className="font-bold text-rose-900 dark:text-rose-100">{t('libraryView.custom.removeConfirm')}</span>
          <button type="button" onClick={onRemove} className={`rounded-xl bg-rose-200 px-3 py-1 font-bold text-rose-900 hover:bg-rose-300 ${focusRing}`}>{t('task.delete')}</button>
          <button type="button" onClick={() => setConfirm(false)} className={`rounded-xl px-3 py-1 font-bold text-slate-600 hover:bg-white dark:text-slate-300 dark:hover:bg-slate-700 ${focusRing}`}>{t('task.keep')}</button>
        </div>
      )}
    </li>
  );
}
