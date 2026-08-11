// Shapes below are reverse-engineered from api.demoblaze.com's own frontend
// (https://www.demoblaze.com/js/prod.js and js/cart.js, fetched and decompiled
// while diagnosing failing example specs) and cross-checked against live curl
// responses — not from third-party QA-course documentation, which turned out to
// be wrong about several endpoint names/methods (see api/clients/DemoblazeApiClient.ts).
//
// The API never uses HTTP status codes for business-logic failures: signup/login/
// cart calls all return 200, and failure is signaled by an `errorMessage` field in
// the JSON body instead.

export type DemoblazeErrorResponse = {
  errorMessage: string;
};

// Success body is the empty string `""`; failure is DemoblazeErrorResponse
// (e.g. {"errorMessage":"This user already exist."}).
export type DemoblazeSignupResponse = string | DemoblazeErrorResponse;

// Success body is a JSON string literal "Auth_token: <token>"; failure is
// DemoblazeErrorResponse (e.g. {"errorMessage":"User does not exist."} or
// {"errorMessage":"Wrong password."}).
export type DemoblazeLoginResponse = string | DemoblazeErrorResponse;

export type DemoblazeCheckResponse = DemoblazeErrorResponse | ({ Item?: { username?: string } } & Record<string, unknown>);

export type DemoblazeProduct = {
  id?: number;
  title?: string;
  price?: number;
  cat?: string;
  desc?: string;
  img?: string;
} & Record<string, unknown>;

export type DemoblazeEntriesResponse = {
  Items?: DemoblazeProduct[];
  Cat?: Array<{ id?: string; cat?: string } & Record<string, unknown>>;
} & Record<string, unknown>;

// /bycat success body is { Items: DemoblazeProduct[] } (confirmed live) — same
// shape as DemoblazeEntriesResponse minus Cat, kept as its own type since the
// two endpoints aren't guaranteed to stay in sync.
export type DemoblazeCategoryResponse = {
  Items?: DemoblazeProduct[];
} & Record<string, unknown>;

export type DemoblazeCartItem = {
  id?: string;
  prod_id?: number;
} & Record<string, unknown>;

export type DemoblazeViewCartResponse = DemoblazeErrorResponse | ({ Items?: DemoblazeCartItem[] } & Record<string, unknown>);

export type DemoblazeCartMutationResponse = Record<string, unknown>;
