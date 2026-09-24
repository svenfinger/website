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
    "inline-flex origin-center items-center justify-center rounded-md border text-sm leading-(--leading-label) font-(--font-weight-label) brightness-100 outline-none select-none transition-[scale,filter,background-color] duration-(--duration-default) ease-(--ease-standard) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground active:scale-[0.98] active:brightness-[0.96] active:duration-(--duration-fast) disabled:pointer-events-none disabled:opacity-50 motion-reduce:scale-100 motion-reduce:brightness-100 motion-reduce:hover:brightness-100 motion-reduce:active:scale-100 motion-reduce:active:brightness-100 [&_svg]:pointer-events-none [&_svg]:shrink-0",
    size === "default" && "px-(--space-2) py-(--space-1)",
    size === "icon" && "p-(--space-1)",
    variant === "outline" &&
      "border-border text-foreground hover:bg-(--color-surface) active:bg-(--color-surface) active:brightness-[0.8]",
    variant === "blue" &&
      "border-transparent bg-accent text-accent-foreground hover:bg-(--color-accent-hover) active:brightness-[0.8]",
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
