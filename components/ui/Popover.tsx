
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

interface PopoverContextType {
  open: boolean;
  setOpen: (open: boolean) => void;
  triggerRef: React.RefObject<HTMLButtonElement>;
}

const PopoverContext = createContext<PopoverContextType | undefined>(undefined);

const usePopover = () => {
  const context = useContext(PopoverContext);
  if (!context) {
    throw new Error('usePopover must be used within a Popover');
  }
  return context;
};

interface PopoverProps {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const Popover: React.FC<PopoverProps> = ({ children, open: controlledOpen, onOpenChange }) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = onOpenChange || setInternalOpen;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (triggerRef.current && !triggerRef.current.contains(event.target as Node)) {
        const popoverContent = document.querySelector('[data-popover-content]');
        if (popoverContent && !popoverContent.contains(event.target as Node)) {
          setOpen(false);
        }
      }
    };

    if (open) {
      // Use a timeout to prevent the click that opens the popover from immediately closing it.
      const timerId = setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside);
      }, 0);
      return () => {
        clearTimeout(timerId);
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [open, setOpen]);

  return (
    <PopoverContext.Provider value={{ open, setOpen, triggerRef }}>
      <div className="relative inline-block">{children}</div>
    </PopoverContext.Provider>
  );
};

const PopoverTrigger = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean }>(
  ({ children, asChild = false, ...props }, ref) => {
    const { open, setOpen, triggerRef } = usePopover();

    const handleToggle = (e: React.MouseEvent<HTMLButtonElement>) => {
        props.onClick?.(e);
        if (asChild && React.isValidElement(children)) {
            (children.props as any).onClick?.(e);
        }
        setOpen(!open);
    };

    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children, {
        ref: triggerRef,
        ...props,
        onClick: handleToggle,
      } as React.HTMLAttributes<HTMLElement>);
    }

    return (
      <button ref={triggerRef} {...props} onClick={handleToggle}>
        {children}
      </button>
    );
  }
);
PopoverTrigger.displayName = 'PopoverTrigger';

const PopoverContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { sideOffset?: number }>(
  ({ className, children, sideOffset = 4, ...props }, ref) => {
    const { open } = usePopover();

    if (!open) return null;

    return (
      <div
        ref={ref}
        data-popover-content
        className={`absolute z-50 rounded-lg border border-border bg-popover text-popover-foreground shadow-md outline-none animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 p-4 ${className}`}
        style={{ marginTop: `${sideOffset}px` }}
        {...props}
      >
        {children}
      </div>
    );
  }
);
PopoverContent.displayName = 'PopoverContent';

export { Popover, PopoverTrigger, PopoverContent };