import { useState } from 'react';
import { SHOP, SLOTS, findItem, isBuyable, isUnlocked } from '../constants/shop.js';
import { Avatar } from '../components/avatar/Avatar.jsx';
import { Coin, CoinBadge } from '../components/ui/Coin.jsx';
import { Icon } from '../components/ui/Icon.jsx';
import { btnPrimary, btnSoft, focusRing, pill, sheet } from '../components/ui/styles.js';
import { useI18n } from '../i18n/useI18n.js';
import { MAX_SHIELDS, SHIELD_PRICE } from '../lib/rest.js';

export function ShopView({ data, level, cheering, cheerTick, onEquip, onBuy, onBuyShield }) {
  const { t, day } = useI18n();
  const [slot, setSlot] = useState('fell');
  const [preview, setPreview] = useState(null);
  const equip = data.hero.equip;
  const owned = new Set(data.owned);
  const previewItem = preview ? findItem(slot, preview) : null;
  const shown = preview ? { ...equip, [slot]: preview } : equip;
  const unlocked = previewItem ? isUnlocked(previewItem, level) : true;
  const canAfford = previewItem ? data.coins >= previewItem.price : false;

  const chooseSlot = (s) => { setSlot(s); setPreview(null); };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-semibold text-slate-800 dark:text-slate-50">{t('shopView.heading')}</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">{t('shopView.intro')}</p>
        </div>
        <CoinBadge coins={data.coins} big />
      </div>

      <div className={`${sheet} flex flex-col items-center gap-4 p-4 sm:flex-row sm:p-5`}>
        <div className="h-[168px] w-[168px] shrink-0">
          <Avatar key={`shop-${cheerTick}`} equip={shown} mood={cheering ? 'cheer' : 'idle'} title={t('shopView.preview', { name: data.hero.name })} />
        </div>
        <div className="w-full min-w-0 flex-1 text-center sm:text-left">
          {previewItem ? (
            <div className="anim-fade">
              <p className="font-display text-xl font-semibold text-slate-800 dark:text-slate-50">{t(`shop.items.${previewItem.id}`)}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">{t('shopView.previewText', { name: data.hero.name })}</p>
              <div className="mt-3 flex flex-wrap justify-center gap-2 sm:justify-start">
                {isBuyable(previewItem) && (
                  <button type="button" className={btnPrimary} disabled={!canAfford || !unlocked}
                    onClick={(e) => { onBuy(slot, previewItem, e); setPreview(null); }}>
                    {t('shopView.buy', { price: previewItem.price })} <Coin size={18} />
                  </button>
                )}
                <button type="button" className={btnSoft} onClick={() => setPreview(null)}>{t('shopView.justLook')}</button>
              </div>
              {!isBuyable(previewItem) && (
                <p className="mt-2 flex items-center justify-center gap-1.5 text-sm text-pink-800 sm:justify-start dark:text-pink-200">
                  <Icon name="sparkles" size={15} />{t('shopView.surpriseHint', { name: data.hero.name })}
                </p>
              )}
              {isBuyable(previewItem) && !unlocked && (
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{t('shopView.locked', { level: previewItem.minLevel })}</p>
              )}
              {isBuyable(previewItem) && unlocked && !canAfford && (
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                  {t('shopView.missing', { count: previewItem.price - data.coins })}
                </p>
              )}
            </div>
          ) : (
            <div>
              <p className="font-display text-xl font-semibold text-slate-800 dark:text-slate-50">{data.hero.name}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">{t('shopView.hint')}</p>
            </div>
          )}
        </div>
      </div>

      <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1" role="group" aria-label={t('shopView.slots')}>
        {SLOTS.map((s) => (
          <button key={s} type="button" className={pill(slot === s)} aria-pressed={slot === s} onClick={() => chooseSlot(s)}>{t(`shop.slots.${s}`)}</button>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 xl:grid-cols-5">
        {SHOP[slot].items.map((item) => {
          const isOwned = owned.has(item.id);
          const isEquipped = equip[slot] === item.id;
          const isPreview = preview === item.id;
          return (
            <button key={item.id} type="button" aria-pressed={isEquipped}
              onClick={() => { if (isOwned) { onEquip(slot, item.id); setPreview(null); } else { setPreview(item.id); } }}
              className={`relative flex flex-col items-center rounded-2xl p-2 pb-2.5 text-center transition ${focusRing} ${isEquipped
                ? 'bg-violet-100 ring-2 ring-violet-300 dark:bg-violet-400/15'
                : isPreview
                  ? 'bg-amber-50 ring-2 ring-amber-200 dark:bg-amber-400/10 dark:ring-amber-300/40'
                  : 'bg-white ring-1 ring-slate-900/5 hover:bg-slate-50 dark:bg-nightcard dark:ring-white/5 dark:hover:bg-slate-700'}`}>
              <span className="block h-[72px] w-[72px] sm:h-[84px] sm:w-[84px]"><Avatar equip={{ ...equip, [slot]: item.id }} title={t(`shop.items.${item.id}`)} still /></span>
              <span className="mt-1 text-sm font-bold leading-tight text-slate-800 dark:text-slate-100">{t(`shop.items.${item.id}`)}</span>
              <span className="mt-0.5 inline-flex items-center gap-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
                {isEquipped
                  ? t('shopView.equipped')
                  : isOwned
                    ? t('shopView.owned')
                    : item.surprise
                      ? <span className="inline-flex items-center gap-1 text-pink-700 dark:text-pink-300"><Icon name="sparkles" size={12} />{t(item.surprise === 'rare' ? 'shopView.surpriseRare' : 'shopView.surpriseOnly')}</span>
                      : isUnlocked(item, level)
                      ? <>{item.price} <Coin size={12} /></>
                      : t('shopView.fromLevel', { level: item.minLevel })}
              </span>
              {!isOwned && <span className="absolute right-2 top-2 text-slate-400"><Icon name="lock" size={14} /></span>}
            </button>
          );
        })}
      </div>

      <ShieldCard shields={data.shields || 0} coins={data.coins} usedOn={data.shieldUsedOn} onBuy={onBuyShield} t={t} day={day} />
    </div>
  );
}

/** Kuscheldecke: schützt die Serie an einem vergessenen Tag. Kein Kleidungsstück, darum ein eigener Bereich. */
function ShieldCard({ shields, coins, usedOn, onBuy, t, day }) {
  const full = shields >= MAX_SHIELDS;
  return (
    <section aria-labelledby="shield-title" className={`${sheet} flex flex-wrap items-center gap-4 p-4 sm:p-5`}>
      <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-indigo-100 text-indigo-700 dark:bg-indigo-400/15 dark:text-indigo-200"><Icon name="shield" size={24} /></span>
      <div className="min-w-0 flex-1 basis-56">
        <h3 id="shield-title" className="font-display text-lg font-semibold text-slate-800 dark:text-slate-100">{t('shield.name')}</h3>
        <p className="text-sm text-slate-600 dark:text-slate-300">{t('shield.text')}</p>
        <p className="mt-1 text-xs font-bold text-slate-500 dark:text-slate-400">
          {t('shield.have', { count: shields, max: MAX_SHIELDS })}
          {usedOn && <> · {t('shield.usedOn', { day: day(usedOn) })}</>}
        </p>
      </div>
      <button type="button" className={btnPrimary} onClick={onBuy} disabled={full || coins < SHIELD_PRICE}>
        {full ? t('shield.full') : <>{t('shield.buy')} · {SHIELD_PRICE} <Coin size={14} /></>}
      </button>
    </section>
  );
}
