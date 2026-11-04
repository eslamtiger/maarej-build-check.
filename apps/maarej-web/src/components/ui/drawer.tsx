"use client";

import * as React from "react";
import { Drawer as DrawerPrimitive } from "vaul";
import { cn } from "@/lib/utils";

export const Drawer = DrawerPrimitive.Root;
export const DrawerTrigger = DrawerPrimitive.Trigger;
export const DrawerClose = DrawerPrimitive.Close;

export function DrawerPortal(props: React.ComponentProps<typeof DrawerPrimitive.Portal>) {
  return <DrawerPrimitive.Portal data-slot="drawer-portal" {...props} />;
}
export function DrawerOverlay({ className, ...props }: React.ComponentProps<typeof DrawerPrimitive.Overlay>) {
  return <DrawerPrimitive.Overlay data-slot="drawer-overlay" className={cn("v102-drawer-overlay", className)} {...props} />;
}
export function DrawerContent({ className, children, ...props }: React.ComponentProps<typeof DrawerPrimitive.Content>) {
  return <DrawerPortal><DrawerOverlay/><DrawerPrimitive.Content data-slot="drawer-content" className={cn("v102-drawer-content", className)} {...props}><div className="v102-drawer-handle"/>{children}</DrawerPrimitive.Content></DrawerPortal>;
}
export function DrawerHeader({ className, ...props }: React.ComponentProps<"div">) { return <div data-slot="drawer-header" className={cn("v102-drawer-header", className)} {...props}/>; }
export function DrawerTitle({ className, ...props }: React.ComponentProps<typeof DrawerPrimitive.Title>) { return <DrawerPrimitive.Title data-slot="drawer-title" className={cn("v102-drawer-title", className)} {...props}/>; }
export function DrawerDescription({ className, ...props }: React.ComponentProps<typeof DrawerPrimitive.Description>) { return <DrawerPrimitive.Description data-slot="drawer-description" className={cn("v102-drawer-description", className)} {...props}/>; }
