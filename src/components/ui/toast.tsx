import * as ToastPrimitive from "@radix-ui/react-toast";
import { X } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/src/lib/utils";

const toastVariants = cva(
  "fixed bottom-0 right-0 m-4 w-96 p-4 shadow-lg rounded-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-bottom-full",
  {
    variants: {
      variant: {
        default: "bg-card border border-border text-foreground",
        success: "bg-green-900/20 border border-green-800 text-green-200",
        error:
          "bg-destructive/20 border border-destructive/50 text-destructive-foreground",
        warning: "bg-yellow-900/20 border border-yellow-800 text-yellow-200",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface ToastProps
  extends React.ComponentPropsWithoutRef<typeof ToastPrimitive.Root>,
    VariantProps<typeof toastVariants> {
  title: string;
  description: string;
}

export function Toast({
  title,
  description,
  variant,
  className,
  open,
  onOpenChange,
  ...props
}: ToastProps) {
  return (
    <ToastPrimitive.Provider>
      <ToastPrimitive.Root
        open={open}
        onOpenChange={onOpenChange}
        className={cn(toastVariants({ variant }), className)}
        {...props}
      >
        <div className="flex justify-between items-start">
          <ToastPrimitive.Title className="font-bold text-lg">
            {title}
          </ToastPrimitive.Title>
          <ToastPrimitive.Close className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
            <X className="h-4 w-4" />
          </ToastPrimitive.Close>
        </div>
        <ToastPrimitive.Description className="mt-2 text-sm text-muted-foreground">
          {description}
        </ToastPrimitive.Description>
      </ToastPrimitive.Root>
      <ToastPrimitive.Viewport />
    </ToastPrimitive.Provider>
  );
}
