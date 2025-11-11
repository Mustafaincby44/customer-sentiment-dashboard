
import React, { createContext, useContext } from 'react';
import { Label } from './Label';

interface RadioGroupContextType {
  name?: string;
  value: string;
  onValueChange: (value: string) => void;
}

const RadioGroupContext = createContext<RadioGroupContextType | undefined>(undefined);

interface RadioGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
  onValueChange: (value: string) => void;
  name?: string;
}

const RadioGroup = React.forwardRef<HTMLDivElement, RadioGroupProps>(
  ({ className, value, onValueChange, name, children, ...props }, ref) => {
    return (
      <div ref={ref} className={className} {...props} role="radiogroup">
        <RadioGroupContext.Provider value={{ name, value, onValueChange }}>
          {children}
        </RadioGroupContext.Provider>
      </div>
    );
  }
);
RadioGroup.displayName = 'RadioGroup';


const RadioGroupItem = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement> & { value: string }>(
  ({ className, value, children, ...props }, ref) => {
    const context = useContext(RadioGroupContext);
    if (!context) {
      throw new Error("RadioGroupItem must be used within a RadioGroup");
    }
    const isChecked = context.value === value;

    return (
        <button
            ref={ref}
            role="radio"
            aria-checked={isChecked}
            data-state={isChecked ? 'checked' : 'unchecked'}
            onClick={() => context.onValueChange(value)}
            className={`flex items-center justify-center h-4 w-4 rounded-full border border-primary text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background
            ${className || ''}`}
            {...props}
        >
            {isChecked && <div className="h-2 w-2 rounded-full bg-primary" />}
        </button>
    );
  }
);
RadioGroupItem.displayName = 'RadioGroupItem';


export { RadioGroup, RadioGroupItem };