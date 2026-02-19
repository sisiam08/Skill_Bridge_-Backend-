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

export const timeDuration = (startTime: string, endTime: string) => {
  const startMinutes = timeToMinutes(startTime);
  const endMinutes = timeToMinutes(endTime);
  return endMinutes - startMinutes;
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

export const fitsInAvailabilitySlot = (
  newBooking: { startTime: string; endTime: string },
  availabilitySlots: { startTime: string; endTime: string }[],
) => {
  const bookingStart = timeToMinutes(newBooking.startTime);
  const bookingEnd = timeToMinutes(newBooking.endTime);

  if (bookingEnd <= bookingStart) {
    throw new Error("Invalid time range");
  }

  return availabilitySlots.some((slot) => {
    const slotStart = timeToMinutes(slot.startTime);
    const slotEnd = timeToMinutes(slot.endTime);

    return bookingStart >= slotStart && bookingEnd <= slotEnd;
  });
};

export const isOverlapping = (
  newBooking: { startTime: string; endTime: string },
  existingBookings: { startTime: string; endTime: string }[],
) => {
  const newStart = timeToMinutes(newBooking.startTime);
  const newEnd = timeToMinutes(newBooking.endTime);

  return existingBookings.some((eb) => {
    const existingStart = timeToMinutes(eb.startTime);
    const existingEnd = timeToMinutes(eb.endTime);

    return newStart < existingEnd && newEnd > existingStart;
  });
};
