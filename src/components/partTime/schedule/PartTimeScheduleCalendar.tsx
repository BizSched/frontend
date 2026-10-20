'use client';

import { useMemo, useRef, useState } from 'react';

import {
  Calendar,
  type CalendarDayContent,
} from '@components/_common/Calendar/Calendar';
import { CalendarEventDots } from '@components/_common/Calendar/CalendarEventDots';
import { openConfirmModal } from '@components/_common/Modal/openConfirmModal';
import { toast } from '@components/_common/Toast/Toaster';
import { openPartTimeScheduleFormModal } from '@components/partTime/schedule/modal/openPartTimeScheduleFormModal';
import { PartTimeScheduleChip } from '@components/partTime/schedule/PartTimeScheduleChip';
import { PartTimeScheduleDaySummary } from '@components/partTime/schedule/PartTimeScheduleDaySummary';
import { PartTimeScheduleStaffFilter } from '@components/partTime/schedule/PartTimeScheduleStaffFilter';

import { useChangeScheduleAttendance } from '@hooks/api/schedule/useChangeScheduleAttendance';
import { useDeleteSchedule } from '@hooks/api/schedule/useDeleteSchedule';
import { useScheduleList } from '@hooks/api/schedule/useScheduleList';
import { useStaffOptions } from '@hooks/api/staff/useStaffOptions';

import { formatCommonError } from '@lib/api/formatCommonError';
import type { PartTimeSchedule } from '@lib/types/partTimeSchedule';
import {
  comparePartTimeScheduleTime,
  getPartTimeScheduleRange,
  groupPartTimeSchedulesByDate,
} from '@lib/utilities/partTime/partTimeSchedule';

const MAX_VISIBLE_SCHEDULE_COUNT = 3;
const EMPTY_SCHEDULES: PartTimeSchedule[] = [];
const ACTION_ERROR_TOAST_ID = 'schedule-action-error';

const createDayContent = (
  schedules: PartTimeSchedule[],
): CalendarDayContent => {
  const visibleSchedules = schedules.slice(0, MAX_VISIBLE_SCHEDULE_COUNT);
  const checkedInCount = schedules.filter(
    (schedule) => schedule.isCheckedIn,
  ).length;

  return {
    full: visibleSchedules.map((schedule) => (
      <PartTimeScheduleChip key={schedule.id} schedule={schedule} />
    )),
    compact: (
      <CalendarEventDots
        className="mt-2 pl-1"
        items={visibleSchedules.map((schedule) => ({
          id: String(schedule.id),
          tone: schedule.isCheckedIn ? 'muted' : 'accent',
        }))}
        label={`스케쥴 ${schedules.length}개, 완료 ${checkedInCount}개`}
      />
    ),
    totalCount: schedules.length,
  };
};

interface PartTimeScheduleCalendarProps {
  today: string;
  initialMonth: string;
}

