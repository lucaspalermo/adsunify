"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp,
  CheckCircle,
  AlertTriangle,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Notification {
  id: string;
  icon: LucideIcon;
  iconColor: string;
  iconBg: string;
  title: string;
  description: string;
  time: string;
  unread: boolean;
  action?: string;
}

const notifications: Notification[] = [
  {
    id: "1",
    icon: TrendingUp,
    iconColor: "text-green-400",
    iconBg: "bg-green-500/10",
    title: "Ranking atualizado",
    description: 'Sua keyword "marketing digital" subiu para a posição #3.',
    time: "5 min atrás",
    unread: true,
    action: "Ver detalhes",
  },
  {
    id: "2",
    icon: Sparkles,
    iconColor: "text-purple-400",
    iconBg: "bg-purple-500/10",
    title: "Nova missão disponível",
    description: "Complete sua análise de concorrentes e ganhe 50 XP.",
    time: "1h atrás",
    unread: true,
    action: "Iniciar missão",
  },
  {
    id: "3",
    icon: AlertTriangle,
    iconColor: "text-amber-400",
    iconBg: "bg-amber-500/10",
    title: "Alerta de queda",
    description: "Tráfego orgânico caiu 12% na última semana.",
    time: "3h atrás",
    unread: false,
  },
  {
    id: "4",
    icon: CheckCircle,
    iconColor: "text-cyan-400",
    iconBg: "bg-cyan-500/10",
    title: "Relatório pronto",
    description: "Seu relatório semanal de SEO está disponível.",
    time: "1 dia atrás",
    unread: false,
  },
];

interface NotificationHubProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationHub({ isOpen, onClose }: NotificationHubProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: -8, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.96 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className={cn(
            "absolute right-0 top-full mt-2 w-[380px] max-w-[calc(100vw-2rem)]",
            "rounded-2xl bg-white border border-slate-200",
            "shadow-xl overflow-hidden z-50"
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
            <h3 className="text-sm font-semibold text-slate-900">Notificações</h3>
            <button className="text-xs font-medium text-violet-600 transition-colors hover:text-violet-700">
              Marcar todas como lidas
            </button>
          </div>

          {/* Notifications list */}
          <div className="max-h-[360px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <p className="text-sm text-slate-400">
                  Nenhuma notificação por enquanto
                </p>
              </div>
            ) : (
              notifications.map((n, i) => {
                const Icon = n.icon;
                return (
                  <motion.div
                    key={n.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05, duration: 0.2 }}
                    className={cn(
                      "flex items-start gap-3 px-5 py-3.5 transition-colors hover:bg-slate-50",
                      i < notifications.length - 1 && "border-b border-slate-100"
                    )}
                  >
                    {/* Icon */}
                    <div
                      className={cn(
                        "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
                        n.iconBg
                      )}
                    >
                      <Icon className={cn("h-4 w-4", n.iconColor)} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium text-slate-900">
                          {n.title}
                        </p>
                        {n.unread && (
                          <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-purple-500" />
                        )}
                      </div>
                      <p className="mt-0.5 text-xs text-slate-600 leading-relaxed">
                        {n.description}
                      </p>
                      <div className="mt-2 flex items-center gap-3">
                        <span className="text-[11px] text-slate-400">
                          {n.time}
                        </span>
                        {n.action && (
                          <button className="text-[11px] font-medium text-violet-600 transition-colors hover:text-violet-700">
                            {n.action}
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default NotificationHub;
