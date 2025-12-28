
import React from 'react';
import { X, Bell, Trash2, CheckCircle2, Clock, Play } from 'lucide-react';
import { AppNotification } from '../types';

interface NotificationCenterProps {
  notifications: AppNotification[];
  onClose: () => void;
  onRead: (id: string) => void;
  onDelete: (id: string) => void;
  onClearAll: () => void;
  onAction: (contentId: string) => void;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({
  notifications,
  onClose,
  onRead,
  onDelete,
  onClearAll,
  onAction
}) => {
  return (
    <div className="fixed inset-y-0 right-0 w-full md:w-96 bg-[#0f0f0f] border-l border-neutral-800 z-[300] shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col">
      <div className="p-6 border-b border-neutral-800 flex items-center justify-between bg-black/20">
        <div className="flex items-center gap-3">
          <Bell size={20} className="text-yellow-500" />
          <h2 className="text-lg font-black uppercase tracking-widest">Alertas</h2>
        </div>
        <div className="flex items-center gap-2">
          {notifications.length > 0 && (
            <button 
              onClick={onClearAll}
              className="p-2 text-neutral-500 hover:text-red-500 transition-colors"
              title="Limpar tudo"
            >
              <Trash2 size={18} />
            </button>
          )}
          <button 
            onClick={onClose}
            className="p-2 text-neutral-500 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
        {notifications.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-10 space-y-4">
            <div className="w-16 h-16 bg-neutral-900 rounded-full flex items-center justify-center text-neutral-700">
              <Bell size={32} />
            </div>
            <div>
              <p className="text-white font-bold">Sem notificações</p>
              <p className="text-neutral-500 text-xs mt-1">Siga seus canais favoritos para receber alertas de novos vídeos.</p>
            </div>
          </div>
        ) : (
          notifications.map((notif) => (
            <div 
              key={notif.id}
              onClick={() => { onRead(notif.id); onAction(notif.contentId); }}
              className={`relative group p-4 rounded-2xl border transition-all cursor-pointer ${
                notif.read 
                  ? 'bg-neutral-900/40 border-neutral-800/50 grayscale-[0.5]' 
                  : 'bg-neutral-900 border-yellow-500/20 shadow-lg shadow-yellow-500/5'
              }`}
            >
              {!notif.read && (
                <span className="absolute top-4 right-4 w-2 h-2 bg-yellow-500 rounded-full shadow-[0_0_8px_#facc15]" />
              )}
              
              <div className="flex gap-4">
                <div className="w-16 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-black border border-neutral-800">
                  <img src={notif.thumbnail} alt="" className="w-full h-full object-cover" />
                </div>
                
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-1.5 text-[10px] font-black text-yellow-500 uppercase tracking-widest">
                    <CheckCircle2 size={10} />
                    <span>{notif.type === 'new_content' ? 'Novo Conteúdo' : 'Sistema'}</span>
                  </div>
                  <h3 className="text-sm font-bold text-white line-clamp-1">{notif.title}</h3>
                  <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed">{notif.message}</p>
                  
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-1.5 text-[10px] text-neutral-500 font-bold uppercase">
                      <Clock size={10} />
                      {new Date(notif.timestamp).toLocaleDateString()}
                    </div>
                    <button 
                      onClick={(e) => { e.stopPropagation(); onDelete(notif.id); }}
                      className="p-1.5 text-neutral-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="absolute inset-0 bg-yellow-500/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl pointer-events-none" />
            </div>
          ))
        )}
      </div>

      {notifications.length > 0 && (
        <div className="p-6 bg-black/20 border-t border-neutral-800 text-center">
          <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest">
            Fique por dentro das novidades da Lumina
          </p>
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;
