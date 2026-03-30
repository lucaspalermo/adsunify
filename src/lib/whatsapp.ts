/**
 * WhatsApp Automation via Evolution API
 * Evolution API docs: https://doc.evolution-api.com/
 */

const EVOLUTION_API_URL = process.env.EVOLUTION_API_URL || "http://localhost:8080"
const EVOLUTION_API_KEY = process.env.EVOLUTION_API_KEY || ""

interface SendMessageParams {
  instanceName: string
  phone: string
  message: string
}

interface SendMediaParams {
  instanceName: string
  phone: string
  mediaUrl: string
  caption?: string
  mediaType: "image" | "video" | "audio" | "document"
}

// Headers for Evolution API
function headers() {
  return {
    "Content-Type": "application/json",
    apikey: EVOLUTION_API_KEY,
  }
}

// Create a new WhatsApp instance
export async function createInstance(instanceName: string) {
  const res = await fetch(`${EVOLUTION_API_URL}/instance/create`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      instanceName,
      qrcode: true,
      integration: "WHATSAPP-BAILEYS",
    }),
  })
  return res.json()
}

// Get QR code for connection
export async function getQRCode(instanceName: string) {
  const res = await fetch(`${EVOLUTION_API_URL}/instance/connect/${instanceName}`, {
    headers: headers(),
  })
  return res.json()
}

// Check connection status
export async function getConnectionStatus(instanceName: string) {
  const res = await fetch(`${EVOLUTION_API_URL}/instance/connectionState/${instanceName}`, {
    headers: headers(),
  })
  return res.json()
}

// Send text message
export async function sendTextMessage({ instanceName, phone, message }: SendMessageParams) {
  const cleanPhone = phone.replace(/\D/g, "")
  const res = await fetch(`${EVOLUTION_API_URL}/message/sendText/${instanceName}`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      number: cleanPhone,
      text: message,
    }),
  })
  return res.json()
}

// Send media message (image, video, etc.)
export async function sendMediaMessage({ instanceName, phone, mediaUrl, caption, mediaType }: SendMediaParams) {
  const cleanPhone = phone.replace(/\D/g, "")
  const res = await fetch(`${EVOLUTION_API_URL}/message/sendMedia/${instanceName}`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      number: cleanPhone,
      mediatype: mediaType,
      media: mediaUrl,
      caption: caption || "",
    }),
  })
  return res.json()
}

// Send message to multiple contacts (bulk)
export async function sendBulkMessages(instanceName: string, phones: string[], message: string, delayMs: number = 3000) {
  const results = []
  for (const phone of phones) {
    try {
      const result = await sendTextMessage({ instanceName, phone, message })
      results.push({ phone, success: true, result })
    } catch (error) {
      results.push({ phone, success: false, error })
    }
    // Delay between messages to avoid ban
    if (delayMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, delayMs))
    }
  }
  return results
}

// Logout/disconnect instance
export async function logoutInstance(instanceName: string) {
  const res = await fetch(`${EVOLUTION_API_URL}/instance/logout/${instanceName}`, {
    method: "DELETE",
    headers: headers(),
  })
  return res.json()
}

// Delete instance
export async function deleteInstance(instanceName: string) {
  const res = await fetch(`${EVOLUTION_API_URL}/instance/delete/${instanceName}`, {
    method: "DELETE",
    headers: headers(),
  })
  return res.json()
}

// Fetch all instances
export async function listInstances() {
  const res = await fetch(`${EVOLUTION_API_URL}/instance/fetchInstances`, {
    headers: headers(),
  })
  return res.json()
}
