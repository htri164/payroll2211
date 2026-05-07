'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

interface DatePickerFieldProps {
  id?: string;
  value: string;
  selectedIso: string;
  inputClassName: string;
  placeholder: string;
  accentClassName?: string;
  onTextChange: (value: string) => void;
  onTextBlur: () => void;
  onSelectIso: (value: string) => void;
}

interface MonthPickerFieldProps {
  value: string;
  selectedMonth: string;
  inputClassName: string;
  placeholder: string;
  accentClassName?: string;
  onTextChange: (value: string) => void;
  onTextBlur: () => void;
  onSelectMonth: (value: string) => void;
}

interface LayerState {
  isMobile: boolean;
  left: number;
  top: number;
  width: number;
  maxHeight: number;
}

const CALENDAR_HEIGHT = 390;
const MONTH_PICKER_HEIGHT = 172;
const DEFAULT_PICKER_WIDTH = 320;
const MONTH_PICKER_WIDTH = 640;
const GUTTER = 12;
const GAP = 8;

const calendarIcon = (
  <svg
    className="block h-5 w-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M8 7V3m8 4V3M5 11h14M6 5h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V7a2 2 0 012-2z"
    />
  </svg>
);

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const parseIsoDate = (value: string) => {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return new Date();
  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
};

const toIsoDate = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
    date.getDate()
  ).padStart(2, '0')}`;

const parseIsoMonth = (value: string) => {
  const match = value.match(/^(\d{4})-(\d{2})$/);
  if (!match) {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() + 1 };
  }

  return { year: Number(match[1]), month: Number(match[2]) };
};

function useFloatingPicker(
  isOpen: boolean,
  onClose: () => void,
  estimatedHeight: number,
  estimatedWidth = DEFAULT_PICKER_WIDTH
) {
  const anchorRef = useRef<HTMLDivElement>(null);
  const layerRef = useRef<HTMLDivElement>(null);
  const [layer, setLayer] = useState<LayerState | null>(null);

  const updateLayer = useCallback(() => {
    const anchor = anchorRef.current;
    if (!anchor || typeof window === 'undefined') return;

    const rect = anchor.getBoundingClientRect();
    const isMobile = window.innerWidth < 640;

    if (isMobile) {
      setLayer({
        isMobile: true,
        left: 0,
        top: 0,
        width: window.innerWidth,
        maxHeight: Math.max(260, window.innerHeight * 0.85),
      });
      return;
    }

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const width = Math.min(Math.max(rect.width, estimatedWidth), viewportWidth - GUTTER * 2);
    const left = clamp(rect.left, GUTTER, viewportWidth - width - GUTTER);
    const spaceBelow = viewportHeight - rect.bottom - GUTTER;
    const spaceAbove = rect.top - GUTTER;
    const openBelow = spaceBelow >= estimatedHeight || spaceBelow >= spaceAbove;
    const availableHeight = Math.max(180, (openBelow ? spaceBelow : spaceAbove) - GAP);
    const maxHeight = Math.min(estimatedHeight, availableHeight);
    const top = openBelow
      ? rect.bottom + GAP
      : Math.max(GUTTER, rect.top - GAP - maxHeight);

    setLayer({
      isMobile: false,
      left,
      top,
      width,
      maxHeight,
    });
  }, [estimatedHeight, estimatedWidth]);

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (anchorRef.current?.contains(target) || layerRef.current?.contains(target)) {
        return;
      }
      onClose();
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    const handleViewportChange = () => {
      window.requestAnimationFrame(updateLayer);
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', handleViewportChange);
    window.addEventListener('scroll', handleViewportChange, true);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', handleViewportChange);
      window.removeEventListener('scroll', handleViewportChange, true);
    };
  }, [isOpen, onClose, updateLayer]);

  return { anchorRef, layerRef, layer, updateLayer };
}

function PickerLayer({
  open,
  layer,
  layerRef,
  children,
  onClose,
}: {
  open: boolean;
  layer: LayerState | null;
  layerRef: React.RefObject<HTMLDivElement | null>;
  children: React.ReactNode;
  onClose: () => void;
}) {
  if (!open || !layer || typeof document === 'undefined') return null;

  if (layer.isMobile) {
    return createPortal(
      <div className="fixed inset-0 z-[1000] flex items-end bg-black/20 sm:hidden">
        <button
          type="button"
          className="absolute inset-0 cursor-default"
          aria-label="Đóng bộ chọn"
          onClick={onClose}
        />
        <div
          ref={layerRef}
          className="relative max-h-[85vh] w-full overflow-y-auto rounded-t-3xl bg-white p-4 shadow-2xl"
        >
          {children}
        </div>
      </div>,
      document.body
    );
  }

  return createPortal(
    <div
      ref={layerRef}
      className="fixed z-[1000] overflow-y-auto rounded-2xl border border-gray-100 bg-white p-3 shadow-2xl"
      style={{
        left: layer.left,
        top: layer.top,
        width: layer.width,
        maxHeight: layer.maxHeight,
      }}
    >
      {children}
    </div>,
    document.body
  );
}

export function DatePickerField({
  id,
  value,
  selectedIso,
  inputClassName,
  placeholder,
  accentClassName = 'bg-primary text-white',
  onTextChange,
  onTextBlur,
  onSelectIso,
}: DatePickerFieldProps) {
  const [open, setOpen] = useState(false);
  const selectedDate = useMemo(() => parseIsoDate(selectedIso), [selectedIso]);
  const [viewDate, setViewDate] = useState(selectedDate);
  const { anchorRef, layerRef, layer, updateLayer } = useFloatingPicker(
    open,
    () => setOpen(false),
    CALENDAR_HEIGHT
  );

  const days = useMemo(() => {
    const firstOfMonth = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1);
    const start = new Date(firstOfMonth);
    start.setDate(1 - firstOfMonth.getDay());

    return Array.from({ length: 42 }, (_, index) => {
      const date = new Date(start);
      date.setDate(start.getDate() + index);
      return date;
    });
  }, [viewDate]);

  const openPicker = () => {
    setViewDate(selectedDate);
    updateLayer();
    setOpen((current) => !current);
  };

  const changeMonth = (offset: number) => {
    setViewDate((current) => new Date(current.getFullYear(), current.getMonth() + offset, 1));
  };

  const selectDate = (date: Date) => {
    onSelectIso(toIsoDate(date));
    setOpen(false);
  };

  const todayIso = toIsoDate(new Date());
  const selectedIsoValue = toIsoDate(selectedDate);

  return (
    <div ref={anchorRef} className="relative">
      <input
        id={id}
        type="text"
        lang="vi"
        inputMode="numeric"
        autoComplete="off"
        placeholder={placeholder}
        value={value}
        onChange={(event) => onTextChange(event.target.value)}
        onBlur={onTextBlur}
        className={`${inputClassName} pr-12`}
      />
      <button
        type="button"
        onClick={openPicker}
        className="absolute right-0 top-0 flex h-12 w-12 items-center justify-center text-gray-400 transition hover:text-gray-700"
        aria-label="Chọn ngày"
      >
        {calendarIcon}
      </button>

      <PickerLayer open={open} layer={layer} layerRef={layerRef} onClose={() => setOpen(false)}>
        <div className="mb-3 flex items-center justify-between">
          <button
            type="button"
            onClick={() => changeMonth(-1)}
            className="rounded-lg px-3 py-2 text-gray-500 transition hover:bg-gray-50 hover:text-gray-900"
            aria-label="Tháng trước"
          >
            {'<'}
          </button>
          <p className="text-sm font-bold text-gray-900">
            Tháng {String(viewDate.getMonth() + 1).padStart(2, '0')}/{viewDate.getFullYear()}
          </p>
          <button
            type="button"
            onClick={() => changeMonth(1)}
            className="rounded-lg px-3 py-2 text-gray-500 transition hover:bg-gray-50 hover:text-gray-900"
            aria-label="Tháng sau"
          >
            {'>'}
          </button>
        </div>

        <div className="grid grid-cols-7 text-center text-xs font-bold text-gray-500">
          {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map((day) => (
            <span key={day} className="py-1">
              {day}
            </span>
          ))}
        </div>

        <div className="mt-1 grid grid-cols-7 gap-1 text-sm">
          {days.map((date) => {
            const iso = toIsoDate(date);
            const inCurrentMonth = date.getMonth() === viewDate.getMonth();
            const selected = iso === selectedIsoValue;
            const today = iso === todayIso;

            return (
              <button
                key={iso}
                type="button"
                onClick={() => selectDate(date)}
                className={`h-9 rounded-lg text-center transition ${
                  selected
                    ? accentClassName
                    : today
                      ? 'border border-gray-300 text-gray-900'
                      : inCurrentMonth
                        ? 'text-gray-900 hover:bg-gray-50'
                        : 'text-gray-300 hover:bg-gray-50'
                }`}
              >
                {date.getDate()}
              </button>
            );
          })}
        </div>

        <div className="mt-3 flex justify-end">
          <button
            type="button"
            onClick={() => selectDate(new Date())}
            className="rounded-lg px-3 py-2 text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
          >
            Hôm nay
          </button>
        </div>
      </PickerLayer>
    </div>
  );
}

export function MonthPickerField({
  value,
  selectedMonth,
  inputClassName,
  placeholder,
  accentClassName = 'bg-success text-white',
  onTextChange,
  onTextBlur,
  onSelectMonth,
}: MonthPickerFieldProps) {
  const [open, setOpen] = useState(false);
  const selected = useMemo(() => parseIsoMonth(selectedMonth), [selectedMonth]);
  const [viewYear, setViewYear] = useState(selected.year);
  const { anchorRef, layerRef, layer, updateLayer } = useFloatingPicker(
    open,
    () => setOpen(false),
    MONTH_PICKER_HEIGHT,
    MONTH_PICKER_WIDTH
  );

  const openPicker = () => {
    setViewYear(selected.year);
    updateLayer();
    setOpen((current) => !current);
  };

  const selectMonth = (month: number) => {
    onSelectMonth(`${viewYear}-${String(month).padStart(2, '0')}`);
    setOpen(false);
  };

  return (
    <div ref={anchorRef} className="relative">
      <input
        type="text"
        inputMode="numeric"
        autoComplete="off"
        placeholder={placeholder}
        value={value}
        onChange={(event) => onTextChange(event.target.value)}
        onBlur={onTextBlur}
        className={`${inputClassName} pr-12`}
      />
      <button
        type="button"
        onClick={openPicker}
        className="absolute right-0 top-0 flex h-12 w-12 items-center justify-center text-gray-400 transition hover:text-gray-700"
        aria-label="Chọn tháng"
      >
        {calendarIcon}
      </button>

      <PickerLayer open={open} layer={layer} layerRef={layerRef} onClose={() => setOpen(false)}>
        <div className="mb-2 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setViewYear((year) => year - 1)}
            className="rounded-lg px-3 py-2 text-gray-500 transition hover:bg-gray-50 hover:text-gray-900"
            aria-label="Năm trước"
          >
            {'<'}
          </button>
          <p className="text-sm font-bold text-gray-900">{viewYear}</p>
          <button
            type="button"
            onClick={() => setViewYear((year) => year + 1)}
            className="rounded-lg px-3 py-2 text-gray-500 transition hover:bg-gray-50 hover:text-gray-900"
            aria-label="Năm sau"
          >
            {'>'}
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
          {Array.from({ length: 12 }, (_, index) => index + 1).map((month) => {
            const monthIso = `${viewYear}-${String(month).padStart(2, '0')}`;
            const active = monthIso === selectedMonth;

            return (
              <button
                key={month}
                type="button"
                onClick={() => selectMonth(month)}
                className={`h-9 rounded-lg text-sm font-semibold transition ${
                  active ? accentClassName : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                Tháng {month}
              </button>
            );
          })}
        </div>
      </PickerLayer>
    </div>
  );
}
