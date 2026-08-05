import React, { useState, useEffect } from 'react';
import { X, Upload, Trash2, Camera, Lock } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  onProfileUpdate: () => void;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  onClose,
  user,
  onProfileUpdate,
}) => {
  const [loading, setLoading] = useState(false);
  const [bio, setBio] = useState(user?.bio || '');
  const [publicPhotos, setPublicPhotos] = useState<string[]>(user?.photos || []);
  const [vipPhotos, setVipPhotos] = useState<string[]>(user?.vip_photos || []);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (user) {
      setBio(user.bio || '');
      setPublicPhotos(user.photos || []);
      setVipPhotos(user.vip_photos || []);
    }
  }, [user]);

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, isVip: boolean) => {
    try {
      setUploading(true);
      const files = e.target.files;
      if (!files || files.length === 0) return;

      const newUrls: string[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}/${Math.random()}.${fileExt}`;
        const bucket = isVip ? 'vip-photos' : 'profile-photos';

        const { error: uploadError } = await supabase.storage
          .from(bucket)
          .upload(fileName, file, { upsert: true });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from(bucket)
          .getPublicUrl(fileName);

        newUrls.push(publicUrl);
      }

      if (isVip) {
        setVipPhotos(prev => [...prev, ...newUrls]);
      } else {
        setPublicPhotos(prev => [...prev, ...newUrls]);
      }
    } catch (error: any) {
      alert('Erro ao fazer upload da imagem: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const removePhoto = (index: number, isVip: boolean) => {
    if (isVip) {
      setVipPhotos(prev => prev.filter((_, i) => i !== index));
    } else {
      setPublicPhotos(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);

      const { error } = await supabase
        .from('profiles')
        .update({
          bio,
          photos: publicPhotos,
          vip_photos: vipPhotos,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;

      onProfileUpdate();
      onClose();
    } catch (error: any) {
      alert('Erro ao salvar perfil: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-lg p-6 my-8 text-white relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 rounded-full hover:bg-gray-800"
        >
          <X size={20} />
        </button>

        <h2 className="text-xl font-bold mb-6 text-center">Editar Perfil</h2>

        <div className="space-y-6">
          {/* Bio */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Sobre você (Bio)</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl p-3 text-white focus:ring-2 focus:ring-rose-500 focus:outline-none"
              placeholder="Escreva algo interessante sobre você..."
            />
          </div>

          {/* Fotos Públicas */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                <Camera size={16} className="text-rose-500" /> Galeria Pública
              </label>
              <span className="text-xs text-gray-500">{publicPhotos.length} fotos</span>
            </div>
            
            <div className="grid grid-cols-3 gap-3 mb-3">
              {publicPhotos.map((url, idx) => (
                <div key={idx} className="relative aspect-square rounded-xl overflow-hidden group border border-gray-800">
                  <img src={url} alt="Pública" className="w-full h-full object-cover" />
                  <button
                    onClick={() => removePhoto(idx, false)}
                    className="absolute top-1 right-1 bg-red-600/80 p-1 rounded-full text-white opacity-90 hover:opacity-100"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
              
              <label className="aspect-square rounded-xl border-2 border-dashed border-gray-700 hover:border-rose-500 flex flex-col items-center justify-center cursor-pointer bg-gray-800/50">
                <Upload size={20} className="text-gray-400 mb-1" />
                <span className="text-xs text-gray-400">Adicionar</span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, false)}
                  className="hidden"
                  disabled={uploading}
                />
              </label>
            </div>
          </div>

          {/* Fotos VIP */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium text-amber-400 flex items-center gap-2">
                <Lock size={16} className="text-amber-400" /> Galeria VIP (Bloqueada)
              </label>
              <span className="text-xs text-amber-500/70">{vipPhotos.length} fotos VIP</span>
            </div>
            
            <div className="grid grid-cols-3 gap-3 mb-3">
              {vipPhotos.map((url, idx) => (
                <div key={idx} className="relative aspect-square rounded-xl overflow-hidden group border border-amber-500/30">
                  <img src={url} alt="VIP" className="w-full h-full object-cover" />
                  <button
                    onClick={() => removePhoto(idx, true)}
                    className="absolute top-1 right-1 bg-red-600/80 p-1 rounded-full text-white opacity-90 hover:opacity-100"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
              
              <label className="aspect-square rounded-xl border-2 border-dashed border-amber-500/40 hover:border-amber-400 flex flex-col items-center justify-center cursor-pointer bg-amber-500/5">
                <Upload size={20} className="text-amber-400 mb-1" />
                <span className="text-xs text-amber-400">Add VIP</span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, true)}
                  className="hidden"
                  disabled={uploading}
                />
              </label>
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-xl border border-gray-700 text-gray-300 font-medium hover:bg-gray-800"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={loading || uploading}
              className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 text-white font-bold hover:opacity-90 disabled:opacity-50"
            >
              {loading ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
              
