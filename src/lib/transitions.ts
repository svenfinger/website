const exit = {
  name: "page-fade-out",
  duration: "var(--duration-fast)",
  easing: "var(--ease-exit)",
  fillMode: "both",
};

const enter = {
  name: "page-fade-in",
  duration: "var(--duration-default)",
  delay: "var(--duration-fast)",
  easing: "var(--ease-enter)",
  fillMode: "both",
};

const pageAnimations = { old: exit, new: enter };

export const pageTransition = {
  forwards: pageAnimations,
  backwards: pageAnimations,
};

const workAnimations = {
  old: exit,
  new: { ...enter, name: "content-enter" },
};

export const workTransition = {
  forwards: workAnimations,
  backwards: workAnimations,
};

export function cardDelay(index: number) {
  return Math.min(index, 4) * 70;
}

export function cardTransition(index: number) {
  const animations = {
    old: exit,
    new: {
      ...enter,
      name: "content-enter",
      delay: `calc(var(--duration-fast) + ${cardDelay(index)}ms)`,
    },
  };

  return { forwards: animations, backwards: animations };
}
