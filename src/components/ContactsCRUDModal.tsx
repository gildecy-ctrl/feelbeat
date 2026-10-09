import React, { useState, useEffect } from 'react';
import { hapticEngine } from '../utils/haptics';

export interface Contact {
  id: string;
  name: string;
  phone: string;
  email: string;
  category: 'interpreter' | 'community' | 'support' | 'emergency';
  preferredChannel: 'video_libras' | 'whatsapp_text' | 'haptic_sync' | 'email';
  notes?: string;
  isFavorite: boolean;
  avatarColor: string;
}

const STORAGE_KEY = 'feelbeat_contacts_list';

const INITIAL_CONTACTS: Contact[] = [
  {
    id: 'c1',
    name: 'Camila Rocha',
    phone: '+55 (11) 98765-4321',
    email: 'camila.libras@feelbeat.app',
    category: 'interpreter',
    preferredChannel: 'video_libras',
    notes: 'Intérprete oficial da faixa Solaris Pulse. Especialista em música eletrônica e ritmo.',
    isFavorite: true,
    avatarColor: '#00f2fe',
  },
  {
    id: 'c2',
    name: 'Marcos Vinicius',
    phone: '+55 (21) 99876-5432',
    email: 'marcos.v@libras.org.br',
    category: 'interpreter',
    preferredChannel: 'video_libras',
    notes: 'Tradutor intérprete especializado em métrica de hip-hop e expressões periféricas.',
    isFavorite: true,
    avatarColor: '#ff4b89',
  },
  {
    id: 'c3',
    name: 'Central de Acessibilidade FeelBeat',
    phone: '0800 777 5427',
    email: 'suporte@feelbeat.app',
    category: 'support',
    preferredChannel: 'video_libras',
    notes: 'Suporte técnico 24h em Língua Brasileira de Sinais para dispositivos táteis.',
    isFavorite: false,
    avatarColor: '#dbb8ff',
  },
  {
    id: 'c4',
    name: 'Lucas Menezes (Parceiro Háptico)',
    phone: '+55 (31) 98123-4567',
    email: 'lucas.menezes@gmail.com',
    category: 'community',
    preferredChannel: 'haptic_sync',
    notes: 'Amigo para sessões musicais com Woojer Vest sincronizado.',
    isFavorite: false,
    avatarColor: '#6ff6ff',
  },
  {
    id: 'c5',
    name: 'Dra. Helena Ribeiro (Fonoaudiologia)',
    phone: '+55 (11) 97111-2233',
    email: 'helena.ribeiro@clinica.com.br',
    category: 'emergency',
    preferredChannel: 'whatsapp_text',
    notes: 'Acompanhamento de percepção vibrotátil e resposta coclear.',
    isFavorite: false,
    avatarColor: '#ffd9e0',
  },
];

interface ContactsCRUDModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSongTitle?: string;
}

