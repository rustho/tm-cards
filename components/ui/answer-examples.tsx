import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * XP answer hints: a primary heading ("Например:") followed by example
 * answers in text-foreground, stacked with a 4px gap, Body 15/20.
 * Sits under a wizard question to suggest what to write.
 */
export interface AnswerExamplesProps extends React.HTMLAttributes<HTMLDivElement> {
  heading?: React.ReactNode;
  examples: React.ReactNode[];
}

const AnswerExamples = React.forwardRef<HTMLDivElement, AnswerExamplesProps>(
  ({ className, heading = "Например:", examples, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col gap-1 text-body", className)} {...props}>
      {heading && <p className="m-0 text-primary">{heading}</p>}
      <ul className="flex flex-col gap-1 text-foreground">
        {examples.map((example, i) => (
          <li key={i}>{example}</li>
        ))}
      </ul>
    </div>
  )
);
AnswerExamples.displayName = "AnswerExamples";

export { AnswerExamples };
