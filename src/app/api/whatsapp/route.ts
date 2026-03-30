import { NextResponse } from "next/server"
import {
  createInstance,
  getQRCode,
  getConnectionStatus,
  sendTextMessage,
  sendBulkMessages,
  logoutInstance,
  listInstances,
} from "@/lib/whatsapp"

// GET: List instances or get QR code
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const action = searchParams.get("action")
  const instanceName = searchParams.get("instance")

  try {
    if (action === "qrcode" && instanceName) {
      const data = await getQRCode(instanceName)
      return NextResponse.json(data)
    }

    if (action === "status" && instanceName) {
      const data = await getConnectionStatus(instanceName)
      return NextResponse.json(data)
    }

    // Default: list all instances
    const instances = await listInstances()
    return NextResponse.json(instances)
  } catch (error) {
    console.error("WhatsApp GET error:", error)
    return NextResponse.json({ error: "Failed" }, { status: 500 })
  }
}

// POST: Create instance, send message, or bulk send
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { action, instanceName, phone, phones, message } = body

    if (action === "create") {
      if (!instanceName) return NextResponse.json({ error: "instanceName required" }, { status: 400 })
      const result = await createInstance(instanceName)
      return NextResponse.json(result)
    }

    if (action === "send") {
      if (!instanceName || !phone || !message) {
        return NextResponse.json({ error: "instanceName, phone, message required" }, { status: 400 })
      }
      const result = await sendTextMessage({ instanceName, phone, message })
      return NextResponse.json(result)
    }

    if (action === "bulk") {
      if (!instanceName || !phones?.length || !message) {
        return NextResponse.json({ error: "instanceName, phones[], message required" }, { status: 400 })
      }
      const results = await sendBulkMessages(instanceName, phones, message)
      return NextResponse.json({
        total: phones.length,
        sent: results.filter((r) => r.success).length,
        failed: results.filter((r) => !r.success).length,
        results,
      })
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch (error) {
    console.error("WhatsApp POST error:", error)
    return NextResponse.json({ error: "Failed" }, { status: 500 })
  }
}

// DELETE: Logout or delete instance
export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url)
  const instanceName = searchParams.get("instance")
  if (!instanceName) return NextResponse.json({ error: "instance required" }, { status: 400 })

  try {
    await logoutInstance(instanceName)
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Failed" }, { status: 500 })
  }
}
