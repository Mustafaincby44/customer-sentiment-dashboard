
import React from 'react';

interface SliderProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
  value?: number[];
  onValueChange?: (value: number[]) => void;
  min?: number;
  max?: number;
  step?: number;
}

const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
  ({ className, value = [0], onValueChange, min = 0, max = 100, step = 1, ...props }, ref) => {
    const internalValue = value[0];

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        onValueChange?.([parseFloat(event.target.value)]);
    };

    return (
        <div className="relative flex items-center w-full">
            <input
                ref={ref}
                type="range"
                min={min}
                max={max}
                step={step}
                value={internalValue}
                onChange={handleChange}
                className={`w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer slider-thumb ${className || ''}`}
                {...props}
            />
            <style>{`
                .slider-thumb::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    appearance: none;
                    width: 16px;
                    height: 16px;
                    background: hsl(var(--primary));
                    border-radius: 50%;
                    cursor: pointer;
                    margin-top: -5px; /* Adjust vertical alignment */
                }
                .slider-thumb::-moz-range-thumb {
                    width: 16px;
                    height: 16px;
                    background: hsl(var(--primary));
                    border-radius: 50%;
                    cursor: pointer;
                }
            `}</style>
        </div>
    );
  }
);

Slider.displayName = 'Slider';

export { Slider };