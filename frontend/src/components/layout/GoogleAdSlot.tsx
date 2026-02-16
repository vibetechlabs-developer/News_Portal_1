import { useEffect, useState } from "react";
import { getAdSlots, type AdPlacement, type GoogleAdSenseSlot } from "@/lib/api";
import { loadAdSenseScript, pushAdSenseAd } from "@/lib/adsense";

interface GoogleAdSlotProps {
  placement: AdPlacement;
  className?: string;
}

/**
 * Renders one or more Google AdSense slots for a given placement.
 * Slots are configured in the admin under "Ad slots (AdSense)".
 */
export function GoogleAdSlot({ placement, className = "" }: GoogleAdSlotProps) {
  const [slots, setSlots] = useState<GoogleAdSenseSlot[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await getAdSlots({ placement });
        if (cancelled) return;
        const active = (Array.isArray(data) ? data : []).filter(
          (s) => s.is_active && s.client_id && s.slot_id
        );
        setSlots(active);
      } catch {
        if (!cancelled) setSlots([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [placement]);

  useEffect(() => {
    if (!slots.length) return;
    const clientId = slots[0]?.client_id;
    if (!clientId) return;

    let cancelled = false;
    (async () => {
      try {
        await loadAdSenseScript(clientId);
        if (cancelled) return;
        // Trigger AdSense rendering for each slot on the page.
        slots.forEach(() => pushAdSenseAd());
      } catch {
        // Non-critical; ignore.
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [slots]);

  if (!slots.length) {
    return null;
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {slots.map((slot) => (
        <div key={slot.id} className="w-full flex justify-center">
          <ins
            className="adsbygoogle"
            style={{ display: "block" }}
            data-ad-client={slot.client_id}
            data-ad-slot={slot.slot_id}
            data-ad-format={slot.format || "auto"}
            data-full-width-responsive={slot.responsive ? "true" : undefined}
          />
        </div>
      ))}
    </div>
  );
}

