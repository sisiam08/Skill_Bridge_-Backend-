import express, { Application } from "express";
import { TutorProfileRouters } from "./modules/TutorProfiles/tutorProfile.router";
import { CategoryRouters } from "./modules/Categories/category.router";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth";
import cors from "cors";
import { AdminRouters } from "./modules/Admin/admin.router";
import { BookingRouters } from "./modules/Bookigs/booking.router";
import { ReviewRouters } from "./modules/Reviews/review.router";
import { notFound } from "./middleware/notFound";
import errorHandler from "./middleware/globalErrorHandler";
import { UserRouters } from "./modules/Users/user.router";
import { UploadRouters } from "./modules/Uploads/upload.router";
import { join } from "path";
import { StudentRouter } from "./modules/student/student.router";

const app: Application = express();

app.use(
  cors({
    origin: [process.env.APP_URL || "http://localhost:3000"],
    credentials: true,
  }),
);

app.all("/api/auth/*splat", toNodeHandler(auth));

app.use(express.static(join(process.cwd(), "public")));

app.use(express.json());

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
app.use(errorHandler);

export default app;
