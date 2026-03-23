var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// src/app.ts
import express8 from "express";

// src/modules/TutorProfiles/tutorProfile.router.ts
import { Router } from "express";

// src/modules/TutorProfiles/tutorProfile.service.ts
import {
  addDays,
  addHours,
  format,
  getHours as getHours2,
  getMinutes as getMinutes2,
  isEqual,
  isSameDay as isSameDay2,
  startOfDay as startOfDay2,
  startOfMonth,
  startOfWeek
} from "date-fns";

// generated/prisma/enums.ts
var UserRole = {
  STUDENT: "STUDENT",
  TUTOR: "TUTOR",
  ADMIN: "ADMIN"
};
var UserStatus = {
  BAN: "BAN",
  UNBAN: "UNBAN"
};
var BookingStatus = {
  CONFIRMED: "CONFIRMED",
  RUNNING: "RUNNING",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED"
};

// src/helpers/CalculateTutionPrice.ts
var calculateTutionPrice = (duration, tutorHourlyRate) => {
  const durationHours = duration / 60;
  const totalPrice = Number((durationHours * tutorHourlyRate).toFixed(2));
  return totalPrice;
};

// src/helpers/TimeHelpers.ts
import {
  formatDistanceToNow,
  getHours,
  getMinutes,
  isBefore,
  isSameDay,
  startOfDay
} from "date-fns";
var timeToMinutes = (time) => {
  const [h, m] = time.split(":").map(Number);
  if (h === void 0 || m === void 0) {
    throw new Error("Invalid time format. Expected HH:MM");
  }
  return h * 60 + m;
};
var minutesToTime = (minutes) => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
};
var timeDuration = (startTime, endTime) => {
  const startMinutes = timeToMinutes(startTime);
  const endMinutes = timeToMinutes(endTime);
  return endMinutes - startMinutes;
};
var subtractBookedFromFreeSlots = (availableSlot, booked) => {
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
      const ranges = [];
      if (bStart > fStart) {
        ranges.push({
          startTime: free.startTime,
          endTime: minutesToTime(bStart)
        });
      }
      if (bEnd < fEnd) {
        ranges.push({
          startTime: minutesToTime(bEnd),
          endTime: free.endTime
        });
      }
      return ranges;
    });
  });
  return freeRanges;
};
var fitsInAvailabilitySlot = (newBooking, availabilitySlots) => {
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
var isOverlapping = (newBooking, existingBookings) => {
  const newStart = timeToMinutes(newBooking.startTime);
  const newEnd = timeToMinutes(newBooking.endTime);
  return existingBookings.some((eb) => {
    const existingStart = timeToMinutes(eb.startTime);
    const existingEnd = timeToMinutes(eb.endTime);
    return newStart < existingEnd && newEnd > existingStart;
  });
};
var validateBookingDateTime = (sessionDate, startTime) => {
  if (sessionDate) {
    if (isBefore(startOfDay(sessionDate), startOfDay(/* @__PURE__ */ new Date()))) {
      throw new Error("Cannot see/book previous date slot!");
    }
    if (startTime && isSameDay(sessionDate, /* @__PURE__ */ new Date())) {
      const now = /* @__PURE__ */ new Date();
      const currentMinutes = getHours(now) * 60 + getMinutes(now);
      const bookingStartMinutes = timeToMinutes(startTime);
      if (bookingStartMinutes < currentMinutes) {
        throw new Error("Cannot see/book previous slot!");
      }
    }
  }
  return true;
};
var timeAgo = (date) => {
  if (!date) return void 0;
  return formatDistanceToNow(new Date(date), { addSuffix: true });
};

// src/lib/prisma.ts
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";

// generated/prisma/client.ts
import * as path from "path";
import { fileURLToPath } from "url";

// generated/prisma/internal/class.ts
import * as runtime from "@prisma/client/runtime/client";
var config = {
  "previewFeatures": [],
  "clientVersion": "7.4.1",
  "engineVersion": "55ae170b1ced7fc6ed07a15f110549408c501bb3",
  "activeProvider": "postgresql",
  "inlineSchema": 'generator client {\n  provider = "prisma-client"\n  output   = "../generated/prisma"\n}\n\ndatasource db {\n  provider = "postgresql"\n}\n\nenum UserRole {\n  STUDENT\n  TUTOR\n  ADMIN\n}\n\nenum UserStatus {\n  BAN\n  UNBAN\n}\n\nmodel User {\n  id            String    @id\n  name          String\n  email         String\n  emailVerified Boolean   @default(false)\n  image         String?\n  createdAt     DateTime  @default(now())\n  updatedAt     DateTime  @updatedAt\n  sessions      Session[]\n  accounts      Account[]\n\n  role   UserRole\n  phone  String?\n  status UserStatus? @default(UNBAN)\n\n  tutorProfile TutorProfiles?\n  bookings     Bookings[]\n\n  @@unique([email])\n  @@map("user")\n}\n\nmodel Session {\n  id        String   @id\n  expiresAt DateTime\n  token     String\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n  ipAddress String?\n  userAgent String?\n  userId    String\n  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)\n\n  @@unique([token])\n  @@index([userId])\n  @@map("session")\n}\n\nmodel Account {\n  id                    String    @id\n  accountId             String\n  providerId            String\n  userId                String\n  user                  User      @relation(fields: [userId], references: [id], onDelete: Cascade)\n  accessToken           String?\n  refreshToken          String?\n  idToken               String?\n  accessTokenExpiresAt  DateTime?\n  refreshTokenExpiresAt DateTime?\n  scope                 String?\n  password              String?\n  createdAt             DateTime  @default(now())\n  updatedAt             DateTime  @updatedAt\n\n  @@index([userId])\n  @@map("account")\n}\n\nmodel Verification {\n  id         String   @id\n  identifier String\n  value      String\n  expiresAt  DateTime\n  createdAt  DateTime @default(now())\n  updatedAt  DateTime @updatedAt\n\n  @@index([identifier])\n  @@map("verification")\n}\n\nmodel TutorProfiles {\n  id                     String     @id @default(uuid())\n  userId                 String     @unique\n  categoriesId           String?\n  bio                    String?    @db.VarChar(255)\n  hourlyRate             Float      @default(0.00)\n  experienceYears        Float\n  totalRating            Int        @default(0)\n  totalReviews           Int        @default(0)\n  totalCompletedBookings Int        @default(0)\n  defaultClassLink       String?    @db.Text\n  createdAt              DateTime   @default(now())\n  updatedAt              DateTime   @updatedAt\n  bookings               Bookings[]\n\n  user         User                @relation(fields: [userId], references: [id])\n  category     Categories?         @relation(fields: [categoriesId], references: [id], onDelete: SetNull)\n  availability TutorAvailability[]\n\n  @@index([userId])\n  @@map("tutorProfiles")\n}\n\nmodel TutorAvailability {\n  id        String  @id @default(uuid())\n  tutorId   String\n  dayOfWeek Int\n  startTime String\n  endTime   String\n  isActive  Boolean @default(true)\n\n  tutor TutorProfiles @relation(fields: [tutorId], references: [id], onDelete: Cascade)\n\n  @@map("tutorAvailability")\n}\n\nmodel Categories {\n  id       String  @id @default(uuid())\n  name     String  @unique @db.VarChar(100)\n  isActive Boolean @default(true)\n\n  tutorProfiles TutorProfiles[]\n\n  @@index([name])\n  @@map("categories")\n}\n\nenum BookingStatus {\n  CONFIRMED\n  RUNNING\n  COMPLETED\n  CANCELLED\n}\n\nmodel Bookings {\n  id          String        @id @default(uuid())\n  studentId   String\n  tutorId     String\n  sessionDate DateTime\n  startTime   String\n  endTime     String\n  price       Float\n  status      BookingStatus @default(CONFIRMED)\n  classLink   String?       @db.Text\n  createdAt   DateTime      @default(now())\n  updatedAt   DateTime      @updatedAt\n\n  reviews Reviews?\n\n  student User          @relation(fields: [studentId], references: [id], onDelete: Cascade)\n  tutor   TutorProfiles @relation(fields: [tutorId], references: [id])\n\n  @@index([id])\n  @@map("bookings")\n}\n\nmodel Reviews {\n  id        String   @id @default(uuid())\n  bookingId String   @unique\n  rating    Int\n  comment   String   @db.Text\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n\n  booking Bookings @relation(fields: [bookingId], references: [id])\n\n  @@index([bookingId])\n  @@map("reviews")\n}\n',
  "runtimeDataModel": {
    "models": {},
    "enums": {},
    "types": {}
  },
  "parameterizationSchema": {
    "strings": [],
    "graph": ""
  }
};
config.runtimeDataModel = JSON.parse('{"models":{"User":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"email","kind":"scalar","type":"String"},{"name":"emailVerified","kind":"scalar","type":"Boolean"},{"name":"image","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"sessions","kind":"object","type":"Session","relationName":"SessionToUser"},{"name":"accounts","kind":"object","type":"Account","relationName":"AccountToUser"},{"name":"role","kind":"enum","type":"UserRole"},{"name":"phone","kind":"scalar","type":"String"},{"name":"status","kind":"enum","type":"UserStatus"},{"name":"tutorProfile","kind":"object","type":"TutorProfiles","relationName":"TutorProfilesToUser"},{"name":"bookings","kind":"object","type":"Bookings","relationName":"BookingsToUser"}],"dbName":"user"},"Session":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"expiresAt","kind":"scalar","type":"DateTime"},{"name":"token","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"ipAddress","kind":"scalar","type":"String"},{"name":"userAgent","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"SessionToUser"}],"dbName":"session"},"Account":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"accountId","kind":"scalar","type":"String"},{"name":"providerId","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"AccountToUser"},{"name":"accessToken","kind":"scalar","type":"String"},{"name":"refreshToken","kind":"scalar","type":"String"},{"name":"idToken","kind":"scalar","type":"String"},{"name":"accessTokenExpiresAt","kind":"scalar","type":"DateTime"},{"name":"refreshTokenExpiresAt","kind":"scalar","type":"DateTime"},{"name":"scope","kind":"scalar","type":"String"},{"name":"password","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"account"},"Verification":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"identifier","kind":"scalar","type":"String"},{"name":"value","kind":"scalar","type":"String"},{"name":"expiresAt","kind":"scalar","type":"DateTime"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"verification"},"TutorProfiles":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"categoriesId","kind":"scalar","type":"String"},{"name":"bio","kind":"scalar","type":"String"},{"name":"hourlyRate","kind":"scalar","type":"Float"},{"name":"experienceYears","kind":"scalar","type":"Float"},{"name":"totalRating","kind":"scalar","type":"Int"},{"name":"totalReviews","kind":"scalar","type":"Int"},{"name":"totalCompletedBookings","kind":"scalar","type":"Int"},{"name":"defaultClassLink","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"bookings","kind":"object","type":"Bookings","relationName":"BookingsToTutorProfiles"},{"name":"user","kind":"object","type":"User","relationName":"TutorProfilesToUser"},{"name":"category","kind":"object","type":"Categories","relationName":"CategoriesToTutorProfiles"},{"name":"availability","kind":"object","type":"TutorAvailability","relationName":"TutorAvailabilityToTutorProfiles"}],"dbName":"tutorProfiles"},"TutorAvailability":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"tutorId","kind":"scalar","type":"String"},{"name":"dayOfWeek","kind":"scalar","type":"Int"},{"name":"startTime","kind":"scalar","type":"String"},{"name":"endTime","kind":"scalar","type":"String"},{"name":"isActive","kind":"scalar","type":"Boolean"},{"name":"tutor","kind":"object","type":"TutorProfiles","relationName":"TutorAvailabilityToTutorProfiles"}],"dbName":"tutorAvailability"},"Categories":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"isActive","kind":"scalar","type":"Boolean"},{"name":"tutorProfiles","kind":"object","type":"TutorProfiles","relationName":"CategoriesToTutorProfiles"}],"dbName":"categories"},"Bookings":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"studentId","kind":"scalar","type":"String"},{"name":"tutorId","kind":"scalar","type":"String"},{"name":"sessionDate","kind":"scalar","type":"DateTime"},{"name":"startTime","kind":"scalar","type":"String"},{"name":"endTime","kind":"scalar","type":"String"},{"name":"price","kind":"scalar","type":"Float"},{"name":"status","kind":"enum","type":"BookingStatus"},{"name":"classLink","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"reviews","kind":"object","type":"Reviews","relationName":"BookingsToReviews"},{"name":"student","kind":"object","type":"User","relationName":"BookingsToUser"},{"name":"tutor","kind":"object","type":"TutorProfiles","relationName":"BookingsToTutorProfiles"}],"dbName":"bookings"},"Reviews":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"bookingId","kind":"scalar","type":"String"},{"name":"rating","kind":"scalar","type":"Int"},{"name":"comment","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"booking","kind":"object","type":"Bookings","relationName":"BookingsToReviews"}],"dbName":"reviews"}},"enums":{},"types":{}}');
config.parameterizationSchema = {
  strings: JSON.parse('["where","orderBy","cursor","user","sessions","accounts","booking","reviews","student","tutor","bookings","tutorProfiles","_count","category","availability","tutorProfile","User.findUnique","User.findUniqueOrThrow","User.findFirst","User.findFirstOrThrow","User.findMany","data","User.createOne","User.createMany","User.createManyAndReturn","User.updateOne","User.updateMany","User.updateManyAndReturn","create","update","User.upsertOne","User.deleteOne","User.deleteMany","having","_min","_max","User.groupBy","User.aggregate","Session.findUnique","Session.findUniqueOrThrow","Session.findFirst","Session.findFirstOrThrow","Session.findMany","Session.createOne","Session.createMany","Session.createManyAndReturn","Session.updateOne","Session.updateMany","Session.updateManyAndReturn","Session.upsertOne","Session.deleteOne","Session.deleteMany","Session.groupBy","Session.aggregate","Account.findUnique","Account.findUniqueOrThrow","Account.findFirst","Account.findFirstOrThrow","Account.findMany","Account.createOne","Account.createMany","Account.createManyAndReturn","Account.updateOne","Account.updateMany","Account.updateManyAndReturn","Account.upsertOne","Account.deleteOne","Account.deleteMany","Account.groupBy","Account.aggregate","Verification.findUnique","Verification.findUniqueOrThrow","Verification.findFirst","Verification.findFirstOrThrow","Verification.findMany","Verification.createOne","Verification.createMany","Verification.createManyAndReturn","Verification.updateOne","Verification.updateMany","Verification.updateManyAndReturn","Verification.upsertOne","Verification.deleteOne","Verification.deleteMany","Verification.groupBy","Verification.aggregate","TutorProfiles.findUnique","TutorProfiles.findUniqueOrThrow","TutorProfiles.findFirst","TutorProfiles.findFirstOrThrow","TutorProfiles.findMany","TutorProfiles.createOne","TutorProfiles.createMany","TutorProfiles.createManyAndReturn","TutorProfiles.updateOne","TutorProfiles.updateMany","TutorProfiles.updateManyAndReturn","TutorProfiles.upsertOne","TutorProfiles.deleteOne","TutorProfiles.deleteMany","_avg","_sum","TutorProfiles.groupBy","TutorProfiles.aggregate","TutorAvailability.findUnique","TutorAvailability.findUniqueOrThrow","TutorAvailability.findFirst","TutorAvailability.findFirstOrThrow","TutorAvailability.findMany","TutorAvailability.createOne","TutorAvailability.createMany","TutorAvailability.createManyAndReturn","TutorAvailability.updateOne","TutorAvailability.updateMany","TutorAvailability.updateManyAndReturn","TutorAvailability.upsertOne","TutorAvailability.deleteOne","TutorAvailability.deleteMany","TutorAvailability.groupBy","TutorAvailability.aggregate","Categories.findUnique","Categories.findUniqueOrThrow","Categories.findFirst","Categories.findFirstOrThrow","Categories.findMany","Categories.createOne","Categories.createMany","Categories.createManyAndReturn","Categories.updateOne","Categories.updateMany","Categories.updateManyAndReturn","Categories.upsertOne","Categories.deleteOne","Categories.deleteMany","Categories.groupBy","Categories.aggregate","Bookings.findUnique","Bookings.findUniqueOrThrow","Bookings.findFirst","Bookings.findFirstOrThrow","Bookings.findMany","Bookings.createOne","Bookings.createMany","Bookings.createManyAndReturn","Bookings.updateOne","Bookings.updateMany","Bookings.updateManyAndReturn","Bookings.upsertOne","Bookings.deleteOne","Bookings.deleteMany","Bookings.groupBy","Bookings.aggregate","Reviews.findUnique","Reviews.findUniqueOrThrow","Reviews.findFirst","Reviews.findFirstOrThrow","Reviews.findMany","Reviews.createOne","Reviews.createMany","Reviews.createManyAndReturn","Reviews.updateOne","Reviews.updateMany","Reviews.updateManyAndReturn","Reviews.upsertOne","Reviews.deleteOne","Reviews.deleteMany","Reviews.groupBy","Reviews.aggregate","AND","OR","NOT","id","bookingId","rating","comment","createdAt","updatedAt","equals","in","notIn","lt","lte","gt","gte","not","contains","startsWith","endsWith","studentId","tutorId","sessionDate","startTime","endTime","price","BookingStatus","status","classLink","name","isActive","every","some","none","dayOfWeek","userId","categoriesId","bio","hourlyRate","experienceYears","totalRating","totalReviews","totalCompletedBookings","defaultClassLink","identifier","value","expiresAt","accountId","providerId","accessToken","refreshToken","idToken","accessTokenExpiresAt","refreshTokenExpiresAt","scope","password","token","ipAddress","userAgent","email","emailVerified","image","UserRole","role","phone","UserStatus","is","isNot","connectOrCreate","upsert","disconnect","delete","connect","createMany","set","updateMany","deleteMany","increment","decrement","multiply","divide"]'),
  graph: "jQRUkAERBAAAqAIAIAUAAKkCACAKAACrAgAgDwAAqgIAIKgBAACkAgAwqQEAACQAEKoBAACkAgAwqwEBAAAAAa8BQACBAgAhsAFAAIECACHDAQAApwLqASPFAQEAgAIAIeMBAQAAAAHkASAAkgIAIeUBAQClAgAh5wEAAKYC5wEi6AEBAKUCACEBAAAAAQAgDAMAALACACCoAQAAuAIAMKkBAAADABCqAQAAuAIAMKsBAQCAAgAhrwFAAIECACGwAUAAgQIAIcsBAQCAAgAh1gFAAIECACHgAQEAgAIAIeEBAQClAgAh4gEBAKUCACEDAwAA3AMAIOEBAADEAgAg4gEAAMQCACAMAwAAsAIAIKgBAAC4AgAwqQEAAAMAEKoBAAC4AgAwqwEBAAAAAa8BQACBAgAhsAFAAIECACHLAQEAgAIAIdYBQACBAgAh4AEBAAAAAeEBAQClAgAh4gEBAKUCACEDAAAAAwAgAQAABAAwAgAABQAgEQMAALACACCoAQAAtgIAMKkBAAAHABCqAQAAtgIAMKsBAQCAAgAhrwFAAIECACGwAUAAgQIAIcsBAQCAAgAh1wEBAIACACHYAQEAgAIAIdkBAQClAgAh2gEBAKUCACHbAQEApQIAIdwBQAC3AgAh3QFAALcCACHeAQEApQIAId8BAQClAgAhCAMAANwDACDZAQAAxAIAINoBAADEAgAg2wEAAMQCACDcAQAAxAIAIN0BAADEAgAg3gEAAMQCACDfAQAAxAIAIBEDAACwAgAgqAEAALYCADCpAQAABwAQqgEAALYCADCrAQEAAAABrwFAAIECACGwAUAAgQIAIcsBAQCAAgAh1wEBAIACACHYAQEAgAIAIdkBAQClAgAh2gEBAKUCACHbAQEApQIAIdwBQAC3AgAh3QFAALcCACHeAQEApQIAId8BAQClAgAhAwAAAAcAIAEAAAgAMAIAAAkAIBMDAACwAgAgCgAAqwIAIA0AALECACAOAACyAgAgqAEAAK4CADCpAQAACwAQqgEAAK4CADCrAQEAgAIAIa8BQACBAgAhsAFAAIECACHLAQEAgAIAIcwBAQClAgAhzQEBAKUCACHOAQgArwIAIc8BCACvAgAh0AECAP8BACHRAQIA_wEAIdIBAgD_AQAh0wEBAKUCACEBAAAACwAgEQcAALUCACAIAACwAgAgCQAArQIAIKgBAACzAgAwqQEAAA0AEKoBAACzAgAwqwEBAIACACGvAUAAgQIAIbABQACBAgAhvAEBAIACACG9AQEAgAIAIb4BQACBAgAhvwEBAIACACHAAQEAgAIAIcEBCACvAgAhwwEAALQCwwEixAEBAKUCACEEBwAA3wMAIAgAANwDACAJAADaAwAgxAEAAMQCACARBwAAtQIAIAgAALACACAJAACtAgAgqAEAALMCADCpAQAADQAQqgEAALMCADCrAQEAAAABrwFAAIECACGwAUAAgQIAIbwBAQCAAgAhvQEBAIACACG-AUAAgQIAIb8BAQCAAgAhwAEBAIACACHBAQgArwIAIcMBAAC0AsMBIsQBAQClAgAhAwAAAA0AIAEAAA4AMAIAAA8AIAoGAACCAgAgqAEAAP4BADCpAQAAEQAQqgEAAP4BADCrAQEAgAIAIawBAQCAAgAhrQECAP8BACGuAQEAgAIAIa8BQACBAgAhsAFAAIECACEBAAAAEQAgBwsAAJMCACCoAQAAkQIAMKkBAAATABCqAQAAkQIAMKsBAQCAAgAhxQEBAIACACHGASAAkgIAIQEAAAATACAHAwAA3AMAIAoAANsDACANAADdAwAgDgAA3gMAIMwBAADEAgAgzQEAAMQCACDTAQAAxAIAIBMDAACwAgAgCgAAqwIAIA0AALECACAOAACyAgAgqAEAAK4CADCpAQAACwAQqgEAAK4CADCrAQEAAAABrwFAAIECACGwAUAAgQIAIcsBAQAAAAHMAQEApQIAIc0BAQClAgAhzgEIAK8CACHPAQgArwIAIdABAgD_AQAh0QECAP8BACHSAQIA_wEAIdMBAQClAgAhAwAAAAsAIAEAABUAMAIAABYAIAEAAAALACAKCQAArQIAIKgBAACsAgAwqQEAABkAEKoBAACsAgAwqwEBAIACACG9AQEAgAIAIb8BAQCAAgAhwAEBAIACACHGASAAkgIAIcoBAgD_AQAhAQkAANoDACAKCQAArQIAIKgBAACsAgAwqQEAABkAEKoBAACsAgAwqwEBAAAAAb0BAQCAAgAhvwEBAIACACHAAQEAgAIAIcYBIACSAgAhygECAP8BACEDAAAAGQAgAQAAGgAwAgAAGwAgAQAAAA0AIAEAAAAZACADAAAADQAgAQAADgAwAgAADwAgAQAAAAMAIAEAAAAHACABAAAADQAgAQAAAAEAIBEEAACoAgAgBQAAqQIAIAoAAKsCACAPAACqAgAgqAEAAKQCADCpAQAAJAAQqgEAAKQCADCrAQEAgAIAIa8BQACBAgAhsAFAAIECACHDAQAApwLqASPFAQEAgAIAIeMBAQCAAgAh5AEgAJICACHlAQEApQIAIecBAACmAucBIugBAQClAgAhBwQAANgDACAFAADZAwAgCgAA2wMAIA8AANoDACDDAQAAxAIAIOUBAADEAgAg6AEAAMQCACADAAAAJAAgAQAAJQAwAgAAAQAgAwAAACQAIAEAACUAMAIAAAEAIAMAAAAkACABAAAlADACAAABACAOBAAA1AMAIAUAANUDACAKAADXAwAgDwAA1gMAIKsBAQAAAAGvAUAAAAABsAFAAAAAAcMBAAAA6gEDxQEBAAAAAeMBAQAAAAHkASAAAAAB5QEBAAAAAecBAAAA5wEC6AEBAAAAAQEVAAApACAKqwEBAAAAAa8BQAAAAAGwAUAAAAABwwEAAADqAQPFAQEAAAAB4wEBAAAAAeQBIAAAAAHlAQEAAAAB5wEAAADnAQLoAQEAAAABARUAACsAMAEVAAArADAOBAAAqgMAIAUAAKsDACAKAACtAwAgDwAArAMAIKsBAQC-AgAhrwFAAMACACGwAUAAwAIAIcMBAACpA-oBI8UBAQC-AgAh4wEBAL4CACHkASAA2wIAIeUBAQDMAgAh5wEAAKgD5wEi6AEBAMwCACECAAAAAQAgFQAALgAgCqsBAQC-AgAhrwFAAMACACGwAUAAwAIAIcMBAACpA-oBI8UBAQC-AgAh4wEBAL4CACHkASAA2wIAIeUBAQDMAgAh5wEAAKgD5wEi6AEBAMwCACECAAAAJAAgFQAAMAAgAgAAACQAIBUAADAAIAMAAAABACAcAAApACAdAAAuACABAAAAAQAgAQAAACQAIAYMAAClAwAgIgAApwMAICMAAKYDACDDAQAAxAIAIOUBAADEAgAg6AEAAMQCACANqAEAAJ0CADCpAQAANwAQqgEAAJ0CADCrAQEA9AEAIa8BQAD2AQAhsAFAAPYBACHDAQAAnwLqASPFAQEA9AEAIeMBAQD0AQAh5AEgAI4CACHlAQEAhgIAIecBAACeAucBIugBAQCGAgAhAwAAACQAIAEAADYAMCEAADcAIAMAAAAkACABAAAlADACAAABACABAAAABQAgAQAAAAUAIAMAAAADACABAAAEADACAAAFACADAAAAAwAgAQAABAAwAgAABQAgAwAAAAMAIAEAAAQAMAIAAAUAIAkDAACkAwAgqwEBAAAAAa8BQAAAAAGwAUAAAAABywEBAAAAAdYBQAAAAAHgAQEAAAAB4QEBAAAAAeIBAQAAAAEBFQAAPwAgCKsBAQAAAAGvAUAAAAABsAFAAAAAAcsBAQAAAAHWAUAAAAAB4AEBAAAAAeEBAQAAAAHiAQEAAAABARUAAEEAMAEVAABBADAJAwAAowMAIKsBAQC-AgAhrwFAAMACACGwAUAAwAIAIcsBAQC-AgAh1gFAAMACACHgAQEAvgIAIeEBAQDMAgAh4gEBAMwCACECAAAABQAgFQAARAAgCKsBAQC-AgAhrwFAAMACACGwAUAAwAIAIcsBAQC-AgAh1gFAAMACACHgAQEAvgIAIeEBAQDMAgAh4gEBAMwCACECAAAAAwAgFQAARgAgAgAAAAMAIBUAAEYAIAMAAAAFACAcAAA_ACAdAABEACABAAAABQAgAQAAAAMAIAUMAACgAwAgIgAAogMAICMAAKEDACDhAQAAxAIAIOIBAADEAgAgC6gBAACcAgAwqQEAAE0AEKoBAACcAgAwqwEBAPQBACGvAUAA9gEAIbABQAD2AQAhywEBAPQBACHWAUAA9gEAIeABAQD0AQAh4QEBAIYCACHiAQEAhgIAIQMAAAADACABAABMADAhAABNACADAAAAAwAgAQAABAAwAgAABQAgAQAAAAkAIAEAAAAJACADAAAABwAgAQAACAAwAgAACQAgAwAAAAcAIAEAAAgAMAIAAAkAIAMAAAAHACABAAAIADACAAAJACAOAwAAnwMAIKsBAQAAAAGvAUAAAAABsAFAAAAAAcsBAQAAAAHXAQEAAAAB2AEBAAAAAdkBAQAAAAHaAQEAAAAB2wEBAAAAAdwBQAAAAAHdAUAAAAAB3gEBAAAAAd8BAQAAAAEBFQAAVQAgDasBAQAAAAGvAUAAAAABsAFAAAAAAcsBAQAAAAHXAQEAAAAB2AEBAAAAAdkBAQAAAAHaAQEAAAAB2wEBAAAAAdwBQAAAAAHdAUAAAAAB3gEBAAAAAd8BAQAAAAEBFQAAVwAwARUAAFcAMA4DAACeAwAgqwEBAL4CACGvAUAAwAIAIbABQADAAgAhywEBAL4CACHXAQEAvgIAIdgBAQC-AgAh2QEBAMwCACHaAQEAzAIAIdsBAQDMAgAh3AFAAJ0DACHdAUAAnQMAId4BAQDMAgAh3wEBAMwCACECAAAACQAgFQAAWgAgDasBAQC-AgAhrwFAAMACACGwAUAAwAIAIcsBAQC-AgAh1wEBAL4CACHYAQEAvgIAIdkBAQDMAgAh2gEBAMwCACHbAQEAzAIAIdwBQACdAwAh3QFAAJ0DACHeAQEAzAIAId8BAQDMAgAhAgAAAAcAIBUAAFwAIAIAAAAHACAVAABcACADAAAACQAgHAAAVQAgHQAAWgAgAQAAAAkAIAEAAAAHACAKDAAAmgMAICIAAJwDACAjAACbAwAg2QEAAMQCACDaAQAAxAIAINsBAADEAgAg3AEAAMQCACDdAQAAxAIAIN4BAADEAgAg3wEAAMQCACAQqAEAAJgCADCpAQAAYwAQqgEAAJgCADCrAQEA9AEAIa8BQAD2AQAhsAFAAPYBACHLAQEA9AEAIdcBAQD0AQAh2AEBAPQBACHZAQEAhgIAIdoBAQCGAgAh2wEBAIYCACHcAUAAmQIAId0BQACZAgAh3gEBAIYCACHfAQEAhgIAIQMAAAAHACABAABiADAhAABjACADAAAABwAgAQAACAAwAgAACQAgCagBAACXAgAwqQEAAGkAEKoBAACXAgAwqwEBAAAAAa8BQACBAgAhsAFAAIECACHUAQEAgAIAIdUBAQCAAgAh1gFAAIECACEBAAAAZgAgAQAAAGYAIAmoAQAAlwIAMKkBAABpABCqAQAAlwIAMKsBAQCAAgAhrwFAAIECACGwAUAAgQIAIdQBAQCAAgAh1QEBAIACACHWAUAAgQIAIQADAAAAaQAgAQAAagAwAgAAZgAgAwAAAGkAIAEAAGoAMAIAAGYAIAMAAABpACABAABqADACAABmACAGqwEBAAAAAa8BQAAAAAGwAUAAAAAB1AEBAAAAAdUBAQAAAAHWAUAAAAABARUAAG4AIAarAQEAAAABrwFAAAAAAbABQAAAAAHUAQEAAAAB1QEBAAAAAdYBQAAAAAEBFQAAcAAwARUAAHAAMAarAQEAvgIAIa8BQADAAgAhsAFAAMACACHUAQEAvgIAIdUBAQC-AgAh1gFAAMACACECAAAAZgAgFQAAcwAgBqsBAQC-AgAhrwFAAMACACGwAUAAwAIAIdQBAQC-AgAh1QEBAL4CACHWAUAAwAIAIQIAAABpACAVAAB1ACACAAAAaQAgFQAAdQAgAwAAAGYAIBwAAG4AIB0AAHMAIAEAAABmACABAAAAaQAgAwwAAJcDACAiAACZAwAgIwAAmAMAIAmoAQAAlgIAMKkBAAB8ABCqAQAAlgIAMKsBAQD0AQAhrwFAAPYBACGwAUAA9gEAIdQBAQD0AQAh1QEBAPQBACHWAUAA9gEAIQMAAABpACABAAB7ADAhAAB8ACADAAAAaQAgAQAAagAwAgAAZgAgAQAAABYAIAEAAAAWACADAAAACwAgAQAAFQAwAgAAFgAgAwAAAAsAIAEAABUAMAIAABYAIAMAAAALACABAAAVADACAAAWACAQAwAAhQMAIAoAAIQDACANAACWAwAgDgAAhgMAIKsBAQAAAAGvAUAAAAABsAFAAAAAAcsBAQAAAAHMAQEAAAABzQEBAAAAAc4BCAAAAAHPAQgAAAAB0AECAAAAAdEBAgAAAAHSAQIAAAAB0wEBAAAAAQEVAACEAQAgDKsBAQAAAAGvAUAAAAABsAFAAAAAAcsBAQAAAAHMAQEAAAABzQEBAAAAAc4BCAAAAAHPAQgAAAAB0AECAAAAAdEBAgAAAAHSAQIAAAAB0wEBAAAAAQEVAACGAQAwARUAAIYBADABAAAAEwAgEAMAAOkCACAKAADoAgAgDQAAlQMAIA4AAOoCACCrAQEAvgIAIa8BQADAAgAhsAFAAMACACHLAQEAvgIAIcwBAQDMAgAhzQEBAMwCACHOAQgAygIAIc8BCADKAgAh0AECAL8CACHRAQIAvwIAIdIBAgC_AgAh0wEBAMwCACECAAAAFgAgFQAAigEAIAyrAQEAvgIAIa8BQADAAgAhsAFAAMACACHLAQEAvgIAIcwBAQDMAgAhzQEBAMwCACHOAQgAygIAIc8BCADKAgAh0AECAL8CACHRAQIAvwIAIdIBAgC_AgAh0wEBAMwCACECAAAACwAgFQAAjAEAIAIAAAALACAVAACMAQAgAQAAABMAIAMAAAAWACAcAACEAQAgHQAAigEAIAEAAAAWACABAAAACwAgCAwAAJADACAiAACTAwAgIwAAkgMAIGQAAJEDACBlAACUAwAgzAEAAMQCACDNAQAAxAIAINMBAADEAgAgD6gBAACVAgAwqQEAAJQBABCqAQAAlQIAMKsBAQD0AQAhrwFAAPYBACGwAUAA9gEAIcsBAQD0AQAhzAEBAIYCACHNAQEAhgIAIc4BCACEAgAhzwEIAIQCACHQAQIA9QEAIdEBAgD1AQAh0gECAPUBACHTAQEAhgIAIQMAAAALACABAACTAQAwIQAAlAEAIAMAAAALACABAAAVADACAAAWACABAAAAGwAgAQAAABsAIAMAAAAZACABAAAaADACAAAbACADAAAAGQAgAQAAGgAwAgAAGwAgAwAAABkAIAEAABoAMAIAABsAIAcJAACPAwAgqwEBAAAAAb0BAQAAAAG_AQEAAAABwAEBAAAAAcYBIAAAAAHKAQIAAAABARUAAJwBACAGqwEBAAAAAb0BAQAAAAG_AQEAAAABwAEBAAAAAcYBIAAAAAHKAQIAAAABARUAAJ4BADABFQAAngEAMAcJAACOAwAgqwEBAL4CACG9AQEAvgIAIb8BAQC-AgAhwAEBAL4CACHGASAA2wIAIcoBAgC_AgAhAgAAABsAIBUAAKEBACAGqwEBAL4CACG9AQEAvgIAIb8BAQC-AgAhwAEBAL4CACHGASAA2wIAIcoBAgC_AgAhAgAAABkAIBUAAKMBACACAAAAGQAgFQAAowEAIAMAAAAbACAcAACcAQAgHQAAoQEAIAEAAAAbACABAAAAGQAgBQwAAIkDACAiAACMAwAgIwAAiwMAIGQAAIoDACBlAACNAwAgCagBAACUAgAwqQEAAKoBABCqAQAAlAIAMKsBAQD0AQAhvQEBAPQBACG_AQEA9AEAIcABAQD0AQAhxgEgAI4CACHKAQIA9QEAIQMAAAAZACABAACpAQAwIQAAqgEAIAMAAAAZACABAAAaADACAAAbACAHCwAAkwIAIKgBAACRAgAwqQEAABMAEKoBAACRAgAwqwEBAAAAAcUBAQAAAAHGASAAkgIAIQEAAACtAQAgAQAAAK0BACABCwAAiAMAIAMAAAATACABAACwAQAwAgAArQEAIAMAAAATACABAACwAQAwAgAArQEAIAMAAAATACABAACwAQAwAgAArQEAIAQLAACHAwAgqwEBAAAAAcUBAQAAAAHGASAAAAABARUAALQBACADqwEBAAAAAcUBAQAAAAHGASAAAAABARUAALYBADABFQAAtgEAMAQLAADcAgAgqwEBAL4CACHFAQEAvgIAIcYBIADbAgAhAgAAAK0BACAVAAC5AQAgA6sBAQC-AgAhxQEBAL4CACHGASAA2wIAIQIAAAATACAVAAC7AQAgAgAAABMAIBUAALsBACADAAAArQEAIBwAALQBACAdAAC5AQAgAQAAAK0BACABAAAAEwAgAwwAANgCACAiAADaAgAgIwAA2QIAIAaoAQAAjQIAMKkBAADCAQAQqgEAAI0CADCrAQEA9AEAIcUBAQD0AQAhxgEgAI4CACEDAAAAEwAgAQAAwQEAMCEAAMIBACADAAAAEwAgAQAAsAEAMAIAAK0BACABAAAADwAgAQAAAA8AIAMAAAANACABAAAOADACAAAPACADAAAADQAgAQAADgAwAgAADwAgAwAAAA0AIAEAAA4AMAIAAA8AIA4HAADVAgAgCAAA1gIAIAkAANcCACCrAQEAAAABrwFAAAAAAbABQAAAAAG8AQEAAAABvQEBAAAAAb4BQAAAAAG_AQEAAAABwAEBAAAAAcEBCAAAAAHDAQAAAMMBAsQBAQAAAAEBFQAAygEAIAurAQEAAAABrwFAAAAAAbABQAAAAAG8AQEAAAABvQEBAAAAAb4BQAAAAAG_AQEAAAABwAEBAAAAAcEBCAAAAAHDAQAAAMMBAsQBAQAAAAEBFQAAzAEAMAEVAADMAQAwDgcAAM0CACAIAADOAgAgCQAAzwIAIKsBAQC-AgAhrwFAAMACACGwAUAAwAIAIbwBAQC-AgAhvQEBAL4CACG-AUAAwAIAIb8BAQC-AgAhwAEBAL4CACHBAQgAygIAIcMBAADLAsMBIsQBAQDMAgAhAgAAAA8AIBUAAM8BACALqwEBAL4CACGvAUAAwAIAIbABQADAAgAhvAEBAL4CACG9AQEAvgIAIb4BQADAAgAhvwEBAL4CACHAAQEAvgIAIcEBCADKAgAhwwEAAMsCwwEixAEBAMwCACECAAAADQAgFQAA0QEAIAIAAAANACAVAADRAQAgAwAAAA8AIBwAAMoBACAdAADPAQAgAQAAAA8AIAEAAAANACAGDAAAxQIAICIAAMgCACAjAADHAgAgZAAAxgIAIGUAAMkCACDEAQAAxAIAIA6oAQAAgwIAMKkBAADYAQAQqgEAAIMCADCrAQEA9AEAIa8BQAD2AQAhsAFAAPYBACG8AQEA9AEAIb0BAQD0AQAhvgFAAPYBACG_AQEA9AEAIcABAQD0AQAhwQEIAIQCACHDAQAAhQLDASLEAQEAhgIAIQMAAAANACABAADXAQAwIQAA2AEAIAMAAAANACABAAAOADACAAAPACAKBgAAggIAIKgBAAD-AQAwqQEAABEAEKoBAAD-AQAwqwEBAAAAAawBAQAAAAGtAQIA_wEAIa4BAQCAAgAhrwFAAIECACGwAUAAgQIAIQEAAADbAQAgAQAAANsBACABBgAAwwIAIAMAAAARACABAADeAQAwAgAA2wEAIAMAAAARACABAADeAQAwAgAA2wEAIAMAAAARACABAADeAQAwAgAA2wEAIAcGAADCAgAgqwEBAAAAAawBAQAAAAGtAQIAAAABrgEBAAAAAa8BQAAAAAGwAUAAAAABARUAAOIBACAGqwEBAAAAAawBAQAAAAGtAQIAAAABrgEBAAAAAa8BQAAAAAGwAUAAAAABARUAAOQBADABFQAA5AEAMAcGAADBAgAgqwEBAL4CACGsAQEAvgIAIa0BAgC_AgAhrgEBAL4CACGvAUAAwAIAIbABQADAAgAhAgAAANsBACAVAADnAQAgBqsBAQC-AgAhrAEBAL4CACGtAQIAvwIAIa4BAQC-AgAhrwFAAMACACGwAUAAwAIAIQIAAAARACAVAADpAQAgAgAAABEAIBUAAOkBACADAAAA2wEAIBwAAOIBACAdAADnAQAgAQAAANsBACABAAAAEQAgBQwAALkCACAiAAC8AgAgIwAAuwIAIGQAALoCACBlAAC9AgAgCagBAADzAQAwqQEAAPABABCqAQAA8wEAMKsBAQD0AQAhrAEBAPQBACGtAQIA9QEAIa4BAQD0AQAhrwFAAPYBACGwAUAA9gEAIQMAAAARACABAADvAQAwIQAA8AEAIAMAAAARACABAADeAQAwAgAA2wEAIAmoAQAA8wEAMKkBAADwAQAQqgEAAPMBADCrAQEA9AEAIawBAQD0AQAhrQECAPUBACGuAQEA9AEAIa8BQAD2AQAhsAFAAPYBACEODAAA-AEAICIAAP0BACAjAAD9AQAgsQEBAAAAAbIBAQAAAASzAQEAAAAEtAEBAAAAAbUBAQAAAAG2AQEAAAABtwEBAAAAAbgBAQD8AQAhuQEBAAAAAboBAQAAAAG7AQEAAAABDQwAAPgBACAiAAD4AQAgIwAA-AEAIGQAAPsBACBlAAD4AQAgsQECAAAAAbIBAgAAAASzAQIAAAAEtAECAAAAAbUBAgAAAAG2AQIAAAABtwECAAAAAbgBAgD6AQAhCwwAAPgBACAiAAD5AQAgIwAA-QEAILEBQAAAAAGyAUAAAAAEswFAAAAABLQBQAAAAAG1AUAAAAABtgFAAAAAAbcBQAAAAAG4AUAA9wEAIQsMAAD4AQAgIgAA-QEAICMAAPkBACCxAUAAAAABsgFAAAAABLMBQAAAAAS0AUAAAAABtQFAAAAAAbYBQAAAAAG3AUAAAAABuAFAAPcBACEIsQECAAAAAbIBAgAAAASzAQIAAAAEtAECAAAAAbUBAgAAAAG2AQIAAAABtwECAAAAAbgBAgD4AQAhCLEBQAAAAAGyAUAAAAAEswFAAAAABLQBQAAAAAG1AUAAAAABtgFAAAAAAbcBQAAAAAG4AUAA-QEAIQ0MAAD4AQAgIgAA-AEAICMAAPgBACBkAAD7AQAgZQAA-AEAILEBAgAAAAGyAQIAAAAEswECAAAABLQBAgAAAAG1AQIAAAABtgECAAAAAbcBAgAAAAG4AQIA-gEAIQixAQgAAAABsgEIAAAABLMBCAAAAAS0AQgAAAABtQEIAAAAAbYBCAAAAAG3AQgAAAABuAEIAPsBACEODAAA-AEAICIAAP0BACAjAAD9AQAgsQEBAAAAAbIBAQAAAASzAQEAAAAEtAEBAAAAAbUBAQAAAAG2AQEAAAABtwEBAAAAAbgBAQD8AQAhuQEBAAAAAboBAQAAAAG7AQEAAAABC7EBAQAAAAGyAQEAAAAEswEBAAAABLQBAQAAAAG1AQEAAAABtgEBAAAAAbcBAQAAAAG4AQEA_QEAIbkBAQAAAAG6AQEAAAABuwEBAAAAAQoGAACCAgAgqAEAAP4BADCpAQAAEQAQqgEAAP4BADCrAQEAgAIAIawBAQCAAgAhrQECAP8BACGuAQEAgAIAIa8BQACBAgAhsAFAAIECACEIsQECAAAAAbIBAgAAAASzAQIAAAAEtAECAAAAAbUBAgAAAAG2AQIAAAABtwECAAAAAbgBAgD4AQAhC7EBAQAAAAGyAQEAAAAEswEBAAAABLQBAQAAAAG1AQEAAAABtgEBAAAAAbcBAQAAAAG4AQEA_QEAIbkBAQAAAAG6AQEAAAABuwEBAAAAAQixAUAAAAABsgFAAAAABLMBQAAAAAS0AUAAAAABtQFAAAAAAbYBQAAAAAG3AUAAAAABuAFAAPkBACETBwAAtQIAIAgAALACACAJAACtAgAgqAEAALMCADCpAQAADQAQqgEAALMCADCrAQEAgAIAIa8BQACBAgAhsAFAAIECACG8AQEAgAIAIb0BAQCAAgAhvgFAAIECACG_AQEAgAIAIcABAQCAAgAhwQEIAK8CACHDAQAAtALDASLEAQEApQIAIeoBAAANACDrAQAADQAgDqgBAACDAgAwqQEAANgBABCqAQAAgwIAMKsBAQD0AQAhrwFAAPYBACGwAUAA9gEAIbwBAQD0AQAhvQEBAPQBACG-AUAA9gEAIb8BAQD0AQAhwAEBAPQBACHBAQgAhAIAIcMBAACFAsMBIsQBAQCGAgAhDQwAAPgBACAiAAD7AQAgIwAA-wEAIGQAAPsBACBlAAD7AQAgsQEIAAAAAbIBCAAAAASzAQgAAAAEtAEIAAAAAbUBCAAAAAG2AQgAAAABtwEIAAAAAbgBCACMAgAhBwwAAPgBACAiAACLAgAgIwAAiwIAILEBAAAAwwECsgEAAADDAQizAQAAAMMBCLgBAACKAsMBIg4MAACIAgAgIgAAiQIAICMAAIkCACCxAQEAAAABsgEBAAAABbMBAQAAAAW0AQEAAAABtQEBAAAAAbYBAQAAAAG3AQEAAAABuAEBAIcCACG5AQEAAAABugEBAAAAAbsBAQAAAAEODAAAiAIAICIAAIkCACAjAACJAgAgsQEBAAAAAbIBAQAAAAWzAQEAAAAFtAEBAAAAAbUBAQAAAAG2AQEAAAABtwEBAAAAAbgBAQCHAgAhuQEBAAAAAboBAQAAAAG7AQEAAAABCLEBAgAAAAGyAQIAAAAFswECAAAABbQBAgAAAAG1AQIAAAABtgECAAAAAbcBAgAAAAG4AQIAiAIAIQuxAQEAAAABsgEBAAAABbMBAQAAAAW0AQEAAAABtQEBAAAAAbYBAQAAAAG3AQEAAAABuAEBAIkCACG5AQEAAAABugEBAAAAAbsBAQAAAAEHDAAA-AEAICIAAIsCACAjAACLAgAgsQEAAADDAQKyAQAAAMMBCLMBAAAAwwEIuAEAAIoCwwEiBLEBAAAAwwECsgEAAADDAQizAQAAAMMBCLgBAACLAsMBIg0MAAD4AQAgIgAA-wEAICMAAPsBACBkAAD7AQAgZQAA-wEAILEBCAAAAAGyAQgAAAAEswEIAAAABLQBCAAAAAG1AQgAAAABtgEIAAAAAbcBCAAAAAG4AQgAjAIAIQaoAQAAjQIAMKkBAADCAQAQqgEAAI0CADCrAQEA9AEAIcUBAQD0AQAhxgEgAI4CACEFDAAA-AEAICIAAJACACAjAACQAgAgsQEgAAAAAbgBIACPAgAhBQwAAPgBACAiAACQAgAgIwAAkAIAILEBIAAAAAG4ASAAjwIAIQKxASAAAAABuAEgAJACACEHCwAAkwIAIKgBAACRAgAwqQEAABMAEKoBAACRAgAwqwEBAIACACHFAQEAgAIAIcYBIACSAgAhArEBIAAAAAG4ASAAkAIAIQPHAQAACwAgyAEAAAsAIMkBAAALACAJqAEAAJQCADCpAQAAqgEAEKoBAACUAgAwqwEBAPQBACG9AQEA9AEAIb8BAQD0AQAhwAEBAPQBACHGASAAjgIAIcoBAgD1AQAhD6gBAACVAgAwqQEAAJQBABCqAQAAlQIAMKsBAQD0AQAhrwFAAPYBACGwAUAA9gEAIcsBAQD0AQAhzAEBAIYCACHNAQEAhgIAIc4BCACEAgAhzwEIAIQCACHQAQIA9QEAIdEBAgD1AQAh0gECAPUBACHTAQEAhgIAIQmoAQAAlgIAMKkBAAB8ABCqAQAAlgIAMKsBAQD0AQAhrwFAAPYBACGwAUAA9gEAIdQBAQD0AQAh1QEBAPQBACHWAUAA9gEAIQmoAQAAlwIAMKkBAABpABCqAQAAlwIAMKsBAQCAAgAhrwFAAIECACGwAUAAgQIAIdQBAQCAAgAh1QEBAIACACHWAUAAgQIAIRCoAQAAmAIAMKkBAABjABCqAQAAmAIAMKsBAQD0AQAhrwFAAPYBACGwAUAA9gEAIcsBAQD0AQAh1wEBAPQBACHYAQEA9AEAIdkBAQCGAgAh2gEBAIYCACHbAQEAhgIAIdwBQACZAgAh3QFAAJkCACHeAQEAhgIAId8BAQCGAgAhCwwAAIgCACAiAACbAgAgIwAAmwIAILEBQAAAAAGyAUAAAAAFswFAAAAABbQBQAAAAAG1AUAAAAABtgFAAAAAAbcBQAAAAAG4AUAAmgIAIQsMAACIAgAgIgAAmwIAICMAAJsCACCxAUAAAAABsgFAAAAABbMBQAAAAAW0AUAAAAABtQFAAAAAAbYBQAAAAAG3AUAAAAABuAFAAJoCACEIsQFAAAAAAbIBQAAAAAWzAUAAAAAFtAFAAAAAAbUBQAAAAAG2AUAAAAABtwFAAAAAAbgBQACbAgAhC6gBAACcAgAwqQEAAE0AEKoBAACcAgAwqwEBAPQBACGvAUAA9gEAIbABQAD2AQAhywEBAPQBACHWAUAA9gEAIeABAQD0AQAh4QEBAIYCACHiAQEAhgIAIQ2oAQAAnQIAMKkBAAA3ABCqAQAAnQIAMKsBAQD0AQAhrwFAAPYBACGwAUAA9gEAIcMBAACfAuoBI8UBAQD0AQAh4wEBAPQBACHkASAAjgIAIeUBAQCGAgAh5wEAAJ4C5wEi6AEBAIYCACEHDAAA-AEAICIAAKMCACAjAACjAgAgsQEAAADnAQKyAQAAAOcBCLMBAAAA5wEIuAEAAKIC5wEiBwwAAIgCACAiAAChAgAgIwAAoQIAILEBAAAA6gEDsgEAAADqAQmzAQAAAOoBCbgBAACgAuoBIwcMAACIAgAgIgAAoQIAICMAAKECACCxAQAAAOoBA7IBAAAA6gEJswEAAADqAQm4AQAAoALqASMEsQEAAADqAQOyAQAAAOoBCbMBAAAA6gEJuAEAAKEC6gEjBwwAAPgBACAiAACjAgAgIwAAowIAILEBAAAA5wECsgEAAADnAQizAQAAAOcBCLgBAACiAucBIgSxAQAAAOcBArIBAAAA5wEIswEAAADnAQi4AQAAowLnASIRBAAAqAIAIAUAAKkCACAKAACrAgAgDwAAqgIAIKgBAACkAgAwqQEAACQAEKoBAACkAgAwqwEBAIACACGvAUAAgQIAIbABQACBAgAhwwEAAKcC6gEjxQEBAIACACHjAQEAgAIAIeQBIACSAgAh5QEBAKUCACHnAQAApgLnASLoAQEApQIAIQuxAQEAAAABsgEBAAAABbMBAQAAAAW0AQEAAAABtQEBAAAAAbYBAQAAAAG3AQEAAAABuAEBAIkCACG5AQEAAAABugEBAAAAAbsBAQAAAAEEsQEAAADnAQKyAQAAAOcBCLMBAAAA5wEIuAEAAKMC5wEiBLEBAAAA6gEDsgEAAADqAQmzAQAAAOoBCbgBAAChAuoBIwPHAQAAAwAgyAEAAAMAIMkBAAADACADxwEAAAcAIMgBAAAHACDJAQAABwAgFQMAALACACAKAACrAgAgDQAAsQIAIA4AALICACCoAQAArgIAMKkBAAALABCqAQAArgIAMKsBAQCAAgAhrwFAAIECACGwAUAAgQIAIcsBAQCAAgAhzAEBAKUCACHNAQEApQIAIc4BCACvAgAhzwEIAK8CACHQAQIA_wEAIdEBAgD_AQAh0gECAP8BACHTAQEApQIAIeoBAAALACDrAQAACwAgA8cBAAANACDIAQAADQAgyQEAAA0AIAoJAACtAgAgqAEAAKwCADCpAQAAGQAQqgEAAKwCADCrAQEAgAIAIb0BAQCAAgAhvwEBAIACACHAAQEAgAIAIcYBIACSAgAhygECAP8BACEVAwAAsAIAIAoAAKsCACANAACxAgAgDgAAsgIAIKgBAACuAgAwqQEAAAsAEKoBAACuAgAwqwEBAIACACGvAUAAgQIAIbABQACBAgAhywEBAIACACHMAQEApQIAIc0BAQClAgAhzgEIAK8CACHPAQgArwIAIdABAgD_AQAh0QECAP8BACHSAQIA_wEAIdMBAQClAgAh6gEAAAsAIOsBAAALACATAwAAsAIAIAoAAKsCACANAACxAgAgDgAAsgIAIKgBAACuAgAwqQEAAAsAEKoBAACuAgAwqwEBAIACACGvAUAAgQIAIbABQACBAgAhywEBAIACACHMAQEApQIAIc0BAQClAgAhzgEIAK8CACHPAQgArwIAIdABAgD_AQAh0QECAP8BACHSAQIA_wEAIdMBAQClAgAhCLEBCAAAAAGyAQgAAAAEswEIAAAABLQBCAAAAAG1AQgAAAABtgEIAAAAAbcBCAAAAAG4AQgA-wEAIRMEAACoAgAgBQAAqQIAIAoAAKsCACAPAACqAgAgqAEAAKQCADCpAQAAJAAQqgEAAKQCADCrAQEAgAIAIa8BQACBAgAhsAFAAIECACHDAQAApwLqASPFAQEAgAIAIeMBAQCAAgAh5AEgAJICACHlAQEApQIAIecBAACmAucBIugBAQClAgAh6gEAACQAIOsBAAAkACAJCwAAkwIAIKgBAACRAgAwqQEAABMAEKoBAACRAgAwqwEBAIACACHFAQEAgAIAIcYBIACSAgAh6gEAABMAIOsBAAATACADxwEAABkAIMgBAAAZACDJAQAAGQAgEQcAALUCACAIAACwAgAgCQAArQIAIKgBAACzAgAwqQEAAA0AEKoBAACzAgAwqwEBAIACACGvAUAAgQIAIbABQACBAgAhvAEBAIACACG9AQEAgAIAIb4BQACBAgAhvwEBAIACACHAAQEAgAIAIcEBCACvAgAhwwEAALQCwwEixAEBAKUCACEEsQEAAADDAQKyAQAAAMMBCLMBAAAAwwEIuAEAAIsCwwEiDAYAAIICACCoAQAA_gEAMKkBAAARABCqAQAA_gEAMKsBAQCAAgAhrAEBAIACACGtAQIA_wEAIa4BAQCAAgAhrwFAAIECACGwAUAAgQIAIeoBAAARACDrAQAAEQAgEQMAALACACCoAQAAtgIAMKkBAAAHABCqAQAAtgIAMKsBAQCAAgAhrwFAAIECACGwAUAAgQIAIcsBAQCAAgAh1wEBAIACACHYAQEAgAIAIdkBAQClAgAh2gEBAKUCACHbAQEApQIAIdwBQAC3AgAh3QFAALcCACHeAQEApQIAId8BAQClAgAhCLEBQAAAAAGyAUAAAAAFswFAAAAABbQBQAAAAAG1AUAAAAABtgFAAAAAAbcBQAAAAAG4AUAAmwIAIQwDAACwAgAgqAEAALgCADCpAQAAAwAQqgEAALgCADCrAQEAgAIAIa8BQACBAgAhsAFAAIECACHLAQEAgAIAIdYBQACBAgAh4AEBAIACACHhAQEApQIAIeIBAQClAgAhAAAAAAAB8gEBAAAAAQXyAQIAAAAB9QECAAAAAfYBAgAAAAH3AQIAAAAB-AECAAAAAQHyAUAAAAABBRwAAIkEACAdAACMBAAg7AEAAIoEACDtAQAAiwQAIPABAAAPACADHAAAiQQAIOwBAACKBAAg8AEAAA8AIAQHAADfAwAgCAAA3AMAIAkAANoDACDEAQAAxAIAIAAAAAAAAAXyAQgAAAAB9QEIAAAAAfYBCAAAAAH3AQgAAAAB-AEIAAAAAQHyAQAAAMMBAgHyAQEAAAABBxwAANACACAdAADTAgAg7AEAANECACDtAQAA0gIAIO4BAAARACDvAQAAEQAg8AEAANsBACAFHAAAgQQAIB0AAIcEACDsAQAAggQAIO0BAACGBAAg8AEAAAEAIAUcAAD_AwAgHQAAhAQAIOwBAACABAAg7QEAAIMEACDwAQAAFgAgBasBAQAAAAGtAQIAAAABrgEBAAAAAa8BQAAAAAGwAUAAAAABAgAAANsBACAcAADQAgAgAwAAABEAIBwAANACACAdAADUAgAgBwAAABEAIBUAANQCACCrAQEAvgIAIa0BAgC_AgAhrgEBAL4CACGvAUAAwAIAIbABQADAAgAhBasBAQC-AgAhrQECAL8CACGuAQEAvgIAIa8BQADAAgAhsAFAAMACACEDHAAA0AIAIOwBAADRAgAg8AEAANsBACADHAAAgQQAIOwBAACCBAAg8AEAAAEAIAMcAAD_AwAg7AEAAIAEACDwAQAAFgAgAAAAAfIBIAAAAAELHAAA3QIAMB0AAOICADDsAQAA3gIAMO0BAADfAgAw7gEAAOECADDvAQAA4QIAMPABAADhAgAw8QEAAOACACDyAQAA4QIAMPMBAADjAgAw9AEAAOQCADAOAwAAhQMAIAoAAIQDACAOAACGAwAgqwEBAAAAAa8BQAAAAAGwAUAAAAABywEBAAAAAc0BAQAAAAHOAQgAAAABzwEIAAAAAdABAgAAAAHRAQIAAAAB0gECAAAAAdMBAQAAAAECAAAAFgAgHAAAgwMAIAMAAAAWACAcAACDAwAgHQAA5wIAIAEVAAD-AwAwEwMAALACACAKAACrAgAgDQAAsQIAIA4AALICACCoAQAArgIAMKkBAAALABCqAQAArgIAMKsBAQAAAAGvAUAAgQIAIbABQACBAgAhywEBAAAAAcwBAQClAgAhzQEBAKUCACHOAQgArwIAIc8BCACvAgAh0AECAP8BACHRAQIA_wEAIdIBAgD_AQAh0wEBAKUCACECAAAAFgAgFQAA5wIAIAIAAADlAgAgFQAA5gIAIA-oAQAA5AIAMKkBAADlAgAQqgEAAOQCADCrAQEAgAIAIa8BQACBAgAhsAFAAIECACHLAQEAgAIAIcwBAQClAgAhzQEBAKUCACHOAQgArwIAIc8BCACvAgAh0AECAP8BACHRAQIA_wEAIdIBAgD_AQAh0wEBAKUCACEPqAEAAOQCADCpAQAA5QIAEKoBAADkAgAwqwEBAIACACGvAUAAgQIAIbABQACBAgAhywEBAIACACHMAQEApQIAIc0BAQClAgAhzgEIAK8CACHPAQgArwIAIdABAgD_AQAh0QECAP8BACHSAQIA_wEAIdMBAQClAgAhC6sBAQC-AgAhrwFAAMACACGwAUAAwAIAIcsBAQC-AgAhzQEBAMwCACHOAQgAygIAIc8BCADKAgAh0AECAL8CACHRAQIAvwIAIdIBAgC_AgAh0wEBAMwCACEOAwAA6QIAIAoAAOgCACAOAADqAgAgqwEBAL4CACGvAUAAwAIAIbABQADAAgAhywEBAL4CACHNAQEAzAIAIc4BCADKAgAhzwEIAMoCACHQAQIAvwIAIdEBAgC_AgAh0gECAL8CACHTAQEAzAIAIQscAAD3AgAwHQAA_AIAMOwBAAD4AgAw7QEAAPkCADDuAQAA-wIAMO8BAAD7AgAw8AEAAPsCADDxAQAA-gIAIPIBAAD7AgAw8wEAAP0CADD0AQAA_gIAMAUcAAD3AwAgHQAA_AMAIOwBAAD4AwAg7QEAAPsDACDwAQAAAQAgCxwAAOsCADAdAADwAgAw7AEAAOwCADDtAQAA7QIAMO4BAADvAgAw7wEAAO8CADDwAQAA7wIAMPEBAADuAgAg8gEAAO8CADDzAQAA8QIAMPQBAADyAgAwBasBAQAAAAG_AQEAAAABwAEBAAAAAcYBIAAAAAHKAQIAAAABAgAAABsAIBwAAPYCACADAAAAGwAgHAAA9gIAIB0AAPUCACABFQAA-gMAMAoJAACtAgAgqAEAAKwCADCpAQAAGQAQqgEAAKwCADCrAQEAAAABvQEBAIACACG_AQEAgAIAIcABAQCAAgAhxgEgAJICACHKAQIA_wEAIQIAAAAbACAVAAD1AgAgAgAAAPMCACAVAAD0AgAgCagBAADyAgAwqQEAAPMCABCqAQAA8gIAMKsBAQCAAgAhvQEBAIACACG_AQEAgAIAIcABAQCAAgAhxgEgAJICACHKAQIA_wEAIQmoAQAA8gIAMKkBAADzAgAQqgEAAPICADCrAQEAgAIAIb0BAQCAAgAhvwEBAIACACHAAQEAgAIAIcYBIACSAgAhygECAP8BACEFqwEBAL4CACG_AQEAvgIAIcABAQC-AgAhxgEgANsCACHKAQIAvwIAIQWrAQEAvgIAIb8BAQC-AgAhwAEBAL4CACHGASAA2wIAIcoBAgC_AgAhBasBAQAAAAG_AQEAAAABwAEBAAAAAcYBIAAAAAHKAQIAAAABDAcAANUCACAIAADWAgAgqwEBAAAAAa8BQAAAAAGwAUAAAAABvAEBAAAAAb4BQAAAAAG_AQEAAAABwAEBAAAAAcEBCAAAAAHDAQAAAMMBAsQBAQAAAAECAAAADwAgHAAAggMAIAMAAAAPACAcAACCAwAgHQAAgQMAIAEVAAD5AwAwEQcAALUCACAIAACwAgAgCQAArQIAIKgBAACzAgAwqQEAAA0AEKoBAACzAgAwqwEBAAAAAa8BQACBAgAhsAFAAIECACG8AQEAgAIAIb0BAQCAAgAhvgFAAIECACG_AQEAgAIAIcABAQCAAgAhwQEIAK8CACHDAQAAtALDASLEAQEApQIAIQIAAAAPACAVAACBAwAgAgAAAP8CACAVAACAAwAgDqgBAAD-AgAwqQEAAP8CABCqAQAA_gIAMKsBAQCAAgAhrwFAAIECACGwAUAAgQIAIbwBAQCAAgAhvQEBAIACACG-AUAAgQIAIb8BAQCAAgAhwAEBAIACACHBAQgArwIAIcMBAAC0AsMBIsQBAQClAgAhDqgBAAD-AgAwqQEAAP8CABCqAQAA_gIAMKsBAQCAAgAhrwFAAIECACGwAUAAgQIAIbwBAQCAAgAhvQEBAIACACG-AUAAgQIAIb8BAQCAAgAhwAEBAIACACHBAQgArwIAIcMBAAC0AsMBIsQBAQClAgAhCqsBAQC-AgAhrwFAAMACACGwAUAAwAIAIbwBAQC-AgAhvgFAAMACACG_AQEAvgIAIcABAQC-AgAhwQEIAMoCACHDAQAAywLDASLEAQEAzAIAIQwHAADNAgAgCAAAzgIAIKsBAQC-AgAhrwFAAMACACGwAUAAwAIAIbwBAQC-AgAhvgFAAMACACG_AQEAvgIAIcABAQC-AgAhwQEIAMoCACHDAQAAywLDASLEAQEAzAIAIQwHAADVAgAgCAAA1gIAIKsBAQAAAAGvAUAAAAABsAFAAAAAAbwBAQAAAAG-AUAAAAABvwEBAAAAAcABAQAAAAHBAQgAAAABwwEAAADDAQLEAQEAAAABDgMAAIUDACAKAACEAwAgDgAAhgMAIKsBAQAAAAGvAUAAAAABsAFAAAAAAcsBAQAAAAHNAQEAAAABzgEIAAAAAc8BCAAAAAHQAQIAAAAB0QECAAAAAdIBAgAAAAHTAQEAAAABBBwAAPcCADDsAQAA-AIAMPABAAD7AgAw8QEAAPoCACADHAAA9wMAIOwBAAD4AwAg8AEAAAEAIAQcAADrAgAw7AEAAOwCADDwAQAA7wIAMPEBAADuAgAgBBwAAN0CADDsAQAA3gIAMPABAADhAgAw8QEAAOACACAAAAAAAAAFHAAA8gMAIB0AAPUDACDsAQAA8wMAIO0BAAD0AwAg8AEAABYAIAMcAADyAwAg7AEAAPMDACDwAQAAFgAgAAAAAAAHHAAA7QMAIB0AAPADACDsAQAA7gMAIO0BAADvAwAg7gEAABMAIO8BAAATACDwAQAArQEAIAMcAADtAwAg7AEAAO4DACDwAQAArQEAIAAAAAAAAAHyAUAAAAABBRwAAOgDACAdAADrAwAg7AEAAOkDACDtAQAA6gMAIPABAAABACADHAAA6AMAIOwBAADpAwAg8AEAAAEAIAAAAAUcAADjAwAgHQAA5gMAIOwBAADkAwAg7QEAAOUDACDwAQAAAQAgAxwAAOMDACDsAQAA5AMAIPABAAABACAAAAAB8gEAAADnAQIB8gEAAADqAQMLHAAAyAMAMB0AAM0DADDsAQAAyQMAMO0BAADKAwAw7gEAAMwDADDvAQAAzAMAMPABAADMAwAw8QEAAMsDACDyAQAAzAMAMPMBAADOAwAw9AEAAM8DADALHAAAvAMAMB0AAMEDADDsAQAAvQMAMO0BAAC-AwAw7gEAAMADADDvAQAAwAMAMPABAADAAwAw8QEAAL8DACDyAQAAwAMAMPMBAADCAwAw9AEAAMMDADAHHAAAtwMAIB0AALoDACDsAQAAuAMAIO0BAAC5AwAg7gEAAAsAIO8BAAALACDwAQAAFgAgCxwAAK4DADAdAACyAwAw7AEAAK8DADDtAQAAsAMAMO4BAAD7AgAw7wEAAPsCADDwAQAA-wIAMPEBAACxAwAg8gEAAPsCADDzAQAAswMAMPQBAAD-AgAwDAcAANUCACAJAADXAgAgqwEBAAAAAa8BQAAAAAGwAUAAAAABvQEBAAAAAb4BQAAAAAG_AQEAAAABwAEBAAAAAcEBCAAAAAHDAQAAAMMBAsQBAQAAAAECAAAADwAgHAAAtgMAIAMAAAAPACAcAAC2AwAgHQAAtQMAIAEVAADiAwAwAgAAAA8AIBUAALUDACACAAAA_wIAIBUAALQDACAKqwEBAL4CACGvAUAAwAIAIbABQADAAgAhvQEBAL4CACG-AUAAwAIAIb8BAQC-AgAhwAEBAL4CACHBAQgAygIAIcMBAADLAsMBIsQBAQDMAgAhDAcAAM0CACAJAADPAgAgqwEBAL4CACGvAUAAwAIAIbABQADAAgAhvQEBAL4CACG-AUAAwAIAIb8BAQC-AgAhwAEBAL4CACHBAQgAygIAIcMBAADLAsMBIsQBAQDMAgAhDAcAANUCACAJAADXAgAgqwEBAAAAAa8BQAAAAAGwAUAAAAABvQEBAAAAAb4BQAAAAAG_AQEAAAABwAEBAAAAAcEBCAAAAAHDAQAAAMMBAsQBAQAAAAEOCgAAhAMAIA0AAJYDACAOAACGAwAgqwEBAAAAAa8BQAAAAAGwAUAAAAABzAEBAAAAAc0BAQAAAAHOAQgAAAABzwEIAAAAAdABAgAAAAHRAQIAAAAB0gECAAAAAdMBAQAAAAECAAAAFgAgHAAAtwMAIAMAAAALACAcAAC3AwAgHQAAuwMAIBAAAAALACAKAADoAgAgDQAAlQMAIA4AAOoCACAVAAC7AwAgqwEBAL4CACGvAUAAwAIAIbABQADAAgAhzAEBAMwCACHNAQEAzAIAIc4BCADKAgAhzwEIAMoCACHQAQIAvwIAIdEBAgC_AgAh0gECAL8CACHTAQEAzAIAIQ4KAADoAgAgDQAAlQMAIA4AAOoCACCrAQEAvgIAIa8BQADAAgAhsAFAAMACACHMAQEAzAIAIc0BAQDMAgAhzgEIAMoCACHPAQgAygIAIdABAgC_AgAh0QECAL8CACHSAQIAvwIAIdMBAQDMAgAhDKsBAQAAAAGvAUAAAAABsAFAAAAAAdcBAQAAAAHYAQEAAAAB2QEBAAAAAdoBAQAAAAHbAQEAAAAB3AFAAAAAAd0BQAAAAAHeAQEAAAAB3wEBAAAAAQIAAAAJACAcAADHAwAgAwAAAAkAIBwAAMcDACAdAADGAwAgARUAAOEDADARAwAAsAIAIKgBAAC2AgAwqQEAAAcAEKoBAAC2AgAwqwEBAAAAAa8BQACBAgAhsAFAAIECACHLAQEAgAIAIdcBAQCAAgAh2AEBAIACACHZAQEApQIAIdoBAQClAgAh2wEBAKUCACHcAUAAtwIAId0BQAC3AgAh3gEBAKUCACHfAQEApQIAIQIAAAAJACAVAADGAwAgAgAAAMQDACAVAADFAwAgEKgBAADDAwAwqQEAAMQDABCqAQAAwwMAMKsBAQCAAgAhrwFAAIECACGwAUAAgQIAIcsBAQCAAgAh1wEBAIACACHYAQEAgAIAIdkBAQClAgAh2gEBAKUCACHbAQEApQIAIdwBQAC3AgAh3QFAALcCACHeAQEApQIAId8BAQClAgAhEKgBAADDAwAwqQEAAMQDABCqAQAAwwMAMKsBAQCAAgAhrwFAAIECACGwAUAAgQIAIcsBAQCAAgAh1wEBAIACACHYAQEAgAIAIdkBAQClAgAh2gEBAKUCACHbAQEApQIAIdwBQAC3AgAh3QFAALcCACHeAQEApQIAId8BAQClAgAhDKsBAQC-AgAhrwFAAMACACGwAUAAwAIAIdcBAQC-AgAh2AEBAL4CACHZAQEAzAIAIdoBAQDMAgAh2wEBAMwCACHcAUAAnQMAId0BQACdAwAh3gEBAMwCACHfAQEAzAIAIQyrAQEAvgIAIa8BQADAAgAhsAFAAMACACHXAQEAvgIAIdgBAQC-AgAh2QEBAMwCACHaAQEAzAIAIdsBAQDMAgAh3AFAAJ0DACHdAUAAnQMAId4BAQDMAgAh3wEBAMwCACEMqwEBAAAAAa8BQAAAAAGwAUAAAAAB1wEBAAAAAdgBAQAAAAHZAQEAAAAB2gEBAAAAAdsBAQAAAAHcAUAAAAAB3QFAAAAAAd4BAQAAAAHfAQEAAAABB6sBAQAAAAGvAUAAAAABsAFAAAAAAdYBQAAAAAHgAQEAAAAB4QEBAAAAAeIBAQAAAAECAAAABQAgHAAA0wMAIAMAAAAFACAcAADTAwAgHQAA0gMAIAEVAADgAwAwDAMAALACACCoAQAAuAIAMKkBAAADABCqAQAAuAIAMKsBAQAAAAGvAUAAgQIAIbABQACBAgAhywEBAIACACHWAUAAgQIAIeABAQAAAAHhAQEApQIAIeIBAQClAgAhAgAAAAUAIBUAANIDACACAAAA0AMAIBUAANEDACALqAEAAM8DADCpAQAA0AMAEKoBAADPAwAwqwEBAIACACGvAUAAgQIAIbABQACBAgAhywEBAIACACHWAUAAgQIAIeABAQCAAgAh4QEBAKUCACHiAQEApQIAIQuoAQAAzwMAMKkBAADQAwAQqgEAAM8DADCrAQEAgAIAIa8BQACBAgAhsAFAAIECACHLAQEAgAIAIdYBQACBAgAh4AEBAIACACHhAQEApQIAIeIBAQClAgAhB6sBAQC-AgAhrwFAAMACACGwAUAAwAIAIdYBQADAAgAh4AEBAL4CACHhAQEAzAIAIeIBAQDMAgAhB6sBAQC-AgAhrwFAAMACACGwAUAAwAIAIdYBQADAAgAh4AEBAL4CACHhAQEAzAIAIeIBAQDMAgAhB6sBAQAAAAGvAUAAAAABsAFAAAAAAdYBQAAAAAHgAQEAAAAB4QEBAAAAAeIBAQAAAAEEHAAAyAMAMOwBAADJAwAw8AEAAMwDADDxAQAAywMAIAQcAAC8AwAw7AEAAL0DADDwAQAAwAMAMPEBAAC_AwAgAxwAALcDACDsAQAAuAMAIPABAAAWACAEHAAArgMAMOwBAACvAwAw8AEAAPsCADDxAQAAsQMAIAAABwMAANwDACAKAADbAwAgDQAA3QMAIA4AAN4DACDMAQAAxAIAIM0BAADEAgAg0wEAAMQCACAABwQAANgDACAFAADZAwAgCgAA2wMAIA8AANoDACDDAQAAxAIAIOUBAADEAgAg6AEAAMQCACABCwAAiAMAIAABBgAAwwIAIAerAQEAAAABrwFAAAAAAbABQAAAAAHWAUAAAAAB4AEBAAAAAeEBAQAAAAHiAQEAAAABDKsBAQAAAAGvAUAAAAABsAFAAAAAAdcBAQAAAAHYAQEAAAAB2QEBAAAAAdoBAQAAAAHbAQEAAAAB3AFAAAAAAd0BQAAAAAHeAQEAAAAB3wEBAAAAAQqrAQEAAAABrwFAAAAAAbABQAAAAAG9AQEAAAABvgFAAAAAAb8BAQAAAAHAAQEAAAABwQEIAAAAAcMBAAAAwwECxAEBAAAAAQ0FAADVAwAgCgAA1wMAIA8AANYDACCrAQEAAAABrwFAAAAAAbABQAAAAAHDAQAAAOoBA8UBAQAAAAHjAQEAAAAB5AEgAAAAAeUBAQAAAAHnAQAAAOcBAugBAQAAAAECAAAAAQAgHAAA4wMAIAMAAAAkACAcAADjAwAgHQAA5wMAIA8AAAAkACAFAACrAwAgCgAArQMAIA8AAKwDACAVAADnAwAgqwEBAL4CACGvAUAAwAIAIbABQADAAgAhwwEAAKkD6gEjxQEBAL4CACHjAQEAvgIAIeQBIADbAgAh5QEBAMwCACHnAQAAqAPnASLoAQEAzAIAIQ0FAACrAwAgCgAArQMAIA8AAKwDACCrAQEAvgIAIa8BQADAAgAhsAFAAMACACHDAQAAqQPqASPFAQEAvgIAIeMBAQC-AgAh5AEgANsCACHlAQEAzAIAIecBAACoA-cBIugBAQDMAgAhDQQAANQDACAKAADXAwAgDwAA1gMAIKsBAQAAAAGvAUAAAAABsAFAAAAAAcMBAAAA6gEDxQEBAAAAAeMBAQAAAAHkASAAAAAB5QEBAAAAAecBAAAA5wEC6AEBAAAAAQIAAAABACAcAADoAwAgAwAAACQAIBwAAOgDACAdAADsAwAgDwAAACQAIAQAAKoDACAKAACtAwAgDwAArAMAIBUAAOwDACCrAQEAvgIAIa8BQADAAgAhsAFAAMACACHDAQAAqQPqASPFAQEAvgIAIeMBAQC-AgAh5AEgANsCACHlAQEAzAIAIecBAACoA-cBIugBAQDMAgAhDQQAAKoDACAKAACtAwAgDwAArAMAIKsBAQC-AgAhrwFAAMACACGwAUAAwAIAIcMBAACpA-oBI8UBAQC-AgAh4wEBAL4CACHkASAA2wIAIeUBAQDMAgAh5wEAAKgD5wEi6AEBAMwCACEDqwEBAAAAAcUBAQAAAAHGASAAAAABAgAAAK0BACAcAADtAwAgAwAAABMAIBwAAO0DACAdAADxAwAgBQAAABMAIBUAAPEDACCrAQEAvgIAIcUBAQC-AgAhxgEgANsCACEDqwEBAL4CACHFAQEAvgIAIcYBIADbAgAhDwMAAIUDACAKAACEAwAgDQAAlgMAIKsBAQAAAAGvAUAAAAABsAFAAAAAAcsBAQAAAAHMAQEAAAABzQEBAAAAAc4BCAAAAAHPAQgAAAAB0AECAAAAAdEBAgAAAAHSAQIAAAAB0wEBAAAAAQIAAAAWACAcAADyAwAgAwAAAAsAIBwAAPIDACAdAAD2AwAgEQAAAAsAIAMAAOkCACAKAADoAgAgDQAAlQMAIBUAAPYDACCrAQEAvgIAIa8BQADAAgAhsAFAAMACACHLAQEAvgIAIcwBAQDMAgAhzQEBAMwCACHOAQgAygIAIc8BCADKAgAh0AECAL8CACHRAQIAvwIAIdIBAgC_AgAh0wEBAMwCACEPAwAA6QIAIAoAAOgCACANAACVAwAgqwEBAL4CACGvAUAAwAIAIbABQADAAgAhywEBAL4CACHMAQEAzAIAIc0BAQDMAgAhzgEIAMoCACHPAQgAygIAIdABAgC_AgAh0QECAL8CACHSAQIAvwIAIdMBAQDMAgAhDQQAANQDACAFAADVAwAgCgAA1wMAIKsBAQAAAAGvAUAAAAABsAFAAAAAAcMBAAAA6gEDxQEBAAAAAeMBAQAAAAHkASAAAAAB5QEBAAAAAecBAAAA5wEC6AEBAAAAAQIAAAABACAcAAD3AwAgCqsBAQAAAAGvAUAAAAABsAFAAAAAAbwBAQAAAAG-AUAAAAABvwEBAAAAAcABAQAAAAHBAQgAAAABwwEAAADDAQLEAQEAAAABBasBAQAAAAG_AQEAAAABwAEBAAAAAcYBIAAAAAHKAQIAAAABAwAAACQAIBwAAPcDACAdAAD9AwAgDwAAACQAIAQAAKoDACAFAACrAwAgCgAArQMAIBUAAP0DACCrAQEAvgIAIa8BQADAAgAhsAFAAMACACHDAQAAqQPqASPFAQEAvgIAIeMBAQC-AgAh5AEgANsCACHlAQEAzAIAIecBAACoA-cBIugBAQDMAgAhDQQAAKoDACAFAACrAwAgCgAArQMAIKsBAQC-AgAhrwFAAMACACGwAUAAwAIAIcMBAACpA-oBI8UBAQC-AgAh4wEBAL4CACHkASAA2wIAIeUBAQDMAgAh5wEAAKgD5wEi6AEBAMwCACELqwEBAAAAAa8BQAAAAAGwAUAAAAABywEBAAAAAc0BAQAAAAHOAQgAAAABzwEIAAAAAdABAgAAAAHRAQIAAAAB0gECAAAAAdMBAQAAAAEPAwAAhQMAIA0AAJYDACAOAACGAwAgqwEBAAAAAa8BQAAAAAGwAUAAAAABywEBAAAAAcwBAQAAAAHNAQEAAAABzgEIAAAAAc8BCAAAAAHQAQIAAAAB0QECAAAAAdIBAgAAAAHTAQEAAAABAgAAABYAIBwAAP8DACANBAAA1AMAIAUAANUDACAPAADWAwAgqwEBAAAAAa8BQAAAAAGwAUAAAAABwwEAAADqAQPFAQEAAAAB4wEBAAAAAeQBIAAAAAHlAQEAAAAB5wEAAADnAQLoAQEAAAABAgAAAAEAIBwAAIEEACADAAAACwAgHAAA_wMAIB0AAIUEACARAAAACwAgAwAA6QIAIA0AAJUDACAOAADqAgAgFQAAhQQAIKsBAQC-AgAhrwFAAMACACGwAUAAwAIAIcsBAQC-AgAhzAEBAMwCACHNAQEAzAIAIc4BCADKAgAhzwEIAMoCACHQAQIAvwIAIdEBAgC_AgAh0gECAL8CACHTAQEAzAIAIQ8DAADpAgAgDQAAlQMAIA4AAOoCACCrAQEAvgIAIa8BQADAAgAhsAFAAMACACHLAQEAvgIAIcwBAQDMAgAhzQEBAMwCACHOAQgAygIAIc8BCADKAgAh0AECAL8CACHRAQIAvwIAIdIBAgC_AgAh0wEBAMwCACEDAAAAJAAgHAAAgQQAIB0AAIgEACAPAAAAJAAgBAAAqgMAIAUAAKsDACAPAACsAwAgFQAAiAQAIKsBAQC-AgAhrwFAAMACACGwAUAAwAIAIcMBAACpA-oBI8UBAQC-AgAh4wEBAL4CACHkASAA2wIAIeUBAQDMAgAh5wEAAKgD5wEi6AEBAMwCACENBAAAqgMAIAUAAKsDACAPAACsAwAgqwEBAL4CACGvAUAAwAIAIbABQADAAgAhwwEAAKkD6gEjxQEBAL4CACHjAQEAvgIAIeQBIADbAgAh5QEBAMwCACHnAQAAqAPnASLoAQEAzAIAIQ0IAADWAgAgCQAA1wIAIKsBAQAAAAGvAUAAAAABsAFAAAAAAbwBAQAAAAG9AQEAAAABvgFAAAAAAb8BAQAAAAHAAQEAAAABwQEIAAAAAcMBAAAAwwECxAEBAAAAAQIAAAAPACAcAACJBAAgAwAAAA0AIBwAAIkEACAdAACNBAAgDwAAAA0AIAgAAM4CACAJAADPAgAgFQAAjQQAIKsBAQC-AgAhrwFAAMACACGwAUAAwAIAIbwBAQC-AgAhvQEBAL4CACG-AUAAwAIAIb8BAQC-AgAhwAEBAL4CACHBAQgAygIAIcMBAADLAsMBIsQBAQDMAgAhDQgAAM4CACAJAADPAgAgqwEBAL4CACGvAUAAwAIAIbABQADAAgAhvAEBAL4CACG9AQEAvgIAIb4BQADAAgAhvwEBAL4CACHAAQEAvgIAIcEBCADKAgAhwwEAAMsCwwEixAEBAMwCACEFBAYCBQoDCh8FDAALDwwEAQMAAQEDAAEFAwABChAFDAAKDRQHDhwJAwcSBggAAQkABAEGAAUCCxcEDAAIAQsYAAEJAAQCCh0ADh4AAwQgAAUhAAoiAAAAAAMMABAiABEjABIAAAADDAAQIgARIwASAQMAAQEDAAEDDAAXIgAYIwAZAAAAAwwAFyIAGCMAGQEDAAEBAwABAwwAHiIAHyMAIAAAAAMMAB4iAB8jACAAAAADDAAmIgAnIwAoAAAAAwwAJiIAJyMAKAIDAAENiQEHAgMAAQ2PAQcFDAAtIgAwIwAxZAAuZQAvAAAAAAAFDAAtIgAwIwAxZAAuZQAvAQkABAEJAAQFDAA2IgA5IwA6ZAA3ZQA4AAAAAAAFDAA2IgA5IwA6ZAA3ZQA4AAADDAA_IgBAIwBBAAAAAwwAPyIAQCMAQQIIAAEJAAQCCAABCQAEBQwARiIASSMASmQAR2UASAAAAAAABQwARiIASSMASmQAR2UASAEGAAUBBgAFBQwATyIAUiMAU2QAUGUAUQAAAAAABQwATyIAUiMAU2QAUGUAURACAREjARImARMnARQoARYqARcsDBgtDRkvARoxDBsyDh4zAR80ASA1DCQ4DyU5EyY6Aic7Aig8Aik9Aio-AitAAixCDC1DFC5FAi9HDDBIFTFJAjJKAjNLDDROFjVPGjZQAzdRAzhSAzlTAzpUAztWAzxYDD1ZGz5bAz9dDEBeHEFfA0JgA0NhDERkHUVlIUZnIkdoIkhrIklsIkptIktvIkxxDE1yI050Ik92DFB3JFF4IlJ5IlN6DFR9JVV-KVZ_BFeAAQRYgQEEWYIBBFqDAQRbhQEEXIcBDF2IASpeiwEEX40BDGCOASthkAEEYpEBBGOSAQxmlQEsZ5YBMmiXAQlpmAEJapkBCWuaAQlsmwEJbZ0BCW6fAQxvoAEzcKIBCXGkAQxypQE0c6YBCXSnAQl1qAEMdqsBNXesATt4rgEHea8BB3qxAQd7sgEHfLMBB321AQd-twEMf7gBPIABugEHgQG8AQyCAb0BPYMBvgEHhAG_AQeFAcABDIYBwwE-hwHEAUKIAcUBBYkBxgEFigHHAQWLAcgBBYwByQEFjQHLAQWOAc0BDI8BzgFDkAHQAQWRAdIBDJIB0wFEkwHUAQWUAdUBBZUB1gEMlgHZAUWXAdoBS5gB3AEGmQHdAQaaAd8BBpsB4AEGnAHhAQadAeMBBp4B5QEMnwHmAUygAegBBqEB6gEMogHrAU2jAewBBqQB7QEGpQHuAQymAfEBTqcB8gFU"
};
async function decodeBase64AsWasm(wasmBase64) {
  const { Buffer: Buffer2 } = await import("buffer");
  const wasmArray = Buffer2.from(wasmBase64, "base64");
  return new WebAssembly.Module(wasmArray);
}
config.compilerWasm = {
  getRuntime: async () => await import("@prisma/client/runtime/query_compiler_fast_bg.postgresql.mjs"),
  getQueryCompilerWasmModule: async () => {
    const { wasm } = await import("@prisma/client/runtime/query_compiler_fast_bg.postgresql.wasm-base64.mjs");
    return await decodeBase64AsWasm(wasm);
  },
  importName: "./query_compiler_fast_bg.js"
};
function getPrismaClientClass() {
  return runtime.getPrismaClient(config);
}

// generated/prisma/internal/prismaNamespace.ts
var prismaNamespace_exports = {};
__export(prismaNamespace_exports, {
  AccountScalarFieldEnum: () => AccountScalarFieldEnum,
  AnyNull: () => AnyNull2,
  BookingsScalarFieldEnum: () => BookingsScalarFieldEnum,
  CategoriesScalarFieldEnum: () => CategoriesScalarFieldEnum,
  DbNull: () => DbNull2,
  Decimal: () => Decimal2,
  JsonNull: () => JsonNull2,
  ModelName: () => ModelName,
  NullTypes: () => NullTypes2,
  NullsOrder: () => NullsOrder,
  PrismaClientInitializationError: () => PrismaClientInitializationError2,
  PrismaClientKnownRequestError: () => PrismaClientKnownRequestError2,
  PrismaClientRustPanicError: () => PrismaClientRustPanicError2,
  PrismaClientUnknownRequestError: () => PrismaClientUnknownRequestError2,
  PrismaClientValidationError: () => PrismaClientValidationError2,
  QueryMode: () => QueryMode,
  ReviewsScalarFieldEnum: () => ReviewsScalarFieldEnum,
  SessionScalarFieldEnum: () => SessionScalarFieldEnum,
  SortOrder: () => SortOrder,
  Sql: () => Sql2,
  TransactionIsolationLevel: () => TransactionIsolationLevel,
  TutorAvailabilityScalarFieldEnum: () => TutorAvailabilityScalarFieldEnum,
  TutorProfilesScalarFieldEnum: () => TutorProfilesScalarFieldEnum,
  UserScalarFieldEnum: () => UserScalarFieldEnum,
  VerificationScalarFieldEnum: () => VerificationScalarFieldEnum,
  defineExtension: () => defineExtension,
  empty: () => empty2,
  getExtensionContext: () => getExtensionContext,
  join: () => join2,
  prismaVersion: () => prismaVersion,
  raw: () => raw2,
  sql: () => sql
});
import * as runtime2 from "@prisma/client/runtime/client";
var PrismaClientKnownRequestError2 = runtime2.PrismaClientKnownRequestError;
var PrismaClientUnknownRequestError2 = runtime2.PrismaClientUnknownRequestError;
var PrismaClientRustPanicError2 = runtime2.PrismaClientRustPanicError;
var PrismaClientInitializationError2 = runtime2.PrismaClientInitializationError;
var PrismaClientValidationError2 = runtime2.PrismaClientValidationError;
var sql = runtime2.sqltag;
var empty2 = runtime2.empty;
var join2 = runtime2.join;
var raw2 = runtime2.raw;
var Sql2 = runtime2.Sql;
var Decimal2 = runtime2.Decimal;
var getExtensionContext = runtime2.Extensions.getExtensionContext;
var prismaVersion = {
  client: "7.4.1",
  engine: "55ae170b1ced7fc6ed07a15f110549408c501bb3"
};
var NullTypes2 = {
  DbNull: runtime2.NullTypes.DbNull,
  JsonNull: runtime2.NullTypes.JsonNull,
  AnyNull: runtime2.NullTypes.AnyNull
};
var DbNull2 = runtime2.DbNull;
var JsonNull2 = runtime2.JsonNull;
var AnyNull2 = runtime2.AnyNull;
var ModelName = {
  User: "User",
  Session: "Session",
  Account: "Account",
  Verification: "Verification",
  TutorProfiles: "TutorProfiles",
  TutorAvailability: "TutorAvailability",
  Categories: "Categories",
  Bookings: "Bookings",
  Reviews: "Reviews"
};
var TransactionIsolationLevel = runtime2.makeStrictEnum({
  ReadUncommitted: "ReadUncommitted",
  ReadCommitted: "ReadCommitted",
  RepeatableRead: "RepeatableRead",
  Serializable: "Serializable"
});
var UserScalarFieldEnum = {
  id: "id",
  name: "name",
  email: "email",
  emailVerified: "emailVerified",
  image: "image",
  createdAt: "createdAt",
  updatedAt: "updatedAt",
  role: "role",
  phone: "phone",
  status: "status"
};
var SessionScalarFieldEnum = {
  id: "id",
  expiresAt: "expiresAt",
  token: "token",
  createdAt: "createdAt",
  updatedAt: "updatedAt",
  ipAddress: "ipAddress",
  userAgent: "userAgent",
  userId: "userId"
};
var AccountScalarFieldEnum = {
  id: "id",
  accountId: "accountId",
  providerId: "providerId",
  userId: "userId",
  accessToken: "accessToken",
  refreshToken: "refreshToken",
  idToken: "idToken",
  accessTokenExpiresAt: "accessTokenExpiresAt",
  refreshTokenExpiresAt: "refreshTokenExpiresAt",
  scope: "scope",
  password: "password",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
var VerificationScalarFieldEnum = {
  id: "id",
  identifier: "identifier",
  value: "value",
  expiresAt: "expiresAt",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
var TutorProfilesScalarFieldEnum = {
  id: "id",
  userId: "userId",
  categoriesId: "categoriesId",
  bio: "bio",
  hourlyRate: "hourlyRate",
  experienceYears: "experienceYears",
  totalRating: "totalRating",
  totalReviews: "totalReviews",
  totalCompletedBookings: "totalCompletedBookings",
  defaultClassLink: "defaultClassLink",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
var TutorAvailabilityScalarFieldEnum = {
  id: "id",
  tutorId: "tutorId",
  dayOfWeek: "dayOfWeek",
  startTime: "startTime",
  endTime: "endTime",
  isActive: "isActive"
};
var CategoriesScalarFieldEnum = {
  id: "id",
  name: "name",
  isActive: "isActive"
};
var BookingsScalarFieldEnum = {
  id: "id",
  studentId: "studentId",
  tutorId: "tutorId",
  sessionDate: "sessionDate",
  startTime: "startTime",
  endTime: "endTime",
  price: "price",
  status: "status",
  classLink: "classLink",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
var ReviewsScalarFieldEnum = {
  id: "id",
  bookingId: "bookingId",
  rating: "rating",
  comment: "comment",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
var SortOrder = {
  asc: "asc",
  desc: "desc"
};
var QueryMode = {
  default: "default",
  insensitive: "insensitive"
};
var NullsOrder = {
  first: "first",
  last: "last"
};
var defineExtension = runtime2.Extensions.defineExtension;

// generated/prisma/client.ts
globalThis["__dirname"] = path.dirname(fileURLToPath(import.meta.url));
var PrismaClient = getPrismaClientClass();

// src/lib/prisma.ts
var connectionString = `${process.env.DATABASE_URL}`;
var adapter = new PrismaPg({ connectionString });
var prisma = new PrismaClient({ adapter });

// src/modules/TutorProfiles/tutorProfile.service.ts
var createProfile = async (tutorData) => {
  return await prisma.tutorProfiles.create({
    data: tutorData
  });
};
var getAllProfiles = async (search, category, maxPrice, minPrice, page, limit, skip, sortBy, sortOrder, rating, availability) => {
  const andConsditions = [];
  if (search) {
    search = search.trim();
    const numberSearch = Number(search);
    if (Number.isNaN(numberSearch)) {
      andConsditions.push({
        OR: [
          {
            bio: {
              contains: search,
              mode: "insensitive"
            }
          },
          {
            category: {
              name: {
                contains: search,
                mode: "insensitive"
              }
            }
          },
          {
            user: {
              name: {
                contains: search,
                mode: "insensitive"
              }
            }
          }
        ]
      });
    } else {
      andConsditions.push({
        OR: [
          {
            hourlyRate: {
              gte: numberSearch
            }
          },
          {
            totalRating: {
              gte: numberSearch
            }
          }
        ]
      });
    }
  }
  if (category) {
    const categoryName = category.trim();
    andConsditions.push({
      category: {
        name: {
          contains: categoryName,
          mode: "insensitive"
        }
      }
    });
  }
  if (minPrice || maxPrice) {
    andConsditions.push({
      hourlyRate: {
        ...minPrice && { gte: Number(minPrice) },
        ...maxPrice && { lte: Number(maxPrice) }
      }
    });
  }
  if (availability) {
    andConsditions.push({
      availability: {
        some: {
          dayOfWeek: availability
        }
      }
    });
  }
  const isPaginated = limit !== void 0;
  const result = await prisma.tutorProfiles.findMany({
    ...isPaginated && { skip, take: limit },
    where: {
      AND: [...andConsditions],
      user: {
        status: "UNBAN"
      }
    },
    orderBy: {
      [sortBy]: sortOrder
    },
    include: {
      user: true,
      category: true,
      availability: true,
      bookings: {
        where: { status: BookingStatus.COMPLETED },
        include: {
          reviews: {
            select: {
              rating: true,
              comment: true
            }
          }
        }
      }
    }
  });
  let filteredResult = result;
  if (rating) {
    filteredResult = result.filter((tutor) => {
      if (tutor.totalReviews === 0) return false;
      const averageRating = tutor.totalRating / tutor.totalReviews;
      return averageRating >= rating;
    });
  }
  let totalData = await prisma.tutorProfiles.count({
    where: {
      AND: [...andConsditions],
      user: {
        status: "UNBAN"
      }
    }
  });
  totalData = rating ? filteredResult.length : totalData;
  const totalPages = Math.ceil(totalData / limit);
  return {
    data: filteredResult,
    pagination: { totalData, page, limit, totalPages }
  };
};
var getProfileById = async (id) => {
  return await prisma.tutorProfiles.findUnique({
    where: { id },
    include: {
      user: true,
      category: true,
      availability: true,
      bookings: {
        where: { status: BookingStatus.COMPLETED },
        include: {
          reviews: {
            select: {
              rating: true,
              comment: true
            }
          }
        }
      }
    }
  });
};
var getMyProfile = async (userId) => {
  return await prisma.tutorProfiles.findUnique({
    where: { userId },
    include: {
      user: true,
      category: true,
      availability: true,
      bookings: {
        where: { status: BookingStatus.COMPLETED },
        include: {
          reviews: {
            select: {
              rating: true,
              comment: true
            }
          }
        }
      }
    }
  });
};
var updateProfile = async (userId, tutorData) => {
  return await prisma.tutorProfiles.update({
    where: { userId },
    data: tutorData,
    include: {
      user: true,
      category: true,
      availability: true,
      bookings: {
        where: { status: BookingStatus.COMPLETED },
        include: {
          reviews: {
            select: {
              rating: true,
              comment: true
            }
          }
        }
      }
    }
  });
};
var deleteProfile = async (id) => {
  return await prisma.tutorProfiles.delete({
    where: { id }
  });
};
var setAvailability = async (userId, availability) => {
  const { dayOfWeek, startTime, endTime } = availability;
  const StartMin = timeToMinutes(startTime);
  const EndMin = timeToMinutes(endTime);
  if (EndMin <= StartMin) {
    throw new Error("Invalid time range");
  }
  const tutorProfile = await prisma.tutorProfiles.findUnique({
    where: { userId },
    select: { id: true }
  });
  if (!tutorProfile) {
    throw new Error("Tutor profile not found");
  }
  const tutorId = tutorProfile.id;
  const exixtingSlots = await prisma.tutorAvailability.findMany({
    where: {
      tutorId,
      dayOfWeek
    }
  });
  if (isOverlapping({ startTime, endTime }, exixtingSlots)) {
    throw new Error("Overlapping availability slots");
  }
  return await prisma.tutorAvailability.create({
    data: {
      tutorId,
      ...availability
    }
  });
};
var getAvailability = async (tutorId) => {
  const availabilities = await prisma.tutorAvailability.findMany({
    where: { tutorId, isActive: true },
    orderBy: [{ dayOfWeek: "asc" }, { startTime: "desc" }]
  });
  return availabilities.filter((av) => {
    if (!av.startTime || !av.endTime) {
      console.error(
        `Warning: Availability record ${av.id} has invalid time values (startTime: ${av.startTime}, endTime: ${av.endTime})`
      );
      return false;
    }
    return true;
  });
};
var getAvailableSlots = async (tutorId, selectedDate, slotDuration) => {
  const date = new Date(selectedDate);
  const dayOfWeek = date.getDay();
  validateBookingDateTime(date);
  const availabilitySlots = await prisma.tutorAvailability.findMany({
    where: {
      tutorId,
      dayOfWeek,
      isActive: true
    }
  });
  if (!availabilitySlots.length) {
    throw new Error("Tutor not available on this day");
  }
  const tutorSlots = await prisma.tutorAvailability.findMany({
    where: {
      tutorId,
      dayOfWeek,
      isActive: true
    },
    orderBy: { startTime: "asc" }
  });
  const bookedSlots = await prisma.bookings.findMany({
    where: {
      tutorId,
      sessionDate: date
    },
    select: {
      startTime: true,
      endTime: true
    }
  });
  let availableSlots = [];
  const now = /* @__PURE__ */ new Date();
  const isToday = isSameDay2(date, now);
  const currentMinutes = getHours2(now) * 60 + getMinutes2(now);
  const currentSlotMinutes = Math.ceil(currentMinutes / 30) * 30;
  tutorSlots.forEach((slot) => {
    const freeRanges = subtractBookedFromFreeSlots(
      { startTime: slot.startTime, endTime: slot.endTime },
      bookedSlots
    );
    freeRanges.forEach((freeSlot) => {
      let freeStartMin = timeToMinutes(freeSlot.startTime);
      let freeEndMin = timeToMinutes(freeSlot.endTime);
      if (isToday) {
        if (freeEndMin <= currentSlotMinutes) {
          return;
        } else if (freeStartMin < currentSlotMinutes) {
          freeStartMin = currentSlotMinutes;
        }
      }
      let currentStart = freeStartMin;
      while (currentStart + slotDuration <= freeEndMin) {
        const endMin = currentStart + slotDuration;
        availableSlots.push({
          startTime: minutesToTime(currentStart),
          endTime: minutesToTime(endMin)
        });
        currentStart = currentStart + 30;
      }
    });
  });
  availableSlots.sort((a, b) => {
    const aStart = timeToMinutes(a.startTime);
    const bStart = timeToMinutes(b.startTime);
    return aStart - bStart;
  });
  const tutor = await prisma.tutorProfiles.findUnique({
    where: { id: tutorId },
    select: { hourlyRate: true }
  });
  if (!tutor) {
    throw new Error("Tutor not found");
  }
  const price = calculateTutionPrice(slotDuration, tutor.hourlyRate);
  return { dayOfWeek, availableSlots, price };
};
var updateAvailability = async (userId, id, availability) => {
  const { dayOfWeek, startTime, endTime, isActive } = availability;
  if (isActive === null) {
    const StartMin = timeToMinutes(startTime);
    const EndMin = timeToMinutes(endTime);
    if (EndMin <= StartMin) {
      throw new Error("Invalid time range");
    }
    const tutorProfile = await prisma.tutorProfiles.findUnique({
      where: { userId },
      select: { id: true }
    });
    if (!tutorProfile) {
      throw new Error("Tutor profile not found");
    }
    const tutorId = tutorProfile.id;
    const exixtingSlots = await prisma.tutorAvailability.findMany({
      where: {
        tutorId,
        dayOfWeek
      }
    });
    if (isOverlapping({ startTime, endTime }, exixtingSlots)) {
      throw new Error("Overlapping availability slots");
    }
  }
  const data = await prisma.tutorAvailability.update({
    where: { id },
    data: availability
  });
  return data;
};
var deleteAvailability = async (id) => {
  return await prisma.tutorAvailability.delete({
    where: { id }
  });
};
var getBookingSessions = async (userId, status, page, limit, skip) => {
  const tutorProfile = await prisma.tutorProfiles.findUnique({
    where: { userId },
    select: { id: true }
  });
  if (!tutorProfile) {
    throw new Error("Tutor profile not found");
  }
  const andConditions = { tutorId: tutorProfile.id };
  if (status) {
    andConditions.status = status;
  }
  return await prisma.$transaction(async (tx) => {
    const today = addHours(startOfDay2(/* @__PURE__ */ new Date()), 6);
    const currentTime = format(/* @__PURE__ */ new Date(), "HH:mm");
    await tx.bookings.updateMany({
      where: {
        OR: [
          {
            sessionDate: {
              lt: today
            }
          },
          {
            sessionDate: {
              equals: today
            },
            endTime: {
              lt: currentTime
            }
          }
        ],
        status: BookingStatus.CONFIRMED
      },
      data: {
        status: BookingStatus.CANCELLED
      }
    });
    const isPaginated = limit !== void 0;
    const result = await prisma.bookings.findMany({
      ...isPaginated && { skip, take: limit },
      where: andConditions,
      orderBy: [{ sessionDate: "asc" }, { startTime: "asc" }],
      include: {
        tutor: {
          select: {
            category: {
              select: {
                name: true
              }
            }
          }
        },
        student: {
          select: {
            name: true,
            email: true,
            role: true,
            image: true
          }
        },
        reviews: {
          select: {
            rating: true,
            comment: true
          }
        }
      }
    });
    const totalData = await prisma.bookings.count({ where: andConditions });
    const totalPages = Math.ceil(totalData / limit);
    return {
      data: result,
      pagination: {
        totalData,
        page,
        limit,
        totalPages
      }
    };
  });
};
var setDefaultClassLink = async (userId, defaultClassLink) => {
  const tutorProfile = await prisma.tutorProfiles.findUnique({
    where: { userId },
    select: { id: true }
  });
  if (!tutorProfile) {
    throw new Error("Tutor profile not found");
  }
  return await prisma.tutorProfiles.update({
    where: { id: tutorProfile.id },
    data: { defaultClassLink }
  });
};
var getDefaultClassLink = async (userId) => {
  const tutorProfile = await prisma.tutorProfiles.findUnique({
    where: { userId },
    select: { defaultClassLink: true }
  });
  if (!tutorProfile) {
    throw new Error("Tutor profile not found");
  }
  return { defaultClassLink: tutorProfile.defaultClassLink };
};
var getTutorStats = async (userId) => {
  const today = addHours(startOfDay2(/* @__PURE__ */ new Date()), 6);
  const currentMonthStart = addHours(startOfMonth(/* @__PURE__ */ new Date()), 6);
  const currentWeekStart = addHours(startOfWeek(/* @__PURE__ */ new Date()), 6);
  return await prisma.$transaction(async (tx) => {
    const tutorProfile = await tx.tutorProfiles.findUnique({
      where: { userId },
      select: {
        id: true,
        totalRating: true,
        totalReviews: true,
        hourlyRate: true,
        experienceYears: true
      }
    });
    if (!tutorProfile) {
      throw new Error("Tutor profile not found");
    }
    const tutorId = tutorProfile.id;
    const bookingsPrice = await tx.bookings.findMany({
      where: {
        tutorId,
        status: "COMPLETED"
      },
      select: {
        price: true,
        sessionDate: true
      }
    });
    const earningsPerBooking = bookingsPrice.map((booking) => ({
      earnings: booking.price * 0.9,
      sessionDate: booking.sessionDate
    }));
    const [
      totalEarnings,
      monthlyEarnings,
      todayEarnings,
      totalUniqueStudents,
      activeAvailableDays,
      totalRatings,
      averageRating,
      totalReviews,
      completedSessions,
      todayCompletedSessions,
      weeklyCompletedSessions,
      canceledSessions,
      monthlyCanceledSessions,
      confirmedSessions
    ] = await Promise.all([
      // Total Earnings
      earningsPerBooking.reduce(
        (accumulator, currentbooking) => accumulator + currentbooking.earnings,
        0
      ),
      // Monthly Earnings
      earningsPerBooking.filter((booking) => booking.sessionDate > currentMonthStart).reduce(
        (accumulator, currentbooking) => accumulator + currentbooking.earnings,
        0
      ),
      // Today's Earnings
      earningsPerBooking.filter((booking) => booking.sessionDate == today).reduce(
        (accumulator, currentbooking) => accumulator + currentbooking.earnings,
        0
      ),
      // Total Unique Students
      tx.bookings.findMany({
        where: {
          tutorId,
          status: BookingStatus.COMPLETED
        },
        distinct: ["studentId"],
        select: { studentId: true }
      }),
      // Active Available Days
      tx.tutorAvailability.findMany({
        where: { tutorId, isActive: true },
        distinct: ["dayOfWeek"],
        select: { dayOfWeek: true }
      }),
      // Total Ratings
      tutorProfile.totalRating,
      // Average Rating
      tutorProfile.totalRating / (tutorProfile.totalReviews ? tutorProfile.totalReviews : 1),
      // Total Reviews
      tutorProfile.totalReviews,
      // Total Completed Sessions
      tx.bookings.count({
        where: { tutorId, status: BookingStatus.COMPLETED }
      }),
      // Today's Completed Sessions
      tx.bookings.count({
        where: {
          tutorId,
          status: BookingStatus.COMPLETED,
          sessionDate: {
            equals: today
          }
        }
      }),
      // Weekly Completed Sessions
      tx.bookings.count({
        where: {
          tutorId,
          status: BookingStatus.COMPLETED,
          sessionDate: { gte: currentWeekStart }
        }
      }),
      // Canceled Sessions
      tx.bookings.count({
        where: { tutorId, status: BookingStatus.CANCELLED }
      }),
      // Monthly Canceled Sessions
      tx.bookings.count({
        where: {
          tutorId,
          status: BookingStatus.CANCELLED,
          sessionDate: { gte: currentMonthStart }
        }
      }),
      // Confirmed Sessions
      tx.bookings.count({
        where: { tutorId, status: BookingStatus.CONFIRMED }
      })
    ]);
    return {
      earnings: {
        totalEarnings: totalEarnings ?? 0,
        earningsThisMonth: monthlyEarnings ?? 0,
        earningsToday: todayEarnings ?? 0,
        hourlyRate: tutorProfile.hourlyRate
      },
      profile: {
        uniqueStudents: totalUniqueStudents.length,
        experienceYears: tutorProfile.experienceYears,
        activeDays: activeAvailableDays.length,
        averageRating,
        totalRatings,
        reviewCount: totalReviews
      },
      sessions: {
        completed: completedSessions,
        completedToday: todayCompletedSessions,
        completedThisWeek: weeklyCompletedSessions,
        cancelled: canceledSessions,
        cancelledThisMonth: monthlyCanceledSessions,
        upcoming: confirmedSessions
      }
    };
  });
};
var getWeeklyEarnings = async (userId) => {
  const tutorProfile = await prisma.tutorProfiles.findUnique({
    where: { userId },
    select: { id: true }
  });
  if (!tutorProfile) {
    throw new Error("Tutor profile not found");
  }
  const currentWeekStart = addHours(startOfWeek(/* @__PURE__ */ new Date()), 6);
  const data = Array.from({ length: 7 }, async (_, i) => {
    const dayStart = addDays(currentWeekStart, i);
    const dayEnd = addDays(dayStart, 1);
    const dayName = format(dayStart, "EEE");
    const result = await prisma.bookings.aggregate({
      where: {
        tutorId: tutorProfile.id,
        status: BookingStatus.COMPLETED,
        sessionDate: {
          gte: dayStart,
          lt: dayEnd
        }
      },
      _sum: { price: true }
    });
    return {
      weekDay: dayName,
      earnings: result._sum.price ?? 0
    };
  });
  const weeklyEarnings = await Promise.all(data);
  return weeklyEarnings;
};
var sendClassLink = async (bookingId, classLink) => {
  const today = addHours(startOfDay2(/* @__PURE__ */ new Date()), 6);
  const currentTime = format(/* @__PURE__ */ new Date(), "HH:mm");
  const bookings = await prisma.bookings.findUnique({
    where: { id: bookingId },
    select: { sessionDate: true, startTime: true }
  });
  if (!bookings) {
    throw new Error("Booking not found");
  }
  if (bookings.sessionDate > today || isEqual(bookings.sessionDate, today) && bookings.startTime > currentTime) {
    throw new Error("Cannot send class link before the session time starts.");
  }
  return await prisma.bookings.update({
    where: { id: bookingId },
    data: { status: BookingStatus.RUNNING, classLink }
  });
};
var TutorProfileServices = {
  createProfile,
  getAllProfiles,
  getProfileById,
  getMyProfile,
  updateProfile,
  deleteProfile,
  setAvailability,
  getAvailability,
  getAvailableSlots,
  updateAvailability,
  deleteAvailability,
  getBookingSessions,
  setDefaultClassLink,
  getDefaultClassLink,
  getTutorStats,
  getWeeklyEarnings,
  sendClassLink
};

// src/helpers/Pagination.ts
var PaginationHelper = (options) => {
  if (options.limit) {
    const page = Number(options.page);
    const limit = Number(options.limit);
    const skip = (page - 1) * limit;
    return { page, limit, skip };
  } else {
    return { page: options.page, limit: options.limit, skip: 0 };
  }
};
var Pagination_default = PaginationHelper;

// src/helpers/Sorting.ts
var SortingHelper = (options) => {
  const sortBy = options.sortBy || "totalRating";
  const sortOrder = options.sortOrder || "desc";
  return { sortBy, sortOrder };
};
var Sorting_default = SortingHelper;

// src/modules/TutorProfiles/tutorProfile.controller.ts
var createProfile2 = async (req, res) => {
  try {
    const data = await TutorProfileServices.createProfile(req.body);
    res.status(201).json({
      success: true,
      message: "Profile created successfully",
      data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create profile"
    });
  }
};
var getAllProfiles2 = async (req, res) => {
  try {
    const search = req.query.search ? String(req.query.search) : void 0;
    const category = req.query.category ? String(req.query.category) : void 0;
    const maxPrice = req.query.maxPrice ? Number.parseFloat(req.query.maxPrice) : void 0;
    const minPrice = req.query.minPrice ? Number.parseFloat(req.query.minPrice) : void 0;
    const rating = req.query.rating ? Number.parseFloat(req.query.rating) : void 0;
    const availability = req.query.availability ? Number.parseFloat(req.query.availability) : void 0;
    const { page, limit, skip } = Pagination_default(
      req.query
    );
    const { sortBy, sortOrder } = Sorting_default(req.query);
    const data = await TutorProfileServices.getAllProfiles(
      search,
      category,
      maxPrice,
      minPrice,
      page,
      limit,
      skip,
      sortBy,
      sortOrder,
      rating,
      availability
    );
    res.status(200).json({
      success: true,
      message: "Profiles retrieved successfully",
      data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to get profiles"
    });
  }
};
var getProfileById2 = async (req, res) => {
  try {
    const id = req.params.id;
    const data = await TutorProfileServices.getProfileById(id);
    res.status(200).json({
      success: true,
      message: "Profile details retrieved successfully",
      data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to get profile"
    });
  }
};
var getMyProfile2 = async (req, res) => {
  try {
    const userId = req.user?.id;
    const data = await TutorProfileServices.getMyProfile(userId);
    res.status(200).json({
      success: true,
      message: "Profile details retrieved successfully",
      data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to get profile"
    });
  }
};
var updateProfile2 = async (req, res) => {
  try {
    const userId = req.user?.id;
    const data = await TutorProfileServices.updateProfile(userId, req.body);
    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update profile"
    });
  }
};
var deleteProfile2 = async (req, res) => {
  try {
    const id = req.params.id;
    const data = await TutorProfileServices.deleteProfile(id);
    res.status(200).json({
      success: true,
      message: "Profile deleted successfully",
      data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to delete profile"
    });
  }
};
var setAvailability2 = async (req, res) => {
  try {
    const userId = req.user?.id;
    const availability = req.body;
    const data = await TutorProfileServices.setAvailability(
      userId,
      availability
    );
    res.status(201).json({
      success: true,
      message: "Availability set successfully",
      data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to set availability"
    });
  }
};
var getAvailability2 = async (req, res) => {
  try {
    const tutorId = req.params.id;
    const tutorProfile = await TutorProfileServices.getProfileById(tutorId);
    if (req.user?.role === "TUTOR" && req.user?.id !== tutorProfile?.user.id) {
      return res.status(403).json({
        success: false,
        message: "You dont have permission to view other tutor's availability"
      });
    }
    const data = await TutorProfileServices.getAvailability(tutorId);
    res.status(200).json({
      success: true,
      message: "Availability retrieved successfully",
      data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to get availability"
    });
  }
};
var getAvailableSlots2 = async (req, res) => {
  try {
    const tutorId = req.params.id;
    const { selectedDate, slotDuration } = req.query;
    const data = await TutorProfileServices.getAvailableSlots(
      tutorId,
      selectedDate,
      Number(slotDuration)
    );
    res.status(200).json({
      success: true,
      message: "Available slots retrieved successfully",
      data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to get available slots"
    });
  }
};
var updateAvailability2 = async (req, res) => {
  try {
    const userId = req.user?.id;
    const id = req.params.id;
    const availability = req.body;
    const data = await TutorProfileServices.updateAvailability(
      userId,
      id,
      availability
    );
    res.status(200).json({
      success: true,
      message: "Availability updated successfully",
      data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
var deleteAvailability2 = async (req, res) => {
  try {
    const id = req.params.id;
    const data = await TutorProfileServices.deleteAvailability(id);
    res.status(200).json({
      success: true,
      message: "Availability deleted successfully",
      data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to delete availability"
    });
  }
};
var getBookingSessions2 = async (req, res) => {
  try {
    const userId = req.user?.id;
    const status = req.query.status ? req.query.status : void 0;
    const { page, limit, skip } = Pagination_default(
      req.query
    );
    const data = await TutorProfileServices.getBookingSessions(
      userId,
      status,
      page,
      limit,
      skip
    );
    res.status(200).json({
      success: true,
      message: "Sessions retrieved successfully",
      data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to get sessions"
    });
  }
};
var setDefaultClassLink2 = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { defaultClassLink } = req.body;
    const data = await TutorProfileServices.setDefaultClassLink(
      userId,
      defaultClassLink
    );
    res.status(200).json({
      success: true,
      message: "Default class link set successfully",
      data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to set default class link"
    });
  }
};
var getDefaultClassLink2 = async (req, res) => {
  try {
    const userId = req.user?.id;
    const data = await TutorProfileServices.getDefaultClassLink(userId);
    res.status(200).json({
      success: true,
      message: "Default class link retrieved successfully",
      data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to get default class link"
    });
  }
};
var getTutorStats2 = async (req, res) => {
  try {
    const userId = req.user?.id;
    const data = await TutorProfileServices.getTutorStats(userId);
    res.status(200).json({
      success: true,
      message: "Tutor stats retrieved successfully",
      data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to get tutor stats"
    });
  }
};
var getWeeklyEarnings2 = async (req, res) => {
  try {
    const userId = req.user?.id;
    const data = await TutorProfileServices.getWeeklyEarnings(userId);
    res.status(200).json({
      success: true,
      message: "Weekly earnings retrieved successfully",
      data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to get weekly earnings"
    });
  }
};
var sendClassLink2 = async (req, res) => {
  try {
    const bookingId = req.params.id;
    const { classLink } = req.body;
    const data = await TutorProfileServices.sendClassLink(
      bookingId,
      classLink
    );
    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Booking not found"
      });
    }
    return res.status(200).json({
      success: true,
      message: "Class link sent successfully",
      data
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to send class link"
    });
  }
};
var TutorProfileControllers = {
  createProfile: createProfile2,
  getAllProfiles: getAllProfiles2,
  getProfileById: getProfileById2,
  getMyProfile: getMyProfile2,
  updateProfile: updateProfile2,
  deleteProfile: deleteProfile2,
  setAvailability: setAvailability2,
  getAvailability: getAvailability2,
  getAvailableSlots: getAvailableSlots2,
  updateAvailability: updateAvailability2,
  deleteAvailability: deleteAvailability2,
  getBookingSessions: getBookingSessions2,
  setDefaultClassLink: setDefaultClassLink2,
  getDefaultClassLink: getDefaultClassLink2,
  getTutorStats: getTutorStats2,
  getWeeklyEarnings: getWeeklyEarnings2,
  sendClassLink: sendClassLink2
};

// src/lib/auth.ts
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import nodemailer from "nodemailer";
var transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.APP_USER,
    pass: process.env.APP_PASSWORD
  }
});
var auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql"
  }),
  baseURL: process.env.BETTER_AUTH_URL,
  trustedOrigins: [process.env.APP_URL, process.env.BETTER_AUTH_URL],
  advanced: {
    defaultCookieAttributes: {
      secure: true,
      httpOnly: true,
      sameSite: "none",
      partitioned: true
    }
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: true
      },
      phone: {
        type: "string",
        required: false
      },
      status: {
        type: "string",
        defaultValue: "UNBAN",
        required: false
      }
    },
    changeEmail: {
      enabled: true,
      updateEmailWithoutVerification: true
    }
  },
  emailAndPassword: {
    enabled: true,
    autoSignIn: false,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url, token }, request) => {
      await transporter.sendMail({
        from: "Skill Bridge <info@skillbridge.com>",
        to: user.email,
        subject: "Reset your password",
        html: `<!DOCTYPE html>
            <html lang="en">
            <head>
              <meta charset="UTF-8" />
              <title>Reset Your Password</title>
              <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            </head>
            <body style="margin:0; padding:0; background-color:#f4f6f8; font-family:Arial, Helvetica, sans-serif;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f6f8; padding:40px 0;">
                <tr>
                  <td align="center">
                    <table width="100%" max-width="600" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:8px; overflow:hidden;">

                      <!-- Header -->
                      <tr>
                        <td style="background:#ec5b13; padding:20px; text-align:center;">
                          <h1 style="color:#ffffff; margin:0; font-size:24px;">
                            Skill Bridge
                          </h1>
                        </td>
                      </tr>

                      <!-- Body -->
                      <tr>
                        <td style="padding:30px; color:#333333;">
                          <h2 style="margin-top:0;">Reset your password</h2>

                          <p style="font-size:16px; line-height:1.6;">
                            Hi <strong>${user.name || "there"}</strong>,
                          </p>

                          <p style="font-size:16px; line-height:1.6;">
                            We received a request to reset your password for your Skill Bridge account.
                            Click the button below to create a new password.
                          </p>

                          <!-- Button -->
                          <div style="text-align:center; margin:30px 0;">
                            <a
                              href="${url}"
                              style="
                                background:#ec5b13;
                                color:#ffffff;
                                text-decoration:none;
                                padding:14px 28px;
                                border-radius:6px;
                                font-size:16px;
                                display:inline-block;
                              "
                            >
                              Reset Password
                            </a>
                          </div>

                          <p style="font-size:14px; color:#666666; line-height:1.6;">
                            If the button doesn't work, copy and paste this link into your browser:
                          </p>

                          <p style="font-size:14px; word-break:break-all;">
                            <a href="${url}" style="color:#ec5b13;">
                              ${url}
                            </a>
                          </p>

                          <p style="font-size:14px; color:#666666; line-height:1.6; margin-top:20px;">
                            This link will expire in 1 hour for security reasons.
                          </p>

                          <p style="font-size:14px; color:#666666; line-height:1.6;">
                            If you did not request a password reset, you can safely ignore this email.
                            Your password will remain unchanged.
                          </p>

                          <p style="margin-top:30px; font-size:14px;">
                            \u2014 Skill Bridge Team
                          </p>
                        </td>
                      </tr>

                      <!-- Footer -->
                      <tr>
                        <td style="background:#f1f5f9; padding:15px; text-align:center; font-size:12px; color:#777777;">
                          \xA9 ${(/* @__PURE__ */ new Date()).getFullYear()} Skill Bridge. All rights reserved.
                        </td>
                      </tr>

                    </table>
                  </td>
                </tr>
              </table>
            </body>
            </html>
            `
      });
    }
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: false,
    sendVerificationEmail: async ({ user, url }) => {
      try {
        const verificationURL = url;
        const info = await transporter.sendMail({
          from: "Skill Bridge <info@skillbridge.com>",
          to: user.email,
          subject: "Verify your email for Skill Bridge",
          html: `<!DOCTYPE html>
              <html lang="en">
              <head>
                <meta charset="UTF-8" />
                <title>Email Verification</title>
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
              </head>
              <body style="margin:0; padding:0; background-color:#f4f6f8; font-family:Arial, Helvetica, sans-serif;">
                <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f6f8; padding:40px 0;">
                  <tr>
                    <td align="center">
                      <table width="100%" max-width="600" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:8px; overflow:hidden;">
                        
                        <!-- Header -->
                        <tr>
                          <td style="background:#ec5b13; padding:20px; text-align:center;">
                            <h1 style="color:#ffffff; margin:0; font-size:24px;">
                              Skill Bridge
                            </h1>
                          </td>
                        </tr>
                    
                        <!-- Body -->
                        <tr>
                          <td style="padding:30px; color:#333333;">
                            <h2 style="margin-top:0;">Verify your email address</h2>
                    
                            <p style="font-size:16px; line-height:1.6;">
                              Hi <strong>${user.name || "there"}</strong>,
                            </p>
                    
                            <p style="font-size:16px; line-height:1.6;">
                              Thank you for signing up for Skill Bridge.  
                              Please confirm your email address by clicking the button below.
                            </p>
                    
                            <!-- Button -->
                            <div style="text-align:center; margin:30px 0;">
                              <a
                                href="${verificationURL}"
                                style="
                                  background:#ec5b13;
                                  color:#ffffff;
                                  text-decoration:none;
                                  padding:14px 28px;
                                  border-radius:6px;
                                  font-size:16px;
                                  display:inline-block;
                                "
                              >
                                Verify Email
                              </a>
                            </div>
                    
                            <p style="font-size:14px; color:#666666; line-height:1.6;">
                              If the button doesn't work, copy and paste this link into your browser:
                            </p>
                    
                            <p style="font-size:14px; word-break:break-all;">
                              <a href="${verificationURL}" style="color:#ec5b13;">
                                ${verificationURL}
                              </a>
                            </p>
                    
                            <p style="font-size:14px; color:#666666; line-height:1.6;">
                              If you did not create an account, you can safely ignore this email.
                            </p>
                    
                            <p style="margin-top:30px; font-size:14px;">
                              \u2014 Skill Bridge Team
                            </p>
                          </td>
                        </tr>
                    
                        <!-- Footer -->
                        <tr>
                          <td style="background:#f1f5f9; padding:15px; text-align:center; font-size:12px; color:#777777;">
                            \xA9 ${(/* @__PURE__ */ new Date()).getFullYear()} Skill Bridge. All rights reserved.
                          </td>
                        </tr>
                    
                      </table>
                    </td>
                  </tr>
                </table>
              </body>
              </html>
              `
        });
        console.log("Verification email sent: ", info.messageId);
      } catch (error) {
        console.error("Error sending verification email: ", error);
      }
    }
  },
  socialProviders: {
    google: {
      prompt: "select_account consent",
      accessType: "offline",
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET
    }
  }
});

