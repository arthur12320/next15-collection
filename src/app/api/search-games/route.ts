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
  const searchParams = request.nextUrl.searchParams;
  const term = searchParams.get("term");
  const gameId = searchParams.get("id");
  const barcode = searchParams.get("barcode");

  if (!IGDB_CLIENT_ID || !IGDB_CLIENT_SECRET) {
    return NextResponse.json(
      { error: "API keys are not configured" },
      { status: 500 }
    );
  }

  try {
    const igdbAccessToken = await getIGDBAccessToken();

    if (barcode) {
      // Search for game by barcode
      // Note: IGDB doesn't directly support barcode search, so we'll use it as a search term
      const response = await fetch(`${IGDB_API_URL}/games`, {
        method: "POST",
        headers: {
          "Client-ID": IGDB_CLIENT_ID,
          Authorization: `Bearer ${igdbAccessToken}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: `search "${barcode}"; fields name,cover.url,genres.name; limit 1;`,
      });

      if (!response.ok) {
        throw new Error(`IGDB API responded with status: ${response.status}`);
      }

      const [game] = await response.json();
      if (game) {
        return NextResponse.json({
          id: game.id,
          name: game.name,
          cover_image: game.cover
            ? `https:${game.cover.url.replace("t_thumb", "t_cover_big")}`
            : null,
          genres: game.genres || [],
        });
      } else {
        return NextResponse.json({ error: "Game not found" }, { status: 404 });
      }
    } else if (gameId) {
      // Fetch specific game details
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
    } else if (term) {
      // Search for games
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
    } else {
      return NextResponse.json(
        { error: "Search term, game ID, or barcode is required" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error fetching games:", error);
    return NextResponse.json(
      { error: "Failed to fetch games" },
      { status: 500 }
    );
  }
}
