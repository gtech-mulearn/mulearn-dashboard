"use client";

import { format } from "date-fns";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface CustomDateTimePickerProps {
  value?: string; // ISO string expected
  onChange: (value: string) => void;
  disabled?: boolean;
  hideTime?: boolean;
  placeholder?: string;
}

const HOURS = Array.from({ length: 24 }, (_, i) =>
  i.toString().padStart(2, "0"),
);
const MINUTES = Array.from({ length: 60 }, (_, i) =>
  i.toString().padStart(2, "0"),
);

const ITEM_HEIGHT = 32;

function CustomDayButton({
  className,
  day,
  modifiers,
  ...props
}: { day: any; modifiers: any } & React.ComponentProps<"button">) {
  const ref = React.useRef<HTMLButtonElement>(null);
  React.useEffect(() => {
    if (modifiers.focused) ref.current?.focus();
  }, [modifiers.focused]);

  return (
    <button
      ref={ref}
      type="button"
      data-day={day.date.toLocaleDateString()}
      data-selected-single={
        modifiers.selected &&
        !modifiers.range_start &&
        !modifiers.range_end &&
        !modifiers.range_middle
      }
      className={cn(
        "flex aspect-square size-auto w-full min-w-8 items-center justify-center font-normal text-[0.8rem]",
        "rounded-full transition-all duration-200 text-black dark:text-white cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800",
        "data-[selected-single=true]:!bg-blue-600 data-[selected-single=true]:!text-white data-[selected-single=true]:font-bold",
        className,
      )}
      {...props}
    />
  );
}

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function MonthYearCaption({
  displayMonth,
  onMonthChange,
}: {
  displayMonth: Date;
  onMonthChange: (date: Date) => void;
}) {
  const [monthOpen, setMonthOpen] = React.useState(false);
  const [yearOpen, setYearOpen] = React.useState(false);
  const currentYear = displayMonth.getFullYear();
  const currentMonth = displayMonth.getMonth();
  const years = Array.from({ length: 201 }, (_, i) => 1900 + i);
  const monthScrollRef = React.useRef<HTMLDivElement>(null);
  const yearScrollRef = React.useRef<HTMLDivElement>(null);

  // Auto-scroll selected item into view when dropdown opens
  React.useEffect(() => {
    if (monthOpen && monthScrollRef.current) {
      const el = monthScrollRef.current.querySelector(
        `[data-month="${currentMonth}"]`,
      ) as HTMLElement;
      el?.scrollIntoView({ block: "center" });
    }
  }, [monthOpen, currentMonth]);

  React.useEffect(() => {
    if (yearOpen && yearScrollRef.current) {
      const el = yearScrollRef.current.querySelector(
        `[data-year="${currentYear}"]`,
      ) as HTMLElement;
      el?.scrollIntoView({ block: "center" });
    }
  }, [yearOpen, currentYear]);

  const goToPrev = () => {
    const d = new Date(displayMonth);
    d.setMonth(d.getMonth() - 1);
    onMonthChange(d);
  };

  const goToNext = () => {
    const d = new Date(displayMonth);
    d.setMonth(d.getMonth() + 1);
    onMonthChange(d);
  };

  return (
    <div className="flex items-center justify-between w-full px-1 mb-2">
      <button
        type="button"
        onClick={goToPrev}
        className="h-7 w-7 rounded-full flex items-center justify-center hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer text-zinc-600 dark:text-zinc-400"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      <div className="flex items-center gap-1">
        {/* Month dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setMonthOpen((o) => !o);
              setYearOpen(false);
            }}
            className="font-bold text-base px-2 py-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer text-black dark:text-white select-none"
          >
            {MONTH_NAMES[currentMonth]}
          </button>
          {monthOpen && (
            <>
              {/* Backdrop to close on outside click */}
              <button
                type="button"
                className="fixed inset-0 z-40 h-full w-full cursor-default bg-transparent outline-none border-none"
                onClick={() => setMonthOpen(false)}
                aria-label="Close month dropdown"
                tabIndex={-1}
              />
              <div
                className="absolute left-1/2 -translate-x-1/2 top-full mt-1 z-50 w-36 bg-white dark:bg-zinc-900 rounded-xl shadow-xl p-1 flex flex-col gap-0.5"
                style={{ maxHeight: "200px", overflowY: "auto" }}
                ref={monthScrollRef}
                onWheel={(e) => e.stopPropagation()}
              >
                {MONTH_NAMES.map((name, idx) => (
                  <button
                    key={name}
                    type="button"
                    data-month={idx}
                    onClick={() => {
                      const d = new Date(displayMonth);
                      d.setMonth(idx);
                      onMonthChange(d);
                      setMonthOpen(false);
                    }}
                    className={cn(
                      "w-full text-left px-3 py-1.5 text-sm rounded-lg transition-colors cursor-pointer",
                      idx === currentMonth
                        ? "bg-blue-600 text-white font-semibold"
                        : "hover:bg-zinc-100 dark:hover:bg-zinc-800 text-black dark:text-white",
                    )}
                  >
                    {name}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Year dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setYearOpen((o) => !o);
              setMonthOpen(false);
            }}
            className="font-bold text-base px-2 py-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer text-black dark:text-white select-none"
          >
            {currentYear}
          </button>
          {yearOpen && (
            <>
              <button
                type="button"
                className="fixed inset-0 z-40 h-full w-full cursor-default bg-transparent outline-none border-none"
                onClick={() => setYearOpen(false)}
                aria-label="Close year dropdown"
                tabIndex={-1}
              />
              <div
                className="absolute left-1/2 -translate-x-1/2 top-full mt-1 z-50 w-24 bg-white dark:bg-zinc-900 rounded-xl shadow-xl p-1 flex flex-col gap-0.5"
                style={{ maxHeight: "200px", overflowY: "auto" }}
                ref={yearScrollRef}
                onWheel={(e) => e.stopPropagation()}
              >
                {years.map((yr) => (
                  <button
                    key={yr}
                    type="button"
                    data-year={yr}
                    onClick={() => {
                      const d = new Date(displayMonth);
                      d.setFullYear(yr);
                      onMonthChange(d);
                      setYearOpen(false);
                    }}
                    className={cn(
                      "w-full text-left px-3 py-1.5 text-sm rounded-lg transition-colors cursor-pointer",
                      yr === currentYear
                        ? "bg-blue-600 text-white font-semibold"
                        : "hover:bg-zinc-100 dark:hover:bg-zinc-800 text-black dark:text-white",
                    )}
                  >
                    {yr}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={goToNext}
        className="h-7 w-7 rounded-full flex items-center justify-center hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer text-zinc-600 dark:text-zinc-400"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}

function TimeWheel({
  items,
  selectedValue,
  onChange,
}: {
  items: string[];
  selectedValue: string;
  onChange: (val: string) => void;
}) {
  const [scrollPos, setScrollPos] = React.useState(() => {
    const index = items.indexOf(selectedValue);
    return index !== -1 ? index * ITEM_HEIGHT : 0;
  });
  const scrollPosRef = React.useRef(scrollPos);
  const scrollTimeout = React.useRef<NodeJS.Timeout>(null);
  const [isDragging, setIsDragging] = React.useState(false);
  const startY = React.useRef(0);
  const startScrollPos = React.useRef(0);

  // Sync when selectedValue changes externally
  React.useEffect(() => {
    const targetIndex = items.indexOf(selectedValue);
    if (targetIndex !== -1) {
      const currentLogicalIndex = scrollPosRef.current / ITEM_HEIGHT;
      const currentCycle = Math.floor(currentLogicalIndex / items.length);
      let newLogicalIndex = currentCycle * items.length + targetIndex;

      const diff = newLogicalIndex - currentLogicalIndex;
      if (diff > items.length / 2) newLogicalIndex -= items.length;
      else if (diff < -items.length / 2) newLogicalIndex += items.length;

      const newPos = newLogicalIndex * ITEM_HEIGHT;
      setScrollPos(newPos);
      scrollPosRef.current = newPos;
    }
  }, [selectedValue, items]);

  const onPointerDown = (e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsDragging(true);
    startY.current = e.clientY;
    startScrollPos.current = scrollPosRef.current;
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!e.currentTarget.hasPointerCapture(e.pointerId)) return;
    const walk = (e.clientY - startY.current) * 1.5;
    const newPos = startScrollPos.current - walk;
    setScrollPos(newPos);
    scrollPosRef.current = newPos;
  };

  const onPointerUp = (e: React.PointerEvent) => {
    if (!e.currentTarget.hasPointerCapture(e.pointerId)) return;
    e.currentTarget.releasePointerCapture(e.pointerId);
    setIsDragging(false);

    // Snap to nearest item
    const nearestLogicalIndex = Math.round(scrollPosRef.current / ITEM_HEIGHT);
    const newPos = nearestLogicalIndex * ITEM_HEIGHT;
    setScrollPos(newPos);
    scrollPosRef.current = newPos;

    const wrappedIndex =
      ((nearestLogicalIndex % items.length) + items.length) % items.length;
    if (items[wrappedIndex] !== selectedValue) {
      onChange(items[wrappedIndex]);
    }
  };

  const onWheel = (e: React.WheelEvent) => {
    const newPos = scrollPosRef.current + e.deltaY;
    setScrollPos(newPos);
    scrollPosRef.current = newPos;

    if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
    scrollTimeout.current = setTimeout(() => {
      const nearestLogicalIndex = Math.round(
        scrollPosRef.current / ITEM_HEIGHT,
      );
      const snapPos = nearestLogicalIndex * ITEM_HEIGHT;
      setScrollPos(snapPos);
      scrollPosRef.current = snapPos;

      const wrappedIndex =
        ((nearestLogicalIndex % items.length) + items.length) % items.length;
      if (items[wrappedIndex] !== selectedValue) {
        onChange(items[wrappedIndex]);
      }
    }, 400);
  };

  const centerLogicalIndex = scrollPos / ITEM_HEIGHT;
  const startIdx = Math.floor(centerLogicalIndex) - 3;
  const endIdx = Math.floor(centerLogicalIndex) + 3;
  const visibleIndices = [];
  for (let i = startIdx; i <= endIdx; i++) {
    visibleIndices.push(i);
  }

  return (
    <div
      className="h-[160px] w-12 relative overflow-hidden [perspective:1000px] cursor-grab active:cursor-grabbing touch-none"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onWheel={onWheel}
    >
      {visibleIndices.map((logicalIndex) => {
        const wrappedIndex =
          ((logicalIndex % items.length) + items.length) % items.length;
        const item = items[wrappedIndex];

        const offset = logicalIndex - centerLogicalIndex;
        const translateY = offset * ITEM_HEIGHT;
        const rotateX = offset * -25;
        const scale = 1 - Math.abs(offset) * 0.15;
        const opacity = Math.max(0, 1 - Math.abs(offset) * 0.5);
        const isSelected = Math.abs(offset) < 0.5;

        return (
          <button
            key={logicalIndex}
            type="button"
            className={cn(
              "absolute left-0 right-0 flex items-center justify-center select-none cursor-pointer",
              isSelected
                ? "text-black font-bold dark:text-white"
                : "text-gray-500 font-normal dark:text-gray-400",
            )}
            onClick={() => {
              if (isDragging) return;
              const newPos = logicalIndex * ITEM_HEIGHT;
              setScrollPos(newPos);
              scrollPosRef.current = newPos;
              onChange(item);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                if (isDragging) return;
                const newPos = logicalIndex * ITEM_HEIGHT;
                setScrollPos(newPos);
                scrollPosRef.current = newPos;
                onChange(item);
              }
            }}
            style={{
              height: ITEM_HEIGHT,
              top: "50%",
              marginTop: -ITEM_HEIGHT / 2,
              transform: `translateY(${translateY}px) rotateX(${rotateX}deg) scale(${scale})`,
              opacity,
              transition: isDragging
                ? "none"
                : "transform 0.2s ease-out, opacity 0.2s ease-out, color 0.2s ease-out",
            }}
          >
            {item}
          </button>
        );
      })}
    </div>
  );
}

export function CustomDateTimePicker({
  value,
  onChange,
  disabled,
  hideTime = false,
  placeholder,
}: CustomDateTimePickerProps) {
  const date = value ? new Date(value) : undefined;
  const [month, setMonth] = React.useState<Date>(date || new Date());

  const formatLocalISO = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const h = String(d.getHours()).padStart(2, "0");
    const m = String(d.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${h}:${m}`;
  };

  const handleDateSelect = (newDate: Date | undefined) => {
    if (!newDate) return;
    const current = date || new Date();
    newDate.setHours(current.getHours());
    newDate.setMinutes(current.getMinutes());
    onChange(formatLocalISO(newDate));
  };

  const handleHourChange = (hour: string) => {
    if (!date) return;
    const newDate = new Date(date);
    newDate.setHours(parseInt(hour, 10));
    onChange(formatLocalISO(newDate));
  };

  const handleMinuteChange = (minute: string) => {
    if (!date) return;
    const newDate = new Date(date);
    newDate.setMinutes(parseInt(minute, 10));
    onChange(formatLocalISO(newDate));
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant={"outline"}
          disabled={disabled}
          className={cn(
            "w-full justify-start text-left font-normal shadow-sm rounded-xl py-6",
            "!border-gray-300 dark:!border-zinc-700 hover:!bg-gray-50 dark:hover:!bg-zinc-900 !text-black dark:!text-white",
            !date && "text-muted-foreground",
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
          {date ? (
            <div className="flex flex-1 items-center justify-between text-black dark:text-white">
              <span>{format(date, "PPP")}</span>
              {!hideTime && <span>{format(date, "p")}</span>}
            </div>
          ) : (
            <span className="text-muted-foreground">
              {placeholder || `Pick a date${!hideTime ? " and time" : ""}`}
            </span>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="w-auto max-w-max p-0 bg-white dark:bg-zinc-950 rounded-2xl shadow-xl overflow-hidden">
        <DialogTitle className="sr-only">Select Date and Time</DialogTitle>
        <div className="flex flex-col md:flex-row max-h-[85vh] overflow-y-auto overflow-x-hidden">
          <div
            className={cn(
              "p-4 border-zinc-100 dark:border-zinc-800",
              !hideTime && "border-b md:border-b-0 md:border-r",
            )}
          >
            <Calendar
              mode="single"
              selected={date}
              month={month}
              onMonthChange={setMonth}
              onSelect={handleDateSelect}
              showOutsideDays={false}
              captionLayout="label"
              className="text-black dark:text-white"
              components={{
                DayButton: CustomDayButton,
                MonthCaption: ({ calendarMonth }: any) => (
                  <MonthYearCaption
                    displayMonth={calendarMonth.date}
                    onMonthChange={setMonth}
                  />
                ),
              }}
              classNames={{
                weekday:
                  "text-gray-400 dark:text-gray-500 rounded-md flex-1 font-medium text-[0.7rem] uppercase select-none text-center",
                button_previous: "hidden",
                button_next: "hidden",
                nav: "hidden",
                month_caption: "flex items-center justify-center",
                today: "!bg-transparent",
              }}
            />
          </div>
          {!hideTime && (
            <div className="flex items-center justify-center p-3 gap-2 bg-zinc-50 dark:bg-zinc-900/50">
              <TimeWheel
                items={HOURS}
                selectedValue={date ? format(date, "HH") : "00"}
                onChange={handleHourChange}
              />
              <div className="flex items-center justify-center font-bold text-xl pb-1">
                :
              </div>
              <TimeWheel
                items={MINUTES}
                selectedValue={date ? format(date, "mm") : "00"}
                onChange={handleMinuteChange}
              />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function ScrollableTimePicker({
  value,
  onChange,
  disabled,
  className,
  "aria-label": ariaLabel,
}: {
  value: string; // "HH:mm"
  onChange: (val: string) => void;
  disabled?: boolean;
  className?: string;
  "aria-label"?: string;
}) {
  const [hourStr, minStr] = (value || "09:00").split(":");
  const selectedHour = hourStr || "09";
  const selectedMinute = minStr || "00";

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          aria-label={ariaLabel}
          className={cn(
            "focus:outline-none disabled:opacity-50 text-left",
            className,
          )}
        >
          {selectedHour}:{selectedMinute}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="center">
        <div className="flex justify-center gap-4 py-4 px-6 select-none bg-zinc-50 dark:bg-zinc-900/50 rounded-md">
          <TimeWheel
            items={HOURS}
            selectedValue={selectedHour}
            onChange={(val) => {
              onChange(`${val}:${selectedMinute}`);
            }}
          />
          <div className="text-xl font-bold flex items-center justify-center -mt-8">
            :
          </div>
          <TimeWheel
            items={MINUTES}
            selectedValue={selectedMinute}
            onChange={(val) => {
              onChange(`${selectedHour}:${val}`);
            }}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}
