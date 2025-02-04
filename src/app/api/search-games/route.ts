import { type NextRequest, NextResponse } from "next/server";
import { env } from "process";

const IGDB_CLIENT_ID = env.IGDB_CLIENT_ID;
const IGDB_CLIENT_SECRET = env.IGDB_CLIENT_SECRET;
const IGDB_API_URL = "https://api.igdb.com/v4";

let igdbAccessToken: string | null = null;
let tokenExpirationTime: number | null = null;

async function getIGDBAccessToken() {
  if (
    igdbAccessToken &&
    tokenExpirationTime &&
    Date.now() < tokenExpirationTime
  ) {
    return igdbAccessToken;
  }

  const response = await fetch(
    `https://id.twitch.tv/oauth2/token?client_id=${IGDB_CLIENT_ID}&client_secret=${IGDB_CLIENT_SECRET}&grant_type=client_credentials`,
    {
      method: "POST",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to obtain IGDB access token");
  }

  const data = await response.json();
  igdbAccessToken = data.access_token;
  tokenExpirationTime = Date.now() + data.expires_in * 1000;
  return igdbAccessToken;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const term = searchParams.get("term");
  const gameId = searchParams.get("id");
  const barcode = searchParams.get("barcode");

  if (barcode) {
    try {
      const response = await fetch(
        `https://api.upcitemdb.com/prod/trial/lookup?upc=${barcode}`
      );
      const data = await response.json();

      if (data.code !== "OK") {
        return NextResponse.json(
          { error: "Failed to fetch game information" },
          { status: 400 }
        );
      }

      if (data.total === 0 || !data.items || data.items.length === 0) {
        return NextResponse.json(
          { error: "No game found for this barcode" },
          { status: 404 }
        );
      }

      const item = data.items[0];
      return NextResponse.json({
        id: item.upc, // Using UPC as ID since we don't have a specific game ID
        name: item.title,
        cover_image:
          item.images && item.images.length > 0 ? item.images[0] : null,
        genres: [], // UPC database doesn't provide genre information
        description: item.description || "",
        brand: item.brand,
        lowestPrice: item.lowest_recorded_price,
        highestPrice: item.highest_recorded_price,
      });
    } catch (error) {
      console.error("Error fetching game info from UPC database:", error);
      return NextResponse.json(
        { error: "Failed to fetch game information" },
        { status: 500 }
      );
    }
  } else if (!IGDB_CLIENT_ID || !IGDB_CLIENT_SECRET) {
    return NextResponse.json(
      { error: "API keys are not configured" },
      { status: 500 }
    );
  } else if (gameId) {
    // Fetch specific game details
    try {
      const igdbAccessToken = await getIGDBAccessToken();
      const response = await fetch(`${IGDB_API_URL}/games`, {
        method: "POST",
        headers: {
          "Client-ID": IGDB_CLIENT_ID,
          Authorization: `Bearer ${igdbAccessToken}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: `fields name,cover.url,genres.name; where id = ${gameId};`,
      });

      if (!response.ok) {
        throw new Error(`IGDB API responded with status: ${response.status}`);
      }

      const [game] = await response.json();
      return NextResponse.json({
        id: game.id,
        name: game.name,
        cover_image: game.cover
          ? `https:${game.cover.url.replace("t_thumb", "t_cover_big")}`
          : null,
        genres: game.genres || [],
      });
    } catch (error) {
      console.error("Error fetching games:", error);
      return NextResponse.json(
        { error: "Failed to fetch games" },
        { status: 500 }
      );
    }
  } else if (term) {
    // Search for games
    try {
      const igdbAccessToken = await getIGDBAccessToken();
      const response = await fetch(`${IGDB_API_URL}/games`, {
        method: "POST",
        headers: {
          "Client-ID": IGDB_CLIENT_ID,
          Authorization: `Bearer ${igdbAccessToken}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: `search "${term}"; fields name,cover.url; limit 10;`,
      });

      if (!response.ok) {
        throw new Error(`IGDB API responded with status: ${response.status}`);
      }

      const games = await response.json();
      return NextResponse.json({
        games: games.map(
          (game: { id: string; name: string; cover: { url: string } }) => ({
            id: game.id,
            name: game.name,
            cover_image: game.cover
              ? `https:${game.cover.url.replace("t_thumb", "t_cover_small")}`
              : null,
          })
        ),
      });
    } catch (error) {
      console.error("Error fetching games:", error);
      return NextResponse.json(
        { error: "Failed to fetch games" },
        { status: 500 }
      );
    }
  } else {
    return NextResponse.json(
      { error: "Search term, game ID, or barcode is required" },
      { status: 400 }
    );
  }
}