// src/middleware/auth.ts
var auth_middleware = (role) => {
  return async (req, res, next) => {
    try {
      const session = await auth.api.getSession({
        headers: req.headers
      });
      if (!session || !session.user) {
        res.status(401).json({
          success: false,
          message: "Unauthorized"
        });
        return;
      }
      if (!session.user.emailVerified) {
        res.status(403).json({
          success: false,
          message: "You need to verify your email to access this resource"
        });
        return;
      }
      if (role.length && !role.includes(session.user.role)) {
        res.status(403).json({
          success: false,
          message: "You don't have permission to access this resource"
        });
        return;
      }
      req.user = {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        role: session.user.role,
        emailVerified: session.user.emailVerified
      };
      next();
    } catch (error) {
      next(error);
    }
  };
};

// src/modules/TutorProfiles/tutorProfile.router.ts
var router = Router();
router.post(
  "/",
  auth_middleware([UserRole.TUTOR]),
  TutorProfileControllers.createProfile
);
router.get("/", TutorProfileControllers.getAllProfiles);
router.get(
  "/profile",
  auth_middleware([UserRole.TUTOR]),
  TutorProfileControllers.getMyProfile
);
router.get(
  "/bookings",
  auth_middleware([UserRole.TUTOR]),
  TutorProfileControllers.getBookingSessions
);
router.get(
  "/defaultClassLink",
  auth_middleware([UserRole.TUTOR]),
  TutorProfileControllers.getDefaultClassLink
);
router.get(
  "/stats",
  auth_middleware([UserRole.TUTOR]),
  TutorProfileControllers.getTutorStats
);
router.get(
  "/weeklyEarnings",
  auth_middleware([UserRole.TUTOR]),
  TutorProfileControllers.getWeeklyEarnings
);
router.get("/:id", TutorProfileControllers.getProfileById);
router.patch(
  "/",
  auth_middleware([UserRole.TUTOR]),
  TutorProfileControllers.updateProfile
);
router.delete(
  "/:id",
  auth_middleware([UserRole.TUTOR]),
  TutorProfileControllers.deleteProfile
);
router.post(
  "/availability",
  auth_middleware([UserRole.TUTOR]),
  TutorProfileControllers.setAvailability
);
router.get(
  "/:id/availability",
  TutorProfileControllers.getAvailability
);
router.get(
  "/:id/availableSlots",
  TutorProfileControllers.getAvailableSlots
);
router.patch(
  "/:id/classLink",
  auth_middleware([UserRole.TUTOR]),
  TutorProfileControllers.sendClassLink
);
router.patch(
  "/availability/:id",
  auth_middleware([UserRole.TUTOR]),
  TutorProfileControllers.updateAvailability
);
router.delete(
  "/availability/:id",
  auth_middleware([UserRole.TUTOR]),
  TutorProfileControllers.deleteAvailability
);
router.patch(
  "/defaultClassLink",
  auth_middleware([UserRole.TUTOR]),
  TutorProfileControllers.setDefaultClassLink
);
var TutorProfileRouters = router;

