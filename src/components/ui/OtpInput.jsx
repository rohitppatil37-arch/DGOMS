import { useRef } from 'react';

export default function OtpInput({ id = 'otp', value = [], onChange }) {
  const refs = useRef([]);

  function handleChange(i, e) {
    const char = e.target.value.replace(/\D/g, '').slice(-1);
    const next = [...value];
    next[i] = char;
    onChange(next);
    if (char && i < 5) refs.current[i + 1]?.focus();
  }

  function handleKeyDown(i, e) {
    if (e.key === 'Backspace' && !value[i] && i > 0) {
      refs.current[i - 1]?.focus();
      const next = [...value];
      next[i - 1] = '';
      onChange(next);
    }
  }

  function handlePaste(e) {
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (text.length === 6) {
      onChange(text.split(''));
      refs.current[5]?.focus();
      e.preventDefault();
    }
  }

  return (
    <div className="flex gap-[7px] mb-[13px]">
      {Array.from({ length: 6 }, (_, i) => (
        <input
          key={i}
          id={`${id}-${i}`}
          ref={el => refs.current[i] = el}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[i] ?? ''}
          onChange={e => handleChange(i, e)}
          onKeyDown={e => handleKeyDown(i, e)}
          onPaste={handlePaste}
          className={`otp-in flex-1 h-[52px] border-2 border-border rounded-[5px] text-center text-[24px] font-bold font-mono text-tx outline-none transition-all min-w-0 bg-surface ${value[i] ? 'filled' : ''}`}
        />
      ))}
    </div>
  );
}
