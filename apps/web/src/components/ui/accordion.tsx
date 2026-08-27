import * as React from "react"
import * as AccordionPrimitive from "@radix-ui/react-accordion"
import { ChevronDown } from "lucide-react"

import { cn } from "@/lib/utils"

interface AccordionProps
  extends Omit<React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Root>, 'type'> {
  type?: "single" | "multiple";
  collapsible?: boolean;
  defaultExpandedKeys?: string[];
  defaultValue?: any;
}

const Accordion = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Root>,
  AccordionProps
>(({ defaultExpandedKeys, defaultValue, type = "single", collapsible = true, ...props }, ref) => {
  const initialVal = defaultValue !== undefined ? defaultValue : (defaultExpandedKeys ? defaultExpandedKeys[0] : undefined);
  
  if (type === "multiple") {
    return (
      <AccordionPrimitive.Root
        ref={ref}
        type="multiple"
        defaultValue={Array.isArray(initialVal) ? initialVal : defaultExpandedKeys}
        {...(props as any)}
      />
    );
  }

  return (
    <AccordionPrimitive.Root
      ref={ref}
      type="single"
      collapsible={collapsible}
      defaultValue={typeof initialVal === 'string' ? initialVal : undefined}
      {...(props as any)}
    />
  );
});
Accordion.displayName = "Accordion";

interface AccordionItemProps
  extends Omit<React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>, 'value'> {
  value?: string;
  id?: string;
}

const AccordionItem = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Item>,
  AccordionItemProps
>(({ className, value, id, ...props }, ref) => (
  <AccordionPrimitive.Item
    ref={ref}
    value={value || id || ""}
    className={cn("border-b border-border/80", className)}
    {...props}
  />
))
AccordionItem.displayName = "AccordionItem"

const AccordionTrigger = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Header className="flex">
    <AccordionPrimitive.Trigger
      ref={ref}
      className={cn(
        "flex flex-1 items-center justify-between py-3.5 text-sm font-semibold transition-all hover:text-primary text-foreground [&[data-state=open]>svg]:rotate-180 cursor-pointer select-none",
        className
      )}
      {...props}
    >
      {children}
      <ChevronDown className="size-4 shrink-0 text-muted-foreground transition-transform duration-200" />
    </AccordionPrimitive.Trigger>
  </AccordionPrimitive.Header>
))
AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName

const AccordionContent = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Content
    ref={ref}
    className="overflow-hidden text-xs text-muted-foreground transition-all duration-200"
    {...props}
  >
    <div className={cn("pb-4 pt-0 leading-relaxed", className)}>{children}</div>
  </AccordionPrimitive.Content>
))
AccordionContent.displayName = AccordionPrimitive.Content.displayName

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }
