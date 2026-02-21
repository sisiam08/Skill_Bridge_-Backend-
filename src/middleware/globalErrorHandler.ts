import { NextFunction, Request, Response } from "express";
import { Prisma } from "../../generated/prisma/client";

function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  let statusCode = 500;
  let errorMessage = "Internal server error!";

  if (err instanceof Prisma.PrismaClientValidationError) {
    statusCode = 400;
    errorMessage = "You provide incorrect field type or missing fields!";
  } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2025") {
      ((statusCode = 404), (errorMessage = "Records not found!"));
    } else if (err.code === "P2003") {
      ((statusCode = 404), (errorMessage = "Foreign key constraint failed!"));
    }
  } else if (err instanceof Prisma.PrismaClientUnknownRequestError) {
    statusCode = 500;
    errorMessage = "Occured wrong query!";
  } else if (err instanceof Prisma.PrismaClientInitializationError) {
    if (err.errorCode === "P1000") {
      statusCode = 401;
      errorMessage =
        "Unauthorized access. Please check your provided credentials!";
    } else if (err.errorCode === "P1008") {
      statusCode = 500;
      errorMessage = "Operations timed out!";
    }
  }

  res.status(statusCode).json({
    message: errorMessage,
    error: err,
  });
}

export default errorHandler;