// src/modules/Categories/category.router.ts
import express from "express";

// src/modules/Categories/category.service.ts
var createCategory = async (categoryData) => {
  return await prisma.categories.create({
    data: categoryData
  });
};
var getAllCategories = async () => {
  return await prisma.categories.findMany({
    orderBy: { name: "asc" },
    where: { isActive: true }
  });
};
var updateCategory = async (id, categoryData) => {
  return await prisma.categories.update({
    where: { id },
    data: categoryData
  });
};
var deleteCategory = async (id) => {
  return await prisma.categories.delete({
    where: { id }
  });
};
var CategoryServices = {
  createCategory,
  getAllCategories,
  updateCategory,
  deleteCategory
};

// src/modules/Categories/category.controller.ts
var createCategory2 = async (req, res) => {
  try {
    const data = await CategoryServices.createCategory(req.body);
    res.status(201).json({
      success: true,
      message: "Category created successfully",
      data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create category"
    });
  }
};
var getAllCategories2 = async (req, res) => {
  try {
    const data = await CategoryServices.getAllCategories();
    res.status(200).json({
      success: true,
      message: "Categories retrieved successfully",
      data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to get categories"
    });
  }
};
var updateCategory2 = async (req, res) => {
  try {
    const id = req.params.id;
    const data = await CategoryServices.updateCategory(id, req.body);
    res.status(200).json({
      success: true,
      message: "Category updated successfully",
      data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update category"
    });
  }
};
var deleteCategory2 = async (req, res) => {
  try {
    const id = req.params.id;
    const data = await CategoryServices.deleteCategory(id);
    res.status(200).json({
      success: true,
      message: "Category deleted successfully",
      data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to delete category"
    });
  }
};
var CategoryControllers = {
  createCategory: createCategory2,
  getAllCategories: getAllCategories2,
  updateCategory: updateCategory2,
  deleteCategory: deleteCategory2
};

