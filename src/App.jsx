import { useEffect, useState } from 'react';
import { useAppearance } from './hooks/useAppearance.js';
import { useCelebration } from './hooks/useCelebration.js';
import { useDailyReset } from './hooks/useDailyReset.js';
import { useGameState } from './hooks/useGameState.js';
import { useLanguage } from './hooks/useLanguage.js';
import { useSync } from './hooks/useSync.js';
import { useTimebox } from './hooks/useTimebox.js';
import { playSound } from './lib/audio.js';
import { addDays, dayKey } from './lib/date.js';
import { pointFrom } from './lib/dom.js';
import { levelInfo } from './lib/progress.js';
import { dailyGoalFor, energyAsked, setEnergy, todayEnergy } from './lib/energy.js';
import { buyShield, isRestDay, setRestDay } from './lib/rest.js';
import { rollSurprise } from './lib/surprise.js';
import { restoreBackup } from './lib/backup.js';
import { clearState, initialState, normalizeTask } from './lib/state.js';
import { isUnlocked } from './constants/shop.js';
import { removeCustomTemplate, saveCustomTemplate } from './lib/templates.js';
import {
  addFirstStep, addTask, clearDoneTasks, completeStep, completeTask, nextOpenTask, postponeTask, removeTask, reopenStep, reopenTask, setDueDates, updateTask,
} from './lib/tasks.js';
import { HeroCard } from './components/hero/HeroCard.jsx';
import { LevelUpModal } from './components/hero/LevelUpModal.jsx';
import { SyncChoiceDialog } from './components/sync/SyncChoiceDialog.jsx';
import { AppHeader } from './components/layout/AppHeader.jsx';
import { TabBar } from './components/layout/TabBar.jsx';
import { TadaModal } from './components/tasks/TadaModal.jsx';
import { TaskFormModal } from './components/tasks/TaskFormModal.jsx';
import { FocusModal } from './components/timebox/FocusModal.jsx';
import { MiniTimer } from './components/timebox/MiniTimer.jsx';
import { TimerModal } from './components/timebox/TimerModal.jsx';
import { FxLayer } from './components/ui/FxLayer.jsx';
import { Toast } from './components/ui/Toast.jsx';
import { LibraryView } from './views/LibraryView.jsx';
import { ProgressView } from './views/ProgressView.jsx';
import { ShopView } from './views/ShopView.jsx';
import { TasksView } from './views/TasksView.jsx';
import { I18nContext } from './i18n/I18nContext.js';

const LEVEL_UP_DELAY = 700;

