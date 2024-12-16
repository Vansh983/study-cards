import { Button } from '@/components/ui/button';
import { useAppStore } from '@/lib/store';
import { Volume2, VolumeX, Pause, Play } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CardTypeSwitcherProps {
    className?: string;
}

export function CardTypeSwitcher({ className }: CardTypeSwitcherProps) {
    const cardType = useAppStore((state) => state.cardType);
    const setCardType = useAppStore((state) => state.setCardType);
    const isMuted = useAppStore((state) => state.isMuted);
    const toggleMute = useAppStore((state) => state.toggleMute);
    const isPaused = useAppStore((state) => state.isPaused);
    const togglePause = useAppStore((state) => state.togglePause);

    return (
        <div className={cn("flex items-center gap-2", className)}>
            <Button
                variant="ghost"
                size="icon"
                className="text-white hover:text-white/80"
                onClick={toggleMute}
            >
                {isMuted ? (
                    <VolumeX className="h-5 w-5" />
                ) : (
                    <Volume2 className="h-5 w-5" />
                )}
            </Button>
            <Button
                variant="ghost"
                size="icon"
                className="text-white hover:text-white/80"
                onClick={togglePause}
            >
                {isPaused ? (
                    <Play className="h-5 w-5" />
                ) : (
                    <Pause className="h-5 w-5" />
                )}
            </Button>
        </div>
    );
} 