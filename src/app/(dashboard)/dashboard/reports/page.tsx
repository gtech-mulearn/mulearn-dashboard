"use client";

import { Download, FileText } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function EventReportPage() {
  const [title, setTitle] = useState("Sample Event Report Title");
  const [details, setDetails] = useState(
    "This is a sample description for the event report. It contains all the necessary details about what happened during the event, the number of participants, key takeaways, and future action items. You can edit this text to see how it looks on the A4 sheet preview.",
  );

  const handleDownloadPDF = () => {
    window.print();
  };

  const getPages = (text: string) => {
    if (!text) return [{ id: "empty-page", paragraphs: [] }];

    const paragraphs = text.split("\n");
    const pages: { id: string; paragraphs: { id: string; text: string }[] }[] =
      [];
    let currentPage: { id: string; text: string }[] = [];
    let currentLength = 0;

    let idCounter = 0;
    const nextId = () => `item-${idCounter++}`;

    // First page has header, so fewer characters
    const FIRST_PAGE_LIMIT = 1800;
    const NORMAL_PAGE_LIMIT = 3000;

    for (let i = 0; i < paragraphs.length; i++) {
      const p = paragraphs[i];
      const limit = pages.length === 0 ? FIRST_PAGE_LIMIT : NORMAL_PAGE_LIMIT;

      // If a single paragraph is longer than a page limit, we must split it
      if (p.length > limit) {
        if (currentPage.length > 0) {
          pages.push({ id: nextId(), paragraphs: currentPage });
          currentPage = [];
          currentLength = 0;
        }

        let remaining = p;
        while (remaining.length > 0) {
          const chunkLimit =
            pages.length === 0 ? FIRST_PAGE_LIMIT : NORMAL_PAGE_LIMIT;
          const chunk = remaining.slice(0, chunkLimit);
          pages.push({
            id: nextId(),
            paragraphs: [{ id: nextId(), text: chunk }],
          });
          remaining = remaining.slice(chunkLimit);
        }
      } else {
        if (currentLength + p.length > limit && currentPage.length > 0) {
          pages.push({ id: nextId(), paragraphs: currentPage });
          currentPage = [{ id: nextId(), text: p }];
          currentLength = p.length;
        } else {
          currentPage.push({ id: nextId(), text: p });
          // add 1 for newline equivalent
          currentLength += p.length + 1;
        }
      }
    }

    if (currentPage.length > 0) {
      pages.push({ id: nextId(), paragraphs: currentPage });
    }

    return pages;
  };

  const pages = getPages(details);

  return (
    <div className="min-h-screen bg-muted p-6 md:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Event Report Generator
            </h1>
            <p className="text-muted-foreground">
              Create and download event reports as PDF
            </p>
          </div>
          <Button
            variant={"default"}
            onClick={handleDownloadPDF}
            className="flex items-center gap-2 print:hidden"
          >
            <Download size={20} />
            Download PDF
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Left Column - Form */}
          <div className="space-y-6 lg:col-span-4 print:hidden">
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm sticky top-8">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-card-foreground">
                <FileText size={20} className="text-primary" />
                Report Details
              </h2>

              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="title"
                    className="mb-1 block text-sm font-medium text-foreground"
                  >
                    Report Title
                  </label>
                  <input
                    type="text"
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
                    placeholder="Enter report title..."
                  />
                </div>

                <div>
                  <label
                    htmlFor="details"
                    className="mb-1 block text-sm font-medium text-foreground"
                  >
                    Report Content
                  </label>
                  <textarea
                    id="details"
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    rows={16}
                    className="w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
                    placeholder="Enter report details..."
                  />
                </div>
                <Button variant={"default"} onClick={handleDownloadPDF}>
                  Generate PDF
                </Button>
              </div>
            </div>
          </div>

          {/* Right Column - A4 Previews */}
          <div className="flex flex-col items-center overflow-auto lg:col-span-8 print:col-span-12 print:overflow-visible gap-8 print:gap-0 pb-8">
            {pages.map((pageContent, index) => (
              <div
                key={pageContent.id}
                className="relative bg-background shadow-xl print:shadow-none shrink-0 print:break-inside-avoid print:break-after-page"
                style={{
                  width: "210mm",
                  minHeight: "297mm",
                  padding: "20mm",
                }}
              >
                {/* Header on all pages */}
                <div className="mb-4 flex items-start justify-between border-b border-border">
                  <h1 className="text-3xl font-bold text-foreground uppercase tracking-wider mt-2">
                    Event Report
                  </h1>
                  <div className="relative h-16 w-32 flex-shrink-0">
                    <Image
                      src="/logo.webp"
                      alt="Logo"
                      width={100}
                      height={100}
                      className="object-contain object-right"
                      style={{ width: "100%", height: "100%" }}
                    />
                  </div>
                </div>

                {/* Title & Date only on first page */}
                {index === 0 && (
                  <div className="mb-8">
                    <h2 className="text-2xl font-bold text-foreground break-words">
                      {title || "Untitled Report"}
                    </h2>
                    <p className="mt-2 text-sm text-muted-foreground font-medium">
                      Date: {new Date().toLocaleDateString()}
                    </p>
                  </div>
                )}

                {/* Content */}
                <div className="prose max-w-none text-foreground">
                  {pageContent.paragraphs.map((p) => (
                    <p
                      key={p.id}
                      className="whitespace-pre-wrap leading-relaxed min-h-[1.5rem]"
                    >
                      {p.text}
                    </p>
                  ))}
                </div>

                {/* Footer explicitly rendered on every page */}
                <div className="absolute bottom-[20mm] left-[20mm] right-[20mm] flex items-center justify-end border-t border-border pt-4 text-sm text-muted-foreground">
                  <span>
                    Page {index + 1} of {pages.length}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
