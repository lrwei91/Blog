import { describe, expect, it } from "vitest";
import { isModalSectionHeading } from "@/lib/modal-content";

describe("isModalSectionHeading", () => {
  it.each([
    "系统策划 | 2021.05—2024.05",
    "测试工程师 | 2017.06—2021.04",
    "系统策划阶段：",
    "代表项目"
  ])("recognizes section heading: %s", (value) => {
    expect(isModalSectionHeading(value)).toBe(true);
  });

  it.each([
    "• 制定并执行游戏版本测试计划，负责用例设计、环境搭建和功能验证。",
    "这是一段长度超过二十个字符的普通工作经历描述，不应被展示成标题。"
  ])("keeps body copy as normal text: %s", (value) => {
    expect(isModalSectionHeading(value)).toBe(false);
  });
});
