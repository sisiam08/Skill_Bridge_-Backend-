import { UserRole } from "../../generated/prisma/enums";
import { prisma } from "../lib/prisma";

async function seedAdmin() {
  try {
    console.log("Admin seeding....");
    const adminData = {
      name: process.env.ADMIN_NAME as string,
      email: process.env.ADMIN_EMAIL as string,
      password: process.env.ADMIN_PASSWORD as string,
      role: UserRole.ADMIN,
    };

    const existAdmin = await prisma.user.findUnique({
      where: {
        email: adminData.email,
      },
    });

    if (existAdmin) {
      throw new Error("Admin already exists");
    }

    const signUpAdmin = await fetch(
      `${process.env.BETTER_AUTH_URL}/api/auth/sign-up/email`,
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
          origin: process.env.APP_URL || "http://localhost:3000",
        },
        body: JSON.stringify(adminData),
      },
    );

    if (signUpAdmin.ok) {
      await prisma.user.update({
        where: {
          email: adminData.email,
        },
        data: {
          emailVerified: true,
        },
      });
    }

    console.log("Admin seeding successfull!");
  } catch (error) {
    console.error("Error seeding admin: ", error);
  }
}

seedAdmin();
