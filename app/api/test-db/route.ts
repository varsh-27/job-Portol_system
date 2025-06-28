import { NextResponse } from "next/server"
import { testConnection } from "@/lib/db"

export async function GET() {
  try {
    const connectionTest = await testConnection()

    if (connectionTest.success) {
      return NextResponse.json({
        status: "success",
        message: "Database connection successful",
        timestamp: new Date().toISOString(),
      })
    } else {
      return NextResponse.json(
        {
          status: "error",
          message: "Database connection failed",
          error: connectionTest.error,
        },
        { status: 500 },
      )
    }
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        message: "Database test failed",
        error: error.message,
      },
      { status: 500 },
    )
  }
}
