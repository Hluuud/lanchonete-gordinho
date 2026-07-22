"use client";

import * as React from "react";
import * as SheetPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";

const Sheet = SheetPrimitive.Root;
const SheetTrigger = SheetPrimitive.Trigger;
const SheetClose = SheetPrimitive.Close;
const SheetPortal = SheetPrimitive.Portal;

function SheetOverlay({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Overlay>) {
  return (
    <SheetPrimitive.Overlay
      className={cn(
        "fixed inset-0 z-50 bg-black/50 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0",
        className,
      )}
      {...props}
    />
  );
}

function SheetContent({
  className,
  children,
  title,
  description,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Content> & {
  title: string;
  description?: string;
}) {
  return (
    <SheetPortal>
      <SheetOverlay />
      <SheetPrimitive.Content
        className={cn(
          "fixed inset-y-0 right-0 z-50 flex h-full w-full max-w-md flex-col gap-4 border-l bg-background shadow-lg outline-none",
          "data-[state=closed]:animate-out data-[state=closed]:duration-200 data-[state=closed]:slide-out-to-right data-[state=open]:animate-in data-[state=open]:duration-300 data-[state=open]:slide-in-from-right",
          className,
        )}
        {...props}
      >
        <SheetPrimitive.Title className="sr-only">{title}</SheetPrimitive.Title>
        {description && (
          <SheetPrimitive.Description className="sr-only">
            {description}
          </SheetPrimitive.Description>
        )}
        {children}
        <SheetPrimitive.Close className="absolute top-4 right-4 rounded-md p-1 opacity-70 transition-opacity hover:opacity-100 focus-visible:outline-none">
          <X className="size-5" aria-hidden />
          <span className="sr-only">Fechar</span>
        </SheetPrimitive.Close>
      </SheetPrimitive.Content>
    </SheetPortal>
  );
}

export { Sheet, SheetTrigger, SheetClose, SheetContent };
