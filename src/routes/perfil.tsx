import { createFileRoute } from '@tanstack/react-router';
import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  ShieldCheck, 
  Crown, 
  ChevronRight, 
  Heart, 
  Users, 
  Coins, 
  HelpCircle 
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { EditProfileModal } from '../components/hotmatch/EditProfileModal';
import { PrivacyModal } from '../components/hotmatch/PrivacyModal';
import { VipModal } from '../components/hotmatch/VipModal';

export const Route = createFileRoute('/perfil')({
  component: ProfilePage,
});

function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Modais
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const [isVipModalOpen, setIsVipModalOpen] = useState(false);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Erro ao buscar perfil:', error);
      }

      if (data) {
        setUser(data);
      } else {
        setUser({ id: authUser.id, name: 'Usuário', age: 18 });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const photos = user?.photos || [];

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="text-gray-400">Carregando perfil...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-black text-white pb-28 px-4 pt-6">
      {/* Header Avatar & Info */}
      <div className="flex flex-col items-center mb-6">
        <div className="relative w-24 h-24 rounded-full p-1 bg-gradient-to-tr from-rose-500 via-purple-500 to-amber-400 mb-3">
          <div className="w-full h-full rounded-full overflow-hidden bg-gray-900 flex items-center justify-center border-2 border-black">
            {user?.avatar_url || (photos.length > 0) ? (
              <img 
                src={user?.avatar_url || photos[0]} 
                alt="Foto de perfil" 
                className="w-full h-full object-cover" 
              />
            ) : (
              <span className="text-3xl font-bold text-gray-400">
                {user?.name?.[0]?.toUpperCase() || 'M'}
              </span>
            )}
          </div>
        </div>

        <h1 className="text-xl font-bold flex items-center gap-1.5">
          {user?.name || 'Matheus'}, {user?.age || 18}
          {user?.is_vip && <Crown size={18} className="text-amber-400 fill-amber-400" />}
        </h1>

        <span className="mt-1 px-3 py-0.5 text-xs font-semibold rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30">
          {user?.is_vip ? 'Membro VIP' : 'Membro Gratuito'}
        </span>

        <p className="text-xs text-gray-400 mt-1">{user?.bio || 'Sem biografia'}</p>
      </div>

      {/* Cards de Métricas */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-4 flex flex-col items-center justify-center">
          <Heart size={20} className="text-rose-500 mb-1" />
          <span className="text-lg font-bold">{user?.interactions || 0}</span>
          <span className="text-xs text-gray-400">Interações</span>
        </div>
        <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-4 flex flex-col items-center justify-center">
          <Users size={20} className="text-amber-400 mb-1" />
          <span className="text-lg font-bold">{user?.following || 0}</span>
          <span className="text-xs text-gray-400">Seguindo</span>
        </div>
      </div>

      {/* Saldo de Moedas */}
      <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-4 flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400 font-bold">
            <Coins size={18} />
          </div>
          <div>
            <p className="text-xs text-gray-400">Saldo de moedas</p>
            <p className="text-lg font-bold text-white">{user?.coins || 0}</p>
          </div>
        </div>
        <button type="button" className="bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs px-4 py-2 rounded-full transition">
          Recarregar
        </button>
      </div>

      {/* Galeria */}
      <div className="bg-gray-900/60 border border-dashed border-gray-800 rounded-2xl p-6 text-center mb-6">
        {photos.length > 0 ? (
          <div className="grid grid-cols-3 gap-2">
            {photos.map((url: string, idx: number) => (
              <img key={idx} src={url} alt={`Foto ${idx + 1}`} className="w-full aspect-square object-cover rounded-xl" />
            ))}
          </div>
        ) : (
          <div>
            <h3 className="text-sm font-bold text-gray-300 mb-1">Galeria vazia</h3>
            <p className="text-xs text-gray-500">Adicione fotos em "Editar perfil e fotos".</p>
          </div>
        )}
      </div>

      {/* Menu de Opções com acionadores funcionais */}
      <div className="bg-gray-900/80 border border-gray-800 rounded-2xl overflow-hidden divide-y divide-gray-800/60 mb-4">
        <button 
          type="button"
          onClick={() => setIsEditModalOpen(true)}
          className="w-full flex items-center justify-between p-4 hover:bg-gray-800/50 transition text-left cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <Settings size={18} className="text-gray-400" />
            <span className="text-sm font-medium">Editar perfil e fotos</span>
          </div>
          <ChevronRight size={18} className="text-gray-500" />
        </button>

        <button 
          type="button"
          onClick={() => setIsPrivacyModalOpen(true)}
          className="w-full flex items-center justify-between p-4 hover:bg-gray-800/50 transition text-left cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <ShieldCheck size={18} className="text-gray-400" />
            <span className="text-sm font-medium">Privacidade e verificação</span>
          </div>
          <ChevronRight size={18} className="text-gray-500" />
        </button>

        <button 
          type="button"
          onClick={() => setIsVipModalOpen(true)}
          className="w-full flex items-center justify-between p-4 hover:bg-gray-800/50 transition text-left cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <Crown size={18} className="text-gray-400" />
            <span className="text-sm font-medium">Gerenciar assinatura VIP</span>
          </div>
          <ChevronRight size={18} className="text-gray-500" />
        </button>
      </div>

      <button type="button" className="bg-gray-900/80 border border-gray-800 rounded-2xl p-4 flex items-center justify-between hover:bg-gray-800/50 transition w-full text-left mb-6">
        <div className="flex items-center gap-3">
          <HelpCircle size={18} className="text-gray-400" />
          <span className="text-sm font-medium">Suporte HotMatch</span>
        </div>
        <ChevronRight size={18} className="text-gray-500" />
      </button>

      {/* Modais */}
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        user={user}
        onProfileUpdate={fetchProfile}
      />

      <PrivacyModal
        isOpen={isPrivacyModalOpen}
        onClose={() => setIsPrivacyModalOpen(false)}
      />

      <VipModal
        isOpen={isVipModalOpen}
        onClose={() => setIsVipModalOpen(false)}
      />
    </div>
  );
                }