// src/modules/Categories/category.router.ts
var router2 = express.Router();
router2.post("/", CategoryControllers.createCategory);
router2.get("/", CategoryControllers.getAllCategories);
router2.patch("/:id", CategoryControllers.updateCategory);
router2.delete("/:id", CategoryControllers.deleteCategory);
var CategoryRouters = router2;

// src/app.ts
import { toNodeHandler } from "better-auth/node";
import cors from "cors";

// src/modules/Admin/admin.router.ts
import express2 from "express";

// src/modules/Admin/admin.service.ts
import { addHours as addHours2, startOfMonth as startOfMonth2 } from "date-fns";
var getAllUsers = async (search, role, status) => {
  const andConditions = [];
  if (search) {
    andConditions.push({
      OR: [
        {
          name: {
            contains: search,
            mode: "insensitive"
          }
        },
        {
          email: {
            contains: search,
            mode: "insensitive"
          }
        }
      ]
    });
  }
  if (role) {
    andConditions.push({
      role: {
        equals: role
      }
    });
  }
  if (status) {
    andConditions.push({
      status: {
        equals: status
      }
    });
  }
  return await prisma.user.findMany({
    where: {
      AND: andConditions
    }
  });
};
var updateUser = async (userId, userStatus) => {
  return await prisma.user.update({
    where: { id: userId },
    data: { status: userStatus }
  });
};
var getStats = async () => {
  return await prisma.$transaction(async (tx) => {
    const bookingsPrice = await tx.bookings.findMany({
      where: { status: "COMPLETED" },
      select: {
        sessionDate: true,
        price: true
      }
    });
    const commissionsPerBooking = bookingsPrice.map((booking) => ({
      commission: booking.price * 0.1,
      sessionDate: booking.sessionDate
    }));
    const currentMonthStart = addHours2(startOfMonth2(/* @__PURE__ */ new Date()), 6);
    const [
      totalUsers,
      totalTutors,
      bannedTutors,
      totalStudents,
      totalBookings,
      totalBookingsCompleted,
      totalBookingsCancelled,
      totalReviews,
      totalRevenue,
      monthlyRevenue
    ] = await Promise.all([
      tx.user.count(),
      tx.user.count({ where: { role: UserRole.TUTOR } }),
      tx.user.count({
        where: { role: UserRole.TUTOR, status: UserStatus.BAN }
      }),
      tx.user.count({ where: { role: UserRole.STUDENT } }),
      tx.bookings.count(),
      tx.bookings.count({ where: { status: "COMPLETED" } }),
      tx.bookings.count({ where: { status: "CANCELLED" } }),
      tx.reviews.count(),
      commissionsPerBooking.reduce(
        (accumulator, currentbooking) => accumulator + currentbooking.commission,
        0
      ),
      commissionsPerBooking.filter((booking) => booking.sessionDate > currentMonthStart).reduce(
        (accumulator, currentbooking) => accumulator + currentbooking.commission,
        0
      )
    ]);
    return {
      totalUsers,
      totalTutors,
      bannedTutors,
      totalStudents,
      totalBookings,
      totalBookingsCompleted,
      totalBookingsCancelled,
      totalReviews,
      totalRevenue,
      monthlyRevenue
    };
  });
};
var AdminServices = {
  getAllUsers,
  updateUser,
  getStats
};

