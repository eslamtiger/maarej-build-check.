"use client";

import { forwardRef, useCallback, useImperativeHandle, useRef } from "react";
import confetti, { type Options as ConfettiOptions, type CreateTypes as ConfettiInstance } from "canvas-confetti";

export type ConfettiRef = { fire: (options?: ConfettiOptions)=>void };

// Copied from Magic UI's canvas-confetti integration and constrained for Maarej celebrations.
export const Confetti = forwardRef<ConfettiRef, { className?:string; manualstart?:boolean; options?:ConfettiOptions }>(function Confetti({className,manualstart=true,options},ref){
  const instanceRef=useRef<ConfettiInstance|null>(null);
  const canvasRef=useCallback((node:HTMLCanvasElement|null)=>{
    if(node && !instanceRef.current) instanceRef.current=confetti.create(node,{resize:true,useWorker:true});
    if(!node && instanceRef.current){instanceRef.current.reset();instanceRef.current=null;}
  },[]);
  const fire=useCallback((opts:ConfettiOptions={})=>{void instanceRef.current?.({particleCount:32,spread:48,startVelocity:22,ticks:90,gravity:.9,scalar:.7,...options,...opts});},[options]);
  useImperativeHandle(ref,()=>({fire}),[fire]);
  return <canvas ref={canvasRef} className={className} data-manualstart={manualstart?"true":"false"}/>;
});
