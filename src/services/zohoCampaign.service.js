const ErrorHandler = require("../utils/ErrorHandler");

let tokenCache = {
  accessToken: null,
  expiresAt: 0,
};

const DEFAULT_ACCOUNTS_BASE_URL = "https://accounts.zoho.com";
const DEFAULT_CAMPAIGNS_BASE_URL = "https://campaigns.zoho.com/api/v1.1";

const getRequiredEnv = (name) => {
  const value = process.env[name];
  if (!value) {
    throw new ErrorHandler(`Missing environment variable: ${name}`, 500);
  }
  return value;
};

const normalizePath = (path) => {
  if (!path) return "";
  return path.startsWith("/") ? path : `/${path}`;
};

const parseResponse = async (response) => {
  const text = await response.text();
  if (!text) return {};

  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
};

const getZohoAccessToken = async () => {
  const now = Date.now();
  if (tokenCache.accessToken && tokenCache.expiresAt > now + 60 * 1000) {
    return tokenCache.accessToken;
  }

  const accountsBaseUrl =
    process.env.ZOHO_ACCOUNTS_BASE_URL || DEFAULT_ACCOUNTS_BASE_URL;

  const body = new URLSearchParams({
    refresh_token: getRequiredEnv("ZOHO_REFRESH_TOKEN"),
    client_id: getRequiredEnv("ZOHO_CLIENT_ID"),
    client_secret: getRequiredEnv("ZOHO_CLIENT_SECRET"),
    grant_type: "refresh_token",
  });

  const response = await fetch(`${accountsBaseUrl}/oauth/v2/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body.toString(),
  });

  const data = await parseResponse(response);

  if (!response.ok || !data.access_token) {
    throw new ErrorHandler(
      `Zoho token request failed: ${JSON.stringify(data)}`,
      response.status || 500
    );
  }

  const expiresIn = Number(data.expires_in || data.expires_in_sec || 3600);
  tokenCache = {
    accessToken: data.access_token,
    expiresAt: Date.now() + expiresIn * 1000,
  };

  return tokenCache.accessToken;
};

const zohoCampaignRequest = async ({
  path,
  method = "GET",
  query = {},
  body = {},
}) => {
  const campaignsBaseUrl =
    process.env.ZOHO_CAMPAIGNS_BASE_URL || DEFAULT_CAMPAIGNS_BASE_URL;
  const accessToken = await getZohoAccessToken();

  const url = new URL(`${campaignsBaseUrl}${normalizePath(path)}`);
  Object.entries({ resfmt: "JSON", ...query }).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  });

  const options = {
    method,
    headers: {
      Authorization: `Zoho-oauthtoken ${accessToken}`,
    },
  };

  if (method !== "GET") {
    const payload = new URLSearchParams();
    Object.entries(body).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        payload.set(key, String(value));
      }
    });

    options.headers["Content-Type"] = "application/x-www-form-urlencoded";
    options.body = payload.toString();
  }

  const response = await fetch(url.toString(), options);
  const data = await parseResponse(response);

  if (!response.ok) {
    throw new ErrorHandler(
      `Zoho campaigns API failed: ${JSON.stringify(data)}`,
      response.status || 500
    );
  }

  return data;
};

const fetchMailingLists = () =>
  zohoCampaignRequest({
    path: process.env.ZOHO_CAMPAIGNS_LISTS_PATH || "/getmailinglists",
    method: "GET",
  });

const createCampaign = (payload) =>
  zohoCampaignRequest({
    path: process.env.ZOHO_CAMPAIGNS_CREATE_PATH || "/createcampaign",
    method: "POST",
    body: payload,
  });

const sendCampaign = (campaignKey, additionalPayload = {}) =>
  zohoCampaignRequest({
    path: process.env.ZOHO_CAMPAIGNS_SEND_PATH || "/sendcampaign",
    method: "POST",
    body: {
      campaignkey: campaignKey,
      ...additionalPayload,
    },
  });

module.exports = {
  fetchMailingLists,
  createCampaign,
  sendCampaign,
};
