import { NextResponse } from "next/server"
import { db } from "@/lib/db"

// Google Maps Places API proxy for prospecting
export async function POST(req: Request) {
  try {
    const { query, location, userId } = await req.json()

    if (!query || !userId) {
      return NextResponse.json({ error: "query and userId required" }, { status: 400 })
    }

    const apiKey = process.env.GOOGLE_MAPS_API_KEY

    if (!apiKey) {
      // Return mock data for development
      const mockLeads = generateMockLeads(query, location || "Brasil")
      return NextResponse.json({
        leads: mockLeads,
        total: mockLeads.length,
        source: "mock",
      })
    }

    // Real Google Places API call
    const searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query + " " + (location || ""))}&language=pt-BR&key=${apiKey}`

    const res = await fetch(searchUrl)
    const data = await res.json()

    if (data.status !== "OK") {
      return NextResponse.json({ error: "Google API error", status: data.status }, { status: 500 })
    }

    const leads = await Promise.all(
      (data.results || []).slice(0, 20).map(async (place: any) => {
        // Get details for phone/website
        let details: any = {}
        if (place.place_id) {
          try {
            const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&fields=formatted_phone_number,website,opening_hours,reviews&language=pt-BR&key=${apiKey}`
            const detailsRes = await fetch(detailsUrl)
            const detailsData = await detailsRes.json()
            details = detailsData.result || {}
          } catch {}
        }

        return {
          name: place.name,
          address: place.formatted_address,
          rating: place.rating || 0,
          totalReviews: place.user_ratings_total || 0,
          phone: details.formatted_phone_number || null,
          website: details.website || null,
          isOpen: details.opening_hours?.open_now || null,
          placeId: place.place_id,
          hasWebsite: !!details.website,
          opportunity: !details.website ? "alto" : details.website && !details.website.includes("https") ? "medio" : "baixo",
        }
      })
    )

    return NextResponse.json({
      leads,
      total: leads.length,
      source: "google_places",
    })
  } catch (error) {
    console.error("Prospecting error:", error)
    return NextResponse.json({ error: "Failed to prospect" }, { status: 500 })
  }
}

function generateMockLeads(query: string, location: string) {
  const types = ["Consultorio", "Clinica", "Escritorio", "Loja", "Studio", "Academia"]
  const leads = []
  for (let i = 0; i < 10; i++) {
    const hasWebsite = Math.random() > 0.4
    leads.push({
      name: `${types[i % types.length]} ${query} ${i + 1}`,
      address: `Rua Exemplo ${100 + i}, ${location}`,
      rating: Math.round((3 + Math.random() * 2) * 10) / 10,
      totalReviews: Math.floor(Math.random() * 200),
      phone: `(11) 9${Math.floor(Math.random() * 10000).toString().padStart(4, "0")}-${Math.floor(Math.random() * 10000).toString().padStart(4, "0")}`,
      website: hasWebsite ? `https://${query.toLowerCase().replace(/\s/g, "")}-${i}.com.br` : null,
      isOpen: Math.random() > 0.3,
      placeId: `mock_${i}`,
      hasWebsite,
      opportunity: !hasWebsite ? "alto" : "baixo",
    })
  }
  return leads
}
