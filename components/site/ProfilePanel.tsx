import type { Profile } from "@/types/profile";
import { ProfileModuleRenderer } from "@/components/site/ProfileModuleRenderer";
import { QualityStage } from "@/components/site/QualityStage";

const qualityStages = [
  { number: "01", label: "DEFINE", tone: "mint" },
  { number: "02", label: "VERIFY", tone: "cyan" },
  { number: "03", label: "AUTOMATE", tone: "pear" },
  { number: "04", label: "SHIP", tone: "coral" }
] as const;

export function ProfilePanel({ profile }: { profile: Profile }) {
  const showAvatar = profile.moduleOrder.includes("avatar") && profile.visibleModules.avatar;
  const visibleModules = profile.moduleOrder.filter((module) => module !== "avatar" && profile.visibleModules[module]);

  return (
    <section className="profile-hero" aria-labelledby="profile-name">
      <div className="profile-hero__content" data-reveal>
        <div className="profile-process" aria-label="质量工作流">
          {qualityStages.map((stage, index) => (
            <span key={stage.number} className="profile-process__item">
              <i data-tone={stage.tone} />
              <b>{stage.number}</b> {stage.label}
              {index < qualityStages.length - 1 ? <em /> : null}
            </span>
          ))}
        </div>

        <div className="profile-hero__modules">
          {visibleModules.map((module) => (
            <ProfileModuleRenderer key={module} module={module} profile={profile} />
          ))}
        </div>

        <p className="profile-hero__note">EVIDENCE FIRST · SYSTEMS THINKING · CONTINUOUS DELIVERY</p>
      </div>

      <QualityStage
        avatarUrl={profile.avatarUrl}
        displayName={profile.displayName}
        showAvatar={showAvatar}
      />
    </section>
  );
}
