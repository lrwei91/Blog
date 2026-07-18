import type { Profile } from "@/types/profile";
import { ProfileModuleRenderer } from "@/components/site/ProfileModuleRenderer";
import { QualityStage } from "@/components/site/QualityStage";

export function ProfilePanel({ profile }: { profile: Profile }) {
  const showAvatar = profile.moduleOrder.includes("avatar") && profile.visibleModules.avatar;
  const visibleModules = profile.moduleOrder.filter((module) => module !== "avatar" && profile.visibleModules[module]);

  return (
    <section className="profile-hero" aria-labelledby="profile-name">
      <div className="profile-hero__content" data-reveal>
        <div className="profile-hero__modules">
          {visibleModules.map((module) => (
            <ProfileModuleRenderer key={module} module={module} profile={profile} />
          ))}
        </div>
      </div>

      <QualityStage
        avatarUrl={profile.avatarUrl}
        showAvatar={showAvatar}
      />
    </section>
  );
}
