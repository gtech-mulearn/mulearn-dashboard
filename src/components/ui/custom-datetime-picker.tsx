"use client";

import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
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
        "rounded-full transition-all duration-200 text-foreground cursor-pointer hover:bg-muted",
        "data-[selected-single=true]:!bg-brand-blue data-[selected-single=true]:!text-primary-foreground data-[selected-single=true]:font-bold",
        className,
      )}
      {...props}
    />
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
                ? "text-foreground font-bold"
                : "text-muted-foreground font-normal",
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
}: CustomDateTimePickerProps) {
  const date = value ? new Date(value) : undefined;

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
    // Preserve existing time when changing date
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
            !date && "text-muted-foreground",
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
          {date ? (
            <div className="flex min-w-0 flex-1 items-center gap-2 text-foreground">
              <span className="truncate">{format(date, "PPP")}</span>
              {!hideTime && (
                <>
                  <span className="text-muted-foreground" aria-hidden>
                    ·
                  </span>
                  <span className="shrink-0">{format(date, "p")}</span>
                </>
              )}
            </div>
          ) : (
            <span className="text-muted-foreground">
              Pick a date{!hideTime && " and time"}
            </span>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="w-auto max-w-max p-0 bg-background rounded-2xl shadow-xl overflow-hidden">
        <DialogTitle className="sr-only">Select Date and Time</DialogTitle>
        <div className="flex flex-col md:flex-row max-h-[85vh] overflow-y-auto overflow-x-hidden">
          <div
            className={cn(
              "p-4 border-border",
              !hideTime && "border-b md:border-b-0 md:border-r",
            )}
          >
            <Calendar
              mode="single"
              selected={date}
              onSelect={handleDateSelect}
              showOutsideDays={false}
              className="text-foreground"
              components={{
                DayButton: CustomDayButton,
                MonthCaption: (props: any) => {
                  const date =
                    props.calendarMonth?.date ||
                    props.displayMonth ||
                    props.month ||
                    new Date();
                  return (
                    <div className={props.className}>
                      <div className="flex flex-col items-center justify-center gap-1">
                        <span className="text-xl font-bold text-foreground leading-none">
                          {format(date, "MMMM")}
                        </span>
                        <span className="text-[0.7rem] font-bold text-foreground leading-none">
                          {format(date, "yyyy")}
                        </span>
                      </div>
                    </div>
                  );
                },
              }}
              classNames={{
                weekday:
                  "text-muted-foreground rounded-md flex-1 font-medium text-[0.7rem] uppercase select-none text-center",
                caption_label: "flex items-center justify-center",
                month_caption: "flex items-center justify-center pt-2 pb-4",
                nav: "flex items-center w-full absolute top-2 inset-x-0 justify-between px-2 pointer-events-none",
                button_previous:
                  "h-8 w-8 rounded-full bg-background shadow-sm border flex items-center justify-center text-foreground hover:bg-muted pointer-events-auto cursor-pointer",
                button_next:
                  "h-8 w-8 rounded-full bg-background shadow-sm border flex items-center justify-center text-foreground hover:bg-muted pointer-events-auto cursor-pointer",
                today: "!bg-transparent",
              }}
            />
          </div>
          {!hideTime && (
            <div className="flex items-center justify-center p-3 gap-2 bg-muted/50">
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
        <div className="flex justify-center gap-4 py-4 px-6 select-none bg-muted/50 rounded-md">
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