function PartTimeScheduleCalendar({
  today,
  initialMonth,
}: PartTimeScheduleCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<string | null>(today);
  const [month, setMonth] = useState(initialMonth);
  const [selectedStaffId, setSelectedStaffId] = useState<number | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const isActionPendingRef = useRef(false);
  const deleteMutation = useDeleteSchedule();
  const attendanceMutation = useChangeScheduleAttendance();
  const isSchedulePending =
    isDeleteConfirmOpen ||
    deleteMutation.isPending ||
    attendanceMutation.isPending;

  const staffId = selectedStaffId ?? undefined;
  const staffQuery = useStaffOptions();
  const monthRange = useMemo(() => getPartTimeScheduleRange(month), [month]);
  const hasSeparateSelectedRange =
    selectedDate !== null &&
    (selectedDate < monthRange.from || selectedDate > monthRange.to);
  const selectedMonth = selectedDate?.slice(0, 7) ?? month;
  const selectedRange = useMemo(
    () =>
      hasSeparateSelectedRange
        ? getPartTimeScheduleRange(selectedMonth)
        : monthRange,
    [hasSeparateSelectedRange, selectedMonth, monthRange],
  );
  const monthQuery = useScheduleList({
    ...monthRange,
    staffId,
  });
  const selectedMonthQuery = useScheduleList(
    { ...selectedRange, staffId },
    hasSeparateSelectedRange,
  );
  const monthSchedules = monthQuery.data ?? EMPTY_SCHEDULES;
  const selectedMonthSchedules = hasSeparateSelectedRange
    ? (selectedMonthQuery.data ?? EMPTY_SCHEDULES)
    : EMPTY_SCHEDULES;
  const activeQueries = hasSeparateSelectedRange
    ? [monthQuery, selectedMonthQuery]
    : [monthQuery];
  const failedQueries = activeQueries.filter(({ isError }) => isError);

  const schedulesByDate = useMemo(
    () =>
      groupPartTimeSchedulesByDate(
        [...monthSchedules].sort(comparePartTimeScheduleTime),
      ),
    [monthSchedules],
  );
  const selectedDateSchedules = useMemo(() => {
    if (!selectedDate) return EMPTY_SCHEDULES;
    if (!hasSeparateSelectedRange)
      return schedulesByDate[selectedDate] ?? EMPTY_SCHEDULES;
    return selectedMonthSchedules
      .filter((schedule) => schedule.date === selectedDate)
      .sort(comparePartTimeScheduleTime);
  }, [
    selectedDate,
    hasSeparateSelectedRange,
    schedulesByDate,
    selectedMonthSchedules,
  ]);
  const contentByDate = useMemo(
    () =>
      Object.fromEntries(
        Object.entries(schedulesByDate).map(([date, dateSchedules]) => [
          date,
          createDayContent(dateSchedules),
        ]),
      ),
    [schedulesByDate],
  );

  const handleScheduleEdit = (schedule: PartTimeSchedule) => {
    void openPartTimeScheduleFormModal({ mode: 'edit', schedule });
  };

  const handleScheduleDelete = async (schedule: PartTimeSchedule) => {
    if (isActionPendingRef.current) return;
    isActionPendingRef.current = true;
    setIsDeleteConfirmOpen(true);
    toast.dismiss(ACTION_ERROR_TOAST_ID);
    try {
      const isConfirmed = await openConfirmModal({
        title: '스케쥴을 삭제하시겠어요?',
        description: '삭제된 스케쥴은 복구할 수 없습니다.',
        confirmText: '삭제',
      });
      if (isConfirmed) await deleteMutation.mutateAsync(schedule.id);
    } catch (error) {
      toast.error(formatCommonError(error), { id: ACTION_ERROR_TOAST_ID });
    } finally {
      setIsDeleteConfirmOpen(false);
      isActionPendingRef.current = false;
    }
  };

  const handleAttendanceChange = async (
    schedule: PartTimeSchedule,
    isCheckedIn: boolean,
  ) => {
    if (schedule.date > today || isActionPendingRef.current) return;
    isActionPendingRef.current = true;
    toast.dismiss(ACTION_ERROR_TOAST_ID);
    try {
      await attendanceMutation.mutateAsync({
        scheduleId: schedule.id,
        body: { status: isCheckedIn ? 'ATTENDED' : 'ABSENT' },
      });
    } catch (error) {
      toast.error(formatCommonError(error), { id: ACTION_ERROR_TOAST_ID });
    } finally {
      isActionPendingRef.current = false;
    }
  };

  return (
    <>
      {failedQueries.length > 0 && (
        <div
          role="alert"
          className="flex items-center justify-center gap-2 text-xs text-slate-500 max-mobile:px-4"
        >
          <p className="min-w-0 truncate">
            {formatCommonError(failedQueries[0].error)}
          </p>
          <button
            type="button"
            onClick={() => {
              failedQueries.forEach(({ refetch }) => void refetch());
            }}
            className="shrink-0 cursor-pointer underline"
          >
            다시 시도
          </button>
        </div>
      )}
      <div className="flex items-start gap-8 max-laptop:flex-col max-laptop:items-stretch max-laptop:gap-0 max-laptop:overflow-hidden max-laptop:rounded-[2rem] max-laptop:bg-white-50 max-laptop:shadow-[0_0_60px_rgb(0_0_0/0.05)] max-tablet:rounded-[1.5rem] max-mobile:rounded-none max-mobile:shadow-none">
        <Calendar
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
          month={month}
          onMonthChange={setMonth}
          today={today}
          contentByDate={contentByDate}
          label="아르바이트생 스케쥴 캘린더"
          headerSlot={
            <PartTimeScheduleStaffFilter
              staffs={staffQuery.data ?? []}
              isError={staffQuery.isError}
              onRetry={() => {
                void staffQuery.refetch();
              }}
              selectedStaffId={selectedStaffId}
              onStaffChange={setSelectedStaffId}
            />
          }
          className="flex-1 max-laptop:rounded-none max-laptop:shadow-none max-tablet:rounded-none max-laptop:[&_td]:rounded-none! max-mobile:[&>header>div:first-child]:justify-center"
        />
        {selectedDate && (
          <PartTimeScheduleDaySummary
            date={selectedDate}
            today={today}
            schedules={selectedDateSchedules}
            onScheduleEdit={handleScheduleEdit}
            onScheduleDelete={handleScheduleDelete}
            onAttendanceChange={handleAttendanceChange}
            isPending={isSchedulePending}
            className="w-94.5 shrink-0 max-laptop:w-auto"
          />
        )}
      </div>
    </>
  );
}

export { PartTimeScheduleCalendar };