// src/modules/Admin/admin.controller.ts
var getAllUsers2 = async (req, res) => {
  try {
    const search = req.query.search ? String(req.query.search) : void 0;
    const role = req.query.role ? String(req.query.role) : void 0;
    const status = req.query.status ? String(req.query.status) : void 0;
    const data = await AdminServices.getAllUsers(search, role, status);
    res.status(200).json({
      success: true,
      message: "Users retrieved successfully",
      data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to get users"
    });
  }
};
var updateUser2 = async (req, res) => {
  try {
    const id = req.params.id;
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({
        success: false,
        message: "You can update only the status field"
      });
    }
    const data = await AdminServices.updateUser(id, status);
    res.status(200).json({
      success: true,
      message: "User updated successfully",
      data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update user"
    });
  }
};
var getStats2 = async (req, res) => {
  try {
    const data = await AdminServices.getStats();
    res.status(200).json({
      success: true,
      message: "Stats retrieved successfully",
      data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to get stats"
    });
  }
};
var AdminControllers = {
  getAllUsers: getAllUsers2,
  updateUser: updateUser2,
  getStats: getStats2
};

// src/modules/Admin/admin.router.ts
var router3 = express2.Router();
router3.get(
  "/users",
  auth_middleware([UserRole.ADMIN]),
  AdminControllers.getAllUsers
);
router3.patch(
  "/users/:id",
  auth_middleware([UserRole.ADMIN]),
  AdminControllers.updateUser
);
router3.get(
  "/stats",
  auth_middleware([UserRole.ADMIN]),
  AdminControllers.getStats
);
var AdminRouters = router3;

