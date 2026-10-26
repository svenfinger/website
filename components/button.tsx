import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cn } from "cn";

type ButtonStyle = {
  className?: string;
  size?: "default" | "icon";
  variant?: "outline" | "blue";
};

function buttonClass({
  className,
  size = "default",
  variant = "outline",
}: ButtonStyle = {}) {
  return cn(
    "type-small inline-flex h-(--space-8) shrink-0 origin-center items-center justify-center gap-(--space-2) rounded-md border border-border px-(--space-2) text-foreground outline-none select-none transition-[scale,filter,background-color] duration-(--duration-default) ease-(--ease-standard) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground active:scale-[0.98] active:brightness-[0.8] active:duration-(--duration-fast) disabled:pointer-events-none disabled:opacity-50 motion-reduce:transform-none motion-reduce:active:scale-100 [&_svg]:pointer-events-none [&_svg]:shrink-0",
    size === "icon" && "min-w-8",
    variant === "outline" &&
      "bg-(--color-surface) hover:bg-(--color-surface-hover)",
    variant === "blue" && "bg-accent hover:bg-(--color-accent-hover)",
    className,
  );
}

function Button({
  className,
  size = "default",
  variant = "outline",
  ...props
}: ButtonPrimitive.Props & ButtonStyle) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={buttonClass({ className, size, variant })}
      {...props}
    />
  );
}

export { Button, buttonClass };
