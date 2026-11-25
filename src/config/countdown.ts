// The Countdown section on Home. Change a number or a message here and the section follows.
export const countdownConfig = {
  // Longest description a countdown can have.
  descriptionMax: 300,
  // The message changes when this share of the whole time is left.
  // The whole time runs from the day the countdown was made to the day it counts down to.
  almostPercent: 20,
  nearlyPercent: 10,
  messages: {
    coming: "Coming soon",
    almost: "Almost here",
    nearly: "The wait is nearly over!",
    done: "It’s here",
  },
} as const;

export type CountdownStage = keyof typeof countdownConfig.messages;