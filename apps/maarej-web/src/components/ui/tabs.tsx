"use client";

import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "@/lib/utils";

export const Tabs = TabsPrimitive.Root;
export function TabsList({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.List>) { return <TabsPrimitive.List data-slot="tabs-list" className={cn("v102-tabs-list", className)} {...props}/>; }
export function TabsTrigger({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Trigger>) { return <TabsPrimitive.Trigger data-slot="tabs-trigger" className={cn("v102-tabs-trigger", className)} {...props}/>; }
export function TabsContent({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Content>) { return <TabsPrimitive.Content data-slot="tabs-content" className={cn("v102-tabs-content", className)} {...props}/>; }
