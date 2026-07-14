export type BlockSize =
  | "wide-short"
  | "small-square"
  | "wide"
  | "large-square"
  | "full-short"
  | "full-wide"
  | "full-tall"
  | "full-square"
  | "tall"
  | "section-text";
export type LayoutDevice = "desktop" | "mobile";

export type BlockPlacement = {
  columnStart?: number;
  rowStart?: number;
};

export type BlockActionType =
  | "none"
  | "link"
  | "image-preview"
  | "modal"
  | "copy"
  | "download";

export type Block = {
  id: string;
  sectionId: string;
  title: string;
  subtitle?: string;
  description?: string;
  size: BlockSize;
  responsiveSizes?: Partial<Record<LayoutDevice, BlockSize>>;
  placements?: Partial<Record<LayoutDevice, BlockPlacement>>;
  coverImage?: string;
  icon?: string;
  badge?: string;
  href?: string;
  actionType: BlockActionType;
  openInNewTab?: boolean;
  backgroundColor?: string;
  textColor?: string;
  metadata?: Record<string, unknown>;
  isVisible: boolean;
  isFeatured: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};
