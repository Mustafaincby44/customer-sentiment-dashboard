
import React, { useState } from 'react';
import { useLanguage } from '../i18n';
import { Button } from './ui/Button';
import { DiceIcon } from './icons/DiceIcon';
import { Popover, PopoverContent, PopoverTrigger } from './ui/Popover';
import { Label } from './ui/Label';
import { Slider } from './ui/Slider';
import { RadioGroup, RadioGroupItem } from './ui/RadioGroup';
import type { SampleGenerationOptions } from '../types';

interface SampleGeneratorProps {
  onGenerate: (options: SampleGenerationOptions) => void;
  isLoading: boolean;
}

const SampleGenerator: React.FC<SampleGeneratorProps> = ({ onGenerate, isLoading }) => {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [topic, setTopic] = useState('Laptop');
  const [count, setCount] = useState(20);
  const [sentimentMix, setSentimentMix] = useState<SampleGenerationOptions['sentimentMix']>('balanced');

  const handleGenerateClick = () => {
    onGenerate({ topic, count, sentimentMix });
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="default" className="w-full sm:w-auto" disabled={isLoading}>
          <DiceIcon className="h-4 w-4 mr-2" />
          {t('sampleGenerator.generate')}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" sideOffset={5}>
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">{t('sampleGenerator.generate')}</h4>
            <p className="text-sm text-muted-foreground">
              {t('sampleGenerator.description')}
            </p>
          </div>
          <div className="grid gap-2">
            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="topic">{t('sampleGenerator.category')}</Label>
              <input
                id="topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="col-span-2 h-8 bg-background border border-input rounded-md px-2 text-sm"
              />
            </div>
            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="count">{t('sampleGenerator.reviewCount')}</Label>
              <Slider
                id="count"
                min={10}
                max={200}
                step={10}
                value={[count]}
                onValueChange={(value) => setCount(value[0])}
                className="col-span-2"
              />
              <span className="text-center text-sm text-muted-foreground col-span-3">{count} {t('sampleGenerator.reviews')}</span>
            </div>
             <div className="grid grid-cols-3 items-center gap-4">
                <Label>{t('sampleGenerator.sentimentMix')}</Label>
                <RadioGroup 
                    defaultValue="balanced" 
                    className="col-span-3 flex items-center justify-around mt-2"
                    onValueChange={(value: SampleGenerationOptions['sentimentMix']) => setSentimentMix(value)}
                    value={sentimentMix}
                >
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="positive" id="r-positive" />
                        <Label htmlFor="r-positive" className="text-xs">{t('sampleGenerator.mix.positive')}</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="balanced" id="r-balanced" />
                        <Label htmlFor="r-balanced" className="text-xs">{t('sampleGenerator.mix.balanced')}</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="negative" id="r-negative" />
                        <Label htmlFor="r-negative" className="text-xs">{t('sampleGenerator.mix.negative')}</Label>
                    </div>
                </RadioGroup>
            </div>
          </div>
          <Button onClick={handleGenerateClick} disabled={isLoading || !topic.trim()}>
            {isLoading ? t('sampleGenerator.generating') : t('sampleGenerator.generate')}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default SampleGenerator;