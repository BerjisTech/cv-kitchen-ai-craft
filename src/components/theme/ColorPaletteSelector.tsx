
import React from 'react';
import { Palette, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useTheme } from '@/context/ThemeProvider';

// Define the available color palettes
const colorPalettes = [
  {
    id: 'indigo',
    name: 'Indigo',
    primary: '#6366f1',
    secondary: '#818cf8',
    accent: '#e0e7ff',
    background: '#ffffff'
  },
  {
    id: 'emerald',
    name: 'Emerald',
    primary: '#10b981',
    secondary: '#34d399',
    accent: '#d1fae5',
    background: '#ffffff'
  },
  {
    id: 'amber',
    name: 'Amber',
    primary: '#f59e0b',
    secondary: '#fbbf24',
    accent: '#fef3c7',
    background: '#ffffff'
  },
  {
    id: 'rose',
    name: 'Rose',
    primary: '#e11d48',
    secondary: '#fb7185',
    accent: '#ffe4e6',
    background: '#ffffff'
  },
  {
    id: 'sky',
    name: 'Sky',
    primary: '#0ea5e9',
    secondary: '#38bdf8',
    accent: '#e0f2fe',
    background: '#ffffff'
  },
  {
    id: 'violet',
    name: 'Violet',
    primary: '#8b5cf6',
    secondary: '#a78bfa',
    accent: '#ede9fe',
    background: '#ffffff'
  }
];

export function ColorPaletteSelector() {
  const { colorPalette, setColorPalette } = useTheme();

  const handlePaletteChange = (paletteId: string) => {
    setColorPalette(paletteId);
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette size={20} />
          <span>Color Palette</span>
        </CardTitle>
        <CardDescription>
          Choose a color scheme for your public profile and portfolio pages
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {colorPalettes.map((palette) => (
            <div key={palette.id} className="space-y-2">
              <button
                type="button"
                onClick={() => handlePaletteChange(palette.id)}
                className={`relative w-full aspect-video rounded-lg p-1 cursor-pointer transition-all ${
                  colorPalette === palette.id ? 'ring-2 ring-primary ring-offset-2' : 'ring-1 ring-border'
                }`}
              >
                <div className="w-full h-full rounded flex flex-col overflow-hidden">
                  <div 
                    className="h-1/2 w-full" 
                    style={{ backgroundColor: palette.primary }}
                  />
                  <div className="h-1/2 w-full flex">
                    <div 
                      className="w-1/2 h-full" 
                      style={{ backgroundColor: palette.secondary }}
                    />
                    <div 
                      className="w-1/2 h-full" 
                      style={{ backgroundColor: palette.accent }}
                    />
                  </div>
                  {colorPalette === palette.id && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <CheckCircle2 className="h-6 w-6 text-primary bg-white rounded-full" />
                    </div>
                  )}
                </div>
              </button>
              <Label className="text-center block text-sm">{palette.name}</Label>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
