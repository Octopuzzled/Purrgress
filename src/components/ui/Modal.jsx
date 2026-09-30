import { useEffect, useRef } from 'react';

export function Modal({ onClose, labelledBy, children, wide = false }) {
  const panelRef = useRef(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') closeRef.current(); };
    window.addEventListener('keydown', onKey);
    const prev = document.activeElement;
    const t = setTimeout(() => {
      const panel = panelRef.current;
      if (!panel) return;
      const target = panel.querySelector('[data-autofocus]') || panel;
      target.focus();
    }, 30);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      clearTimeout(t);
      document.body.style.overflow = prevOverflow;
      if (prev && typeof prev.focus === 'function' && document.contains(prev)) prev.focus();
    };
  }, []);

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center p-3 sm:items-center sm:p-6" role="dialog" aria-modal="true" aria-labelledby={labelledBy}>
      <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-[2px]" onClick={() => closeRef.current()} />
      <div ref={panelRef} tabIndex={-1}
        className={`anim-fade relative w-full ${wide ? 'max-w-xl' : 'max-w-md'} max-h-[88vh] overflow-y-auto rounded-[28px] bg-cream p-5 shadow-2xl outline-hidden dark:bg-nightcard sm:p-6`}
        style={{ marginBottom: 'env(safe-area-inset-bottom, 0px)' }}>
        {children}
      </div>
    </div>
  );
}
