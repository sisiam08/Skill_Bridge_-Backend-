export const timeToMinutes = (time: string) => {
  const [h, m] = time.split(":").map(Number);
  if (h === undefined || m === undefined) {
    throw new Error("Invalid time format. Expected HH:MM");
  }
  return h * 60 + m;
};

export const minutesToTime = (minutes: number) => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
};

export const subtractBookedFromFreeSlots = (
  availableSlot: { startTime: string; endTime: string },
  booked: { startTime: string; endTime: string }[],
) => {
  let freeRanges = [{ ...availableSlot }];
  booked.forEach((b) => {
    const bStart = timeToMinutes(b.startTime);
    const bEnd = timeToMinutes(b.endTime);

    freeRanges = freeRanges.flatMap((free) => {
      const fStart = timeToMinutes(free.startTime);
      const fEnd = timeToMinutes(free.endTime);

      if (bEnd <= fStart || bStart >= fEnd) {
        return [free];
      }

      const ranges: { startTime: string; endTime: string }[] = [];

      if (bStart > fStart) {
        ranges.push({
          startTime: free.startTime,
          endTime: minutesToTime(bStart),
        });
      }

      if (bEnd < fEnd) {
        ranges.push({
          startTime: minutesToTime(bEnd),
          endTime: free.endTime,
        });
      }

      return ranges;
    });
  });
  return freeRanges;
};
