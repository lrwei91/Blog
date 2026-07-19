"use client";

import { ChevronLeft, ChevronRight, Images, MapPin, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { Block } from "@/types/block";
import { readPhotoStories } from "@/lib/life-modules";

type Selection = { storyIndex: number; photoIndex: number } | null;

export function PhotoStories({ block, enablePreview }: { block: Block; enablePreview: boolean }) {
  const stories = useMemo(() => readPhotoStories(block.metadata?.photoStories), [block]);
  const [selection, setSelection] = useState<Selection>(null);
  const selectedStory = selection ? stories[selection.storyIndex] : null;
  const selectedPhoto = selectedStory && selection ? selectedStory.photos[selection.photoIndex] : null;

  const movePhoto = useCallback((direction: -1 | 1) => {
    setSelection((current) => {
      if (!current) return null;
      const photos = stories[current.storyIndex]?.photos ?? [];
      if (photos.length < 2) return current;
      return { ...current, photoIndex: (current.photoIndex + direction + photos.length) % photos.length };
    });
  }, [stories]);

  useEffect(() => {
    if (!selection) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelection(null);
      if (event.key === "ArrowLeft") movePhoto(-1);
      if (event.key === "ArrowRight") movePhoto(1);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [selection, movePhoto]);

  return (
    <section className="photo-stories" aria-label="照片故事">
      {stories.length > 0 ? (
        <div className="photo-stories__grid">
          {stories.map((story, storyIndex) => {
            const cover = story.photos[0];
            const content = (
              <>
                <div className="photo-stories__cover">
                  {cover ? <img src={cover.url} alt={cover.alt} /> : <span><Images aria-hidden="true" /></span>}
                  <b><Images aria-hidden="true" /> {story.photos.length}</b>
                </div>
                <div className="photo-stories__body">
                  {[story.date, story.location].filter(Boolean).length > 0 ? (
                    <p>{[story.date, story.location].filter(Boolean).join(" · ")}</p>
                  ) : null}
                  <h3>{story.title}</h3>
                  {story.summary ? <span>{story.summary}</span> : null}
                  {story.location ? <small><MapPin aria-hidden="true" /> {story.location}</small> : null}
                </div>
              </>
            );
            return enablePreview && cover ? (
              <button className="photo-stories__card" key={story.id} type="button" onClick={() => setSelection({ storyIndex, photoIndex: 0 })}>
                {content}
              </button>
            ) : <article className="photo-stories__card" key={story.id}>{content}</article>;
          })}
        </div>
      ) : <p className="life-module-empty">照片故事还没有内容。</p>}

      {selection && selectedStory && selectedPhoto ? (
        <div className="photo-lightbox" role="dialog" aria-modal="true" aria-label={selectedStory.title} onMouseDown={(event) => event.target === event.currentTarget && setSelection(null)}>
          <button className="photo-lightbox__close" type="button" onClick={() => setSelection(null)} aria-label="关闭预览"><X /></button>
          <div className="photo-lightbox__panel">
            <img src={selectedPhoto.url} alt={selectedPhoto.alt} />
            <div className="photo-lightbox__caption">
              <span><b>{selectedStory.title}</b><small>{selectedPhoto.caption || selectedPhoto.alt}</small></span>
              <em>{selection.photoIndex + 1} / {selectedStory.photos.length}</em>
            </div>
          </div>
          {selectedStory.photos.length > 1 ? (
            <>
              <button className="photo-lightbox__nav photo-lightbox__nav--prev" type="button" onClick={() => movePhoto(-1)} aria-label="上一张"><ChevronLeft /></button>
              <button className="photo-lightbox__nav photo-lightbox__nav--next" type="button" onClick={() => movePhoto(1)} aria-label="下一张"><ChevronRight /></button>
            </>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
