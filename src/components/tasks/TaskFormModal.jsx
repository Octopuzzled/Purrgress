import { useState } from 'react';
import { CATS, CAT_ORDER, DIFF, DIFF_ORDER, STEP_XP } from '../../constants/game.js';
import { BOX_CHOICES } from '../../constants/timebox.js';
import { uid } from '../../lib/id.js';
import { Coin } from '../ui/Coin.jsx';
import { Icon } from '../ui/Icon.jsx';
import { Modal } from '../ui/Modal.jsx';
import { Toggle } from '../ui/Toggle.jsx';
import { btnPrimary, btnSoft, focusRing, iconBtn, inputCls } from '../ui/styles.js';
import { useI18n } from '../../i18n/useI18n.js';
import { DAYPARTS, DEFAULT_DAYPART } from '../../constants/dayparts.js';
import { addDays, dayKey, parseDayKey } from '../../lib/date.js';
import { nextOccurrence, normalizeRepeat, WEEK_ORDER } from '../../lib/repeat.js';
import { estimateFor } from '../../lib/estimate.js';

export function TaskFormModal({ initial, timeLog, onClose, onSave, onDelete }) {
  const { t, duration, day, weekday } = useI18n();
  const isEdit = !!initial;
  const [title, setTitle] = useState(initial ? initial.title : '');
  const [desc, setDesc] = useState(initial ? initial.desc : '');
  const [category, setCategory] = useState(initial ? initial.category : 'routine');
  const [difficulty, setDifficulty] = useState(initial ? initial.difficulty : 'leicht');
  const [asTemplate, setAsTemplate] = useState(false);
  const [minutes, setMinutes] = useState(initial ? initial.minutes : null);
  const [when, setWhen] = useState(initial ? initial.when || DEFAULT_DAYPART : DEFAULT_DAYPART);
  const today = dayKey();
  const tomorrow = addDays(today, 1);
  const [repeat, setRepeat] = useState(initial ? initial.repeat : 'none');
  const [repeatDays, setRepeatDays] = useState(initial && initial.repeatDays.length ? initial.repeatDays : [parseDayKey(today).getDay()]);
  const [due, setDue] = useState(initial && initial.repeat === 'none' ? initial.due : null);
  const customDue = !!due && due !== today && due !== tomorrow;
  // Zeitgefühl: Was dauert so etwas bei dir wirklich?
  const estimate = minutes
    ? estimateFor(timeLog, { id: initial ? initial.id : '', templateId: initial ? initial.templateId : null, repeat, title, category }, minutes)
    : null;
  const boxChoices = Array.from(new Set([...BOX_CHOICES, ...(initial && initial.minutes ? [initial.minutes] : [])])).sort((a, b) => a - b);
  const [steps, setSteps] = useState(initial ? initial.steps.map((s) => ({ ...s })) : []);
  const [newStep, setNewStep] = useState('');
  const [error, setError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);

  const addStep = () => {
    const text = newStep.trim();
    if (!text) return;
    setSteps((s) => [...s, { id: uid(), text, done: false, xp: 0, coins: 0 }]);
    setNewStep('');
  };

  const submit = (e) => {
    e.preventDefault();
    const name = title.trim();
    if (!name) { setError(t('form.nameError')); return; }
    const pending = newStep.trim();
    const finalSteps = [...steps, ...(pending ? [{ id: uid(), text: pending, done: false, xp: 0, coins: 0 }] : [])]
      .map((s) => ({ ...s, text: s.text.trim() }))
      .filter((s) => s.text);
    const rep = normalizeRepeat({ repeat, repeatDays });
    // Wiederholung unverändert: anstehenden Termin behalten (auch wenn er überfällig ist)
    const unchanged = initial && initial.repeat === rep.repeat && initial.repeatDays.join() === rep.repeatDays.join();
    const finalDue = rep.repeat === 'none' ? due : unchanged && initial.due ? initial.due : nextOccurrence(rep, today);
    onSave({ title: name, desc: desc.trim(), category, difficulty, ...rep, due: finalDue, minutes, when, steps: finalSteps }, { asTemplate });
  };

  return (
    <Modal onClose={onClose} labelledBy="task-form-title" wide>
      <form onSubmit={submit} className="space-y-5">
        <div className="flex items-start justify-between gap-3">
          <h2 id="task-form-title" className="font-display text-2xl font-semibold text-slate-800 dark:text-slate-50">{t(isEdit ? 'form.titleEdit' : 'form.titleNew')}</h2>
          <button type="button" className={iconBtn} onClick={onClose} aria-label={t('common.close')}><Icon name="x" /></button>
        </div>

        <div>
          <label htmlFor="f-title" className="mb-1.5 block text-sm font-bold text-slate-700 dark:text-slate-200">{t('form.name')}</label>
          <input id="f-title" data-autofocus value={title} maxLength={120}
            onChange={(e) => { setTitle(e.target.value); if (error) setError(''); }}
            placeholder={t('form.namePlaceholder')} className={inputCls} aria-invalid={!!error} aria-describedby={error ? 'f-title-error' : undefined} />
          {error && <p id="f-title-error" className="mt-1.5 text-sm font-semibold text-rose-600 dark:text-rose-300">{error}</p>}
        </div>

        <div>
          <label htmlFor="f-desc" className="mb-1.5 block text-sm font-bold text-slate-700 dark:text-slate-200">{t('form.desc')} <span className="font-semibold text-slate-400">{t('common.optional')}</span></label>
          <textarea id="f-desc" value={desc} onChange={(e) => setDesc(e.target.value)} rows={3}
            placeholder={t('form.descPlaceholder')} className={`${inputCls} resize-y`} />
        </div>

        <fieldset>
          <legend className="mb-1.5 text-sm font-bold text-slate-700 dark:text-slate-200">{t('form.category')}</legend>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {CAT_ORDER.map((c) => (
              <button key={c} type="button" aria-pressed={category === c} onClick={() => setCategory(c)}
                className={`flex items-center justify-center gap-1.5 rounded-2xl px-3 py-2.5 text-sm font-bold transition ${focusRing} ${category === c ? `${CATS[c].chip} ring-2 ring-current` : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-700/70 dark:text-slate-300 dark:hover:bg-slate-700'}`}>
                <Icon name={CATS[c].icon} size={16} />{t(`category.${c}.label`)}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="mb-1.5 text-sm font-bold text-slate-700 dark:text-slate-200">{t('form.difficulty')}</legend>
          <div className="grid grid-cols-3 gap-2">
            {DIFF_ORDER.map((d) => (
              <button key={d} type="button" aria-pressed={difficulty === d} onClick={() => setDifficulty(d)}
                className={`rounded-2xl px-2 py-2.5 text-center transition ${focusRing} ${difficulty === d ? 'bg-violet-100 text-violet-900 ring-2 ring-violet-300 dark:bg-violet-400/15 dark:text-violet-100' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-700/70 dark:text-slate-300 dark:hover:bg-slate-700'}`}>
                <span className="block text-sm font-bold">{t(`difficulty.${d}`)}</span>
                <span className="mt-0.5 flex items-center justify-center gap-1 text-xs font-semibold opacity-80">+{DIFF[d].xp} XP <Coin size={12} />{DIFF[d].coins}</span>
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="mb-1.5 text-sm font-bold text-slate-700 dark:text-slate-200">{t('form.timebox')} <span className="font-semibold text-slate-400">{t('common.optional')}</span></legend>
          <div className="flex flex-wrap gap-1.5">
            {[null, ...boxChoices].map((m) => (
              <button key={m || 'none'} type="button" aria-pressed={minutes === m} onClick={() => setMinutes(m)}
                className={`rounded-full px-3 py-1.5 text-sm font-bold transition ${focusRing} ${minutes === m
                  ? 'bg-violet-100 text-violet-900 ring-2 ring-violet-300 dark:bg-violet-400/15 dark:text-violet-100'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-700/70 dark:text-slate-300 dark:hover:bg-slate-700'}`}>
                {m ? duration(m) : t('form.noTimebox')}
              </button>
            ))}
          </div>
          <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">{t('form.timeboxHint')}</p>
          {estimate && (
            <p className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-violet-700 dark:text-violet-300">
              <Icon name="clock" size={13} />{t('form.timeEstimate', { duration: duration(estimate.suggested) })}
            </p>
          )}
        </fieldset>

        <fieldset>
          <legend className="mb-1.5 text-sm font-bold text-slate-700 dark:text-slate-200">{t('form.daypart')}</legend>
          <div className="grid grid-cols-3 gap-2">
            {DAYPARTS.map((d) => (
              <button key={d.id} type="button" aria-pressed={when === d.id} onClick={() => setWhen(d.id)}
                className={`flex items-center justify-center gap-1.5 rounded-2xl px-2 py-2.5 text-sm font-bold transition ${focusRing} ${when === d.id
                  ? 'bg-violet-100 text-violet-900 ring-2 ring-violet-300 dark:bg-violet-400/15 dark:text-violet-100'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-700/70 dark:text-slate-300 dark:hover:bg-slate-700'}`}>
                <Icon name={d.icon} size={16} className={when === d.id ? '' : d.tone} />{t(`daypart.${d.id}.short`)}
              </button>
            ))}
          </div>
          <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">{t('form.daypartHint')}</p>
        </fieldset>

        <fieldset>
          <legend className="mb-1.5 text-sm font-bold text-slate-700 dark:text-slate-200">{t('form.repeat')}</legend>
          <div className="grid grid-cols-3 gap-2">
            {[['none', 'form.repeatNone'], ['daily', 'form.repeatDaily'], ['weekly', 'form.repeatWeekly']].map(([value, key]) => (
              <button key={value} type="button" aria-pressed={repeat === value} onClick={() => setRepeat(value)}
                className={`rounded-2xl px-2 py-2.5 text-sm font-bold transition ${focusRing} ${repeat === value
                  ? 'bg-violet-100 text-violet-900 ring-2 ring-violet-300 dark:bg-violet-400/15 dark:text-violet-100'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-700/70 dark:text-slate-300 dark:hover:bg-slate-700'}`}>
                {t(key)}
              </button>
            ))}
          </div>
          {repeat === 'weekly' && (
            <div className="anim-fade mt-2.5" role="group" aria-label={t('form.repeatDays')}>
              <p className="mb-1.5 text-xs font-bold text-slate-500 dark:text-slate-400">{t('form.repeatDays')}</p>
              <div className="flex flex-wrap gap-1.5">
                {WEEK_ORDER.map((d) => {
                  const on = repeatDays.includes(d);
                  return (
                    <button key={d} type="button" aria-pressed={on} aria-label={weekday(d, 'long')}
                      // Mindestens ein Tag bleibt gewählt
                      onClick={() => setRepeatDays((all) => (on ? (all.length > 1 ? all.filter((x) => x !== d) : all) : [...all, d]))}
                      className={`grid h-10 w-10 place-items-center rounded-full text-xs font-bold transition ${focusRing} ${on
                        ? 'bg-violet-100 text-violet-900 ring-2 ring-violet-300 dark:bg-violet-400/15 dark:text-violet-100'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-700/70 dark:text-slate-300 dark:hover:bg-slate-700'}`}>
                      {weekday(d)}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </fieldset>

        <fieldset>
          <legend className="mb-1.5 text-sm font-bold text-slate-700 dark:text-slate-200">{t('form.due')} <span className="font-semibold text-slate-400">{t('common.optional')}</span></legend>
          {repeat !== 'none' ? (
            <p className="flex items-start gap-2 rounded-2xl bg-sky-50 p-3 text-sm text-sky-900 dark:bg-sky-400/10 dark:text-sky-100">
              <Icon name="repeat" size={16} className="mt-0.5 shrink-0" />{t(repeat === 'daily' ? 'form.dueDaily' : 'form.dueWeekly')}
            </p>
          ) : (
            <>
              <div className="flex flex-wrap gap-1.5">
                {[[null, t('form.noDue')], [today, t('form.dueToday')], [tomorrow, t('form.dueTomorrow')]].map(([value, label]) => (
                  <button key={label} type="button" aria-pressed={due === value} onClick={() => setDue(value)}
                    className={`rounded-full px-3 py-1.5 text-sm font-bold transition ${focusRing} ${due === value
                      ? 'bg-violet-100 text-violet-900 ring-2 ring-violet-300 dark:bg-violet-400/15 dark:text-violet-100'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-700/70 dark:text-slate-300 dark:hover:bg-slate-700'}`}>
                    {label}
                  </button>
                ))}
                <label className={`relative inline-flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-bold transition focus-within:ring-4 focus-within:ring-violet-200 dark:focus-within:ring-violet-400/40 ${customDue
                  ? 'bg-violet-100 text-violet-900 ring-2 ring-violet-300 dark:bg-violet-400/15 dark:text-violet-100'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-700/70 dark:text-slate-300 dark:hover:bg-slate-700'}`}>
                  <Icon name="calendar" size={14} />
                  <span>{customDue ? day(due, today) : t('form.duePick')}</span>
                  <input type="date" value={due || ''} min={today} onChange={(e) => setDue(e.target.value || null)}
                    onClick={(e) => { try { e.currentTarget.showPicker(); } catch { /* Browser öffnet selbst */ } }}
                    aria-label={t('form.duePick')} className="absolute inset-0 cursor-pointer opacity-0" />
                </label>
              </div>
              <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">{t('form.dueHint')}</p>
            </>
          )}
        </fieldset>

        <div className="divide-y divide-slate-200/70 rounded-2xl bg-slate-100/70 px-4 dark:divide-white/10 dark:bg-slate-700/40">
          <Toggle checked={asTemplate} onChange={setAsTemplate} label={t('form.saveAsTemplate')} hint={t('form.saveAsTemplateHint')} />
        </div>

        <div>
          <p className="mb-1.5 text-sm font-bold text-slate-700 dark:text-slate-200">{t('form.steps')} <span className="font-semibold text-slate-400">{t('form.stepsHint', { xp: STEP_XP })}</span></p>
          {steps.length > 0 && (
            <ul className="mb-2 space-y-1.5">
              {steps.map((s, i) => (
                <li key={s.id} className="flex items-center gap-2">
                  <span className="w-5 shrink-0 text-right text-xs font-bold tabular-nums text-slate-400">{i + 1}.</span>
                  <input value={s.text} aria-label={t('form.step', { n: i + 1 })}
                    onChange={(e) => setSteps((all) => all.map((x) => (x.id === s.id ? { ...x, text: e.target.value } : x)))}
                    className={`${inputCls} py-2 text-sm`} />
                  <button type="button" className={iconBtn} onClick={() => setSteps((all) => all.filter((x) => x.id !== s.id))} aria-label={t('form.removeStep', { n: i + 1 })}><Icon name="x" size={16} /></button>
                </li>
              ))}
            </ul>
          )}
          <div className="flex gap-2">
            <input value={newStep} onChange={(e) => setNewStep(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addStep(); } }}
              placeholder={t('form.stepPlaceholder')} aria-label={t('form.newStep')} className={`${inputCls} py-2 text-sm`} />
            <button type="button" className={`${btnSoft} px-3 py-2`} onClick={addStep} aria-label={t('form.addStep')}><Icon name="plus" size={18} /></button>
          </div>
        </div>

        {isEdit && (
          confirmDelete ? (
            <div className="anim-fade flex flex-wrap items-center gap-2 rounded-2xl bg-rose-50 p-2.5 text-sm dark:bg-rose-400/10">
              <span className="font-bold text-rose-900 dark:text-rose-100">{t('task.deleteConfirm')}</span>
              <button type="button" onClick={() => onDelete(initial.id)} className={`rounded-xl bg-rose-200 px-3 py-1 font-bold text-rose-900 hover:bg-rose-300 ${focusRing}`}>{t('task.delete')}</button>
              <button type="button" onClick={() => setConfirmDelete(false)} className={`rounded-xl px-3 py-1 font-bold text-slate-600 hover:bg-white dark:text-slate-300 dark:hover:bg-slate-700 ${focusRing}`}>{t('task.keep')}</button>
            </div>
          ) : (
            <button type="button" onClick={() => setConfirmDelete(true)}
              className={`inline-flex items-center gap-1.5 rounded-xl px-2 py-1 text-sm font-bold text-rose-700 hover:bg-rose-50 dark:text-rose-300 dark:hover:bg-rose-400/10 ${focusRing}`}>
              <Icon name="trash" size={16} />{t('form.delete')}
            </button>
          )
        )}

        <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end">
          <button type="button" className={btnSoft} onClick={onClose}>{t('common.cancel')}</button>
          <button type="submit" className={btnPrimary}>{t(isEdit ? 'form.save' : 'form.create')}</button>
        </div>
      </form>
    </Modal>
  );
}