export function App() {
  const [state, setState] = useGameState();
  const settings = state.settings;

  const [tab, setTab] = useState('aufgaben');
  const [toast, setToast] = useState(null);
  const [levelUp, setLevelUp] = useState(null);
  const [form, setForm] = useState(null); // { task: Task | null }
  const [focusOpen, setFocusOpen] = useState(false);
  const [tadaOpen, setTadaOpen] = useState(false);
  const [timerOpen, setTimerOpen] = useState(false);
  const [afterDone, setAfterDone] = useState(null); // { title, nextId }

  const i18n = useLanguage(settings.language);
  const { t } = i18n;

  useDailyReset(setState);
  const sync = useSync({ state, setState });

  /* Einladungslink (?invite=CODE): Registrierung öffnen und den Code vorausfüllen */
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('invite');
    if (!code) return;
    sync.setInvite(code.trim().toUpperCase());
    setTab('fortschritt');
    params.delete('invite');
    const rest = params.toString();
    window.history.replaceState(null, '', window.location.pathname + (rest ? `?${rest}` : '') + window.location.hash);
    // nur beim Start
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const isDark = useAppearance(settings);
  const celebrate = useCelebration(settings);
  const timebox = useTimebox({
    state, setState, settings,
    onTimeUp: () => celebrate.say(t('hero.lineTimeUp')),
  });

  const lvl = levelInfo(state.xp);
  const todayCount = state.history[dayKey()] || 0;
  const goal = dailyGoalFor(state);
  const restToday = isRestDay(state);
  const defaultLine = restToday && todayCount === 0
    ? t('rest.line')
    : todayCount === 0
    ? t('hero.lineStart')
    : todayCount >= goal
      ? t('hero.lineGoal')
      : t('hero.lineDefault');

  const sfx = (kind) => {
    if (settings.sound) playSound(kind);
  };

  const showLevelUp = (reward, delay = LEVEL_UP_DELAY) => {
    if (reward.gained > 0) setTimeout(() => setLevelUp({ level: reward.level, bonus: reward.bonus }), delay);
  };

  /* ---------- Aufgaben ---------- */
  const toggleTask = (id, evt) => {
    const task = state.tasks.find((t) => t.id === id);
    if (!task) return;

    if (task.done) {
      setState((s) => reopenTask(s, id));
      setToast((tt) => (tt && tt.taskId === id ? null : tt));
      return;
    }

    const surprise = rollSurprise(state);
    const { reward } = completeTask(state, id, Date.now(), surprise);
    if (!reward) return;
    setState((s) => completeTask(s, id, Date.now(), surprise).state);
    celebrateReward(reward, evt);
    const praise = t('praise');
    celebrate.say(rewardLine(reward) || praise[Math.floor(Math.random() * praise.length)]);
    setToast({ id: `${id}-${Date.now()}`, kind: 'done', taskId: id, text: task.title });
  };

  /* Was Mochi zu einer Belohnung sagt: Tagesziel-Bonus vor Überraschung. null = normales Lob. */
  const rewardLine = (reward) => {
    if (reward.goalBonus) return t('hero.lineGoalBonus', { coins: reward.goalBonus });
    const s = reward.surprise;
    if (!s) return null;
    if (s.kind === 'coins') return t('surprise.coins', { coins: s.coins });
    if (s.kind === 'gift') return t('surprise.gift', { item: t(`shop.items.${s.id}`) });
    return t('surprise.phrases')[s.index] || null;
  };

  const surpriseBurst = (s) => {
    if (!s) return [];
    if (s.kind === 'coins') return [{ text: t('surprise.coinsBurst', { coins: s.coins }), tone: 'coin' }];
    return [{ text: t(s.kind === 'gift' ? 'surprise.giftBurst' : 'surprise.phraseBurst'), tone: 'xp' }];
  };

  const celebrateReward = (reward, evt) => {
    celebrate.burst(pointFrom(evt), [
      { text: t('common.xpGain', { xp: reward.xp }), tone: 'xp' },
      { text: t('common.coinGain', { coins: reward.coins }), tone: 'coin' },
      ...(reward.goalBonus ? [{ text: t('common.goalBonus', { coins: reward.goalBonus }), tone: 'coin' }] : []),
      ...surpriseBurst(reward.surprise),
    ]);
    sfx(reward.gained > 0 ? 'level' : 'done');
    celebrate.cheer();
    showLevelUp(reward);
  };

  /* „Ta-da!“: schon Geschafftes eintragen – wird angelegt und sofort abgehakt */
  const logTada = ({ title, difficulty }, evt) => {
    const task = normalizeTask({ title, difficulty, tada: true, createdAt: Date.now() });
    const surprise = rollSurprise(state);
    const { reward } = completeTask(addTask(state, task), task.id, Date.now(), surprise);
    setState((s) => completeTask(addTask(s, task), task.id, Date.now(), surprise).state);
    setTadaOpen(false);
    celebrateReward(reward, evt);
    celebrate.say(rewardLine(reward) || t('hero.lineTada'));
    setToast({ id: `${task.id}-${Date.now()}`, kind: 'tada', taskId: task.id, text: title });
  };

  /* „Nicht heute“ und Tagesabschluss: auf morgen legen, mit Rückgängig */
  const snoozeTask = (id) => {
    const task = state.tasks.find((t) => t.id === id);
    if (!task) return;
    setState((s) => postponeTask(s, id));
    celebrate.say(t('hero.lineSnooze'));
    setToast({ id: `${id}-${Date.now()}`, kind: 'snoozed', text: task.title, prevDue: { [id]: task.due } });
  };

  const moveToTomorrow = (ids) => {
    const prevDue = Object.fromEntries(state.tasks.filter((t) => ids.includes(t.id)).map((t) => [t.id, t.due]));
    const tomorrow = addDays(dayKey(), 1);
    setState((s) => setDueDates(s, Object.fromEntries(ids.map((id) => [id, tomorrow]))));
    celebrate.say(t('hero.lineGoodNight'));
    setToast({ id: `many-${Date.now()}`, kind: 'snoozed', count: ids.length, prevDue });
  };

  /* „Zu groß?“: kleinsten ersten Schritt vorn anfügen */
  const shrinkTask = (taskId, text) => {
    setState((s) => addFirstStep(s, taskId, text));
    celebrate.say(t('tooBig.line'));
  };

  const undoToast = () => {
    if (!toast) return;
    if (toast.prevDue) {
      setState((s) => setDueDates(s, toast.prevDue));
    } else if (toast.kind === 'tada') {
      setState((s) => removeTask(reopenTask(s, toast.taskId), toast.taskId));
    } else {
      const task = state.tasks.find((t) => t.id === toast.taskId);
      if (task && task.done) toggleTask(task.id);
    }
    setToast(null);
  };

  const toggleStep = (taskId, stepId, evt) => {
    const task = state.tasks.find((t) => t.id === taskId);
    const step = task && task.steps.find((s) => s.id === stepId);
    if (!step) return;

    if (step.done) {
      setState((s) => reopenStep(s, taskId, stepId));
      return;
    }

    const { reward } = completeStep(state, taskId, stepId);
    setState((s) => completeStep(s, taskId, stepId).state);
    celebrate.burst(pointFrom(evt), [{ text: t('common.xpGain', { xp: reward.xp }), tone: 'xp' }], false);
    sfx(reward.gained > 0 ? 'level' : 'step');
    if (reward.gained > 0) {
      celebrate.cheer();
      showLevelUp(reward, 500);
    }
  };

  const saveTask = (fields, { asTemplate = false } = {}) => {
    if (asTemplate) {
      setState((s) => saveCustomTemplate(s, fields));
      celebrate.say(t('hero.lineTemplateSaved'));
    }
    if (form && form.task) {
      const id = form.task.id;
      setState((s) => updateTask(s, id, fields));
    } else {
      setState((s) => addTask(s, normalizeTask({ ...fields, createdAt: Date.now() })));
      setTab('aufgaben');
    }
    setForm(null);
  };

  const deleteTask = (id) => {
    setState((s) => removeTask(s, id));
    setToast((tt) => (tt && tt.taskId === id ? null : tt));
  };

  const addTemplate = (tpl) => {
    setState((s) => addTask(s, normalizeTask({
      title: tpl.title, desc: tpl.desc, category: tpl.category, difficulty: tpl.difficulty,
      repeat: tpl.repeat || 'none', repeatDays: tpl.repeatDays, steps: tpl.steps || [], minutes: tpl.minutes || null, when: tpl.when,
      templateId: tpl.id, createdAt: Date.now(),
    })));
  };

  const deleteCustomTemplate = (id) => setState((s) => removeCustomTemplate(s, id));

  /* Tagesform: level 'wenig' | 'mittel' | 'viel', null = übersprungen, undefined = neu fragen */
  const chooseEnergy = (level) => {
    setState((s) => setEnergy(s, level));
    if (level === 'wenig') celebrate.say(t('energy.lineWenig', { goal: dailyGoalFor(setEnergy(state, level)) }));
    else if (level === 'mittel') celebrate.say(t('energy.lineMittel'));
    else if (level === 'viel') celebrate.say(t('energy.lineViel'));
  };

  /* Ruhetag: zählt nicht als Lücke in der Serie. Wer ihn nimmt, wird heute nicht mehr nach der Tagesform gefragt. */
  const chooseRest = (on) => {
    setState((s) => setRestDay(on && !energyAsked(s) ? setEnergy(s, null) : s, on));
    celebrate.say(on ? t('rest.line') : t('energy.lineMittel'));
  };

  const buyBlanket = (evt) => {
    const next = buyShield(state);
    if (next === state) return;
    setState(buyShield);
    celebrate.burst(pointFrom(evt), [{ text: t('shield.name'), tone: 'coin' }]);
    sfx('buy');
    celebrate.cheer();
    celebrate.say(t('shield.bought'));
  };

  /* ---------- Zeitbox ---------- */
  const startTimebox = (taskId, minutes) => {
    if (!timebox.start(taskId, minutes)) return;
    setAfterDone(null);
    setFocusOpen(false);
    setTimerOpen(true);
  };

  const stopTimebox = () => {
    timebox.stop();
    setTimerOpen(false);
  };

  const postponeTimebox = () => {
    timebox.later();
    setTimerOpen(false);
    celebrate.say(t('hero.lineLater'));
  };

  const completeTimebox = (evt) => {
    const task = timebox.task;
    if (!task) return;
    const next = nextOpenTask(state.tasks, task.id);
    toggleTask(task.id, evt);
    setAfterDone({ title: task.title, nextId: next ? next.id : null });
  };

  const closeTimerModal = () => {
    setTimerOpen(false);
    setAfterDone(null);
  };

  /* ---------- Held, Shop & Einstellungen ---------- */
  const equipItem = (slot, itemId) => {
    setState((s) => ({ ...s, hero: { ...s.hero, equip: { ...s.hero.equip, [slot]: itemId } } }));
  };

  const buyItem = (slot, item, evt) => {
    if (state.owned.includes(item.id)) {
      equipItem(slot, item.id);
      return;
    }
    if (state.coins < item.price || !isUnlocked(item, lvl.level)) return;
    setState((s) => ({
      ...s,
      coins: s.coins - item.price,
      owned: [...s.owned, item.id],
      hero: { ...s.hero, equip: { ...s.hero.equip, [slot]: item.id } },
    }));
    const itemName = t(`shop.items.${item.id}`);
    celebrate.burst(pointFrom(evt), [{ text: t('shopView.bought', { item: itemName }), tone: 'coin' }]);
    sfx('buy');
    celebrate.cheer();
    celebrate.say(t('hero.lineBought', { item: itemName }));
  };

  const rename = (name) => setState((s) => ({ ...s, hero: { ...s.hero, name } }));
  const updateSettings = (patch) => setState((s) => ({ ...s, settings: { ...s.settings, ...patch } }));

  const resetAll = () => {
    clearState();
    setState(initialState(settings.language)); // Sprache bleibt beim Zurücksetzen erhalten
    setToast(null);
    setTimerOpen(false);
    setAfterDone(null);
    setTab('aufgaben');
  };

  const importBackup = (imported) => {
    setState((s) => restoreBackup(s, imported));
    setToast(null);
    setTimerOpen(false);
    setAfterDone(null);
  };

  const goLibrary = () => {
    setFocusOpen(false);
    setTab('vorlagen');
  };

  const nextTask = afterDone && afterDone.nextId
    ? state.tasks.find((t) => t.id === afterDone.nextId && !t.done) || null
    : null;
  const miniVisible = !!timebox.timer && !timerOpen;

  return (
    <I18nContext.Provider value={i18n}>
    <div className="min-h-full font-sans text-slate-700 dark:text-slate-200">
      <div className="mx-auto max-w-6xl px-4 pb-28 pt-4 sm:px-6 lg:grid lg:grid-cols-[340px_minmax(0,1fr)] lg:gap-8 lg:pt-8">
        <aside className="lg:sticky lg:top-8 lg:self-start">
          <AppHeader sound={settings.sound} isDark={isDark}
            onToggleSound={() => updateSettings({ sound: !settings.sound })}
            onToggleTheme={() => updateSettings({ theme: isDark ? 'light' : 'dark' })} />
          <HeroCard data={state} lvl={lvl} todayCount={todayCount} goal={goal} cheering={celebrate.cheering} cheerTick={celebrate.cheerTick}
            line={celebrate.heroLine || defaultLine} onRename={rename} onTada={() => setTadaOpen(true)} />
        </aside>

        <main className="mt-4 lg:mt-0">
          <TabBar tab={tab} onChange={setTab} />
          <div className="mt-3" key={tab}>
            {tab === 'aufgaben' && (
              <TasksView tasks={state.tasks} timer={timebox.timer} todayCount={todayCount}
                energy={state.energy} onEnergy={chooseEnergy} restToday={restToday} onRest={chooseRest}
                onSnooze={snoozeTask} onMoveToTomorrow={moveToTomorrow} onAddFirstStep={shrinkTask}
                onStart={startTimebox} onOpenTimer={() => setTimerOpen(true)}
                onToggle={toggleTask} onToggleStep={toggleStep}
                onEdit={(task) => setForm({ task })} onNew={() => setForm({ task: null })}
                onFocus={() => setFocusOpen(true)} onClearDone={() => setState(clearDoneTasks)} onGoLibrary={goLibrary} />
            )}
            {tab === 'vorlagen' && (
              <LibraryView tasks={state.tasks} customTemplates={state.customTemplates}
                onAdd={addTemplate} onRemoveCustom={deleteCustomTemplate} />
            )}
            {tab === 'umkleide' && (
              <ShopView data={state} level={lvl.level} cheering={celebrate.cheering} cheerTick={celebrate.cheerTick} onEquip={equipItem} onBuy={buyItem} onBuyShield={buyBlanket} />
            )}
            {tab === 'fortschritt' && <ProgressView data={state} sync={sync} onSettings={updateSettings} onRestore={importBackup} onReset={resetAll} />}
          </div>
        </main>
      </div>

      <FxLayer items={celebrate.fx} />

      {miniVisible && (
        <MiniTimer timer={timebox.timer} task={timebox.task} onOpen={() => setTimerOpen(true)}
          onPause={timebox.pause} onResume={timebox.resume} />
      )}
      {toast && <Toast toast={toast} onUndo={undoToast} onClose={() => setToast(null)} lifted={miniVisible} />}

      {form && (
        <TaskFormModal key={form.task ? form.task.id : 'neu'} initial={form.task} timeLog={state.timeLog} onClose={() => setForm(null)} onSave={saveTask}
          onDelete={(id) => { deleteTask(id); setForm(null); }} />
      )}
      {tadaOpen && <TadaModal onClose={() => setTadaOpen(false)} onSave={logTada} />}
      {focusOpen && (
        <FocusModal tasks={state.tasks} energy={todayEnergy(state)} onClose={() => setFocusOpen(false)} onStart={startTimebox}
          onComplete={(id, e) => { toggleTask(id, e); setFocusOpen(false); }}
          onToggleStep={toggleStep} onAddFirstStep={shrinkTask} onGoLibrary={goLibrary} />
      )}
      {timerOpen && (timebox.timer || afterDone) && (
        <TimerModal timer={timebox.timer} task={timebox.task} hero={state.hero} timeLog={state.timeLog} after={afterDone} nextTask={nextTask}
          noiseOn={timebox.noiseOn} onNoise={timebox.toggleNoise} onMinimize={closeTimerModal}
          onPause={timebox.pause} onResume={timebox.resume} onAdjust={timebox.adjust}
          onComplete={completeTimebox} onStop={stopTimebox} onLater={postponeTimebox}
          onToggleStep={toggleStep} onStartNext={(id) => startTimebox(id)} />
      )}
      {sync.needsChoice && <SyncChoiceDialog onChoose={sync.resolveChoice} onClose={sync.signOut} />}
      {levelUp && <LevelUpModal info={levelUp} equip={state.hero.equip} onClose={() => setLevelUp(null)} />}
    </div>
    </I18nContext.Provider>
  );
}
