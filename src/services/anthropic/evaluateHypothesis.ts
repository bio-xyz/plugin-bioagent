import { openai } from "./client";
import {
  stepOnePrompt,
  stepTwoPrompt,
} from "../../evaluators/evaluationPrompt";
import { EvaluationResult } from "../../evaluators/types";
import { IAgentRuntime } from "@elizaos/core";
import { anthropic } from "./client";

export async function evaluateHypothesis(
  hypothesis: string
): Promise<EvaluationResult> {
  // Step 1: Internet Research
  const stepOneCompletion = await openai.chat.completions.create({
    model: "gpt-4o-search-preview",
    messages: [
      {
        role: "system",
        content: stepOnePrompt,
      },
      {
        role: "user",
        content: `Here is the Hypothesis to research: ${hypothesis}`,
      },
    ],
  });

  const research = stepOneCompletion.choices[0].message.content;

  // Step 2: Hypothesis Evaluation
  const stepTwoCompletion = await openai.chat.completions.create({
    model: "o1",
    messages: [
      {
        role: "system",
        content: stepTwoPrompt,
      },
      {
        role: "user",
        content: `Here is the Hypothesis to evaluate: ${hypothesis}\n\nHere are the research findings from Step 1: ${research}`,
      },
    ],
  });

  const evaluation = stepTwoCompletion.choices[0].message.content;

  const scoreCompletion = await anthropic.messages.create({
    model: "claude-3-5-haiku-latest",
    messages: [
      {
        role: "user",
        content: `You are a scientific hypothesis score extractor. Extract the numerical score (0-100) from the evaluation below. The score should already be present in the text. Output ONLY the integer score, no other text.\n\nEvaluation: ${evaluation}`,
      },
    ],
    max_tokens: 100,
  });

  const score =
    scoreCompletion.content[0].type === "text"
      ? scoreCompletion.content[0].text
      : "0";

  return {
    stepOne: {
      research: research || "",
      timestamp: new Date().toISOString(),
    },
    stepTwo: {
      evaluation: evaluation || "",
      timestamp: new Date().toISOString(),
    },
    score,
  };
}

/**
 * Sends the evaluation to the Discord channel
 * @param agentRuntime The agent runtime
 * @param hypothesis The hypothesis
 * @param hypothesisMessageId The message id of the hypothesis
 */
export async function sendEvaluationToDiscord(
  agentRuntime: IAgentRuntime,
  hypothesis: string,
  hypothesisMessageId: string
) {
  const channel = await agentRuntime
    .getService("discord")
    // @ts-ignore
    .client.channels.fetch(process.env.DISCORD_CHANNEL_ID);
  const evaluationResult = await evaluateHypothesis(hypothesis);
  const research = evaluationResult.stepOne.research.split("\n\n");
  const evaluation = evaluationResult.stepTwo.evaluation.split("\n\n");
  await channel.send({
    content: "# Research",
    reply: { messageReference: hypothesisMessageId },
  });
  research.forEach(async (paragraph) => {
    await channel.send(paragraph);
  });
  await channel.send({
    content: "# Evaluation",
    reply: { messageReference: hypothesisMessageId },
  });
  evaluation.forEach(async (paragraph) => {
    await channel.send(paragraph);
  });
}