// src/modules/Bookigs/booking.router.ts
import express3 from "express";

// src/modules/Bookigs/booking.service.ts
import { addHours as addHours3, format as format2, startOfDay as startOfDay3 } from "date-fns";
var createBooking = async (studentId, bookingData) => {
  return await prisma.$transaction(async (tx) => {
    const { tutorId, sessionDate, startTime, endTime } = bookingData;
    const date = new Date(sessionDate);
    const dayOfWeek = date.getDay();
    const slotDuration = timeDuration(startTime, endTime);
    validateBookingDateTime(date, startTime);
    const availabilitySlots = await tx.tutorAvailability.findMany({
      where: {
        tutorId,
        dayOfWeek,
        isActive: true
      }
    });
    if (!availabilitySlots.length) {
      throw new Error("Tutor not available on this day");
    }
    if (!fitsInAvailabilitySlot({ startTime, endTime }, availabilitySlots)) {
      throw new Error("Selected time outside of tutor availability");
    }
    const existingTutorBookings = await tx.bookings.findMany({
      where: {
        tutorId,
        sessionDate: date
      },
      select: {
        startTime: true,
        endTime: true
      }
    });
    if (isOverlapping({ startTime, endTime }, existingTutorBookings)) {
      throw new Error("Slot already booked");
    }
    const existingMyBookings = await tx.bookings.findMany({
      where: {
        studentId,
        sessionDate: date
      },
      select: {
        startTime: true,
        endTime: true
      }
    });
    if (isOverlapping({ startTime, endTime }, existingMyBookings)) {
      throw new Error("Already you book this slot with another tutor.");
    }
    const tutor = await tx.tutorProfiles.findUnique({
      where: { id: tutorId },
      select: { hourlyRate: true }
    });
    if (!tutor) {
      throw new Error("Tutor not found");
    }
    const price = calculateTutionPrice(slotDuration, tutor.hourlyRate);
    return await tx.bookings.create({
      data: {
        studentId,
        tutorId,
        sessionDate: date,
        startTime,
        endTime,
        price
      }
    });
  });
};
var getAllBookings = async (status, page, limit, skip) => {
  return await prisma.$transaction(async (tx) => {
    const today = addHours3(startOfDay3(/* @__PURE__ */ new Date()), 6);
    const currentTime = format2(/* @__PURE__ */ new Date(), "HH:mm");
    await tx.bookings.updateMany({
      where: {
        OR: [
          {
            sessionDate: {
              lt: today
            }
          },
          {
            sessionDate: {
              equals: today
            },
            endTime: {
              lt: currentTime
            }
          }
        ],
        status: BookingStatus.CONFIRMED
      },
      data: {
        status: BookingStatus.CANCELLED
      }
    });
    const isPaginated = limit !== void 0;
    const result = await tx.bookings.findMany({
      ...isPaginated && { skip, take: limit },
      where: status ? { status } : {},
      orderBy: [{ sessionDate: "desc" }, { startTime: "desc" }],
      include: {
        tutor: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
                image: true
              }
            },
            category: {
              select: { id: true, name: true }
            }
          }
        },
        student: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            image: true
          }
        },
        reviews: {
          select: { id: true, rating: true, comment: true }
        }
      }
    });
    const totalData = await prisma.bookings.count({
      where: status ? { status } : {}
    });
    const totalPages = Math.ceil(totalData / limit);
    return {
      data: result,
      pagination: {
        totalData,
        page,
        limit,
        totalPages
      }
    };
  });
};
var getMyBookings = async (studentId, status, page, limit, skip) => {
  return await prisma.$transaction(async (tx) => {
    const today = addHours3(startOfDay3(/* @__PURE__ */ new Date()), 6);
    const currentTime = format2(/* @__PURE__ */ new Date(), "HH:mm");
    const andConditions = { studentId };
    if (status) {
      andConditions.status = status;
    }
    await tx.bookings.updateMany({
      where: {
        OR: [
          {
            sessionDate: {
              lt: today
            }
          },
          {
            sessionDate: {
              equals: today
            },
            endTime: {
              lt: currentTime
            }
          }
        ],
        status: BookingStatus.CONFIRMED
      },
      data: {
        status: BookingStatus.CANCELLED
      }
    });
    const isPaginated = limit !== void 0;
    const result = await tx.bookings.findMany({
      ...isPaginated && { skip, take: limit },
      where: andConditions,
      orderBy: [{ sessionDate: "desc" }, { startTime: "asc" }],
      include: {
        tutor: {
          include: {
            user: true,
            category: true
          }
        },
        reviews: true
      }
    });
    const totalData = await prisma.bookings.count({ where: andConditions });
    const totalPages = Math.ceil(totalData / limit);
    return {
      data: result,
      pagination: {
        totalData,
        page,
        limit,
        totalPages
      }
    };
  });
};
var getBookingDetails = async (bookingId) => {
  return await prisma.bookings.findUnique({
    where: {
      id: bookingId
    },
    include: {
      tutor: {
        include: {
          user: true,
          category: true
        }
      },
      reviews: true
    }
  });
};
var updateBookingStatus = async (userId, userRole, bookingId, status) => {
  return await prisma.$transaction(async (tx) => {
    if (userRole === UserRole.TUTOR) {
      await tx.tutorProfiles.update({
        where: {
          userId
        },
        data: {
          totalCompletedBookings: {
            increment: 1
          }
        }
      });
    }
    return await tx.bookings.update({
      where: { id: bookingId },
      data: { status }
    });
  });
};
var BookingServices = {
  createBooking,
  getAllBookings,
  getMyBookings,
  getBookingDetails,
  updateBookingStatus
};

