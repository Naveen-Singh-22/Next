import { NextResponse, type NextRequest } from "next/server";
import { ZodError } from "zod";

export interface ApiError {
  message: string;
  status: number;
  details?: Record<string, unknown>;
}

export class AuthenticationError extends Error {
  constructor(message: string = "Unauthorized") {
    super(message);
    this.name = "AuthenticationError";
  }
}

export class AuthorizationError extends Error {
  constructor(message: string = "Forbidden") {
    super(message);
    this.name = "AuthorizationError";
  }
}

export class ValidationError extends Error {
  constructor(
    message: string = "Validation failed",
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = "ValidationError";
  }
}

export class NotFoundError extends Error {
  constructor(message: string = "Resource not found") {
    super(message);
    this.name = "NotFoundError";
  }
}

export class ConflictError extends Error {
  constructor(message: string = "Resource already exists") {
    super(message);
    this.name = "ConflictError";
  }
}

/**
 * Handle errors and return appropriate HTTP responses
 */
export function handleError(error: unknown): NextResponse {
  // Zod validation errors
  if (error instanceof ZodError) {
    const fieldErrors: Record<string, string | string[]> = {};
    error.issues.forEach((issue) => {
      const path = issue.path.join(".");
      if (fieldErrors[path]) {
        if (Array.isArray(fieldErrors[path])) {
          (fieldErrors[path] as string[]).push(issue.message);
        } else {
          fieldErrors[path] = [fieldErrors[path] as string, issue.message];
        }
      } else {
        fieldErrors[path] = issue.message;
      }
    });

    return NextResponse.json(
      {
        ok: false,
        message: "Validation failed",
        errors: fieldErrors,
      },
      { status: 400 }
    );
  }

  // Custom errors
  if (error instanceof AuthenticationError) {
    return NextResponse.json(
      {
        ok: false,
        message: error.message,
      },
      { status: 401 }
    );
  }

  if (error instanceof AuthorizationError) {
    return NextResponse.json(
      {
        ok: false,
        message: error.message,
      },
      { status: 403 }
    );
  }

  if (error instanceof ValidationError) {
    return NextResponse.json(
      {
        ok: false,
        message: error.message,
        details: error.details,
      },
      { status: 400 }
    );
  }

  if (error instanceof NotFoundError) {
    return NextResponse.json(
      {
        ok: false,
        message: error.message,
      },
      { status: 404 }
    );
  }

  if (error instanceof ConflictError) {
    return NextResponse.json(
      {
        ok: false,
        message: error.message,
      },
      { status: 409 }
    );
  }

  // Generic errors
  if (error instanceof Error) {
    // Don't expose internal error messages in production
    const message = process.env.NODE_ENV === "production" ? "Internal server error" : error.message;
    
    console.error("[API Error]", error.name, error.message);

    return NextResponse.json(
      {
        ok: false,
        message,
      },
      { status: 500 }
    );
  }

  // Unknown errors
  console.error("[API Error] Unknown error type:", error);

  return NextResponse.json(
    {
      ok: false,
      message: "Internal server error",
    },
    { status: 500 }
  );
}

/**
 * Wrapper to safely execute async route handlers
 */
export function withErrorHandler<T extends (...args: any[]) => Promise<NextResponse>>(handler: T): T {
  return (async (...args: any[]) => {
    try {
      return await handler(...args);
    } catch (error) {
      return handleError(error);
    }
  }) as T;
}
