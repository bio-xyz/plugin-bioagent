import type { Plugin } from "@elizaos/core";

import { dkgInsert } from "./actions/dkgInsert";
import { HypothesisService } from "./services";

export * as actions from "./actions";

export const dkgPlugin: Plugin = {
  name: "dkg",
  description:
    "Agent DKG which allows you to store memories on the OriginTrail Decentralized Knowledge Graph",
  actions: [dkgInsert],
  providers: [],
  evaluators: [],
  services: [HypothesisService],
};
