import {
  Award,
  BedDouble,
  Briefcase,
  ClipboardCheck,
  Coins,
  Compass,
  FileText,
  Globe2,
  GraduationCap,
  HeartHandshake,
  Library,
  MapPin,
  PartyPopper,
  Plane,
  Stethoscope,
  Wallet,
  type LucideIcon,
} from "lucide-react";

/**
 * Icon per top-level FAQ category, keyed by the backend's stable category id.
 *
 * The backend's category set does change (ids are slugs of editable labels), so
 * unknown ids fall back to a neutral icon rather than breaking the grid, and a
 * few superseded ids are kept as aliases.
 */
const CATEGORY_ICONS: Record<string, LucideIcon> = {
  "bdu-virtual-tur": Compass,
  "qebul-ve-qeydiyyat": ClipboardCheck,
  "fakulteler-ve-ixtisaslar": GraduationCap,
  yerlesme: MapPin,
  "maliyye-ve-odenisler": Wallet,
  teqaud: Coins,
  yataqxana: BedDouble,
  "poliklinika-ve-tibbi-xidmet": Stethoscope,
  kitabxana: Library,
  "telebe-heyati": PartyPopper,
  "mubadile-ve-tecrube-proqramlari": Plane,
  "beynelxalq-emekdasliq-ikili-diplom-proqr": Globe2,
  "karyera-ve-mezunlar": Briefcase,
  "psixoloji-destek": HeartHandshake,
  "diplom-ve-senedler": FileText,

  // Superseded / alternative slugs kept so a backend rename doesn't silently
  // drop an icon back to the fallback.
  "magistratura-ixtisaslari": Award,
  "beynelxalq-emekdasliq": Globe2,
  "tecrube-ve-mubadile-proqramlari": Plane,
};

/** Keeps unknown ids (new backend categories) looking intentional. */
export const FALLBACK_CATEGORY_ICON: LucideIcon = Compass;

export function iconForCategory(id: string): LucideIcon {
  return CATEGORY_ICONS[id] ?? FALLBACK_CATEGORY_ICON;
}
