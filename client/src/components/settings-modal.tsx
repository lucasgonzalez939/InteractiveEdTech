import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useGameState } from '@/hooks/use-game-state';

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
}

export default function SettingsModal({ open, onClose }: SettingsModalProps) {
  const { settings, updateSettings } = useGameState();

  const handleSave = () => {
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-fredoka text-dark text-center">
            Configuración
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div>
            <Label className="text-sm font-bold text-dark mb-2 block">
              Volumen del Sonido
            </Label>
            <Slider
              value={[settings.volume]}
              onValueChange={(value) => updateSettings({ volume: value[0] })}
              max={100}
              step={1}
              className="w-full"
            />
          </div>
          
          <div>
            <Label className="text-sm font-bold text-dark mb-2 block">
              Dificultad
            </Label>
            <Select
              value={settings.difficulty}
              onValueChange={(value: 'easy' | 'medium' | 'hard') => 
                updateSettings({ difficulty: value })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="easy">Fácil</SelectItem>
                <SelectItem value="medium">Medio</SelectItem>
                <SelectItem value="hard">Difícil</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="soundEnabled"
              checked={settings.soundEnabled}
              onCheckedChange={(checked) => 
                updateSettings({ soundEnabled: checked as boolean })
              }
            />
            <Label htmlFor="soundEnabled" className="text-sm font-bold text-dark">
              Activar Sonidos
            </Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="animationsEnabled"
              checked={settings.animationsEnabled}
              onCheckedChange={(checked) => 
                updateSettings({ animationsEnabled: checked as boolean })
              }
            />
            <Label htmlFor="animationsEnabled" className="text-sm font-bold text-dark">
              Activar Animaciones
            </Label>
          </div>
        </div>

        <div className="flex justify-end space-x-4 mt-6">
          <Button
            onClick={onClose}
            variant="outline"
            className="font-bold"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            className="bg-success hover:bg-success/80 text-white font-bold"
          >
            Guardar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
