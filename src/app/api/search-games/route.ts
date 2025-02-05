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

async function searchIGDBWithFlexibleTitle(
  title: string,
  igdbAccessToken: string
) {
  // Remove common prefixes like "Nintendo" and special characters
  const cleanTitle = title
    .replace(/^(Nintendo|Sony|Microsoft)\s+/i, "")
    .replace(/[:\-–]/g, " ")
    .trim();

  // Split the title into words
  const titleWords = cleanTitle.split(/\s+/);

  // Create a search query that looks for games containing most of the words
  const searchQuery = titleWords
    .map((word) => `name ~ *"${word}"*`)
    .join(" & ");

  console.log(searchQuery);

  const response = await fetch(`${IGDB_API_URL}/games`, {
    method: "POST",
    headers: {
      "Client-ID": IGDB_CLIENT_ID,
      Authorization: `Bearer ${igdbAccessToken}`,
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: `where ${searchQuery}; fields name,cover.url,genres.name; limit 10;`,
  });

  if (!response.ok) {
    throw new Error(`IGDB API responded with status: ${response.status}`);
  }

  return await response.json();
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
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
      const upcResponse = await fetch(
        `https://api.upcitemdb.com/prod/trial/lookup?upc=${barcode}`
      );
      const upcData = await upcResponse.json();

      if (
        upcData.code !== "OK" ||
        upcData.total === 0 ||
        !upcData.items ||
        upcData.items.length === 0
      ) {
        return NextResponse.json(
          { error: "No game found for this barcode" },
          { status: 404 }
        );
      }

      const upcItem = upcData.items[0];

      // Use the title from UPC database to search IGDB
      const igdbGames = await searchIGDBWithFlexibleTitle(
        upcItem.title,
        igdbAccessToken
      );

      if (igdbGames.length > 0) {
        const game = igdbGames[0]; // Use the first match
        const games = await searchIGDBWithFlexibleTitle(
          game.title,
          igdbAccessToken
        );
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
        // If no match in IGDB, return UPC data
        console.log("searching the long way");
        return NextResponse.json(
          { error: "Failed to fetch games" },
          { status: 500 }
        );
      }
    } else if (gameId) {
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
      const games = await searchIGDBWithFlexibleTitle(term, igdbAccessToken);
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
