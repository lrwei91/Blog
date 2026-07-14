import type { Block } from "@/types/block";
import { cn } from "@/lib/utils";

export function TextBlock({ block }: { block: Block }) {
  if (block.metadata?.textVariant === "plain") {
    const rawTextAlign = block.metadata.textAlign;
    const rawVerticalAlign = block.metadata.verticalAlign;
    const textAlign = rawTextAlign === "left" || rawTextAlign === "right" ? rawTextAlign : "center";
    const verticalAlign = rawVerticalAlign === "top" || rawVerticalAlign === "bottom" ? rawVerticalAlign : "center";
    const text = block.description || block.title;

    return (
      <div
        className={cn(
          "flex h-full min-h-0 w-full",
          verticalAlign === "top" && "items-start",
          verticalAlign === "center" && "items-center",
          verticalAlign === "bottom" && "items-end"
        )}
      >
        <p
          className={cn(
            "w-full whitespace-pre-wrap text-lg leading-7",
            textAlign === "left" && "text-left",
            textAlign === "center" && "text-center",
            textAlign === "right" && "text-right",
            block.metadata.textBold === true ? "font-bold" : "font-semibold",
            block.metadata.textItalic === true && "italic",
            block.metadata.textUnderline === true && "underline"
          )}
        >
          {text}
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-2">
      {block.title ? <h3 className="text-lg font-semibold">{block.title}</h3> : null}
      {block.description ? <p className="line-clamp-5 text-sm leading-6 text-[#555]">{block.description}</p> : null}
    </div>
  );
}
