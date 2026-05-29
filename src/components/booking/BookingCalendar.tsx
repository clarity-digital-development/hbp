"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  getSlotsForDate,
  isDateAvailable,
  isSameDay,
  startOfToday,
  toISODate,
  formatLongDate,
} from "@/lib/availability";

interface BookingCalendarProps {
  selectedDate: Date | null;
  selectedTime: string | null;
  onSelectDate: (date: Date) => void;
  onSelectTime: (time: string) => void;
}

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export function BookingCalendar({
  selectedDate,
  selectedTime,
  onSelectDate,
  onSelectTime,
}: BookingCalendarProps) {
  const [viewMonth, setViewMonth] = useState(() => {
    const d = startOfToday();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });

  const slots = selectedDate ? getSlotsForDate(selectedDate) : [];

  const handleDateChange = (date: Date) => {
    onSelectDate(date);
    onSelectTime(""); // reset time when the date changes
  };

  const today = startOfToday();
  const currentMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const canGoPrev = viewMonth > currentMonthStart;

  const firstWeekday = viewMonth.getDay();
  const daysInMonth = new Date(
    viewMonth.getFullYear(),
    viewMonth.getMonth() + 1,
    0
  ).getDate();

  const cells: (Date | null)[] = [];
  for (let i = 0; i < firstWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(new Date(viewMonth.getFullYear(), viewMonth.getMonth(), d));
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 md:p-8">
      {/* Month grid — used on every device (iOS native picker can't grey
          out unavailable days, which led to confusing 'no availability'
          messages on dates that look pickable). */}
      <div className="flex items-center justify-between mb-6">
        <button
          type="button"
          onClick={() =>
            canGoPrev &&
            setViewMonth(
              new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1, 1)
            )
          }
          disabled={!canGoPrev}
          aria-label="Previous month"
          className="h-9 w-9 rounded-full border border-charcoal/20 flex items-center justify-center text-charcoal hover:bg-charcoal hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-charcoal"
        >
          <ChevronLeft size={18} />
        </button>
        <p className="font-display text-lg sm:text-xl text-charcoal">
          {MONTHS[viewMonth.getMonth()]} {viewMonth.getFullYear()}
        </p>
        <button
          type="button"
          onClick={() =>
            setViewMonth(
              new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1)
            )
          }
          aria-label="Next month"
          className="h-9 w-9 rounded-full border border-charcoal/20 flex items-center justify-center text-charcoal hover:bg-charcoal hover:text-white transition-colors"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {WEEKDAYS.map((d) => (
          <div
            key={d}
            className="text-center text-[10px] sm:text-xs uppercase tracking-wider text-medium-gray py-2"
          >
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((date, i) => {
          if (!date) return <div key={`empty-${i}`} />;
          const available = isDateAvailable(date);
          const isSelected = selectedDate && isSameDay(date, selectedDate);
          return (
            <button
              key={toISODate(date)}
              type="button"
              disabled={!available}
              onClick={() => handleDateChange(date)}
              className={`aspect-square rounded-full flex items-center justify-center text-sm transition-colors ${
                isSelected
                  ? "bg-dusty-rose text-white"
                  : available
                  ? "text-charcoal hover:bg-blush-light cursor-pointer"
                  : "text-medium-gray/30 cursor-not-allowed line-through"
              }`}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>

      {/* Time slots — appear under the calendar once a date is picked */}
      {selectedDate && (
        <div className="mt-8 border-t border-beige pt-6">
          <p className="text-xs sm:text-sm font-medium text-charcoal mb-3 break-words">
            {formatLongDate(selectedDate)}
          </p>
          {slots.length > 0 ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {slots.map((slot) => (
                <button
                  key={slot}
                  type="button"
                  onClick={() => onSelectTime(slot)}
                  className={`px-2 py-2 rounded-full text-xs sm:text-sm border transition-colors text-center whitespace-nowrap ${
                    selectedTime === slot
                      ? "bg-dusty-rose text-white border-dusty-rose"
                      : "border-beige text-charcoal hover:border-dusty-rose"
                  }`}
                >
                  {slot}
                </button>
              ))}
            </div>
          ) : (
            <p className="text-medium-gray text-sm">
              No availability on this date. Please choose another day.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
