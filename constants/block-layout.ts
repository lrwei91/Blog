import type { CSSProperties } from "react";
import type { Block, BlockSize, LayoutDevice } from "@/types/block";

export const blockGridClass = "block-grid grid grid-flow-dense grid-cols-12 gap-4";

export const blockGridClassByDevice: Record<LayoutDevice, string> = {
  desktop: "admin-block-grid grid gap-4",
  mobile: "admin-block-grid grid gap-4"
};

export const blockSizeClassByDevice: Record<LayoutDevice, Record<BlockSize, string>> = {
  desktop: {
    "wide-short": "col-span-8 row-span-1",
    "small-square": "col-span-4 row-span-2",
    wide: "col-span-8 row-span-2",
    "large-square": "col-span-8 row-span-4",
    "full-short": "col-span-12 row-span-1",
    "full-wide": "col-span-12 row-span-2",
    "full-tall": "col-span-12 row-span-4",
    "full-square": "col-span-12 row-span-6",
    tall: "col-span-4 row-span-4",
    "section-text": "col-span-12 row-span-2"
  },
  mobile: {
    "wide-short": "col-span-12 row-span-1",
    "small-square": "col-span-6 row-span-2",
    wide: "col-span-12 row-span-2",
    "large-square": "col-span-12 row-span-4",
    "full-short": "col-span-12 row-span-1",
    "full-wide": "col-span-12 row-span-2",
    "full-tall": "col-span-12 row-span-4",
    "full-square": "col-span-12 row-span-6",
    tall: "col-span-6 row-span-4",
    "section-text": "col-span-12 row-span-2"
  }
};

export const blockSizeClass = blockSizeClassByDevice.desktop;

export function getBlockSize(block: Block, device: LayoutDevice) {
  if (block.size === "section-text") return "section-text";
  return block.responsiveSizes?.[device] ?? block.size;
}

export function getPublicBlockSizeClass() {
  return "block-placement";
}

export function getDefaultGridSpan(size: BlockSize, device: LayoutDevice) {
  if (size === "section-text") return 12;
  if (device === "mobile") {
    return size === "small-square" || size === "tall" ? 6 : 12;
  }
  if (size === "small-square" || size === "tall") return 4;
  if (size === "wide" || size === "wide-short") return 8;
  if (size === "large-square") return 8;
  return 12;
}

export function getLogicalColumnCount(device: LayoutDevice) {
  return device === "desktop" ? 3 : 2;
}

export function getLogicalColumnSpan(size: BlockSize, device: LayoutDevice) {
  const baseSpan = device === "desktop" ? 4 : 6;
  return getDefaultGridSpan(size, device) / baseSpan;
}

export function getDefaultRowSpan(size: BlockSize) {
  if (size === "wide-short" || size === "full-short") return 1;
  if (size === "full-square") return 6;
  if (size === "large-square" || size === "tall" || size === "full-tall") return 4;
  return 2;
}

export function getBlockLogicalColumnStart(block: Block, device: LayoutDevice) {
  const rawColumnStart = block.placements?.[device]?.columnStart;
  if (!rawColumnStart) return undefined;

  const size = getBlockSize(block, device);
  const logicalColumns = getLogicalColumnCount(device);
  const logicalSpan = getLogicalColumnSpan(size, device);
  const maxColumnStart = logicalColumns - logicalSpan + 1;
  const baseSpan = device === "desktop" ? 4 : 6;
  const logicalColumnStart =
    rawColumnStart > logicalColumns ? Math.round((rawColumnStart - 1) / baseSpan) + 1 : rawColumnStart;

  return Math.max(1, Math.min(maxColumnStart, logicalColumnStart));
}

export function getBlockColumnStart(block: Block, device: LayoutDevice) {
  const logicalColumnStart = getBlockLogicalColumnStart(block, device);
  if (!logicalColumnStart) return undefined;
  const baseSpan = device === "desktop" ? 4 : 6;
  return (logicalColumnStart - 1) * baseSpan + 1;
}

export function getBlockRowStart(block: Block, device: LayoutDevice) {
  const rawRowStart = block.placements?.[device]?.rowStart;
  if (!rawRowStart) return undefined;
  return Math.max(1, Math.min(240, rawRowStart));
}

export function getAdminBlockGridStyle(block: Block, device: LayoutDevice, size: BlockSize): CSSProperties {
  const columnStart = getBlockColumnStart({ ...block, responsiveSizes: { ...block.responsiveSizes, [device]: size } }, device);
  const rowStart = getBlockRowStart(block, device);
  return {
    gridColumnStart: columnStart,
    gridColumnEnd: `span ${getDefaultGridSpan(size, device)}`,
    gridRowStart: rowStart,
    gridRowEnd: `span ${getDefaultRowSpan(size)}`
  };
}

type GridItem = {
  id: string;
  block: Block;
};

type GridPlacement = {
  column: number;
  row: number;
  columnSpan: number;
  rowSpan: number;
};

