// Enums
export const RoleEnum = {
  USER: "USER",
  ASSISTANT: "ASSISTANT",
  TOOL_CALL: "TOOL_CALL",
  TOOL_RESULT: "TOOL_RESULT"
};

export const ParameterLocation = {
  UNSPECIFIED: "PARAMETER_LOCATION_UNSPECIFIED",
  QUERY: "PARAMETER_LOCATION_QUERY",
  PATH: "PARAMETER_LOCATION_PATH",
  HEADER: "PARAMETER_LOCATION_HEADER",
  BODY: "PARAMETER_LOCATION_BODY"
};

export const KnownParamEnum = {
  UNSPECIFIED: "KNOWN_PARAM_UNSPECIFIED",
  CALL_ID: "KNOWN_PARAM_CALL_ID",
  CONVERSATION_HISTORY: "KNOWN_PARAM_CONVERSATION_HISTORY"
};

// Interface-like objects
export const Message = {
  ordinal: undefined,
  role: null,
  text: '',
  invocationId: undefined,
  toolName: undefined
};

export const SelectedTool = {
  toolId: undefined,
  toolName: undefined,
  temporaryTool: undefined,
  nameOverride: undefined,
  authTokens: {},
  parameterOverrides: {}
};

export const CallConfig = {
  systemPrompt: '',
  model: undefined,
  languageHint: undefined,
  selectedTools: [],
  initialMessages: [],
  voice: undefined,
  temperature: undefined,
  maxDuration: undefined,
  timeExceededMessage: undefined,
  callKey: undefined
};

export const DemoConfig = {
  title: '',
  overview: '',
  callConfig: {}
};

// For our order details component
export const OrderItem = {
  name: '',
  quantity: 0,
  specialInstructions: undefined,
  price: 0
};

export const OrderDetailsData = {
  items: [],
  totalAmount: 0
}; 