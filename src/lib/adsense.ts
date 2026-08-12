const defaultAdsenseClient = "ca-pub-2981823212977040";
const defaultAdsenseSlot = "2675947950";

const configuredClient = process.env.NEXT_PUBLIC_ADSENSE_CLIENT?.trim();
const configuredSlot = process.env.NEXT_PUBLIC_ADSENSE_SLOT?.trim();

export const adsenseClient = configuredClient && /^ca-pub-\d+$/.test(configuredClient)
  ? configuredClient
  : defaultAdsenseClient;

export const adsenseSlot = configuredSlot && /^\d+$/.test(configuredSlot)
  ? configuredSlot
  : defaultAdsenseSlot;
