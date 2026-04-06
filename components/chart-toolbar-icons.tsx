import type { ComponentType, FC } from "react";
import {
  Bell,
  Camera,
  Columns2,
  Globe,
  LayoutGrid,
  LineChart,
  Maximize2,
  Moon,
  Play,
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
export const ToolbarIconAlert = wrap(Bell, "ToolbarIconAlert");
export const ToolbarIconReplay = wrap(Play, "ToolbarIconReplay");
export const ToolbarIconUndo = wrap(Undo2, "ToolbarIconUndo");
export const ToolbarIconRedo = wrap(Redo2, "ToolbarIconRedo");
