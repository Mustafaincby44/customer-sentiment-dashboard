import React, { useEffect, useRef, useState, useMemo } from 'react';
import type { WordCloudWord } from '../types';
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card';

// D3 is loaded from CDN and available on the window object.
const d3 = (window as any).d3;

interface WordCloudProps {
  words: WordCloudWord[];
  title: string;
  icon: React.ReactNode;
}

// FIX: Removed 'extends d3.layout.cloud.Word' as d3 types are not available
// to the compiler when the library is loaded from a CDN. The interface 
// already defines all properties used within the component.
interface LayoutWord {
  text: string;
  size: number;
  x?: number;
  y?: number;
  rotate?: number;
}

const WordCloud: React.FC<WordCloudProps> = ({ words, title, icon }) => {
  const ref = useRef<SVGSVGElement>(null);
  const [layoutWords, setLayoutWords] = useState<LayoutWord[]>([]);

  const fillColor = useMemo(() => {
    const isPraises = title.toLowerCase().includes('praises') || title.toLowerCase().includes('övgüler');
    if (isPraises) {
        return 'hsl(var(--chart-positive))';
    }
    return 'hsl(var(--chart-negative))';
  }, [title]);

  useEffect(() => {
    if (words.length === 0) {
        setLayoutWords([]);
        return;
    };
    
    const maxFreq = d3.max(words, (d: WordCloudWord) => d.value) || 1;
    const sizeScale = d3.scaleLinear().domain([1, maxFreq]).range([14, 60]).clamp(true);

    const layout = d3.layout.cloud()
      .size([500, 500])
      .words(words.map(d => ({ text: d.text, size: sizeScale(d.value) })))
      .padding(5)
      .rotate(() => (~~(Math.random() * 6) - 3) * 15)
      .font("Impact")
      .fontSize((d: any) => d.size)
      .on("end", (words: LayoutWord[]) => {
        setLayoutWords(words);
      });

    layout.start();

    return () => {
        layout.stop();
    }
  }, [words]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{icon}{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-center items-center w-full h-[500px]">
          {layoutWords.length > 0 ? (
             <svg ref={ref} width={500} height={500}>
                <g transform="translate(250,250)">
                {layoutWords.map((word, i) => (
                    <text
                    key={word.text + i}
                    textAnchor="middle"
                    transform={`translate(${word.x}, ${word.y}) rotate(${word.rotate})`}
                    style={{ fontSize: word.size, fontFamily: 'Impact', fill: fillColor }}
                    >
                    {word.text}
                    </text>
                ))}
                </g>
          </svg>
          ) : (
            <div className="text-muted-foreground">Not enough data to generate cloud.</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default WordCloud;