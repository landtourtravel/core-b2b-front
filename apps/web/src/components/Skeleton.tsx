"use client";
import React from "react";

/** Base pulse block — compose into page/component-specific skeleton layouts. */
export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-gray-200/80 rounded-lg ${className}`} />;
}
