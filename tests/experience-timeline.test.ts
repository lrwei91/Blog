import { describe, expect, it } from "vitest";
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
});
