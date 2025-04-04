import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import { InstructorClient as IC } from "@instructor-ai/instructor";

export type AnthropicImage = {
  type: "image";
  source: {
    type: "base64";
    media_type: "image/png";
    data: string;
  };
};

export type OpenAIImage = {
  type: "image_url";
  image_url: {
    url: string;
  };
};

export type InstructorClient = IC<OpenAI> | IC<Anthropic>;
