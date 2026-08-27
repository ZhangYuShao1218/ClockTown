import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useGameState } from "../../hooks/useGameState";
import { useAuth } from "../../hooks/useAuth";
import { leaveRoom, setPlayerSeat } from "../../services/roomService";
import { CenterStage } from "./CenterStage";
import { Grimoire } from "./Grimoire";
import { GrimoireSettings } from "./GrimoireSettings";
import { ScriptInfoModal } from "./ScriptInfoModal";
import { RoleInfoModal } from "./RoleInfoModal";
import { NightOrderModal } from "./NightOrderModal";
import { Chat } from "./Chat";
import { AlertDialog } from "../common/AlertDialog";
import { AllScripts } from "../../data/scripts";

export const Room = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { gameState, loading, error } = useGameState(id);

  const [activeTab, setActiveTab] = useState<'stage' | 'truth'>('stage');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [isScriptModalOpen, setScriptModalOpen] = useState(false);
  const [activeScriptId, setActiveScriptId] = useState<string | null>(null);
  const [isViewingList, setIsViewingList] = useState(false);
  const [isTopMenuOpen, setIsTopMenuOpen] = useState(false);
  const [topMenuTab, setTopMenuTab] = useState<'info' | 'settings'>('info');
  
  const [isRoleInfoOpen, setRoleInfoOpen] = useState(false);
  const [isNightOrderOpen, setNightOrderOpen] = useState(false);
  const [totalUnreadCount, setTotalUnreadCount] = useState(0);
  const [isClearDataAlertOpen, setClearDataAlertOpen] = useState(false);
  
  const myPlayerRaw = user && gameState?.players ? gameState.players[user.uid] : null;
  const isHostRaw = gameState?.public?.hostId === user?.uid;
  const previousRoleRef = useRef<string | undefined | null>(undefined);
  const isInitialLoad = useRef(true);
  const [roleAlert, setRoleAlert] = useState<string | null>(null);

  useEffect(() => {
    if (loading) return; // Wait for Firebase data to load initially
    
    if (isInitialLoad.current) {
      isInitialLoad.current = false;
      previousRoleRef.current = myPlayerRaw?.roleId;
      return;
    }

    if (myPlayerRaw?.roleId && myPlayerRaw.roleId !== previousRoleRef.current && !isHostRaw) {
       setRoleAlert(`你已收到遊戲角色！\n\n請至「說書人」私訊頻道查看詳細資訊。`);
    }
    previousRoleRef.current = myPlayerRaw?.roleId;
  }, [myPlayerRaw?.roleId, isHostRaw, loading]);

  useEffect(() => {
    const hasName = !!localStorage.getItem("botc_player_name");
    if (!hasName && id) {
      navigate(`/?returnUrl=/room/${id}`);
    }
  }, [navigate, id]);

  useEffect(() => {
    if (gameState?.public?.activeSetupId && !activeScriptId) {
      setActiveScriptId(gameState?.public?.activeSetupId);
    }
  }, [gameState?.public?.activeSetupId]);

  useEffect(() => {
    if (!user || !id || !gameState) return;
    
    // Auto join if not in players list
    const name = localStorage.getItem("botc_player_name");
    if (name && !gameState.players?.[user.uid]) {
      import("../../services/roomService").then(({ joinRoom }) => {
         joinRoom(id, user.uid, name).catch(console.error);
      });
    }

    import("firebase/database").then(({ onDisconnect, ref, update }) => {
      import("../../services/firebase").then(({ db }) => {
        const playerOnlineRef = ref(db, `rooms/${id}/players/${user.uid}/isOnline`);
        update(ref(db), { [`rooms/${id}/players/${user.uid}/isOnline`]: true });
        onDisconnect(playerOnlineRef).set(false);
      });
    });
  }, [id, user, gameState]);

  if (loading) {
    return <div className="flex h-screen items-center justify-center text-white/50 bg-black">讀取房間中...</div>;
  }

  if (error || !gameState) {
    return (
      <div className="flex flex-col h-screen items-center justify-center space-y-4 bg-black">
        <div className="text-red-500 font-medium">{error || "找不到房間"}</div>
        <button 
          onClick={() => navigate("/")}
          className="rounded-md bg-indigo-900 px-4 py-2 text-sm text-indigo-100 hover:bg-indigo-800 transition-colors border border-indigo-500/50"
        >
          返回大廳
        </button>
      </div>
    );
  }

  const isHost = gameState?.public?.hostId === user?.uid;
  const players = gameState?.players || {};
  const hostPlayer = players[gameState?.public?.hostId];

  // Derived state
  const currentScript = gameState?.public?.scriptId ? Object.values(AllScripts).find(s => s.id === gameState?.public?.scriptId) : undefined;
  const seatCount = gameState?.public?.seatCount || 10;
  const seats = Array.from({ length: seatCount }, (_, i) => i + 1);
  const bluffs = gameState?.private?.bluffs || [null, null, null];
  
  const myPlayer = user ? players[user.uid] : null;
  const myRoleInfo = myPlayer?.roleId ? currentScript?.roles.find(r => r.id === myPlayer.roleId) : null;
  const isEvil = myRoleInfo?.type === 'demon' || myRoleInfo?.type === 'minion';
  const canSeeBluffs = isHost || isEvil;

  const getPlayerInSeat = (seatIndex: number) => {
    const entry = Object.entries(players).find(([_, p]: [string, any]) => p.seat === seatIndex);
    if (!entry) return undefined;
    return { uid: entry[0], ...(entry[1] || {}) };
  };

  const handleTakeSeat = async (seatIndex: number) => {
    if (!user) return;
    await setPlayerSeat(id!, user.uid, seatIndex);
  };

  const handleLeaveSeat = async () => {
    if (!user) return;
    await setPlayerSeat(id!, user.uid, null);
  };

  const handleLeave = async () => {
    if (user) await leaveRoom(id!, user.uid);
    navigate('/');
  };



  return (
    <div className="flex flex-col h-screen p-0 bg-black overflow-hidden relative">
      {/* Background Image */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-60 mix-blend-luminosity pointer-events-none"
        style={{ backgroundImage: "url('/background.jpg')" }}
      />
      <div className="absolute inset-0 z-0 bg-transparent backdrop-blur-sm pointer-events-none" />

      {/* Top Left Nav */}
      <div className="absolute top-4 left-[36px] z-50 flex items-center space-x-3 pointer-events-auto">
        <div className="flex space-x-1 bg-black/60 p-1 rounded-lg border border-white/20 backdrop-blur-md">
          <button 
            onClick={() => setActiveTab('stage')} 
            className={`px-4 py-1.5 rounded-md font-bold tracking-widest transition-colors text-lg ${activeTab === 'stage' ? 'bg-white/20 text-white shadow-md' : 'text-white/80 bg-white/5 hover:text-white hover:bg-white/20'}`}
          >
            舞台中央
          </button>
          {isHost && currentScript && (
            <button 
              onClick={() => setActiveTab('truth')} 
              className={`px-4 py-1.5 rounded-md font-bold tracking-widest transition-colors text-lg ${activeTab === 'truth' ? 'bg-red-900/80 text-red-100 shadow-md' : 'text-red-300/80 bg-red-900/20 hover:text-red-100 hover:bg-red-900/40'}`}
            >
              鐘樓真相
            </button>
          )}
        </div>
      </div>

      {/* 獨立選單按鈕 (位於右上角) */}
      <div className="absolute right-[20%] top-4 z-40 pointer-events-auto flex flex-col items-end">
        <button 
          onClick={() => {
            if (!isTopMenuOpen) {
              setTopMenuTab('info');
            }
            setIsTopMenuOpen(!isTopMenuOpen);
          }}
          className="w-[52px] h-[52px] bg-black/70 border-2 border-white/30 rounded-full flex items-center justify-center text-white shadow-lg backdrop-blur-md hover:bg-white/20 transition-all hover:border-white/50 hover:scale-105"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
        </button>
        
        {/* 下拉選單 */}
        <div className={`absolute top-full right-0 pt-2 transition-all duration-200 transform origin-top-right ${isTopMenuOpen ? 'opacity-100 visible scale-100' : 'opacity-0 invisible scale-95 pointer-events-none'}`}>
          <div className="bg-black/95 border border-white/20 rounded-lg shadow-2xl backdrop-blur-md flex flex-col w-40 overflow-hidden relative z-50">
            {/* 分頁標籤 */}
            <div className="flex border-b border-white/20">
              <button 
                onClick={() => setTopMenuTab('info')}
                className={`flex-1 py-2 flex justify-center items-center transition-colors ${topMenuTab === 'info' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/80 hover:bg-white/5'}`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </button>
              <button 
                onClick={() => setTopMenuTab('settings')}
                className={`flex-1 py-2 flex justify-center items-center transition-colors ${topMenuTab === 'settings' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/80 hover:bg-white/5'}`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              </button>
            </div>
            
            {/* 分頁內容 */}
            <div className="flex flex-col">
              {topMenuTab === 'info' ? (
                <>
                  <button onClick={() => { setRoleInfoOpen(true); setIsTopMenuOpen(false); }} className="px-4 py-2.5 text-white/80 hover:bg-blue-500/30 hover:text-blue-200 text-center font-bold tracking-widest text-sm border-b border-white/10 transition-colors">角色資訊</button>
                  <button onClick={() => { /* setTravelerInfoOpen(true); */ setIsTopMenuOpen(false); }} className="px-4 py-2.5 text-white/80 hover:bg-purple-500/30 hover:text-purple-200 text-center font-bold tracking-widest text-sm border-b border-white/10 transition-colors">旅行者資訊</button>
                  <button onClick={() => { setNightOrderOpen(true); setIsTopMenuOpen(false); }} className="px-4 py-2.5 text-white/80 hover:bg-blue-500/30 hover:text-blue-200 text-center font-bold tracking-widest text-sm border-b border-white/10 transition-colors">角色順序表</button>
                  <button className="px-4 py-2.5 text-white/80 hover:bg-blue-500/30 hover:text-blue-200 text-center font-bold tracking-widest text-sm transition-colors border-b border-white/10">投票紀錄</button>
                  {activeTab !== "truth" && (
                    <button onClick={() => { setClearDataAlertOpen(true); setIsTopMenuOpen(false); }} className="px-4 py-2.5 text-red-400 hover:bg-red-500/30 hover:text-red-200 text-center font-bold tracking-widest text-sm transition-colors">清空資料</button>
                  )}
                </>
              ) : (
                <>
                  <button className="px-4 py-2.5 text-white/80 hover:bg-slate-700/50 text-center font-bold tracking-widest text-sm border-b border-white/10 transition-colors">測試按鈕 1</button>
                  <button className="px-4 py-2.5 text-white/80 hover:bg-slate-700/50 text-center font-bold tracking-widest text-sm border-b border-white/10 transition-colors">測試按鈕 2</button>
                  <button className="px-4 py-2.5 text-white/80 hover:bg-slate-700/50 text-center font-bold tracking-widest text-sm transition-colors">測試按鈕 3</button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* 點擊外部關閉選單的背景層 */}
      {isTopMenuOpen && (
        <div className="fixed inset-0 z-30 pointer-events-auto" onClick={() => setIsTopMenuOpen(false)}></div>
      )}

      {/* Main Board Area (100% full screen) */}
      <div className="absolute inset-0 z-10 overflow-hidden">
        {activeTab === 'stage' ? (
          <CenterStage 
            roomId={id!}
            
            seats={seats}
            getPlayerInSeat={getPlayerInSeat}
            handleTakeSeat={handleTakeSeat}
            handleLeaveSeat={handleLeaveSeat}
            userUid={user?.uid}
            script={currentScript}
            bluffs={bluffs}
            canSeeBluffs={canSeeBluffs}
            distribution={gameState?.public?.distribution || [7,2,2,1]}
            onLeaveRoom={handleLeave}
            onOpenScriptModal={() => setScriptModalOpen(true)}
            fabled={gameState?.public?.fabled || []}
            hostPlayer={hostPlayer}
            privateNotes={user ? gameState?.private?.notes?.[user.uid] : undefined}
            isHost={isHost}
            seatStatus={gameState?.public?.seatStatus || {}}
            votingState={gameState?.public?.votingState}
          />
        ) : (
          isHost ? (
            currentScript ? (
              <Grimoire 
                roomId={id!}
                seatCount={seatCount}
                script={currentScript}
                
                grimoireState={gameState.private?.grimoire}
                bluffs={bluffs}
                distribution={gameState?.public?.distribution || [7,2,2,1]}
                seats={seats}
                getPlayerInSeat={getPlayerInSeat}
                fabled={gameState?.public?.fabled || []}
                onLeaveRoom={handleLeave}
                onOpenScriptModal={() => setScriptModalOpen(true)}
                hostPlayer={hostPlayer}
                seatStatus={gameState?.public?.seatStatus || {}}
              />
            ) : (
              <div className="flex-1 flex items-center justify-center text-white/50 h-full"><p>真相仍在迷霧之中...</p></div>
            )
          ) : (
            <div className="flex-1 flex items-center justify-center text-white/50 h-full"><p>僅說書人可見</p></div>
          )
        )}
      </div>

      {/* Left Drawer */}
      <div className={`fixed inset-y-0 left-0 z-50 w-full sm:w-96 bg-slate-800 border-r-2 border-slate-600 shadow-[10px_0_30px_rgba(0,0,0,0.9)] transform transition-transform duration-300 ease-in-out flex flex-col ${isDrawerOpen ? 'translate-x-0' : '-translate-x-[calc(100%-25px)]'}`}>
        
        {/* Toggle Bookmark Button attached to drawer */}
        <div className="absolute top-1/2 -translate-y-1/2 left-full z-50 pointer-events-auto">
          <button 
            onClick={() => setIsDrawerOpen(!isDrawerOpen)}
            className="px-[10px] py-4 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-r-xl border-y-2 border-r-2 border-l-0 border-slate-600 shadow-[10px_0_20px_rgba(0,0,0,0.8)] transition-all flex flex-col items-center justify-center cursor-pointer"
          >
              <div className="relative">
                <span className="mb-2 text-lg">☰</span>
                {totalUnreadCount > 0 && (
                  <div className="absolute -top-[32px] -right-[28px] text-amber-400 animate-pulse drop-shadow-[0_0_8px_rgba(251,191,36,0.9)] z-10">
                    <svg className="w-7 h-7 drop-shadow-[0_0_8px_rgba(251,191,36,0.9)]" fill="currentColor" viewBox="0 0 20 20"><path d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z" /></svg>
                  </div>
                )}
              </div>
              <div className="flex flex-col items-center gap-1 text-lg tracking-widest font-serif mt-2">
              {(isHost && activeTab === "truth" ? "說書人面版" : "遊戲訊息").split('').map((char, i) => (
                <span key={i} className="leading-none">{char}</span>
              ))}
            </div>
          </button>
        </div>

        <div className="flex justify-between items-center p-4 border-b border-white/10 bg-black/40">
          <h2 className="text-lg font-bold text-white tracking-widest">
            {isHost && activeTab === 'truth' ? '說書人面版' : `${myPlayer?.name || user?.displayName || '未知玩家'} - 玩家面板`}
          </h2>
          {isHost && activeTab === 'truth' && activeScriptId && (
            <button 
              onClick={() => setIsViewingList(true)} 
              className="bg-slate-800 hover:bg-slate-700 border border-slate-500 text-white px-3 py-1.5 rounded-lg shadow-md transition-colors text-sm font-bold flex items-center"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
              劇本列表
            </button>
          )}
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar p-0 min-h-0">
          {activeTab === 'truth' && isHost ? (
            <GrimoireSettings 
              roomId={id!}
              seatCount={seatCount}
              scriptId={gameState?.public?.scriptId}
              
              script={currentScript}
              bluffs={bluffs}
              distribution={gameState?.public?.distribution || [7,2,2,1]}
              grimoireState={gameState.private?.grimoire}
              customScript={gameState?.public?.customScript}
              activeScriptId={activeScriptId}
              activeSetupId={gameState?.public?.activeSetupId || null}
              setActiveScriptId={setActiveScriptId}
              isViewingList={isViewingList}
              setIsViewingList={setIsViewingList}
              settings={gameState?.public?.settings}
              players={Object.entries(players).map(([uid_str, p]: [string, any]) => ({ uid: uid_str, ...(p || {}) }))}
            />
          ) : (
            <div className="flex flex-col h-full">
              <div className="mb-6 p-4 bg-white/5 border border-white/10 rounded-xl shrink-0">
                {!isHost && !myRoleInfo && (
                  <h3 className="text-base font-bold text-white/50 mb-3 border-b border-white/10 pb-2">你的角色</h3>
                )}
                {isHost ? (
                  <div className="flex flex-col">
                    <div className="flex justify-between items-end mb-3 pb-2 border-b border-white/10">
                      <span className="text-xl font-bold text-yellow-500">說書人</span>
                      <span className="text-base text-white/40">陣營：???</span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 rounded-full border-2 border-yellow-500/80 shadow-[0_0_10px_rgba(234,179,8,0.3)] flex items-center justify-center bg-black/60 overflow-hidden shrink-0">
                        <img src={`/icons/storyteller.png`} alt="說書人" className="w-full h-full object-contain scale-[1.15]" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling?.classList.remove('hidden'); }} />
                        <span className="hidden text-white/30 text-2xl font-bold">?</span>
                      </div>
                      <div className="flex-1 p-2 bg-black/40 rounded border border-white/10 text-sm text-yellow-100/80 leading-relaxed">
                        你是說書人，掌控全域。
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col">
                    {myRoleInfo && (
                      <div className="flex justify-between items-end mb-3 pb-2 border-b border-white/10">
                        <span className={`text-xl font-bold ${isEvil ? 'text-red-400' : 'text-blue-300'}`}>
                          {myRoleInfo.name}
                        </span>
                        <span className={`text-base font-medium ${isEvil ? 'text-red-400/80' : 'text-blue-300/80'}`}>
                          陣營：{isEvil ? '邪惡' : '善良'}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center space-x-4">
                      <div className={`w-16 h-16 rounded-full border-2 flex items-center justify-center bg-black/60 shadow-lg overflow-hidden shrink-0 ${myRoleInfo ? (isEvil ? 'border-red-500/80 shadow-[0_0_10px_rgba(239,68,68,0.3)]' : 'border-blue-500/80 shadow-[0_0_10px_rgba(59,130,246,0.3)]') : 'border-white/20'}`}>
                        {myRoleInfo ? (
                           <img src={myRoleInfo.icon || `/icons/${myRoleInfo.id}.png`} alt={myRoleInfo.name} className="w-full h-full object-contain scale-[1.15]" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling?.classList.remove('hidden'); }} />
                        ) : null}
                        <span className={`${myRoleInfo ? 'hidden' : ''} text-white/30 text-2xl font-bold`}>?</span>
                      </div>
                      <div className="flex flex-col flex-1 justify-center">
                        {!myRoleInfo && (
                          <>
                            <span className="text-xl font-bold text-white/50">尚未分配</span>
                            <span className="text-base text-white/30 mt-1 capitalize">等待說書人</span>
                          </>
                        )}
                        {myRoleInfo && (
                          <div className="mt-1 p-2 bg-black/40 rounded border border-white/10 text-sm text-yellow-100/80 leading-relaxed">
                            {myRoleInfo.ability}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex-1 min-h-0 border border-white/10 rounded-xl overflow-hidden shadow-inner">
                
                <Chat roomId={id!} userUid={user?.uid!} userName={myPlayerRaw?.name || localStorage.getItem("botc_player_name") || 'Unknown'} isHost={isHost} players={Object.entries(players).map(([uid_str, p]: [string, any]) => ({ uid: uid_str, ...p }))} hostPlayer={{ uid: gameState?.public?.hostId, ...hostPlayer }} isEvil={isEvil} settings={gameState?.public?.settings} seatCount={gameState?.public?.seatCount} onUnreadCountChange={setTotalUnreadCount} />
              </div>
            </div>
          )}
        </div>
      </div>



      <ScriptInfoModal isOpen={isScriptModalOpen} onClose={() => setScriptModalOpen(false)} script={currentScript} />
      
      <RoleInfoModal 
        isOpen={isRoleInfoOpen} 
        onClose={() => setRoleInfoOpen(false)} 
        script={currentScript}
      />
      
      <NightOrderModal 
        isOpen={isNightOrderOpen} 
        onClose={() => setNightOrderOpen(false)} 
        script={currentScript}
      />

      <AlertDialog 
        isOpen={isClearDataAlertOpen} 
        onClose={() => setClearDataAlertOpen(false)} 
        onConfirm={() => window.dispatchEvent(new CustomEvent('clear-local-notes'))} 
        message="確定要清空所有自行標記的角色與筆記嗎？" 
      />

      <AlertDialog 
        isOpen={!!roleAlert} 
        onClose={() => setRoleAlert(null)} 
        onConfirm={() => setRoleAlert(null)} 
        message={roleAlert || ""} 
      />
    </div>
  );
};
