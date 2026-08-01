"use client";

import { ChevronLeft, ChevronRight, Images, MapPin, X } from "lucide-react";
import { useCallback, useEffect, useId, useMemo, useRef, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import type { Block } from "@/types/block";
import type { PhotoStory, PhotoStoryImage } from "@/types/life-modules";
import { readPhotoStories } from "@/lib/life-modules";
import { useAccessibleDialog } from "@/components/ui/useAccessibleDialog";
import { useExitTransition } from "@/components/ui/useExitTransition";

type Selection = { storyIndex: number; photoIndex: number } | null;

export function PhotoStories({ block, enablePreview }: { block: Block; enablePreview: boolean }) {
  const stories = useMemo(() => readPhotoStories(block.metadata?.photoStories), [block]);
  const [selection, setSelection] = useState<Selection>(null);
  const [dialogContainer, setDialogContainer] = useState<Element | null>(null);
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
                </div>
                <div className="photo-stories__body">
                  {[story.date, story.location].filter(Boolean).length > 0 ? (
                    <p>{[story.date, story.location].filter(Boolean).join(" / ")}</p>
                  ) : null}
                  <h3>{story.title}</h3>
                  {story.summary ? <span>{story.summary}</span> : null}
                  <small><Images aria-hidden="true" /> {story.photos.length} 张照片</small>
                  {story.location ? <small><MapPin aria-hidden="true" /> {story.location}</small> : null}
                </div>
              </>
            );
            return enablePreview && cover ? (
              <button
                className="photo-stories__card"
                key={story.id}
                type="button"
                data-reveal="card"
                style={{ "--reveal-index": storyIndex } as CSSProperties}
                onClick={(event) => {
                  setDialogContainer(event.currentTarget.closest(".public-site"));
                  setSelection({ storyIndex, photoIndex: 0 });
                }}
              >
                {content}
              </button>
            ) : (
              <article
                className="photo-stories__card"
                key={story.id}
                data-reveal="card"
                style={{ "--reveal-index": storyIndex } as CSSProperties}
              >
                {content}
              </article>
            );
          })}
        </div>
      ) : <p className="life-module-empty">照片故事还没有内容。</p>}

      {selection && selectedStory && selectedPhoto ? (
        <PhotoLightbox
          story={selectedStory}
          photo={selectedPhoto}
          photoIndex={selection.photoIndex}
          container={dialogContainer}
          onClose={() => setSelection(null)}
          onMove={movePhoto}
        />
      ) : null}
    </section>
  );
}

function PhotoLightbox({
  story,
  photo,
  photoIndex,
  container,
  onClose,
  onMove
}: {
  story: PhotoStory;
  photo: PhotoStoryImage;
  photoIndex: number;
  container: Element | null;
  onClose: () => void;
  onMove: (direction: -1 | 1) => void;
}) {
  const titleId = useId();
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const { isClosing, requestClose } = useExitTransition(onClose);
  const { overlayRef, dialogRef } = useAccessibleDialog({
    onClose: requestClose,
    portalRoot: container,
    initialFocusRef: closeButtonRef
  });

  useEffect(() => {
    function moveWithArrowKeys(event: KeyboardEvent) {
      if (event.key === "ArrowLeft") onMove(-1);
      if (event.key === "ArrowRight") onMove(1);
    }

    document.addEventListener("keydown", moveWithArrowKeys);
    return () => document.removeEventListener("keydown", moveWithArrowKeys);
  }, [onMove]);

  return createPortal(
    <div
      ref={overlayRef}
      className={`photo-lightbox${isClosing ? " is-closing" : ""}`}
      role="presentation"
      onMouseDown={(event) => event.target === event.currentTarget && requestClose()}
    >
      <div
        ref={dialogRef}
        className="photo-lightbox__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
      >
        <button ref={closeButtonRef} className="photo-lightbox__close" type="button" onClick={requestClose} aria-label="关闭预览">
          <X aria-hidden="true" />
        </button>
        <img src={photo.url} alt={photo.alt} />
        <div className="photo-lightbox__caption">
          <span><b id={titleId}>{story.title}</b><small>{photo.caption || photo.alt}</small></span>
          <em>{photoIndex + 1} / {story.photos.length}</em>
        </div>
        {story.photos.length > 1 ? (
          <>
            <button className="photo-lightbox__nav photo-lightbox__nav--prev" type="button" onClick={() => onMove(-1)} aria-label="上一张">
              <ChevronLeft aria-hidden="true" />
            </button>
            <button className="photo-lightbox__nav photo-lightbox__nav--next" type="button" onClick={() => onMove(1)} aria-label="下一张">
              <ChevronRight aria-hidden="true" />
            </button>
          </>
        ) : null}
      </div>
    </div>,
    container ?? document.body
  );
}
