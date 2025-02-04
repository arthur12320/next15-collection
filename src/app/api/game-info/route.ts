import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const barcode = searchParams.get("barcode");

  if (!barcode) {
    return NextResponse.json({ error: "Barcode is required" }, { status: 400 });
  }

  try {
    const gameInfo = await fetchGameInfoFromBarcode(barcode);
    return NextResponse.json(gameInfo);
  } catch (error) {
    console.error("Error fetching game info:", error);
    return NextResponse.json(
      { error: "Unable to fetch game information" },
      { status: 500 }
    );
  }
}

async function fetchGameInfoFromBarcode(barcode: string) {
  // This is where you'd make a call to a UPC lookup service
  // For this example, we'll use a mock API call to UPCItemDB
  const apiUrl = `https://api.upcitemdb.com/prod/trial/lookup?upc=${barcode}`;

  const response = await fetch(apiUrl);
  if (!response.ok) {
    throw new Error("Failed to fetch from UPC database");
  }

  const data = await response.json();

  // Check if we got any items back
  if (data.items && data.items.length > 0) {
    const item = data.items[0];
    return {
      id: Date.now(),
      title: item.title,
      description: item.description || "No description available",
    };
  } else {
    throw new Error("No game found for this barcode");
  }
}
