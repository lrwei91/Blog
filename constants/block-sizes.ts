import type { BlockSize } from "@/types/block";

export const blockSizes: BlockSize[] = [
  "wide-short",
  "small-square",
  "wide",
  "large-square",
  "full-short",
  "full-wide",
  "full-tall",
  "full-square",
  "tall",
  "section-text"
];

export const blockSizeLabels: Record<BlockSize, string> = {
  "wide-short": "横向 2x1/2",
  "small-square": "小方块",
  wide: "横向 2 格",
  "large-square": "大方块 2x2",
  "full-short": "整行 3x1/2",
  "full-wide": "整行",
  "full-tall": "整行 3x2",
  "full-square": "整行 3x3",
  tall: "竖向",
  "section-text": "文本 Block"
};
