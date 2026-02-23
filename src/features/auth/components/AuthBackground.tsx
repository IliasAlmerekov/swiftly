import { lazy, Suspense, useEffect, useState } from 'react';

const LiquidEther = lazy(() => import('@/components/LiquidEther'));

const canUseDOM = typeof window !== 'undefined';

const prefersReducedMotion = (): boolean =>
  canUseDOM && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const runOnIdle = (callback: () => void): (() => void) => {
  if (!canUseDOM) {
    return () => undefined;
  }

  const windowWithIdle = window as Window & {
    requestIdleCallback?: (cb: () => void, options?: { timeout: number }) => number;
    cancelIdleCallback?: (id: number) => void;
  };

  if (typeof windowWithIdle.requestIdleCallback === 'function') {
    const idleId = windowWithIdle.requestIdleCallback(callback, { timeout: 1000 });
    return () => windowWithIdle.cancelIdleCallback?.(idleId);
  }

  const timeoutId = globalThis.setTimeout(callback, 120);
  return () => globalThis.clearTimeout(timeoutId);
};

export const AuthBackground = () => {
  const [showEffect, setShowEffect] = useState(false);

  useEffect(() => {
    if (prefersReducedMotion()) {
      return;
    }

    return runOnIdle(() => setShowEffect(true));
  }, []);

  return (
    <div className="pointer-events-none absolute inset-0">
      <div className="bg-card absolute inset-0" />
      {showEffect ? (
        <Suspense fallback={null}>
          <LiquidEther
            colors={['#0000db']}
            mouseForce={9}
            cursorSize={55}
            resolution={0.25}
            isViscous
            viscous={15}
            iterationsViscous={10}
            iterationsPoisson={12}
            isBounce={false}
            autoDemo
            autoSpeed={0.25}
            autoIntensity={0.7}
            takeoverDuration={0.25}
            autoResumeDelay={3000}
            autoRampDuration={0.6}
          />
        </Suspense>
      ) : null}
    </div>
  );
};

export default AuthBackground;
