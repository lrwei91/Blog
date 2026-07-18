import type { CSSProperties } from "react";
import { CHINA_MAP_VIEW_BOX, chinaProvincePaths } from "@/lib/china-map-paths";
import type { Block } from "@/types/block";

type TravelLocation = {
  city: string;
  province: string;
  note: string;
  longitude: number;
  latitude: number;
};

const fallbackLocations: TravelLocation[] = [
  { city: "福州", province: "福建", note: "常驻地 · 有福之州", longitude: 119.3, latitude: 26.08 },
  { city: "贵州", province: "贵州", note: "已到访", longitude: 106.71, latitude: 26.6 },
  { city: "成都", province: "四川", note: "已到访", longitude: 104.07, latitude: 30.67 },
  { city: "潮汕", province: "广东", note: "已到访", longitude: 116.68, latitude: 23.35 },
  { city: "江西", province: "江西", note: "已到访", longitude: 115.86, latitude: 28.68 }
];

export function TravelFootprint({ block }: { block: Block }) {
  const locations = getTravelLocations(block);
  const provinceCount = new Set(locations.map((location) => location.province)).size;

  return (
    <section className="travel-footprint" aria-label="旅行足迹">
      <div className="travel-footprint__summary">
        <div className="travel-footprint__copy">
          <p className="travel-footprint__stat">
            <b>{String(provinceCount).padStart(2, "0")}</b> 省 · <b>{String(locations.length).padStart(2, "0")}</b> 城
          </p>
          <h3>{block.title || "走过的每一个地方，都是故事"}</h3>
          {block.description?.trim() ? <p className="travel-footprint__intro">{block.description}</p> : null}
        </div>

        <ol className="travel-footprint__places">
          {locations.map((location, index) => (
            <li key={`${index}-${location.province}-${location.city}`}>
              <em>{String(index + 1).padStart(2, "0")}</em>
              <span>
                <b>{location.city}</b>
                <small>{location.province} · {location.note}</small>
              </span>
            </li>
          ))}
        </ol>
      </div>

      <div className="travel-footprint__map">
        <div className="travel-footprint__map-stage">
          <svg
            className="travel-footprint__china-map"
            viewBox={CHINA_MAP_VIEW_BOX}
            role="img"
            aria-label="中国省级行政区地图"
          >
            <title>中国省级行政区地图</title>
            <g>
              {chinaProvincePaths.map((province) => (
                <path
                  key={province.adcode}
                  d={province.d}
                  data-visited={locations.some((location) => province.name.includes(location.province)) ? "true" : undefined}
                />
              ))}
            </g>
          </svg>

          {locations.map((location, index) => {
            const position = projectLocation(location.longitude, location.latitude);
            return (
              <span
                key={`${index}-${location.province}-${location.city}`}
                className="travel-footprint__marker"
                style={
                  {
                    "--travel-x": `${position.x}%`,
                    "--travel-y": `${position.y}%`
                  } as CSSProperties
                }
              >
                <i />
                <b>{location.city}</b>
              </span>
            );
          })}
        </div>

        <div className="travel-footprint__legend" aria-hidden="true">
          <span><i data-tone="visited" /> 已到访省份</span>
        </div>
      </div>
    </section>
  );
}

function getTravelLocations(block: Block) {
  const locations = block.metadata?.travelLocations;
  if (!Array.isArray(locations)) return fallbackLocations;

  const validLocations = locations.flatMap((location) => {
    if (!location || typeof location !== "object") return [];
    const entry = location as Record<string, unknown>;
    if (
      typeof entry.city !== "string" ||
      typeof entry.province !== "string" ||
      typeof entry.note !== "string" ||
      typeof entry.longitude !== "number" ||
      typeof entry.latitude !== "number"
    ) return [];

    return [{
      city: entry.city,
      province: entry.province,
      note: entry.note,
      longitude: Math.min(135, Math.max(73, entry.longitude)),
      latitude: Math.min(54, Math.max(17, entry.latitude))
    }];
  });

  return validLocations;
}

function projectLocation(longitude: number, latitude: number) {
  const mapX = 30 + ((longitude - 73) / (135 - 73)) * 940;
  const mapY = 10 + ((54 - latitude) / (54 - 17)) * 680;
  return { mapX, mapY, x: mapX / 10, y: mapY / 7 };
}
