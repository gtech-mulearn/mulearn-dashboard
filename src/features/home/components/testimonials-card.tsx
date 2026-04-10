"use client";

import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { textTestimonials, videoTestimonials } from "../data/testimonials";

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function TestimonialsCard() {
  const [activeVideoIndex, setActiveVideoIndex] = useState(0);
  const [activeTextPage, setActiveTextPage] = useState(0);
  const lastWheelAtRef = useRef(0);

  const safeVideoIndex = useMemo(() => {
    if (videoTestimonials.length === 0) {
      return 0;
    }
    return activeVideoIndex % videoTestimonials.length;
  }, [activeVideoIndex]);

  const activeVideo =
    videoTestimonials[safeVideoIndex] ?? videoTestimonials[0] ?? null;

  const goToNextVideo = () => {
    setActiveVideoIndex((prev) =>
      videoTestimonials.length === 0
        ? 0
        : (prev + 1) % videoTestimonials.length,
    );
  };

  const goToPrevVideo = () => {
    setActiveVideoIndex((prev) =>
      videoTestimonials.length === 0
        ? 0
        : (prev - 1 + videoTestimonials.length) % videoTestimonials.length,
    );
  };

  useEffect(() => {
    if (videoTestimonials.length <= 1) {
      return;
    }

    const intervalId = setInterval(() => {
      setActiveVideoIndex((prev) => (prev + 1) % videoTestimonials.length);
    }, 4500);

    return () => clearInterval(intervalId);
  }, []);

  const textPages = useMemo(() => {
    const pages: (typeof textTestimonials)[] = [];
    for (let index = 0; index < textTestimonials.length; index += 2) {
      pages.push(textTestimonials.slice(index, index + 2));
    }
    return pages;
  }, []);

  const safeTextPage = useMemo(() => {
    if (textPages.length === 0) {
      return 0;
    }
    return activeTextPage % textPages.length;
  }, [activeTextPage, textPages.length]);

  const visibleTextTestimonials = textPages[safeTextPage] ?? [];

  const goToNextTextPage = () => {
    setActiveTextPage((prev) =>
      textPages.length === 0 ? 0 : (prev + 1) % textPages.length,
    );
  };

  const goToPrevTextPage = () => {
    setActiveTextPage((prev) =>
      textPages.length === 0
        ? 0
        : (prev - 1 + textPages.length) % textPages.length,
    );
  };

  const handleTextWheel: React.WheelEventHandler<HTMLDivElement> = (event) => {
    if (textPages.length <= 1) {
      return;
    }

    event.preventDefault();

    const now = Date.now();
    if (now - lastWheelAtRef.current < 350) {
      return;
    }
    lastWheelAtRef.current = now;

    if (event.deltaY > 0) {
      goToNextTextPage();
      return;
    }

    if (event.deltaY < 0) {
      goToPrevTextPage();
    }
  };

  return (
    <Card className="rounded-2xl border-none bg-card p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md md:p-6">
      <Tabs defaultValue="video" className="w-full">
        <TabsList className="mb-5 grid h-auto w-full grid-cols-2 gap-1 rounded-xl bg-muted/60 p-1">
          <TabsTrigger
            value="video"
            className="!flex-none h-auto min-h-10 w-full whitespace-normal break-words rounded-lg px-2 py-2 text-center text-[11px] leading-tight sm:text-xs md:text-sm data-[state=active]:bg-[var(--primary)] data-[state=active]:text-primary-foreground"
          >
            Video Testimonials
          </TabsTrigger>
          <TabsTrigger
            value="text"
            className="!flex-none h-auto min-h-10 w-full whitespace-normal break-words rounded-lg px-2 py-2 text-center text-[11px] leading-tight sm:text-xs md:text-sm data-[state=active]:bg-[var(--chart-2)] data-[state=active]:text-foreground"
          >
            Community Feedback
          </TabsTrigger>
        </TabsList>

        <TabsContent value="video" className="mt-0">
          <div className="space-y-4">
            {activeVideo ? (
              <div className="max-w-full overflow-hidden rounded-2xl border border-border/50 bg-background shadow-sm">
                <div className="min-w-0 space-y-1 px-4 pt-4">
                  <h3 className="truncate font-semibold text-foreground">
                    {activeVideo.name}
                  </h3>
                  <p className="truncate text-xs text-muted-foreground">
                    {activeVideo.label ?? "Mulearn Community"}
                  </p>
                </div>

                <div className="relative mt-3 aspect-video w-full max-w-full overflow-hidden bg-muted">
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/${activeVideo.videoUrl}`}
                    title={`Video testimonial by ${activeVideo.name}`}
                    className="h-full w-full"
                    loading="lazy"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                  />

                  <Button
                    type="button"
                    size="icon"
                    variant="secondary"
                    className="absolute left-3 top-1/2 z-10 size-8 -translate-y-1/2 rounded-full bg-background/85 shadow-sm backdrop-blur-sm"
                    onClick={goToPrevVideo}
                    aria-label="Previous testimonial video"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    size="icon"
                    variant="secondary"
                    className="absolute right-3 top-1/2 z-10 size-8 -translate-y-1/2 rounded-full bg-background/85 shadow-sm backdrop-blur-sm"
                    onClick={goToNextVideo}
                    aria-label="Next testimonial video"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : null}

            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-1.5">
                {videoTestimonials.map((video, idx) => (
                  <button
                    key={`${video.name}-${video.videoUrl}`}
                    type="button"
                    onClick={() => setActiveVideoIndex(idx)}
                    className={
                      idx === safeVideoIndex
                        ? "h-1.5 w-7 rounded-full bg-[var(--primary)]"
                        : "h-1.5 w-1.5 rounded-full bg-muted-foreground/40"
                    }
                    aria-label={`Show video testimonial ${idx + 1}`}
                  />
                ))}
              </div>

              <span className="text-xs text-muted-foreground">
                {safeVideoIndex + 1}/{videoTestimonials.length}
              </span>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="text" className="mt-0">
          <div className="space-y-4" onWheel={handleTextWheel}>
            <div className="space-y-4">
              {visibleTextTestimonials.map((testimonial, index) => {
                const isEvenCard = index % 2 === 0;
                const imageOnLeft = isEvenCard;
                const imageSource = testimonial.profileImage?.trim() ?? "";
                const shouldShowImage =
                  imageSource.length > 0 &&
                  !imageSource.includes("placehold.co");

                return (
                  <article
                    key={testimonial.id}
                    className="group max-w-full overflow-hidden rounded-2xl border border-border/60 bg-background shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[var(--chart-1)]/50"
                  >
                    <div
                      className={`flex min-h-[18rem] flex-col ${
                        imageOnLeft ? "md:flex-row" : "md:flex-row-reverse"
                      }`}
                    >
                      <div className="relative h-56 w-full shrink-0 overflow-hidden bg-muted md:h-auto md:w-52">
                        <div className="pointer-events-none absolute top-2 left-3 select-none text-[6rem] font-black leading-none text-foreground/10">
                          &ldquo;
                        </div>

                        {shouldShowImage ? (
                          <Image
                            src={imageSource}
                            alt={testimonial.name}
                            fill
                            sizes="(max-width: 768px) 100vw, 208px"
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex h-full min-h-56 w-full items-center justify-center bg-muted md:min-h-[18rem]">
                            <span className="text-4xl font-black text-muted-foreground/40">
                              {getInitials(testimonial.name)}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex flex-1 flex-col justify-center space-y-3 p-4 md:p-6">
                        <div className="min-w-0 space-y-1">
                          <h3 className="break-words text-base font-semibold text-foreground">
                            {testimonial.name}
                          </h3>
                          <p className="break-words text-sm text-muted-foreground">
                            {testimonial.role} • {testimonial.company}
                          </p>
                        </div>

                        <p className="line-clamp-6 break-words text-sm leading-relaxed italic text-muted-foreground">
                          “{testimonial.quote}”
                        </p>

                        <div
                          className="flex items-center gap-1"
                          role="img"
                          aria-label="Star rating"
                        >
                          {Array.from({ length: 5 }).map((_, starIndex) => (
                            <Star
                              key={`${testimonial.id}-star-${starIndex}`}
                              className={`h-4 w-4 ${
                                starIndex < testimonial.rating
                                  ? "fill-[var(--chart-5)] text-[var(--chart-5)]"
                                  : "text-muted"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-1.5">
                {textPages.map((page, idx) => (
                  <button
                    key={`text-page-${page.map((item) => item.id).join("-")}`}
                    type="button"
                    onClick={() => setActiveTextPage(idx)}
                    className={
                      idx === safeTextPage
                        ? "h-1.5 w-7 rounded-full bg-[var(--chart-2)]"
                        : "h-1.5 w-1.5 rounded-full bg-muted-foreground/40"
                    }
                    aria-label={`Show testimonial page ${idx + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
}
