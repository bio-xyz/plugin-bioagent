import "dotenv/config";
import { Anthropic } from "@anthropic-ai/sdk";

const apiKey: string | undefined = process.env.ANTHROPIC_API_KEY;

export function getClient(): Anthropic {
    return new Anthropic({ apiKey });
}

export async function generateResponse(
    client: Anthropic,
    prompt: string,
    model: string = "claude-3-5-sonnet-20241022",
    maxTokens: number = 1500
): Promise<string> {
    const response = await client.messages.create({
        model: model,
        max_tokens: maxTokens,
        messages: [{ role: "user", content: prompt }],
    });

    if (
        response.content &&
        response.content.length > 0 &&
        response.content[0].type === "text"
    ) {
        return response.content[0].text;
    } else {
        throw new Error("No response received from Claude.");
    }
}
