"use client";

import { Copy, Github, Globe2, Instagram, LinkIcon, Linkedin, Mail, MapPin, MessagesSquare, Radio, Twitter, Youtube } from "lucide-react";
import { toast } from "sonner";
import type { Profile, ProfileModule } from "@/types/profile";
import { cn } from "@/lib/utils";

function Icon({ name }: { name?: string }) {
  const iconClass = "h-4 w-4";
  if (name === "github") return <Github className={iconClass} />;
  if (name === "twitter" || name === "x") return <Twitter className={iconClass} />;
  if (name === "weibo") return <Radio className={iconClass} />;
  if (name === "wechat") return <MessagesSquare className={iconClass} />;
  if (name === "instagram") return <Instagram className={iconClass} />;
  if (name === "linkedin") return <Linkedin className={iconClass} />;
  if (name === "youtube") return <Youtube className={iconClass} />;
  if (name === "website" || name === "globe") return <Globe2 className={iconClass} />;
  if (name === "mail" || name === "email") return <Mail className={iconClass} />;
  return <LinkIcon className={iconClass} />;
}

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
                    onClick={() => {
                      void navigator.clipboard.writeText(link.copyText || link.href || link.label);
                      toast.success("Copied");
                    }}
                    className={className}
                  >
                    <Icon name={link.icon} />
                    {link.label}
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
                  <Icon name={link.icon} />
                  {link.label}
                </a>
              );
            })}
        </div>
      );
    case "contact":
      return profile.email && profile.email !== "example@example.com" ? (
        <button
          type="button"
          onClick={() => {
            void navigator.clipboard.writeText(profile.email ?? "");
            toast.success("Email copied");
          }}
          className={cn("profile-module profile-module--contact profile-module__action")}
          data-profile-module="contact"
        >
          <Mail className="h-4 w-4" />
          {profile.email}
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
