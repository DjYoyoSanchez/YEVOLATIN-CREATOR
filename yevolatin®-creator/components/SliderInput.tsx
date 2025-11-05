import React from 'react';

interface SliderInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
}

const SliderInput: React.FC<SliderInputProps> = ({
  label,
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  unit = '%',
}) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange(Number(event.target.value));
  };

  return (
    <div className="flex flex-col space-y-2">
      <div className="flex justify-between items-center">
        <label className="text-gray-200 font-medium text-sm">{label}</label>
        <span className="text-sm font-mono px-2 py-1 bg-black/30 rounded-md text-gray-100 border border-white/10">
          {value}{unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={handleChange}
        className="w-full h-2 bg-black/30 rounded-lg appearance-none cursor-pointer
                   focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-red-500
                   [&::-webkit-slider-thumb]:appearance-none
                   [&::-webkit-slider-thumb]:h-5
                   [&::-webkit-slider-thumb]:w-5
                   [&::-webkit-slider-thumb]:rounded-full
                   [&::-webkit-slider-thumb]:bg-red-500
                   [&::-webkit-slider-thumb]:shadow-md
                   [&::-webkit-slider-thumb]:cursor-pointer
                   [&::-webkit-slider-thumb]:border
                   [&::-webkit-slider-thumb]:border-red-200/50
                   [&::-moz-range-thumb]:h-5
                   [&::-moz-range-thumb]:w-5
                   [&::-moz-range-thumb]:rounded-full
                   [&::-moz-range-thumb]:bg-red-500
                   [&::-moz-range-thumb]:shadow-md
                   [&::-moz-range-thumb]:cursor-pointer
                   [&::-moz-range-thumb]:border-red-200/50"
      />
    </div>
  );
};

export default SliderInput;
