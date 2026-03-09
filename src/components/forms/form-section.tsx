import { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function FormSection({
  step,
  title,
  description,
  children,
  className,
}: {
  step: string;
  title: string;
  description: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="gap-2.5 pb-4 sm:gap-3 sm:pb-5">
        <Badge className="w-fit">{step}</Badge>
        <div className="space-y-2">
          <CardTitle className="text-[1.45rem] sm:text-[1.95rem]">{title}</CardTitle>
          <CardDescription className="max-w-2xl text-[14px] leading-6 sm:text-sm sm:leading-7">{description}</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-5 sm:space-y-6">{children}</CardContent>
    </Card>
  );
}
