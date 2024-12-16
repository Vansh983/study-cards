import { Button } from '@/components/ui/button';
import { useAppStore } from '@/lib/store';
import { Volume2, VolumeX } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CardTypeSwitcherProps {
    className?: string;
}

export function CardTypeSwitcher({ className }: CardTypeSwitcherProps) {
    const cardType = useAppStore((state) => state.cardType);
    const setCardType = useAppStore((state) => state.setCardType);
    const isMuted = useAppStore((state) => state.isMuted);
    const toggleMute = useAppStore((state) => state.toggleMute);

    return (
        <div className={cn("flex items-center gap-2", className)}>
            <Button
                variant="ghost"
                size="icon"
                className="text-white hover:text-white/80"
                onClick={toggleMute}
            >
                {isMuted ? (
                    <VolumeX className="h-12 w-5" />
                ) : (
                    <Volume2 className="h-5 w-5" />
                )}
            </Button>
            {/* <div className="bg-black/20 backdrop-blur-sm rounded-full p-1 flex items-center">
                <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                        "rounded-full px-4 text-sm font-medium",
                        cardType === 'default' ? "bg-white text-black" : "text-white"
                    )}
                    onClick={() => setCardType('default')}
                >
                    Default
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                        "rounded-full px-4 text-sm font-medium",
                        cardType === 'video' ? "bg-white text-black" : "text-white"
                    )}
                    onClick={() => setCardType('video')}
                >
                    Video
                </Button>
            </div> */}

        </div >
    );
} 