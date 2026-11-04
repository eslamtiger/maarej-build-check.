"use client";
import * as React from "react";
import { cn } from "@/lib/utils";

export function Carousel({className,...props}:React.ComponentProps<"div">){return <div data-slot="carousel" className={cn("v104-carousel",className)} {...props}/>}
export function CarouselContent({className,...props}:React.ComponentProps<"div">){return <div data-slot="carousel-content" className={cn("v104-carousel-content",className)} {...props}/>}
export function CarouselItem({className,...props}:React.ComponentProps<"div">){return <div data-slot="carousel-item" className={cn("v104-carousel-item",className)} {...props}/>}
