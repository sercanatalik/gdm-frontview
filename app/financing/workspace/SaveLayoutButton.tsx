import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"; // Import dropdown components

interface SaveLayoutButtonProps {
  onSave: () => void;
  onReset: () => void; // Add reset handler prop
}

export function SaveLayoutButton({ onSave, onReset }: SaveLayoutButtonProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline"
          size="sm"
          className="transition h-6 border-none text-xs hover:bg-transparent"
        >
          <Save className="h-4 w-4 mr-1" />
          Layout
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={onSave}>
          Save Current Layout
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onReset}>
          Reset Layout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 