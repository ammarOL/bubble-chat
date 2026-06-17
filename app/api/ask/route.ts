import { NextResponse } from "next/server";
import { generateMemoryAnswer } from "./_lib/gemini";
import { parseAskRequest } from "./_lib/request";

export async function POST(request: Request) {
  if (!process.env.GOOGLE_API_KEY) {
    return NextResponse.json(
      { error: "GOOGLE_API_KEY is missing on the server." },
      { status: 503 },
    );
  }

  let askRequest: ReturnType<typeof parseAskRequest>;

  try {
    askRequest = parseAskRequest(await request.json());
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Bubbles could not read that Ask Memory request.",
      },
      { status: 400 },
    );
  }

  try {
    const answer = await generateMemoryAnswer(askRequest);

    return NextResponse.json({
      answer,
      usedBubbleIds: askRequest.matches.map((match) => match.id),
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Bubbles could not reach Gemini right now.",
      },
      { status: 502 },
    );
  }
}
