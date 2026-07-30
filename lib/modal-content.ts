export function isModalSectionHeading(section: string) {
  const value = section.trim();
  if (!value || value.startsWith("•")) return false;
  if (value.length <= 20) return true;
  return /^[^。\n]{2,16}\s*[|｜]\s*\d{4}(?:[./年-]\d{1,2})/.test(value);
}
