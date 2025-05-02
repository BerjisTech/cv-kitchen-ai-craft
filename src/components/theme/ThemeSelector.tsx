
import React from "react";
import { Laptop, Moon, Sun } from "lucide-react";
import { useTheme } from "@/context/ThemeProvider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

export function ThemeSelector() {
  const { theme, setTheme } = useTheme();

  return (
    <RadioGroup 
      value={theme} 
      onValueChange={(value) => setTheme(value as "light" | "dark" | "system")}
      className="grid grid-cols-3 gap-4"
    >
      <div className="flex flex-col items-center space-y-2">
        <Label
          htmlFor="theme-light"
          className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer"
        >
          <RadioGroupItem value="light" id="theme-light" className="sr-only" />
          <Sun className="h-6 w-6 mb-2" />
          <span>Light</span>
        </Label>
      </div>
      
      <div className="flex flex-col items-center space-y-2">
        <Label
          htmlFor="theme-dark"
          className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer"
        >
          <RadioGroupItem value="dark" id="theme-dark" className="sr-only" />
          <Moon className="h-6 w-6 mb-2" />
          <span>Dark</span>
        </Label>
      </div>
      
      <div className="flex flex-col items-center space-y-2">
        <Label
          htmlFor="theme-system"
          className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer"
        >
          <RadioGroupItem value="system" id="theme-system" className="sr-only" />
          <Laptop className="h-6 w-6 mb-2" />
          <span>System</span>
        </Label>
      </div>
    </RadioGroup>
  );
}
