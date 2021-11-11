export interface RegionListRaw {
  REGIONS: { REGION: RegionRaw[] };
}

export interface RegionRaw {
  NAME: string;
  FACTBOOK: string;
  NUMNATIONS: string;
  NATIONS: string | Record<string, never>;
  DELEGATE: string;
  DELEGATEVOTES: string;
  DELEGATEAUTH: string;
  FOUNDER: string;
  FOUNDERAUTH: string;
  OFFICERS: OfficerEntryRaw;
  POWER: string;
  FLAG: string;
  EMBASSIES: EmbassyListRaw;
  WABADGES?: WABadgeEntryRaw;
  LASTUPDATE: string;
}

export interface OfficerEntryRaw {
  OFFICER?: OfficerRaw | OfficerRaw[];
}

export interface OfficerRaw {
  NATION: string;
  OFFICE: string;
  AUTHORITY: string;
  TIME: string;
  BY: string;
  ORDER: string;
}

export interface EmbassyListRaw {
  EMBASSY?: EmbassyEntryRaw | EmbassyEntryRaw[];
}

export type EmbassyEntryRaw = string | EmbassyRaw;

export interface EmbassyRaw {
  type: string;
  $t: string;
}

export interface WABadgeEntryRaw {
  WABADGE: WABadgeRaw | WABadgeRaw[];
}

export interface WABadgeRaw {
  type: string;
  $t: string;
}

export interface RegionList {
  regions: Region[];
}

export interface Region {
  name: string;
  factbook: string;
  nations: string[];
  delegate?: RegionDelegate;
  founder?: Founder;
  officers: Officer[];
  power: string;
  flag: string;
  embassies: EmbassyRaw[];
  waBadges: WABadgeRaw[];
  lastUpdate: number;
}

export interface RegionDelegate {
  name: string;
  votes: number;
  auth: string;
}

export interface Founder {
  name: string;
  auth: string;
}

export interface Officer {
  nation: string;
  office: string;
  authority: string;
  time: number;
  by: string;
  order: number;
}

export function convertToRegion(raw: RegionRaw): Region {
  return {
    name: raw.NAME,
    factbook: raw.FACTBOOK,
    nations: typeof raw.NATIONS === "string" ? raw.NATIONS.split(":") : [],
    delegate: raw.DELEGATE
      ? {
        name: raw.DELEGATE,
        votes: Number(raw.DELEGATEVOTES),
        auth: raw.DELEGATEAUTH
      }
      : undefined,
    founder: raw.FOUNDER ? { name: raw.FOUNDER, auth: raw.FOUNDERAUTH } : undefined,
    officers: convertToOfficerArray(raw.OFFICERS),
    power: raw.POWER,
    flag: raw.FLAG,
    embassies: convertToEmbassyArray(raw.EMBASSIES),
    waBadges: [],
    lastUpdate: Number(raw.LASTUPDATE)
  };
}

function convertToOfficerArray(raw: OfficerEntryRaw): Officer[] {
  if (!raw.OFFICER) {
    return [];
  }

  if (!Array.isArray(raw.OFFICER)) {
    const officer = raw.OFFICER;
    return [
      {
        nation: officer.NATION,
        office: officer.OFFICE,
        authority: officer.AUTHORITY,
        time: Number(officer.TIME),
        by: officer.BY,
        order: Number(officer.ORDER)
      }
    ];
  }

  return raw.OFFICER.map((officer) => ({
    nation: officer.NATION,
    office: officer.OFFICE,
    authority: officer.AUTHORITY,
    time: Number(officer.TIME),
    by: officer.BY,
    order: Number(officer.ORDER)
  }));
}

function convertToEmbassyArray(raw: EmbassyListRaw): EmbassyRaw[] {
  if (!raw.EMBASSY) {
    return [];
  }

  if (!Array.isArray(raw.EMBASSY)) {
    if (typeof raw.EMBASSY === "string") {
      return [{ type: "accepted", $t: raw.EMBASSY }];
    } else {
      return [raw.EMBASSY];
    }
  }

  return raw.EMBASSY.map((e) => (typeof e === "string" ? { type: "accepted", $t: e } : e));
}

export interface RegionData {
  date: Date;
  name: string;
  deltaVotes: number;
  deltaNations: number;
}
