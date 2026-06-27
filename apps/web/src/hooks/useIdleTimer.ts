"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface UseIdleTimerOptions {
  /** Tiempo de inactividad (ms) antes de mostrar el aviso. */
  idleMs: number;
  /** Duración del countdown (ms) antes del cierre automático. */
  warningMs: number;
  /** Se llama si el countdown llega a 0 sin que el usuario reaccione. */
  onTimeout?: () => void;
  /** Si es false, el timer queda desactivado (p. ej. mientras carga la sesión). */
  enabled?: boolean;
}

interface UseIdleTimerResult {
  showWarning: boolean;
  secondsLeft: number;
  /** Resetea el timer y cierra el aviso (lo llama "Continuar sesión"). */
  resetTimer: () => void;
}

const ACTIVITY_EVENTS = [
  "mousemove",
  "mousedown",
  "keydown",
  "touchstart",
  "scroll",
] as const;

/**
 * Detecta inactividad del usuario. Tras `idleMs` sin actividad muestra un aviso
 * y arranca un countdown de `warningMs`; si nadie reacciona, llama `onTimeout`.
 *
 * Mientras el aviso está visible, la actividad del usuario NO resetea el timer:
 * la decisión de continuar debe ser consciente (botón "Continuar sesión").
 */
export function useIdleTimer({
  idleMs,
  warningMs,
  onTimeout,
  enabled = true,
}: UseIdleTimerOptions): UseIdleTimerResult {
  const warningSeconds = Math.ceil(warningMs / 1000);

  const [showWarning, setShowWarning] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(warningSeconds);

  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const showWarningRef = useRef(false);
  const lastActivity = useRef(0);
  const onTimeoutRef = useRef(onTimeout);
  onTimeoutRef.current = onTimeout;

  const clearTimers = useCallback(() => {
    if (idleTimer.current) {
      clearTimeout(idleTimer.current);
      idleTimer.current = null;
    }
    if (countdownTimer.current) {
      clearInterval(countdownTimer.current);
      countdownTimer.current = null;
    }
  }, []);

  const startCountdown = useCallback(() => {
    showWarningRef.current = true;
    setShowWarning(true);
    setSecondsLeft(warningSeconds);
    countdownTimer.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearTimers();
          showWarningRef.current = false;
          setShowWarning(false);
          onTimeoutRef.current?.();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  }, [warningSeconds, clearTimers]);

  const startIdleTimer = useCallback(() => {
    clearTimers();
    idleTimer.current = setTimeout(startCountdown, idleMs);
  }, [idleMs, clearTimers, startCountdown]);

  const resetTimer = useCallback(() => {
    showWarningRef.current = false;
    setShowWarning(false);
    setSecondsLeft(warningSeconds);
    if (enabled) startIdleTimer();
    else clearTimers();
  }, [enabled, warningSeconds, startIdleTimer, clearTimers]);

  useEffect(() => {
    if (!enabled) {
      clearTimers();
      return;
    }

    startIdleTimer();

    const handleActivity = () => {
      // Durante el aviso, ignorar actividad: la decisión debe ser consciente.
      if (showWarningRef.current) return;
      const now = Date.now();
      if (now - lastActivity.current < 1000) return; // throttle: máx. 1 reset/seg
      lastActivity.current = now;
      startIdleTimer();
    };

    const handleVisibility = () => {
      if (document.visibilityState === "visible" && !showWarningRef.current) {
        startIdleTimer();
      }
    };

    ACTIVITY_EVENTS.forEach((ev) =>
      window.addEventListener(ev, handleActivity, { passive: true })
    );
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      clearTimers();
      ACTIVITY_EVENTS.forEach((ev) =>
        window.removeEventListener(ev, handleActivity)
      );
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [enabled, startIdleTimer, clearTimers]);

  return { showWarning, secondsLeft, resetTimer };
}