// src/modules/Bookigs/booking.controller.ts
var createBooking2 = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }
    const studentId = req.user.id;
    const bookingData = req.body;
    const data = await BookingServices.createBooking(
      studentId,
      bookingData
    );
    return res.status(201).json({
      success: true,
      message: "Booking completed successfully",
      data
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Booking failed"
    });
  }
};
var getAllBookings2 = async (req, res) => {
  try {
    const status = req.query.status ? req.query.status : void 0;
    const { page, limit, skip } = Pagination_default(
      req.query
    );
    const data = await BookingServices.getAllBookings(
      status,
      page,
      limit,
      skip
    );
    return res.status(200).json({
      success: true,
      message: "Bookings retrieved successfully",
      data
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve bookings"
    });
  }
};
var getMyBookings2 = async (req, res) => {
  try {
    const studentId = req?.user?.id;
    const status = req.query.status ? req.query.status : void 0;
    const { page, limit, skip } = Pagination_default(
      req.query
    );
    const data = await BookingServices.getMyBookings(studentId, status, page, limit, skip);
    return res.status(200).json({
      success: true,
      message: "Bookings retrieved successfully",
      data
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve bookings"
    });
  }
};
var getBookingDetails2 = async (req, res) => {
  try {
    const bookingId = req.params.id;
    const data = await BookingServices.getBookingDetails(bookingId);
    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Booking not found"
      });
    }
    return res.status(200).json({
      success: true,
      message: "Booking details retrieved successfully",
      data
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve booking details"
    });
  }
};
var updateBookingStatus2 = async (req, res) => {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.role;
    const bookingId = req.params.id;
    const { status } = req.body;
    const data = await BookingServices.updateBookingStatus(
      userId,
      userRole,
      bookingId,
      status
    );
    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Booking not found"
      });
    }
    return res.status(200).json({
      success: true,
      message: "Booking status updated successfully",
      data
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update booking status"
    });
  }
};
var BookingControllers = {
  createBooking: createBooking2,
  getAllBookings: getAllBookings2,
  getMyBookings: getMyBookings2,
  getBookingDetails: getBookingDetails2,
  updateBookingStatus: updateBookingStatus2
};

