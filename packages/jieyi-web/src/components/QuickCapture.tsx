import { useEffect, useRef, useState } from 'react';
import { jieyiService } from '@shared/api/services';

export default function QuickCapture({ onNavigate }: { onNavigate: (path: string) => void }) {
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (open) requestAnimationFrame(() => textareaRef.current?.focus());
  }, [open]);

  const close = () => {
    if (saving) return;
    setOpen(false);
    setError('');
    setSaved(false);
  };

  const save = async () => {
    if (!content.trim() || saving) return;
    setSaving(true);
    setError('');
    try {
      await jieyiService.notes.create({
        title: '记一笔',
        content,
      });
      setContent('');
      setSaved(true);
    } catch (reason) {
      console.error('quick capture failed', reason);
      setError('原文没有保存成功，请稍后重试。');
    } finally {
      setSaving(false);
    }
  };

  const goToAccumulation = () => {
    close();
    onNavigate('/accumulate');
  };

  return (
    <>
      <button className="quick-capture-trigger" type="button" onClick={() => setOpen(true)}>记一笔</button>
      {open && (
        <div className="quick-capture-backdrop" role="presentation" onMouseDown={(event) => {
          if (event.currentTarget === event.target) close();
        }}>
          <section className="quick-capture-dialog" role="dialog" aria-modal="true" aria-labelledby="quick-capture-title">
            <header>
              <div><span>QUICK NOTE</span><h2 id="quick-capture-title">先把原话留下</h2></div>
              <button type="button" onClick={close} aria-label="关闭记一笔">关闭</button>
            </header>
            <p>不分类，直接保存。关联和整理可以稍后再做。</p>
            <textarea ref={textareaRef} value={content} onChange={(event) => setContent(event.target.value)} placeholder="想到什么就写什么，可以粘贴长文……" />
            {error && <div className="api-warning" role="alert">{error}</div>}
            {saved ? (
              <div className="quick-capture-success" role="status">
                <b>原文已保存</b><span>关联和整理可以稍后再做。</span>
                <div><button type="button" className="btn-primary" onClick={goToAccumulation}>去积累查看</button><button type="button" className="btn-secondary" onClick={close}>完成</button></div>
              </div>
            ) : (
              <button type="button" className="btn-primary quick-capture-save" disabled={!content.trim() || saving} onClick={save}>{saving ? '保存中…' : '保存原文'}</button>
            )}
          </section>
        </div>
      )}
    </>
  );
}
