import { useToast } from "./use-toast";

type ShareType = "property" | "reel" | "post";

/**
 * Hook to handle sharing functionality across the app.
 * Generates a shareable URL and copies it to the clipboard.
 */
export const useShare = () => {
  const { toast } = useToast();

  const handleShare = async (e: React.MouseEvent | undefined, type: ShareType, id: string) => {
    if (e) e.stopPropagation();

    if (!id) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo generar el enlace para compartir",
      });
      return;
    }

    // Base URL configuration for sharing
    // You can move this to an environment variable later
    const SHARE_BASE_URL = "https://feeds.ilyrox.com";
    const shareUrl = `${SHARE_BASE_URL}/?type=${type}&id=${id}`;

    try {
      if (navigator.share && /mobile/i.test(navigator.userAgent)) {
        await navigator.share({
          title: "i360 - Compartir",
          url: shareUrl,
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        toast({
          title: "Enlace copiado",
          description: "El enlace se ha copiado al portapapeles",
        });
      }
    } catch (error) {
      if (error instanceof Error && error.name !== "AbortError") {
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudo compartir el enlace",
        });
      }
    }
  };

  return { handleShare };
};
