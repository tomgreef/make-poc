/* =========================================================================
   Make Bridge - Integration endpoint models
   https://developers.make.com/bridge-documentation/make-bridge-api-reference/integration
   ====================================================================== */

/* ---------- helpers --------------------------------------------------- */
export type ISODateTime = string; // e.g. "2025-06-07T12:42:28.696Z"
export type AnyJson = Record<string, unknown>;

/* ---------- common query/path params ---------------------------------- */
export interface TeamIdQuery {
  teamId?: number;
}
export interface PublicVersionIdParam {
  publicVersionId: number;
}
export interface ScenarioIdParam {
  scenarioId: number;
}
export interface FlowIdParam {
  flowId: string;
}

/* ---------- GET /integrations ----------------------------------------- */
export interface SchedulingRule {
  type: string; // "immediately" | "cron" | …
  interval?: number;
  date?: ISODateTime;
  between?: ISODateTime[];
  time?: string;
  days?: number[];
  months?: number[];
  restrict?: Array<{
    time?: string[];
    days?: number[];
    months?: number[];
  }>;
}

export interface IntegrationListItem {
  scenario: {
    id: number;
    name: string;
    isActive: boolean;
    usedPackages: string[];
    scheduling: SchedulingRule;
  };
  state: {
    isConnected: boolean;
  };
  template: {
    versionUid: number;
    publicVersionId: number;
  };
}

export interface ListIntegrationsResponse {
  integrations: IntegrationListItem[];
}

/* ---------- POST /integrations/init/{publicVersionId} ----------------- */
export interface InitializeIntegrationBody {
  teamId?: number;
  algorithm?: string; // e.g. "whiteboard"
  prefill?: {
    hard?: AnyJson;
    soft?: AnyJson;
  };
  allowReusingComponents?: boolean;
  allowCreatingComponents?: boolean;
  autoActivate?: boolean;
  autoFinalize?: boolean;
  redirectUri?: string;
  scenario?: {
    name?: string;
    enable?: boolean;
    folderId?: number;
  };
  /** Accept unknown future keys */
  [extra: string]: unknown;
}

export interface InitializeIntegrationResponse {
  publicUrl: string;
  flow: { id: string };
  createdComponents?: {
    hooks: Array<{ id: number; url: string }>;
    /** Accept unknown component types */
    [extra: string]: unknown;
  };
}

/* ---------- GET /integrations/check-init/{flowId} --------------------- */
export interface CheckInitResponse {
  flow: {
    id: string;
    statusId: number;
    statusMessage: string;
    isCompleted: boolean;
    result?: {
      scenarios: Array<{ id: number; description: string }>;
      [extra: string]: unknown;
    };
    [extra: string]: unknown;
  };
}

/* ---------- POST /integrations/{scenarioId}/activate ------------------ */
export interface ActivateIntegrationResponse {
  integration: { scenarioId: number };
}

/* ---------- POST /integrations/{scenarioId}/deactivate ---------------- */
export interface DeactivateIntegrationResponse {
  integration: { scenarioId: number };
}

/* ---------- DELETE /integrations/{scenarioId} ------------------------- */
export interface DeleteIntegrationResponse {
  message: string;
}

/* ---------- POST /integrations/{scenarioId}/run ----------------------- */
export interface RunIntegrationBody {
  data?: AnyJson;
  responsive?: boolean;
  [extra: string]: unknown;
}

export interface RunIntegrationResponse {
  executionId: string;
  statusUrl: string;
  status: string | null;
  outputs: AnyJson;
  [extra: string]: unknown;
}

/* ---------- grouped helpers ------------------------------------------ */
export namespace MakeBridgeIntegration {
  /* -------- requests ------- */
  export type ListIntegrationsRequest = TeamIdQuery;
  export interface InitializeIntegrationRequest
    extends PublicVersionIdParam,
      TeamIdQuery {
    body: InitializeIntegrationBody;
  }
  export interface CheckInitRequest extends FlowIdParam, TeamIdQuery {}
  export interface ActivateRequest extends ScenarioIdParam, TeamIdQuery {}
  export interface DeactivateRequest extends ScenarioIdParam, TeamIdQuery {}
  export interface DeleteRequest extends ScenarioIdParam, TeamIdQuery {}
  export interface RunRequest extends ScenarioIdParam, TeamIdQuery {
    body: RunIntegrationBody;
  }

  /* -------- responses ------ */
  // export type ListIntegrationsResponse   = ListIntegrationsResponse;
  export type InitializeIntegrationResp = InitializeIntegrationResponse;
  export type CheckInitResp = CheckInitResponse;
  export type ActivateResp = ActivateIntegrationResponse;
  export type DeactivateResp = DeactivateIntegrationResponse;
  export type DeleteResp = DeleteIntegrationResponse;
  export type RunResp = RunIntegrationResponse;
}
