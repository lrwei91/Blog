import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ContentArea } from "@/components/site/ContentArea";
import { defaultSiteConfig } from "@/lib/default-site-config";
import { buildFullModuleTestConfig } from "@/lib/full-module-test-config";
import { buildRenderModel } from "@/lib/utils";

describe("full module test config", () => {
  it("renders every optional life module with representative content", () => {
    const config = buildFullModuleTestConfig(defaultSiteConfig);
    const model = buildRenderModel(config);
    const html = renderToStaticMarkup(createElement(ContentArea, {
      topLevelBlocks: model.topLevelBlocks,
      orderedContentItems: model.orderedContentItems,
      desktopContentColumns: 3,
      enableImagePreview: true
    }));

    expect(html).toContain('data-content-group="now"');
    expect(html).toContain('class="now-status"');
    expect(html).toContain("正在把复杂的体验");
    expect(html).toContain('data-content-group="media"');
    expect(html).toContain('class="media-shelf"');
    expect(html.match(/media-shelf__card/g)).toHaveLength(8);
    expect(html).toContain("查看更多");
    expect(html).toContain('data-content-group="photos"');
    expect(html).toContain('class="photo-stories"');
    expect(html.match(/photo-stories__card/g)).toHaveLength(2);
  });
});
