import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ExperienceModulePreview } from "@/components/admin/ExperienceModuleForm";
import { BlockCard } from "@/components/blocks/BlockCard";
import { getExperienceTimelineMeta } from "@/lib/experience-timeline";
import { defaultSiteConfig } from "@/lib/default-site-config";

describe("getExperienceTimelineMeta", () => {
  it("keeps the company logo empty for legacy experience entries", () => {
    const experience = defaultSiteConfig.blocks.find((block) => block.id === "job-baismgs");
    if (!experience) throw new Error("experience block missing");

    expect(getExperienceTimelineMeta(experience).companyLogo).toBe("");
  });

  it("reads and trims the configured company logo", () => {
    const experience = structuredClone(
      defaultSiteConfig.blocks.find((block) => block.id === "job-baismgs")
    );
    if (!experience) throw new Error("experience block missing");
    experience.metadata = {
      ...experience.metadata,
      companyLogo: " /images/logos/company.png "
    };

    expect(getExperienceTimelineMeta(experience).companyLogo).toBe("/images/logos/company.png");
  });

  it("removes the logo frame entirely when no company logo is configured", () => {
    const experience = structuredClone(
      defaultSiteConfig.blocks.find((block) => block.id === "job-baismgs")
    );
    if (!experience) throw new Error("experience block missing");

    const html = renderToStaticMarkup(createElement(BlockCard, {
      block: experience,
      withLayout: false,
      timelineMeta: getExperienceTimelineMeta(experience)
    }));

    expect(html).toContain('data-has-company-logo="false"');
    expect(html).not.toContain("experience-timeline__art");
  });

  it("keeps the logo frame when a company logo is configured", () => {
    const experience = structuredClone(
      defaultSiteConfig.blocks.find((block) => block.id === "job-baismgs")
    );
    if (!experience) throw new Error("experience block missing");
    experience.metadata = { ...experience.metadata, companyLogo: "/brand-seal.png" };

    const html = renderToStaticMarkup(createElement(BlockCard, {
      block: experience,
      withLayout: false,
      timelineMeta: getExperienceTimelineMeta(experience)
    }));

    expect(html).toContain('data-has-company-logo="true"');
    expect(html).toContain("experience-timeline__art");
    expect(html).toContain('src="/brand-seal.png"');
  });

  it("keeps the admin preview in sync with the empty-logo layout", () => {
    const experience = structuredClone(
      defaultSiteConfig.blocks.find((block) => block.id === "job-baismgs")
    );
    if (!experience) throw new Error("experience block missing");

    const html = renderToStaticMarkup(createElement(ExperienceModulePreview, {
      blocks: [experience]
    }));

    expect(html).toContain('data-has-company-logo="false"');
    expect(html).not.toContain('src="/brand-seal.png"');
  });
});
