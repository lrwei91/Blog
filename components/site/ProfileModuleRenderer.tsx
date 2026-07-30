"use client";

import { Copy, Mail, MapPin } from "lucide-react";
import { toast } from "sonner";
import { SocialIcon } from "@/components/site/SocialIcon";
import type { Profile, ProfileModule } from "@/types/profile";
import { cn } from "@/lib/utils";

export function ProfileModuleRenderer({ module, profile }: { module: ProfileModule; profile: Profile }) {
  switch (module) {
    case "avatar":
      return (
        <div className="profile-module profile-module--avatar" data-profile-module="avatar">
          <img
            src={profile.avatarUrl || "/default-avatar.svg"}
            alt={profile.displayName}
            className="profile-module__avatar"
          />
        </div>
      );
    case "name": {
      const username = isPlaceholderHandle(profile.username) ? "" : profile.username;
      return (
        <div className="profile-module profile-module--name" data-profile-module="name">
          <h1 id="profile-name">{profile.displayName}</h1>
          {username ? <p>@{username}</p> : null}
        </div>
      );
    }
    case "headline":
      return profile.headline.trim() ? (
        <p className="profile-module profile-module--headline whitespace-pre-wrap" data-profile-module="headline">
          {profile.headline}
        </p>
      ) : null;
    case "bio":
      return profile.bio.trim() ? (
        <p className="profile-module profile-module--bio whitespace-pre-wrap" data-profile-module="bio">{profile.bio}</p>
      ) : null;
    case "tags":
      return (
        <div className="profile-module profile-module--tags" data-profile-module="tags">
          {profile.tags.map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
      );
    case "location":
      return profile.location?.trim() ? (
        <div className="profile-module profile-module--location" data-profile-module="location">
          <MapPin className="h-4 w-4" />
          <span>{profile.location}</span>
        </div>
      ) : null;
    case "socialLinks":
      return (
        <div className="profile-module profile-module--social" data-profile-module="socialLinks">
          {[...profile.socialLinks]
            .filter((link) => link.isVisible)
            .sort((a, b) => a.sortOrder - b.sortOrder)
            .map((link) => {
              const className =
                "profile-module__action";

              if (link.actionType === "copy") {
                return (
                  <button
                    key={link.id}
                    type="button"
                    onClick={() => void copyToClipboard(link.copyText || link.href || link.label, `${link.label} 已复制`)}
                    className={className}
                  >
                    <SocialIcon name={link.icon} />
                    <span className="truncate">{link.label}</span>
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                );
              }

              return (
                <a
                  key={link.id}
                  href={link.href}
                  target={link.openInNewTab === false ? "_self" : "_blank"}
                  rel="noreferrer"
                  className={className}
                >
                  <SocialIcon name={link.icon} />
                  <span className="truncate">{link.label}</span>
                </a>
              );
            })}
        </div>
      );
    case "contact":
      return profile.email && profile.email !== "example@example.com" ? (
        <button
          type="button"
          onClick={() => void copyToClipboard(profile.email ?? "", "邮箱地址已复制")}
          className={cn("profile-module profile-module--contact profile-module__action")}
          data-profile-module="contact"
        >
          <Mail className="h-4 w-4" />
          <span className="truncate">{profile.email}</span>
          <Copy className="h-3.5 w-3.5" />
        </button>
      ) : null;
    case "latestPosts":
      return null;
    default:
      return null;
  }
}

function isPlaceholderHandle(value?: string) {
  return value?.trim().replace(/^@/, "").toLowerCase() === "your-handle";
}

async function copyToClipboard(value: string, successMessage: string) {
  try {
    await navigator.clipboard.writeText(value);
    toast.success(successMessage);
  } catch {
    toast.error("复制失败，请手动复制");
  }
}
