"use client";

import * as React from "react";
import { Drawer as DrawerPrimitive } from "vaul";

import { cn } from "@/lib/utils";

const Drawer = (props: React.ComponentProps<typeof DrawerPrimitive.Root>) => (
  <DrawerPrimitive.Root {...props} />
);

const DrawerTrigger = DrawerPrimitive.Trigger;
const DrawerPortal = DrawerPrimitive.Portal;
const DrawerClose = DrawerPrimitive.Close;

function DrawerOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Overlay>) {
  return (
    <DrawerPrimitive.Overlay
      className={cn("fixed inset-0 z-50 bg-black/50", className)}
      {...props}
    />
  );
}

function DrawerContent({
  className,
  children,
  title,
  description,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Content> & {
  title: string;
  description?: string;
}) {
  return (
    <DrawerPortal>
      <DrawerOverlay />
      <DrawerPrimitive.Content
        className={cn(
          "fixed inset-x-0 bottom-0 z-50 flex max-h-[88vh] flex-col rounded-t-2xl border-t bg-background outline-none",
          className,
        )}
        {...props}
      >
        <div
          aria-hidden
          className="mx-auto mt-3 h-1.5 w-12 shrink-0 rounded-full bg-muted"
        />
        <DrawerPrimitive.Title className="sr-only">
          {title}
        </DrawerPrimitive.Title>
        {description && (
          <DrawerPrimitive.Description className="sr-only">
            {description}
          </DrawerPrimitive.Description>
        )}
        {children}
      </DrawerPrimitive.Content>
    </DrawerPortal>
  );
}

export { Drawer, DrawerTrigger, DrawerClose, DrawerContent };
