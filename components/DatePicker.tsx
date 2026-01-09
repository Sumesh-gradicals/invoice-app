"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";

interface DatePickerProps {
  value: Date | null;
  onChange: (date: Date) => void;
  label?: string;
}

export function DatePicker({ value, onChange, label = "Service date" }: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(value || new Date());
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleQuickSelect = (days: number) => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    onChange(date);
    setIsOpen(false);
  };

  const handleDateSelect = (day: number) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    onChange(date);
    setIsOpen(false);
  };

  const getDaysInMonth = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const days = [];
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    return days;
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "None";
    return date.toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" });
  };

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const dayNames = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  return (
    <div className="relative" ref={dropdownRef}>
      <div
        className={`border rounded-lg p-3 cursor-pointer ${
          isOpen ? "ring-2 ring-black" : "border-slate-200"
        }`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <label className={`text-[10px] uppercase font-bold block mb-1 ${
          isOpen ? "text-blue-600" : "text-slate-400"
        }`}>
          {label}
        </label>
        <div className="flex items-center justify-between">
          <span className="text-sm">{formatDate(value)}</span>
          <ChevronDown size={16} className="text-slate-400" />
        </div>
      </div>

      {isOpen && (
        <div className="absolute left-0 top-full mt-1 bg-white border rounded-lg shadow-xl z-50 w-[320px]">
          {/* Quick Select Options */}
          <div className="border-b p-2">
            <button
              onClick={() => handleQuickSelect(0)}
              className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50 rounded"
            >
              Today
            </button>
            <button
              onClick={() => handleQuickSelect(7)}
              className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50 rounded"
            >
              In 7 days
            </button>
            <button
              onClick={() => handleQuickSelect(14)}
              className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50 rounded"
            >
              In 14 days
            </button>
            <button
              onClick={() => handleQuickSelect(30)}
              className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50 rounded"
            >
              In 30 days
            </button>
          </div>

          {/* Calendar */}
          <div className="p-4">
            {/* Month/Year Header */}
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                className="p-1 hover:bg-slate-100 rounded"
              >
                <ChevronLeft size={20} />
              </button>
              <div className="font-bold text-sm">
                {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
              </div>
              <button
                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                className="p-1 hover:bg-slate-100 rounded"
              >
                <ChevronRight size={20} />
              </button>
            </div>

            {/* Day Names */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {dayNames.map((day) => (
                <div key={day} className="text-center text-xs text-slate-500 font-medium">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
              {getDaysInMonth().map((day, index) => (
                <div key={index}>
                  {day ? (
                    <button
                      onClick={() => handleDateSelect(day)}
                      className={`w-full aspect-square flex items-center justify-center text-sm rounded-full hover:bg-slate-100 ${
                        value &&
                        day === value.getDate() &&
                        currentMonth.getMonth() === value.getMonth() &&
                        currentMonth.getFullYear() === value.getFullYear()
                          ? "bg-black text-white hover:bg-black"
                          : ""
                      }`}
                    >
                      {day}
                    </button>
                  ) : (
                    <div />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
