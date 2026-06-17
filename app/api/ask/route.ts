import { NextResponse } from "next/server";
import { AI_PROVIDER_LABELS, type AiProvider } from "../../_lib/types";
import { generateMemoryAnswer } from "./_lib/providers";
import { parseAskRequest } from "./_lib/request";

export async function POST(request: Request) {
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
    const apiKey = getProviderApiKey(askRequest.provider, askRequest.apiKey);

    if (!apiKey) {
      return NextResponse.json(
        {
          error: `${AI_PROVIDER_LABELS[askRequest.provider]} needs an API key. Add one in Settings or configure ${getProviderEnvKey(askRequest.provider)} on the server.`,
        },
        { status: 503 },
      );
    }

    const answer = await generateMemoryAnswer({
      ...askRequest,
      apiKey,
    });

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
            : "Bubbles could not reach the selected provider right now.",
      },
      { status: 502 },
    );
  }
}

function getProviderApiKey(provider: AiProvider, requestApiKey?: string) {
  if (requestApiKey?.trim()) {
    return requestApiKey.trim();
  }

  switch (provider) {
    case "openai":
      return process.env.OPENAI_API_KEY?.trim() ?? "";
    case "groq":
      return process.env.GROQ_API_KEY?.trim() ?? "";
    case "gemini":
      return process.env.GOOGLE_API_KEY?.trim() ?? "";
  }
}

function getProviderEnvKey(provider: AiProvider) {
  switch (provider) {
    case "openai":
      return "OPENAI_API_KEY";
    case "groq":
      return "GROQ_API_KEY";
    case "gemini":
      return "GOOGLE_API_KEY";
  }
}
