import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Copy, Check } from "lucide-react";
import { motion } from "framer-motion";

/**
 * Design Philosophy: Minimalist Scientific Approach
 * - Color theory visualization is the priority
 * - Functional and clean layout
 * - Precise data display
 * - Dark background (#1a1a1a) to highlight colors
 */

interface ColorStep {
  hex: string;
  rgb: { r: number; g: number; b: number };
  hsl: { h: number; s: number; l: number };
  opacity: number;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

function rgbToHsl(
  r: number,
  g: number,
  b: number
): { h: number; s: number; l: number } {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0,
    s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

function rgbToHex(r: number, g: number, b: number): string {
  return (
    "#" +
    [r, g, b]
      .map((x) => {
        const hex = x.toString(16);
        return hex.length === 1 ? "0" + hex : hex;
      })
      .join("")
      .toUpperCase()
  );
}

function generateColorSteps(hexColor: string, steps: number = 5): ColorStep[] {
  const rgb = hexToRgb(hexColor);
  if (!rgb) return [];

  const result: ColorStep[] = [];

  for (let i = 0; i < steps; i++) {
    // Linear interpolation from input color to white (#ffffff)
    const ratio = i / (steps - 1); // 0 to 1
    const r = Math.round(rgb.r + (255 - rgb.r) * ratio);
    const g = Math.round(rgb.g + (255 - rgb.g) * ratio);
    const b = Math.round(rgb.b + (255 - rgb.b) * ratio);

    const hsl = rgbToHsl(r, g, b);

    result.push({
      hex: rgbToHex(r, g, b),
      rgb: { r, g, b },
      hsl,
      opacity: 1 - ratio, // For reference
    });
  }

  return result;
}

function ColorSwatch({
  step,
  index,
  total,
}: {
  step: ColorStep;
  index: number;
  total: number;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      className="flex flex-col gap-3"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
    >
      <div className="text-center text-sm font-medium text-muted-foreground">
        Step {index + 1} / {total}
      </div>
      <motion.div
        className="w-full h-32 rounded-lg border border-border shadow-md transition-all duration-300 hover:shadow-lg cursor-pointer group"
        style={{
          backgroundColor: step.hex,
        }}
        onClick={() => handleCopy(step.hex)}
        whileHover={{ scale: 1.05, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.3)" }}
        whileTap={{ scale: 0.98 }}
      />
      <div className="space-y-2 text-xs">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">HEX:</span>
          <button
            onClick={() => handleCopy(step.hex)}
            className="flex items-center gap-1 font-mono text-foreground hover:text-primary transition-colors"
          >
            {step.hex}
            {copied ? (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
              >
                <Check className="w-3 h-3" />
              </motion.div>
            ) : (
              <Copy className="w-3 h-3" />
            )}
          </button>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">RGB:</span>
          <span className="font-mono text-foreground">
            ({step.rgb.r}, {step.rgb.g}, {step.rgb.b})
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">HSL:</span>
          <span className="font-mono text-foreground">
            ({step.hsl.h}°, {step.hsl.s}%, {step.hsl.l}%)
          </span>
        </div>
      </div>
    </motion.div>
  );
}

export default function Home() {
  const [inputColor, setInputColor] = useState("#002AFF");
  const [isValidColor, setIsValidColor] = useState(true);
  const [stepCount, setStepCount] = useState(5);

  const colorSteps = useMemo(() => {
    if (!isValidColor) return [];
    return generateColorSteps(inputColor, stepCount);
  }, [inputColor, isValidColor, stepCount]);

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputColor(value);
    // Validate hex color
    const isValid = /^#[0-9A-F]{6}$/i.test(value);
    setIsValidColor(isValid);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-foreground">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <motion.div
          className="mb-12 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            Color Decomposer
          </h1>
          <p className="text-muted-foreground">
            カラーコードを入力して、色が徐々に薄くなっていく過程を視覚化します
          </p>
        </motion.div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Input Section */}
          <motion.div
            className="lg:col-span-1"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <Card className="p-6 sticky top-8 border-border/50 backdrop-blur-sm bg-card/80">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    カラーコード
                  </label>
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      value={inputColor}
                      onChange={handleColorChange}
                      placeholder="#002AFF"
                      className="font-mono text-lg bg-input/50 border-border/50"
                    />
                    <motion.input
                      type="color"
                      value={inputColor}
                      onChange={(e) => setInputColor(e.target.value)}
                      className="w-12 h-10 rounded cursor-pointer border border-border"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                    />
                  </div>
                  {!isValidColor && (
                    <p className="text-xs text-destructive mt-2">
                      有効な16進数カラーコード（#RRGGBB）を入力してください
                    </p>
                  )}
                </div>

                {/* Original Color Preview */}
                {isValidColor && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.4 }}
                  >
                    <label className="block text-sm font-medium mb-2">
                      プレビュー
                    </label>
                    <motion.div
                      className="w-full h-24 rounded-lg border border-border shadow-md"
                      style={{ backgroundColor: inputColor }}
                      layoutId="preview"
                      transition={{ duration: 0.3 }}
                    />
                  </motion.div>
                )}

                {/* Step Count Slider */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    分解ステップ数: <span className="text-primary">{stepCount}</span>
                  </label>
                  <input
                    type="range"
                    min="2"
                    max="20"
                    value={stepCount}
                    onChange={(e) => setStepCount(parseInt(e.target.value))}
                    className="w-full h-2 bg-input rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>2</span>
                    <span>20</span>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Color Steps Section */}
          <motion.div
            className="lg:col-span-2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            {isValidColor && colorSteps.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {colorSteps.map((step, index) => (
                  <ColorSwatch
                    key={index}
                    step={step}
                    index={index}
                    total={colorSteps.length}
                  />
                ))}
              </div>
            ) : (
              <motion.div
                className="text-center text-muted-foreground py-12"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
              >
                {isValidColor
                  ? "色を入力して分解を開始します"
                  : "有効なカラーコードを入力してください"}
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
