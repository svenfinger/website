"use client";

import { CaretRightIcon, CaretLeftIcon } from "@phosphor-icons/react";
import type { IconProps } from "@phosphor-icons/react";

const ICONS = {
  CaretRight: CaretRightIcon,
  CaretLeft: CaretLeftIcon,
} as const;

export type PhosphorIconName = keyof typeof ICONS;

export function PhosphorIcon({
  name,
  ...props
}: { name: PhosphorIconName } & IconProps) {
  const Icon = ICONS[name];
  return <Icon {...props} />;
}
