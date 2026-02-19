import express, { Application } from "express";
import { TutorProfileRouters } from "./modules/TutorProfiles/tutorProfile.router";
import { CategoryRouters } from "./modules/Categories/category.router";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth";
import cors from "cors";
import { UserRouters } from "./modules/Users/user.router";
import { BookingRouters } from "./modules/Bookigs/booking.router";

const app: Application = express();

app.use(
  cors({
    origin: process.env.APP_URL || "http://localhost:3000",
    credentials: true,
  }),
);

app.all("/api/auth/*splat", toNodeHandler(auth));

app.use(express.json());

app.use("/api/admin", UserRouters);
app.use("/api/tutors", TutorProfileRouters);
app.use("/api/categories", CategoryRouters);
app.use("/api/bookings", BookingRouters);

app.get("/", (req, res) => {
  res.send("Skill Bridge");
});

export default app;
