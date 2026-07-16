import { Quote, ScanSearch, ShieldCheck, Workflow } from "lucide-react";

export function QualityStage({
  avatarUrl,
  showAvatar
}: {
  avatarUrl?: string;
  showAvatar: boolean;
}) {
  return (
    <div className="quality-stage" data-reveal>
      <div className="quality-stage__orbit" aria-hidden="true">
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
        <span className="quality-stage__signal-icon" aria-hidden="true"><Quote /></span>
        <span>
          <b><i /> PERSONAL MOTTO</b>
          <small>春风若有怜花意，可否许我再少年？</small>
        </span>
      </div>
    </div>
  );
}
