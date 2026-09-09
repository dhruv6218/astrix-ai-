import { useEffect, useRef } from 'react';

export function useMagnetic(strength = 0.3) {
  const ref = useRef<HTMLDivElement | HTMLButtonElement | HTMLAnchorElement>(null);

  useEffect(() => {
    const element = ref.current;
    // Disable on touch devices
    if (!element || window.matchMedia('(pointer: coarse)').matches) return;

    const handleMouseMove = (e: Event) => {
      const mouseEvent = e as MouseEvent;
      const rect = element.getBoundingClientRect();
      const h = rect.width / 2;
      const w = rect.height / 2;
      const x = mouseEvent.clientX - rect.left - h;
      const y = mouseEvent.clientY - rect.top - w;

      (element as HTMLElement).style.transform = `translate(${x * strength}px, ${y * strength}px)`;
    };

    const handleMouseLeave = () => {
      (element as HTMLElement).style.transform = `translate(0px, 0px)`;
    };

    element.addEventListener('mousemove', handleMouseMove);
    element.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      element.removeEventListener('mousemove', handleMouseMove);
      element.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [strength]);

  return ref;
}
