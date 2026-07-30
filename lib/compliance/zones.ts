export type ComplianceProfile =
  | "india_dpdp"
  | "eu_gdpr"
  | "gulf_uae_fdpl"
  | "international_imo";

export interface ComplianceZone {
  id: string;
  label: string;
  profile: ComplianceProfile;
  bbox: [number, number, number, number];
  lookAheadNm: number;
  disposalHours: number;
  legalBasis: string;
  hudColor: string;
}

export const INTERNATIONAL_COMPLIANCE_DEFAULT = {
  profile: "international_imo" as ComplianceProfile,
  lookAheadNm: 200,
  disposalHours: 48,
  legalBasis:
    "SOLAS V/19 + IMO MSC-FAL.1/Circ.3 - 200 nm forward display; no retained historical track.",
};

export const COMPLIANCE_ZONES: ComplianceZone[] = [
  {
    id: "india_eez_west",
    label: "Indian EEZ - Arabian Sea",
    profile: "india_dpdp",
    bbox: [60.0, 6.0, 78.0, 24.0],
    lookAheadNm: 150,
    disposalHours: 24,
    legalBasis:
      "DPDP Act 2023 sec. 8(7) - retain only for navigation purpose; dispose within 24 h of segment transit.",
    hudColor: "text-orange-400",
  },
  {
    id: "india_eez_east",
    label: "Indian EEZ - Bay of Bengal",
    profile: "india_dpdp",
    bbox: [78.0, 5.0, 95.0, 22.0],
    lookAheadNm: 150,
    disposalHours: 24,
    legalBasis:
      "DPDP Act 2023 sec. 8(7) - retain only for navigation purpose; dispose within 24 h of segment transit.",
    hudColor: "text-orange-400",
  },
  {
    id: "india_territorial",
    label: "Indian Territorial Waters (12 nm)",
    profile: "india_dpdp",
    bbox: [68.0, 16.5, 74.2, 23.5],
    lookAheadNm: 80,
    disposalHours: 1,
    legalBasis:
      "DPDP Act 2023 sec. 16 + IT Act SPDI Rules 2011 - territorial sea: immediate masking, 1 h disposal.",
    hudColor: "text-red-400",
  },
  {
    id: "eu_mediterranean",
    label: "EU Waters - Mediterranean",
    profile: "eu_gdpr",
    bbox: [-6.0, 30.0, 36.5, 46.0],
    lookAheadNm: 100,
    disposalHours: 0,
    legalBasis:
      "GDPR Art. 5(1)(e) storage limitation + Art. 25 privacy by design - no historical track retention.",
    hudColor: "text-blue-400",
  },
  {
    id: "eu_north_sea",
    label: "EU Waters - North Sea / English Channel",
    profile: "eu_gdpr",
    bbox: [-5.0, 48.5, 10.0, 58.0],
    lookAheadNm: 100,
    disposalHours: 0,
    legalBasis:
      "GDPR Art. 5(1)(e) + NIS2 Art. 21 - maritime transport: data minimisation and cyber risk management.",
    hudColor: "text-blue-400",
  },
  {
    id: "uae_gulf",
    label: "UAE/Gulf Jurisdiction - Persian Gulf",
    profile: "gulf_uae_fdpl",
    bbox: [48.0, 22.0, 57.5, 27.5],
    lookAheadNm: 80,
    disposalHours: 12,
    legalBasis:
      "UAE FDPL Art. 6/14 + Saudi PDPL Art. 29 - minimisation and restricted cross-border transfer.",
    hudColor: "text-yellow-400",
  },
  {
    id: "uae_gulf_of_oman",
    label: "UAE/Oman Jurisdiction - Gulf of Oman",
    profile: "gulf_uae_fdpl",
    bbox: [55.5, 22.0, 60.5, 26.5],
    lookAheadNm: 80,
    disposalHours: 12,
    legalBasis:
      "UAE FDPL Art. 6/14 - applies to UAE registered terminals and connected route processing.",
    hudColor: "text-yellow-400",
  },
];

export const COMPLIANCE_ZONE_BY_ID: Record<string, ComplianceZone> =
  Object.fromEntries(COMPLIANCE_ZONES.map((zone) => [zone.id, zone]));

export function findComplianceZones(
  lng: number,
  lat: number,
): ComplianceZone[] {
  return COMPLIANCE_ZONES.filter(
    (zone) =>
      lng >= zone.bbox[0] &&
      lng <= zone.bbox[2] &&
      lat >= zone.bbox[1] &&
      lat <= zone.bbox[3],
  );
}

export function classifyWaypoint(
  lng: number,
  lat: number,
): ComplianceZone | null {
  const matching = findComplianceZones(lng, lat);
  if (matching.length === 0) return null;

  return matching.reduce((current, candidate) => {
    if (candidate.lookAheadNm !== current.lookAheadNm) {
      return candidate.lookAheadNm < current.lookAheadNm
        ? candidate
        : current;
    }
    return candidate.disposalHours < current.disposalHours
      ? candidate
      : current;
  });
}

export function bboxToPolygon(
  [west, south, east, north]: [number, number, number, number],
): [number, number][] {
  return [
    [west, south],
    [east, south],
    [east, north],
    [west, north],
  ];
}
