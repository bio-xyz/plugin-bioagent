export type Binding = {
  obj: {
    type: string;
    value: string;
  };
};

export type Abstract = {
  abstract: {
    type: string;
    value: string;
  };
  sub: {
    type: string;
    value: string;
  };
};

export type Finding = {
  description: {
    type: string;
    value: string;
  };
  paper: {
    type: string;
    value: string;
  };
};

export type FindingResult = {
  finding: string;
  paper: string;
};

export type Hypothesis = {
  hypothesis: {
    type: string;
    value: string;
  };
  hypothesisEntity: {
    type: string;
    value: string;
  };
};