export const ContactsCRUDModal: React.FC<ContactsCRUDModalProps> = ({
  isOpen,
  onClose,
  currentSongTitle = 'Solaris Pulse',
}) => {
  // Load contacts from localStorage or use initial list
  const [contacts, setContacts] = useState<Contact[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // fallback
    }
    return INITIAL_CONTACTS;
  });

  // Save to localStorage whenever contacts change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(contacts));
    } catch {
      // ignore
    }
  }, [contacts]);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'interpreter' | 'community' | 'support' | 'emergency'>('all');

  // Form Modal state (Create / Edit)
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);

  // Form Fields
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formCategory, setFormCategory] = useState<Contact['category']>('interpreter');
  const [formChannel, setFormChannel] = useState<Contact['preferredChannel']>('video_libras');
  const [formNotes, setFormNotes] = useState('');
  const [formIsFavorite, setFormIsFavorite] = useState(false);
  const [formError, setFormError] = useState('');

  // Delete Confirm Modal state
  const [deleteCandidate, setDeleteCandidate] = useState<Contact | null>(null);

  // Success Notification
  const [notification, setNotification] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  if (!isOpen) return null;

  // Open Form for Creating New Contact
  const handleOpenCreate = () => {
    setEditingContact(null);
    setFormName('');
    setFormPhone('');
    setFormEmail('');
    setFormCategory('interpreter');
    setFormChannel('video_libras');
    setFormNotes('');
    setFormIsFavorite(false);
    setFormError('');
    setIsFormOpen(true);
    hapticEngine.triggerClickFeedback();
  };

  // Open Form for Editing Existing Contact
  const handleOpenEdit = (contact: Contact) => {
    setEditingContact(contact);
    setFormName(contact.name);
    setFormPhone(contact.phone);
    setFormEmail(contact.email);
    setFormCategory(contact.category);
    setFormChannel(contact.preferredChannel);
    setFormNotes(contact.notes || '');
    setFormIsFavorite(contact.isFavorite);
    setFormError('');
    setIsFormOpen(true);
    hapticEngine.triggerClickFeedback();
  };

  // Save Contact (Create or Update)
  const handleSaveContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      setFormError('Por favor, informe o nome do contato.');
      return;
    }
    if (!formPhone.trim() && !formEmail.trim()) {
      setFormError('Informe ao menos um telefone ou e-mail de contato.');
      return;
    }

    const avatarColors = ['#00f2fe', '#ff4b89', '#dbb8ff', '#6ff6ff', '#ffd9e0'];
    const randomColor = avatarColors[Math.floor(Math.random() * avatarColors.length)];

    if (editingContact) {
      // Update
      setContacts((prev) =>
        prev.map((c) =>
          c.id === editingContact.id
            ? {
                ...c,
                name: formName.trim(),
                phone: formPhone.trim(),
                email: formEmail.trim(),
                category: formCategory,
                preferredChannel: formChannel,
                notes: formNotes.trim(),
                isFavorite: formIsFavorite,
              }
            : c
        )
      );
      showNotification(`Contato "${formName}" atualizado com sucesso!`);
    } else {
      // Create
      const newContact: Contact = {
        id: 'contact_' + Date.now(),
        name: formName.trim(),
        phone: formPhone.trim(),
        email: formEmail.trim(),
        category: formCategory,
        preferredChannel: formChannel,
        notes: formNotes.trim(),
        isFavorite: formIsFavorite,
        avatarColor: randomColor,
      };
      setContacts((prev) => [newContact, ...prev]);
      showNotification(`Contato "${formName}" adicionado com sucesso!`);
    }

    hapticEngine.playTactilePulse(75, 120, 8);
    setIsFormOpen(false);
  };

  // Delete Contact
  const handleConfirmDelete = () => {
    if (!deleteCandidate) return;
    setContacts((prev) => prev.filter((c) => c.id !== deleteCandidate.id));
    showNotification(`Contato "${deleteCandidate.name}" removido.`);
    hapticEngine.playTactilePulse(50, 150, 9);
    setDeleteCandidate(null);
  };

  // Toggle Favorite
  const handleToggleFavorite = (id: string) => {
    setContacts((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isFavorite: !c.isFavorite } : c))
    );
    hapticEngine.triggerClickFeedback();
  };

  // Filtered contacts
  const filteredContacts = contacts.filter((c) => {
    const matchesQuery =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.notes && c.notes.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesQuery) return false;
    if (categoryFilter !== 'all' && c.category !== categoryFilter) return false;
    return true;
  });

  const getCategoryBadge = (category: Contact['category']) => {
    switch (category) {
      case 'interpreter':
        return { label: 'Intérprete Libras', bg: 'bg-[#00f2fe]/15 text-[#00f2fe] border-[#00f2fe]/30' };
      case 'community':
        return { label: 'Comunidade Surda', bg: 'bg-[#ff4b89]/15 text-[#ff4b89] border-[#ff4b89]/30' };
      case 'support':
        return { label: 'Suporte Acessível', bg: 'bg-[#dbb8ff]/15 text-[#dbb8ff] border-[#dbb8ff]/30' };
      case 'emergency':
        return { label: 'Contato de Emergência', bg: 'bg-[#ffb4ab]/15 text-[#ffb4ab] border-[#ffb4ab]/30' };
    }
  };

  const getChannelInfo = (channel: Contact['preferredChannel']) => {
    switch (channel) {
      case 'video_libras':
        return { label: 'Vídeo Chamada Libras', icon: 'videocam' };
      case 'whatsapp_text':
        return { label: 'WhatsApp / Texto', icon: 'chat' };
      case 'haptic_sync':
        return { label: 'Sessão Háptica Compartilhada', icon: 'vibration' };
      case 'email':
        return { label: 'E-mail', icon: 'mail' };
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl max-h-[90vh] rounded-2xl bg-[#1b1b1f] border border-white/10 shadow-2xl flex flex-col text-[#e4e1e7] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-[#1f1f24]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#00f2fe]/15 flex items-center justify-center text-[#00f2fe] border border-[#00f2fe]/30 shadow-[0_0_12px_rgba(0,242,254,0.25)]">
              <span className="material-symbols-outlined text-[22px]">contacts</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-[18px] text-[#e0fdff] tracking-tight">
                  Gestão de Contatos & Intérpretes
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#ff4b89]/20 text-[#ff4b89]">
                  CRUD Ativo
                </span>
              </div>
              <p className="text-[12px] text-[#b9cacb]">
                Rede de intérpretes de Libras, suporte de acessibilidade e comunidade
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleOpenCreate}
              className="px-3.5 py-1.5 rounded-xl bg-[#00f2fe] hover:bg-[#6ff6ff] text-[#00373a] font-bold text-[12px] flex items-center gap-1.5 shadow-[0_0_12px_rgba(0,242,254,0.35)] active:scale-95 transition-all"
              type="button"
            >
              <span className="material-symbols-outlined text-[17px]">person_add</span>
              <span className="hidden sm:inline">Novo Contato</span>
              <span className="sm:hidden">Novo</span>
            </button>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-[#2a292e] hover:bg-[#353439] flex items-center justify-center text-[#b9cacb] hover:text-white transition-colors"
              title="Fechar"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>
        </div>

        {/* Notification Toast */}
        {notification && (
          <div className="bg-[#00f2fe]/20 border-b border-[#00f2fe]/30 px-4 py-2 text-[12px] text-[#e0fdff] flex items-center gap-2 animate-fadeIn">
            <span className="material-symbols-outlined text-[#00f2fe] text-[16px]">check_circle</span>
            <span>{notification}</span>
          </div>
        )}

        {/* Toolbar: Search & Category Filter */}
        <div className="p-4 border-b border-white/5 bg-[#17171b] flex flex-col gap-2.5">
          <div className="relative w-full">
            <span className="material-symbols-outlined absolute left-3.5 top-2.5 text-[18px] text-[#849495]">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar contato por nome, telefone, e-mail ou observações..."
              className="w-full bg-[#131317] border border-white/10 rounded-xl pl-10 pr-4 py-2 text-[13px] text-[#e4e1e7] placeholder-[#849495] focus:outline-none focus:border-[#00f2fe] transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-[#849495] hover:text-white text-[16px]"
              >
                ✕
              </button>
            )}
          </div>

          {/* Category Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 text-[11px] font-bold">
            <button
              onClick={() => {
                setCategoryFilter('all');
                hapticEngine.triggerClickFeedback();
              }}
              className={`px-3 py-1 rounded-lg transition-all whitespace-nowrap ${
                categoryFilter === 'all'
                  ? 'bg-[#00f2fe] text-[#00373a] shadow-sm'
                  : 'bg-[#2a292e] text-[#b9cacb] hover:text-white'
              }`}
            >
              Todos ({contacts.length})
            </button>
            <button
              onClick={() => {
                setCategoryFilter('interpreter');
                hapticEngine.triggerClickFeedback();
              }}
              className={`px-3 py-1 rounded-lg transition-all whitespace-nowrap ${
                categoryFilter === 'interpreter'
                  ? 'bg-[#00f2fe] text-[#00373a] shadow-sm'
                  : 'bg-[#2a292e] text-[#b9cacb] hover:text-white'
              }`}
            >
              Intérpretes ({contacts.filter((c) => c.category === 'interpreter').length})
            </button>
            <button
              onClick={() => {
                setCategoryFilter('community');
                hapticEngine.triggerClickFeedback();
              }}
              className={`px-3 py-1 rounded-lg transition-all whitespace-nowrap ${
                categoryFilter === 'community'
                  ? 'bg-[#ff4b89] text-[#590026] shadow-sm'
                  : 'bg-[#2a292e] text-[#b9cacb] hover:text-white'
              }`}
            >
              Comunidade Surda ({contacts.filter((c) => c.category === 'community').length})
            </button>
            <button
              onClick={() => {
                setCategoryFilter('support');
                hapticEngine.triggerClickFeedback();
              }}
              className={`px-3 py-1 rounded-lg transition-all whitespace-nowrap ${
                categoryFilter === 'support'
                  ? 'bg-[#dbb8ff] text-[#470083] shadow-sm'
                  : 'bg-[#2a292e] text-[#b9cacb] hover:text-white'
              }`}
            >
              Suporte Acessível ({contacts.filter((c) => c.category === 'support').length})
            </button>
            <button
              onClick={() => {
                setCategoryFilter('emergency');
                hapticEngine.triggerClickFeedback();
              }}
              className={`px-3 py-1 rounded-lg transition-all whitespace-nowrap ${
                categoryFilter === 'emergency'
                  ? 'bg-[#ffb4ab] text-[#690005] shadow-sm'
                  : 'bg-[#2a292e] text-[#b9cacb] hover:text-white'
              }`}
            >
              Emergência ({contacts.filter((c) => c.category === 'emergency').length})
            </button>
          </div>
        </div>

        {/* Contacts List (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 min-h-[300px]">
          {filteredContacts.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center text-[#b9cacb] gap-2">
              <span className="material-symbols-outlined text-[42px] text-[#849495]">
                person_search
              </span>
              <p className="font-bold text-[15px] text-[#e4e1e7]">Nenhum contato encontrado</p>
              <p className="text-[12px] max-w-sm">
                Não há contatos correspondentes aos filtros selecionados. Clique em "Novo Contato" para cadastrar um intérprete ou parceiro.
              </p>
              <button
                onClick={handleOpenCreate}
                className="mt-2 px-4 py-2 rounded-xl bg-[#00f2fe] text-[#00373a] font-bold text-[12px]"
              >
                Cadastrar Novo Contato
              </button>
            </div>
          ) : (
            filteredContacts.map((contact) => {
              const badge = getCategoryBadge(contact.category);
              const channel = getChannelInfo(contact.preferredChannel);

              return (
                <div
                  key={contact.id}
                  className="p-3.5 sm:p-4 rounded-xl bg-[#1f1f24] hover:bg-[#25252b] border border-white/5 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                >
                  {/* Left: Avatar + Contact Info */}
                  <div className="flex items-start gap-3 min-w-0">
                    {/* Monogram Avatar */}
                    <div
                      className="w-11 h-11 rounded-full flex items-center justify-center font-extrabold text-[16px] text-[#131317] shrink-0 shadow-md ring-2 ring-white/10"
                      style={{ backgroundColor: contact.avatarColor }}
                    >
                      {contact.name.charAt(0).toUpperCase()}
                    </div>

                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-bold text-[15px] text-[#e0fdff] truncate">
                          {contact.name}
                        </h4>
                        {/* Category Badge */}
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${badge.bg}`}
                        >
                          {badge.label}
                        </span>
                        {/* Favorite star */}
                        <button
                          onClick={() => handleToggleFavorite(contact.id)}
                          className="text-[#b9cacb] hover:text-[#ff4b89] transition-colors"
                          title={contact.isFavorite ? 'Remover dos favoritos' : 'Favoritar'}
                        >
                          <span
                            className="material-symbols-outlined text-[16px]"
                            style={{
                              color: contact.isFavorite ? '#ff4b89' : undefined,
                              fontVariationSettings: contact.isFavorite ? "'FILL' 1" : "'FILL' 0",
                            }}
                          >
                            star
                          </span>
                        </button>
                      </div>

                      {/* Phone & Email */}
                      <div className="flex items-center gap-3 text-[12px] text-[#b9cacb] mt-1 flex-wrap">
                        {contact.phone && (
                          <div className="flex items-center gap-1 font-mono">
                            <span className="material-symbols-outlined text-[14px] text-[#00f2fe]">call</span>
                            <span>{contact.phone}</span>
                          </div>
                        )}
                        {contact.email && (
                          <div className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px] text-[#ff4b89]">mail</span>
                            <span className="truncate max-w-[200px]">{contact.email}</span>
                          </div>
                        )}
                      </div>

                      {/* Preferred communication channel */}
                      <div className="flex items-center gap-1.5 mt-1 text-[11px] text-[#dbb8ff]">
                        <span className="material-symbols-outlined text-[13px]">{channel.icon}</span>
                        <span>Canal preferido: <strong>{channel.label}</strong></span>
                      </div>

                      {/* Notes */}
                      {contact.notes && (
                        <p className="text-[11px] text-[#849495] mt-1 line-clamp-1 italic">
                          "{contact.notes}"
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right: Quick Action Buttons & CRUD Operations */}
                  <div className="flex items-center gap-1.5 sm:self-center shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/5">
                    {/* Quick Action: Share song session */}
                    <button
                      onClick={() => {
                        showNotification(`Sessão de "${currentSongTitle}" compartilhada com ${contact.name}!`);
                        hapticEngine.playTactilePulse(70, 180, 8);
                      }}
                      className="px-2.5 py-1.5 rounded-lg bg-[#2a292e] hover:bg-[#353439] text-[#00f2fe] text-[11px] font-bold flex items-center gap-1 border border-white/5"
                      title="Compartilhar Faixa Atual"
                      type="button"
                    >
                      <span className="material-symbols-outlined text-[15px]">share</span>
                      <span className="hidden md:inline">Enviar Faixa</span>
                    </button>

                    {/* Quick Action: Call Video Libras */}
                    <button
                      onClick={() => {
                        showNotification(`Iniciando conexão de vídeo em Libras com ${contact.name}...`);
                        hapticEngine.playTactilePulse(80, 250, 9);
                      }}
                      className="px-2.5 py-1.5 rounded-lg bg-[#00f2fe]/15 hover:bg-[#00f2fe]/25 text-[#00f2fe] text-[11px] font-bold flex items-center gap-1 border border-[#00f2fe]/30"
                      title="Iniciar Conexão Libras"
                      type="button"
                    >
                      <span className="material-symbols-outlined text-[15px]">videocam</span>
                      <span className="hidden md:inline">Libras</span>
                    </button>

                    {/* Edit button */}
                    <button
                      onClick={() => handleOpenEdit(contact)}
                      className="w-8 h-8 rounded-lg bg-[#2a292e] hover:bg-[#353439] text-[#e4e1e7] flex items-center justify-center transition-colors"
                      title="Editar Contato"
                      type="button"
                    >
                      <span className="material-symbols-outlined text-[16px]">edit</span>
                    </button>

                    {/* Delete button */}
                    <button
                      onClick={() => setDeleteCandidate(contact)}
                      className="w-8 h-8 rounded-lg bg-[#2a292e] hover:bg-[#93000a]/50 text-[#ffb4ab] flex items-center justify-center transition-colors"
                      title="Excluir Contato"
                      type="button"
                    >
                      <span className="material-symbols-outlined text-[16px]">delete</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3.5 px-5 bg-[#17171b] border-t border-white/10 flex items-center justify-between text-[11px] text-[#b9cacb]">
          <span>{contacts.length} contatos cadastrados no FeelBeat</span>
          <span className="text-[#00f2fe] font-semibold">Persistência Local Automática</span>
        </div>
      </div>

      {/* CREATE / EDIT FORM SUB-MODAL */}
      {isFormOpen && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-fade-in"
          onClick={() => setIsFormOpen(false)}
        >
          <div
            className="w-full max-w-lg rounded-2xl bg-[#2a292e] border border-white/10 shadow-2xl p-5 flex flex-col gap-4 text-[#e4e1e7]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#00f2fe] text-[22px]">
                  {editingContact ? 'edit' : 'person_add'}
                </span>
                <h3 className="font-extrabold text-[17px] text-[#e0fdff]">
                  {editingContact ? 'Editar Contato' : 'Adicionar Novo Contato'}
                </h3>
              </div>
              <button
                onClick={() => setIsFormOpen(false)}
                className="w-8 h-8 rounded-full bg-[#1f1f24] hover:bg-[#353439] flex items-center justify-center text-[#b9cacb]"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            {formError && (
              <div className="p-2.5 rounded-lg bg-[#93000a]/40 border border-[#ffb4ab]/30 text-[#ffdad6] text-[12px] flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px]">error</span>
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSaveContact} className="flex flex-col gap-3.5">
              {/* Nome */}
              <div>
                <label className="text-[12px] font-bold text-[#b9cacb] block mb-1">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Ex: Camila Rocha"
                  className="w-full bg-[#1b1b1f] border border-white/10 rounded-xl px-3.5 py-2 text-[13px] text-[#e4e1e7] focus:outline-none focus:border-[#00f2fe]"
                />
              </div>

              {/* Telefone & Email grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[12px] font-bold text-[#b9cacb] block mb-1">
                    Telefone / WhatsApp
                  </label>
                  <input
                    type="text"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="+55 (11) 98765-4321"
                    className="w-full bg-[#1b1b1f] border border-white/10 rounded-xl px-3.5 py-2 text-[13px] text-[#e4e1e7] focus:outline-none focus:border-[#00f2fe]"
                  />
                </div>
                <div>
                  <label className="text-[12px] font-bold text-[#b9cacb] block mb-1">
                    E-mail
                  </label>
                  <input
                    type="email"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="contato@exemplo.com"
                    className="w-full bg-[#1b1b1f] border border-white/10 rounded-xl px-3.5 py-2 text-[13px] text-[#e4e1e7] focus:outline-none focus:border-[#00f2fe]"
                  />
                </div>
              </div>

              {/* Categoria & Canal Preferido */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[12px] font-bold text-[#b9cacb] block mb-1">
                    Categoria do Contato
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as Contact['category'])}
                    className="w-full bg-[#1b1b1f] border border-white/10 rounded-xl px-3 py-2 text-[13px] text-[#e4e1e7] focus:outline-none focus:border-[#00f2fe]"
                  >
                    <option value="interpreter">Intérprete Libras</option>
                    <option value="community">Comunidade Surda</option>
                    <option value="support">Suporte Acessível</option>
                    <option value="emergency">Contato de Emergência</option>
                  </select>
                </div>
                <div>
                  <label className="text-[12px] font-bold text-[#b9cacb] block mb-1">
                    Canal de Contato Preferido
                  </label>
                  <select
                    value={formChannel}
                    onChange={(e) => setFormChannel(e.target.value as Contact['preferredChannel'])}
                    className="w-full bg-[#1b1b1f] border border-white/10 rounded-xl px-3 py-2 text-[13px] text-[#e4e1e7] focus:outline-none focus:border-[#00f2fe]"
                  >
                    <option value="video_libras">Vídeo Chamada Libras</option>
                    <option value="whatsapp_text">WhatsApp / Texto</option>
                    <option value="haptic_sync">Sessão Háptica Compartilhada</option>
                    <option value="email">E-mail</option>
                  </select>
                </div>
              </div>

              {/* Observações */}
              <div>
                <label className="text-[12px] font-bold text-[#b9cacb] block mb-1">
                  Observações & Especialidade
                </label>
                <textarea
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Ex: Intérprete credenciada para eventos ao vivo e traduções rítmicas..."
                  rows={2}
                  className="w-full bg-[#1b1b1f] border border-white/10 rounded-xl p-3 text-[13px] text-[#e4e1e7] focus:outline-none focus:border-[#00f2fe]"
                />
              </div>

              {/* Favorito Checkbox */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="formIsFav"
                  checked={formIsFavorite}
                  onChange={(e) => setFormIsFavorite(e.target.checked)}
                  className="w-4 h-4 rounded bg-[#1b1b1f] border-white/20 accent-[#ff4b89]"
                />
                <label htmlFor="formIsFav" className="text-[12px] font-semibold text-[#e4e1e7] cursor-pointer">
                  Marcar como contato favorito / prioritário
                </label>
              </div>

              {/* Form Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#1b1b1f] hover:bg-[#353439] text-[#b9cacb] font-bold text-[12px]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#00f2fe] hover:bg-[#6ff6ff] text-[#00373a] font-extrabold text-[12px] shadow-[0_0_12px_rgba(0,242,254,0.3)]"
                >
                  {editingContact ? 'Salvar Alterações' : 'Cadastrar Contato'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION DIALOG */}
      {deleteCandidate && (
        <div
          className="fixed inset-0 z-70 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-fade-in"
          onClick={() => setDeleteCandidate(null)}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-[#1f1f24] border border-[#ffb4ab]/30 shadow-2xl p-5 flex flex-col gap-3.5 text-[#e4e1e7]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2.5 text-[#ffb4ab]">
              <span className="material-symbols-outlined text-[24px]">warning</span>
              <h3 className="font-extrabold text-[16px]">Confirmar Exclusão</h3>
            </div>
            <p className="text-[13px] text-[#b9cacb] leading-relaxed">
              Tem certeza de que deseja remover o contato <strong className="text-white">"{deleteCandidate.name}"</strong>? Esta ação não pode ser desfeita.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={() => setDeleteCandidate(null)}
                className="px-3.5 py-1.5 rounded-xl bg-[#2a292e] hover:bg-[#353439] text-[#b9cacb] text-[12px] font-bold"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-1.5 rounded-xl bg-[#93000a] hover:bg-[#ba1a1a] text-[#ffdad6] text-[12px] font-bold shadow-md"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