export function getCompactedBlockGridStyles(items: GridItem[], device: LayoutDevice): Map<string, CSSProperties> {
  const placements = new Map<string, GridPlacement>();
  const occupied: boolean[][] = [];

  for (const item of items) {
    const size = getBlockSize(item.block, device);
    const columnSpan = getDefaultGridSpan(size, device);
    const rowSpan = getDefaultRowSpan(size);
    const preferredColumn = getBlockColumnStart(item.block, device);
    const preferredRow = getBlockRowStart(item.block, device);
    const placement = placeGridItem(occupied, 12, columnSpan, rowSpan, preferredColumn, preferredRow);
    placements.set(item.id, placement);
  }

  const occupiedRows = new Set<number>();
  for (const placement of placements.values()) {
    for (let row = placement.row; row < placement.row + placement.rowSpan; row += 1) {
      occupiedRows.add(row);
    }
  }
  const compactedRowByOriginal = new Map<number, number>();
  [...occupiedRows]
    .sort((a, b) => a - b)
    .forEach((row, index) => compactedRowByOriginal.set(row, index));

  const styles = new Map<string, CSSProperties>();
  for (const [id, placement] of placements.entries()) {
    styles.set(id, {
      gridColumnStart: placement.column + 1,
      gridColumnEnd: `span ${placement.columnSpan}`,
      gridRowStart: (compactedRowByOriginal.get(placement.row) ?? placement.row) + 1,
      gridRowEnd: `span ${placement.rowSpan}`
    });
  }

  return styles;
}

function placeGridItem(
  occupied: boolean[][],
  columns: number,
  rawColumnSpan: number,
  rawRowSpan: number,
  rawColumnStart?: number,
  rawRowStart?: number
): GridPlacement {
  const columnSpan = Math.max(1, Math.min(columns, rawColumnSpan));
  const rowSpan = Math.max(1, rawRowSpan);
  const preferredColumn = rawColumnStart ? Math.max(0, Math.min(columns - columnSpan, rawColumnStart - 1)) : null;
  const preferredRow = rawRowStart ? Math.max(0, Math.min(239, rawRowStart - 1)) : null;
  const rowsToTry =
    preferredRow === null
      ? Array.from({ length: 240 }, (_, row) => row)
      : [preferredRow, ...Array.from({ length: 240 }, (_, row) => row).filter((row) => row !== preferredRow)];

  for (const row of rowsToTry) {
    ensureGridRows(occupied, row + rowSpan, columns);
    const columnsToTry =
      preferredColumn === null
        ? Array.from({ length: columns - columnSpan + 1 }, (_, column) => column)
        : [
            preferredColumn,
            ...Array.from({ length: columns - columnSpan + 1 }, (_, column) => column).filter(
              (column) => column !== preferredColumn
            )
          ];

    for (const column of columnsToTry) {
      if (!canPlaceGridItem(occupied, column, row, columnSpan, rowSpan)) continue;
      occupyGridItem(occupied, column, row, columnSpan, rowSpan);
      return { column, row, columnSpan, rowSpan };
    }
  }

  return { column: 0, row: occupied.length, columnSpan, rowSpan };
}

function ensureGridRows(occupied: boolean[][], rowCount: number, columns: number) {
  while (occupied.length < rowCount) {
    occupied.push(Array.from({ length: columns }, () => false));
  }
}

function canPlaceGridItem(
  occupied: boolean[][],
  column: number,
  row: number,
  columnSpan: number,
  rowSpan: number
) {
  for (let rowOffset = 0; rowOffset < rowSpan; rowOffset += 1) {
    for (let columnOffset = 0; columnOffset < columnSpan; columnOffset += 1) {
      if (occupied[row + rowOffset]?.[column + columnOffset]) return false;
    }
  }
  return true;
}

function occupyGridItem(occupied: boolean[][], column: number, row: number, columnSpan: number, rowSpan: number) {
  for (let rowOffset = 0; rowOffset < rowSpan; rowOffset += 1) {
    for (let columnOffset = 0; columnOffset < columnSpan; columnOffset += 1) {
      occupied[row + rowOffset][column + columnOffset] = true;
    }
  }
}

export function getPublicBlockPlacementStyle(
  block: Block,
  compacted?: Partial<Record<LayoutDevice, CSSProperties>>
): CSSProperties & Record<string, string | number | undefined> {
  const mobileSize = getBlockSize(block, "mobile");
  const desktopSize = getBlockSize(block, "desktop");
  const mobileColumnStart = compacted?.mobile?.gridColumnStart ?? getBlockColumnStart(block, "mobile");
  const desktopColumnStart = compacted?.desktop?.gridColumnStart ?? getBlockColumnStart(block, "desktop");
  const mobileRowStart = compacted?.mobile?.gridRowStart ?? getBlockRowStart(block, "mobile");
  const desktopRowStart = compacted?.desktop?.gridRowStart ?? getBlockRowStart(block, "desktop");
  const mobileColumnEnd = compacted?.mobile?.gridColumnEnd ?? `span ${getDefaultGridSpan(mobileSize, "mobile")}`;
  const desktopColumnEnd = compacted?.desktop?.gridColumnEnd ?? `span ${getDefaultGridSpan(desktopSize, "desktop")}`;
  const mobileRowEnd = compacted?.mobile?.gridRowEnd ?? `span ${getDefaultRowSpan(mobileSize)}`;
  const desktopRowEnd = compacted?.desktop?.gridRowEnd ?? `span ${getDefaultRowSpan(desktopSize)}`;

  return {
    "--block-mobile-column-start": mobileColumnStart,
    "--block-mobile-column-end": mobileColumnEnd,
    "--block-desktop-column-start": desktopColumnStart,
    "--block-desktop-column-end": desktopColumnEnd,
    "--block-mobile-row-start": mobileRowStart,
    "--block-mobile-row-end": mobileRowEnd,
    "--block-desktop-row-start": desktopRowStart,
    "--block-desktop-row-end": desktopRowEnd
  };
}
