import type { ComponentType, FC } from "react";
import {
  Bell,
  CalendarDays,
  Camera,
  CandlestickChart,
  ChevronDown,
  Copy,
  Download,
  CircleUserRound,
  Columns2,
  FolderOpen,
  Globe,
  LayoutGrid,
  LineChart,
  Maximize2,
  Moon,
  PenLine,
  Play,
  Plus,
  Redo2,
  Search,
  Settings,
  Square,
  Sun,
  Undo2,
  type LucideProps,
} from "lucide-react";

const stroke = 1.5;
const size = 18;

function wrap(
  Icon: ComponentType<LucideProps>,
  displayName: string
): FC<LucideProps> {
  const Wrapped = ({ className, ...rest }: LucideProps) => (
    <Icon
      className={className}
      size={size}
      strokeWidth={stroke}
      aria-hidden
      {...rest}
    />
  );
  Wrapped.displayName = displayName;
  return Wrapped;
}

export const ToolbarIconIndicator = wrap(LineChart, "ToolbarIconIndicator");
export const ToolbarIconGlobe = wrap(Globe, "ToolbarIconGlobe");
export const ToolbarIconGear = wrap(Settings, "ToolbarIconGear");
export const ToolbarIconCamera = wrap(Camera, "ToolbarIconCamera");
export const ToolbarIconExpand = wrap(Maximize2, "ToolbarIconExpand");
export const ToolbarIconSun = wrap(Sun, "ToolbarIconSun");
export const ToolbarIconMoon = wrap(Moon, "ToolbarIconMoon");
export const ToolbarIconLayout1 = wrap(Square, "ToolbarIconLayout1");
export const ToolbarIconLayout2 = wrap(Columns2, "ToolbarIconLayout2");
export const ToolbarIconLayout4 = wrap(LayoutGrid, "ToolbarIconLayout4");
export const ToolbarIconSearch = wrap(Search, "ToolbarIconSearch");
export const ToolbarIconProfile = wrap(CircleUserRound, "ToolbarIconProfile");
export const ToolbarIconChevronDown = wrap(ChevronDown, "ToolbarIconChevronDown");
export const ToolbarIconChartType = wrap(CandlestickChart, "ToolbarIconChartType");
export const ToolbarIconAlert = wrap(Bell, "ToolbarIconAlert");
export const ToolbarIconReplay = wrap(Play, "ToolbarIconReplay");
export const ToolbarIconUndo = wrap(Undo2, "ToolbarIconUndo");
export const ToolbarIconRedo = wrap(Redo2, "ToolbarIconRedo");
export const ToolbarIconCopy = wrap(Copy, "ToolbarIconCopy");
export const ToolbarIconRename = wrap(PenLine, "ToolbarIconRename");
export const ToolbarIconDownload = wrap(Download, "ToolbarIconDownload");
export const ToolbarIconCreate = wrap(Plus, "ToolbarIconCreate");
export const ToolbarIconOpenLayout = wrap(FolderOpen, "ToolbarIconOpenLayout");
export const ToolbarIconCalendar = wrap(CalendarDays, "ToolbarIconCalendar");