// src/modules/Bookigs/booking.router.ts
var router4 = express3.Router();
router4.post(
  "/",
  auth_middleware([UserRole.STUDENT]),
  BookingControllers.createBooking
);
router4.get(
  "/",
  auth_middleware([UserRole.ADMIN]),
  BookingControllers.getAllBookings
);
router4.get(
  "/my-bookings",
  auth_middleware([UserRole.STUDENT]),
  BookingControllers.getMyBookings
);
router4.get(
  "/:id",
  auth_middleware([UserRole.ADMIN, UserRole.STUDENT]),
  BookingControllers.getBookingDetails
);
router4.patch(
  "/:id",
  auth_middleware([UserRole.TUTOR, UserRole.STUDENT]),
  BookingControllers.updateBookingStatus
);
var BookingRouters = router4;

// src/modules/Reviews/review.router.ts
import express4 from "express";

// src/modules/Reviews/review.service.ts
var createReview = async (reviewData) => {
  return await prisma.$transaction(async (tx) => {
    const booking = await tx.bookings.findUnique({
      where: { id: reviewData.bookingId },
      select: { tutorId: true }
    });
    if (!booking) {
      throw new Error("Booking not found");
    }
    await tx.tutorProfiles.update({
      where: { id: booking.tutorId },
      data: {
        totalReviews: {
          increment: 1
        },
        totalRating: {
          increment: reviewData.rating
        }
      }
    });
    return await tx.reviews.create({
      data: { ...reviewData }
    });
  });
};
var getAllReviews = async () => {
  const data = await prisma.reviews.findMany({
    orderBy: {
      rating: "desc"
    },
    include: {
      booking: {
        select: {
          tutor: {
            select: {
              user: {
                select: {
                  name: true,
                  image: true
                }
              },
              category: {
                select: {
                  name: true
                }
              }
            }
          },
          student: {
            select: {
              name: true,
              image: true
            }
          }
        }
      }
    }
  });
  return data.map((review) => ({
    id: review.id,
    bookingId: review.bookingId,
    rating: review.rating,
    comment: review.comment,
    tutorName: review.booking?.tutor?.user?.name,
    tutorImage: review.booking?.tutor?.user?.image,
    tutorCategory: review.booking?.tutor?.category?.name,
    studentName: review.booking?.student?.name,
    studentImage: review.booking?.student?.image
  }));
};
var getAllReviewsForTutor = async (tutorId) => {
  const data = await prisma.reviews.findMany({
    where: { booking: { tutorId } },
    orderBy: {
      rating: "desc"
    },
    include: {
      booking: {
        select: {
          tutor: {
            select: {
              user: {
                select: {
                  name: true,
                  image: true
                }
              },
              category: {
                select: {
                  name: true
                }
              }
            }
          },
          student: {
            select: {
              name: true,
              image: true
            }
          }
        }
      }
    }
  });
  return data.map((review) => ({
    id: review.id,
    bookingId: review.bookingId,
    rating: review.rating,
    comment: review.comment,
    tutorName: review.booking?.tutor?.user?.name,
    tutorImage: review.booking?.tutor?.user?.image,
    tutorCategory: review.booking?.tutor?.category?.name,
    studentName: review.booking?.student?.name,
    studentImage: review.booking?.student?.image
  }));
};
var ReviewServices = {
  createReview,
  getAllReviews,
  getAllReviewsForTutor
};

// src/modules/Reviews/review.controller.ts
var createReview2 = async (req, res) => {
  try {
    const { bookingId, rating, comment } = req.body;
    const data = await ReviewServices.createReview({
      bookingId,
      rating,
      comment
    });
    return res.status(201).json({
      success: true,
      message: "Review created successfully",
      data
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create review."
    });
  }
};
var getAllReviews2 = async (req, res) => {
  try {
    const data = await ReviewServices.getAllReviews();
    return res.status(200).json({
      success: true,
      message: "Reviews fetched successfully",
      data
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch reviews."
    });
  }
};
var getAllReviewsForTutor2 = async (req, res) => {
  try {
    const tutorId = req.params.id;
    const data = await ReviewServices.getAllReviewsForTutor(tutorId);
    return res.status(200).json({
      success: true,
      message: "Reviews fetched successfully",
      data
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch reviews."
    });
  }
};
var ReviewControllers = {
  createReview: createReview2,
  getAllReviews: getAllReviews2,
  getAllReviewsForTutor: getAllReviewsForTutor2
};

// src/modules/Reviews/review.router.ts
var router5 = express4.Router();
router5.post(
  "/",
  auth_middleware([UserRole.STUDENT]),
  ReviewControllers.createReview
);
router5.get("/", ReviewControllers.getAllReviews);
router5.get("/tutor/:id", ReviewControllers.getAllReviewsForTutor);
var ReviewRouters = router5;

// src/middleware/notFound.ts
var notFound = (req, res) => {
  res.status(404).json({
    message: "Route not found",
    path: req.originalUrl,
    date: /* @__PURE__ */ new Date()
  });
};

// src/middleware/globalErrorHandler.ts
function errorHandler(err, req, res, next) {
  let statusCode = 500;
  let errorMessage = "Internal server error!";
  if (err instanceof prismaNamespace_exports.PrismaClientValidationError) {
    statusCode = 400;
    errorMessage = "You provide incorrect field type or missing fields!";
  } else if (err instanceof prismaNamespace_exports.PrismaClientKnownRequestError) {
    if (err.code === "P2025") {
      statusCode = 404, errorMessage = "Records not found!";
    } else if (err.code === "P2003") {
      statusCode = 404, errorMessage = "Foreign key constraint failed!";
    }
  } else if (err instanceof prismaNamespace_exports.PrismaClientUnknownRequestError) {
    statusCode = 500;
    errorMessage = "Occured wrong query!";
  } else if (err instanceof prismaNamespace_exports.PrismaClientInitializationError) {
    if (err.errorCode === "P1000") {
      statusCode = 401;
      errorMessage = "Unauthorized access. Please check your provided credentials!";
    } else if (err.errorCode === "P1008") {
      statusCode = 500;
      errorMessage = "Operations timed out!";
    }
  }
  res.status(statusCode).json({
    message: errorMessage,
    error: err
  });
}
var globalErrorHandler_default = errorHandler;

// src/modules/Users/user.router.ts
import express5 from "express";

// src/modules/Users/user.service.ts
var getUserById = async (userId) => {
  return await prisma.user.findUnique({
    where: { id: userId }
  });
};
var updateMe = async (userId, data) => {
  return await prisma.user.update({
    where: { id: userId },
    data
  });
};
var UserServices = {
  getUserById,
  updateMe
};

// src/modules/Users/user.controller.ts
var getUserById2 = async (req, res) => {
  try {
    const userId = req.user?.id;
    const data = await UserServices.getUserById(userId);
    res.status(200).json({
      success: true,
      message: "User details retrieved successfully",
      data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to get user"
    });
  }
};
var updateMe2 = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { name, phone, image } = req.body;
    const data = await UserServices.updateMe(userId, { name, phone, image });
    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update profile"
    });
  }
};
var UserControllers = {
  getUserById: getUserById2,
  updateMe: updateMe2
};

// src/modules/Users/user.router.ts
var router6 = express5.Router();
router6.get(
  "/me",
  auth_middleware([UserRole.ADMIN, UserRole.TUTOR, UserRole.STUDENT]),
  UserControllers.getUserById
);
router6.patch(
  "/me",
  auth_middleware([UserRole.ADMIN, UserRole.TUTOR, UserRole.STUDENT]),
  UserControllers.updateMe
);
var UserRouters = router6;

// src/modules/Uploads/upload.router.ts
import express6 from "express";

// src/modules/Uploads/upload.service.ts
import { mkdir, writeFile } from "fs/promises";
import { join as join3 } from "path";
var uploadImage = async (file) => {
  const uploadDir = join3(process.cwd(), "public", "uploads");
  await mkdir(uploadDir, { recursive: true });
  const fileName = `image-${Date.now()}-${file.originalname}`;
  const filePath = join3(uploadDir, fileName);
  await writeFile(filePath, file.buffer);
  const baseUrl = process.env.BETTER_AUTH_URL;
  return `${baseUrl}/uploads/${fileName}`;
};
var UploadServices = {
  uploadImage
};

// src/modules/Uploads/upload.controller.ts
var uploadImage2 = async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded"
      });
    }
    const fileUrl = await UploadServices.uploadImage(file);
    return res.status(200).json({
      success: true,
      message: "File uploaded successfully",
      data: { url: fileUrl }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error uploading file"
    });
  }
};
var UploadControllers = {
  uploadImage: uploadImage2
};

// src/modules/Uploads/upload.router.ts
import multer from "multer";
var router7 = express6.Router();
var upload = multer({ storage: multer.memoryStorage() });
router7.post("/", upload.single("image"), UploadControllers.uploadImage);
var UploadRouters = router7;

// src/app.ts
import { join as join4 } from "path";

// src/modules/student/student.router.ts
import express7 from "express";

// src/modules/student/student.service.ts
import { addHours as addHours4, startOfMonth as startOfMonth3 } from "date-fns";
var getStudentStats = async (userId) => {
  const currentMonthStart = addHours4(startOfMonth3(/* @__PURE__ */ new Date()), 6);
  return await prisma.$transaction(async (tx) => {
    const [
      totalBookings,
      monthlyBookings,
      completedSessions,
      totalSpent,
      refundableAmount
    ] = await Promise.all([
      // Total Bookings
      tx.bookings.count({
        where: {
          studentId: userId
        }
      }),
      // This Month Bookings
      tx.bookings.count({
        where: {
          studentId: userId,
          createdAt: {
            gte: currentMonthStart
          }
        }
      }),
      // Completed Sessions
      tx.bookings.count({
        where: {
          studentId: userId,
          status: BookingStatus.COMPLETED
        }
      }),
      // Total Spent
      tx.bookings.aggregate({
        where: {
          studentId: userId
        },
        _sum: {
          price: true
        }
      }),
      // Refundable Amount
      tx.bookings.aggregate({
        where: {
          studentId: userId,
          status: BookingStatus.CANCELLED
        },
        _sum: {
          price: true
        }
      })
    ]);
    const completionRate = totalBookings > 0 ? completedSessions / totalBookings * 100 : 0;
    return {
      totalBookings,
      monthlyBookings,
      completedSessions,
      completionRate,
      totalSpent: totalSpent._sum.price || 0,
      refundableAmount: refundableAmount._sum.price || 0
    };
  });
};
var getRecentActivity = async (userId) => {
  return await prisma.$transaction(async (tx) => {
    const [recentSession, recentReview, recentBooking] = await Promise.all([
      // recent completed session
      tx.bookings.findFirst({
        where: {
          studentId: userId,
          status: BookingStatus.COMPLETED
        },
        orderBy: {
          updatedAt: "desc"
        },
        select: {
          updatedAt: true,
          tutor: {
            select: {
              user: {
                select: {
                  name: true
                }
              },
              category: {
                select: {
                  name: true
                }
              }
            }
          }
        }
      }),
      // recent review
      tx.reviews.findFirst({
        where: {
          booking: {
            studentId: userId
          }
        },
        orderBy: {
          createdAt: "desc"
        },
        select: {
          rating: true,
          createdAt: true,
          booking: {
            select: {
              tutor: {
                select: {
                  user: {
                    select: {
                      name: true
                    }
                  }
                }
              }
            }
          }
        }
      }),
      // recent booking
      tx.bookings.findFirst({
        where: {
          studentId: userId,
          status: BookingStatus.CONFIRMED
        },
        orderBy: {
          createdAt: "desc"
        },
        select: {
          sessionDate: true,
          createdAt: true,
          tutor: {
            select: {
              category: {
                select: {
                  name: true
                }
              }
            }
          }
        }
      })
    ]);
    return {
      recentSession: {
        tutorName: recentSession?.tutor.user.name,
        categoryName: recentSession?.tutor?.category?.name,
        timeAgo: timeAgo(recentSession?.updatedAt)
      },
      recentReview: {
        rating: recentReview?.rating,
        tutorName: recentReview?.booking.tutor.user.name,
        timeAgo: timeAgo(recentReview?.createdAt)
      },
      recentBooking: {
        sessionDate: recentBooking?.sessionDate,
        categoryName: recentBooking?.tutor?.category?.name,
        timeAgo: timeAgo(recentBooking?.createdAt)
      }
    };
  });
};
var StudentServices = {
  getStudentStats,
  getRecentActivity
};

// src/modules/student/student.controller.ts
var getStudentStats2 = async (req, res) => {
  try {
    const userId = req.user?.id;
    const data = await StudentServices.getStudentStats(userId);
    return res.status(200).json({
      success: true,
      message: "Stats retrieved successfully",
      data
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve stats"
    });
  }
};
var getRecentActivity2 = async (req, res) => {
  try {
    const userId = req.user?.id;
    const data = await StudentServices.getRecentActivity(userId);
    return res.status(200).json({
      success: true,
      message: "Recent activity retrieved successfully",
      data
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve recent activity"
    });
  }
};
var StudentControllers = {
  getStudentStats: getStudentStats2,
  getRecentActivity: getRecentActivity2
};

// src/modules/student/student.router.ts
var router8 = express7.Router();
router8.get(
  "/stats",
  auth_middleware([UserRole.STUDENT]),
  StudentControllers.getStudentStats
);
router8.get(
  "/recentActivity",
  auth_middleware([UserRole.STUDENT]),
  StudentControllers.getRecentActivity
);
var StudentRouter = router8;

// src/app.ts
var app = express8();
app.use(
  cors({
    origin: process.env.APP_URL,
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"]
  })
);
app.all("/api/auth/*splat", toNodeHandler(auth));
app.use(express8.static(join4(process.cwd(), "public")));
app.use(express8.json());
app.use("/api/admin", AdminRouters);
app.use("/api/users", UserRouters);
app.use("/api/tutors", TutorProfileRouters);
app.use("/api/students", StudentRouter);
app.use("/api/categories", CategoryRouters);
app.use("/api/bookings", BookingRouters);
app.use("/api/reviews", ReviewRouters);
app.use("/api/uploads", UploadRouters);
app.get("/", (req, res) => {
  res.send("Skill Bridge");
});
app.use(notFound);
app.use(globalErrorHandler_default);
var app_default = app;

// src/index.ts
var index_default = app_default;
export {
  index_default as default
};
