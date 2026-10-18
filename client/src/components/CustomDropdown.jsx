import React, { useState } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { useClickOutside } from '../hooks/useClickOutside';

/**
 * Premium Aurora Glass Custom Dropdown component.
 * Features:
 * - Outside click dismisses immediately (pointerdown) without blocking foreign actions.
 * - Escape key closes.
 * - Full keyboard & accessibility support.
 * - Consistent Aurora Glass styling.
 */
export const CustomDropdown = ({
  trigger,
  value,
  onChange,
  options = [], // [{ value, label, icon, badge, extra }]
  placeholder = 'Select...',
  align = 'right', // 'left' | 'right'
  width = 'w-56',
  maxHeight = 'max-h-72',
  className = '',
  id,
  renderCustomMenu,
  isOpen: controlledIsOpen,
  onOpenChange,
}) => {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isControlled = controlledIsOpen !== undefined;
  const isOpen = isControlled ? controlledIsOpen : internalIsOpen;

  const setIsOpen = (nextState) => {
    if (!isControlled) {
      setInternalIsOpen(nextState);
    }
    if (onOpenChange) {
      onOpenChange(nextState);
    }
  };

  const closeDropdown = () => {
    setIsOpen(false);
  };

  const dropdownRef = useClickOutside(closeDropdown, isOpen);

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div ref={dropdownRef} className={`relative inline-block ${className}`} id={id ? `${id}-wrapper` : undefined}>
      {/* Trigger Button */}
      {trigger ? (
        typeof trigger === 'function' ? (
          trigger({ isOpen, toggle: () => setIsOpen(!isOpen), close: closeDropdown, selectedOption })
        ) : (
          <div onClick={() => setIsOpen(!isOpen)}>{trigger}</div>
        )
      ) : (
        <button
          type="button"
          id={id}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-xs font-medium glass-input hover:border-slate-500/60 text-slate-200 transition-all cursor-pointer w-full"
        >
          <span className="flex items-center gap-2 truncate">
            {selectedOption?.icon && <span>{selectedOption.icon}</span>}
            <span className="truncate">{selectedOption?.label || placeholder}</span>
          </span>
          <ChevronDown
            className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform duration-200 ${
              isOpen ? 'rotate-180 text-purple-400' : ''
            }`}
          />
        </button>
      )}

      {/* Dropdown Menu Container */}
      {isOpen && (
        <div
          role="listbox"
          className={`absolute ${
            align === 'left' ? 'left-0' : 'right-0'
          } mt-2 ${width} ${maxHeight} overflow-y-auto glass-panel rounded-2xl border border-white/[0.1] p-1.5 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150`}
        >
          {renderCustomMenu ? (
            renderCustomMenu({ close: closeDropdown })
          ) : (
            <div className="space-y-0.5">
              {options.map((opt) => {
                const isSelected = opt.value === value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => {
                      if (onChange) onChange(opt.value);
                      closeDropdown();
                    }}
                    className={`w-full text-left px-2.5 py-2 rounded-xl text-xs font-medium flex items-center justify-between transition-all ${
                      isSelected
                        ? 'bg-purple-600/25 text-purple-200 font-semibold border border-purple-500/30'
                        : 'text-slate-300 hover:bg-white/[0.06] hover:text-white'
                    }`}
                  >
                    <span className="flex items-center gap-2 truncate">
                      {opt.icon && <span className="shrink-0">{opt.icon}</span>}
                      <span className="truncate">{opt.label}</span>
                      {opt.badge && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700/50">
                          {opt.badge}
                        </span>
                      )}
                    </span>
                    <span className="flex items-center gap-1.5 shrink-0 ml-2">
                      {opt.extra && <span className="text-slate-400 text-[11px] font-mono">{opt.extra}</span>}
                      {isSelected && <Check className="w-3.5 h-3.5 text-purple-400" />}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CustomDropdown;
