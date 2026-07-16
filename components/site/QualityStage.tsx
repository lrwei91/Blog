import { ScanSearch, ShieldCheck, Workflow } from "lucide-react";

export function QualityStage({
  avatarUrl,
  displayName,
  showAvatar
}: {
  avatarUrl?: string;
  displayName: string;
  showAvatar: boolean;
}) {
  return (
    <div className="quality-stage" data-reveal aria-hidden="true">
      <div className="quality-stage__orbit">
        <span className="quality-stage__ring quality-stage__ring--outer" />
        <span className="quality-stage__ring quality-stage__ring--inner" />
        <span className="quality-stage__node quality-stage__node--one"><ScanSearch /></span>
        <span className="quality-stage__node quality-stage__node--two"><Workflow /></span>
        <span className="quality-stage__node quality-stage__node--three"><ShieldCheck /></span>
        <div className="quality-stage__portrait">
          {showAvatar ? (
            <img src={avatarUrl || "/default-avatar.svg"} alt="" />
          ) : (
            <span>QA</span>
          )}
          <i />
        </div>
      </div>

      <div className="quality-stage__signal">
        <span className="quality-stage__signal-icon"><ShieldCheck /></span>
        <span>
          <b><i /> QUALITY SYSTEM · ACTIVE</b>
          <small>{displayName} · DEFINE → VERIFY → SHIP</small>
        </span>
      </div>
    </div>
  );
}
