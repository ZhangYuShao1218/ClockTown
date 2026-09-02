import type { Character } from '../../types';
import { Loric } from '../../../../../data/roles';

/**
 * ⚠️ 單一資料源：奇遇（Loric）角色一律取自主專案 `src/data/roles/loric.ts`（中文 + 圖示）。
 * 下方 I18N 僅為英 / 西語系靜態翻譯覆寫，缺項時 fallback 回中文。
 */
interface LoricI18n { en: string; es: string; enAbility: string; esAbility: string; enFirstNightReminder?: string; esFirstNightReminder?: string; }
const I18N: Record<string, LoricI18n> = {
  gardener_loric: { en: 'Gardener', es: 'Jardinero', enAbility: "The Storyteller assigns 1 or more players' characters.", esAbility: 'El Narrador asigna los personajes de 1 o más jugadores.' },
  tor_loric: {
    en: 'Tor', es: 'Tor',
    enAbility: "Players don't know their character or alignment. They learn them after they die.",
    esAbility: 'Los jugadores no saben su personaje ni su bando. Lo descubren cuando mueren.',
    enFirstNightReminder: 'During the setup and adjustment phase, do not give the blind draw bag to the players. The storyteller draws role markers from the blind draw bag and places them in the grimoire. If a player dies during the day, inform them of their role and faction privately. If a player dies at night, wake them up and show them the "You are" information marker, their role marker, the "You are" information marker again, and a thumbs up or down in sequence.',
    esFirstNightReminder: 'Durante la fase de preparación y ajuste, no des la bolsa de sorteo a los jugadores. El Narrador extrae las fichas de personaje de la bolsa y las coloca en el grimorio. Si un jugador muere durante el día, infórmale en privado su personaje y bando. Si un jugador muere por la noche, despiértalo y muéstrale la ficha de información "Tú eres", su ficha de personaje, la ficha de información "Tú eres" de nuevo, y un pulgar hacia arriba o abajo en secuencia.',
  },
  stormcatcher_loric: { en: 'Storm Catcher', es: 'Cazatormentas', enAbility: 'Name a good character. If in play, they can only die by execution, but evil players learn which player it is.', esAbility: 'Nombra un personaje bueno. Si está en juego, solo puede morir por ejecución, pero los jugadores malvados saben quién es.' },
  bigwig_loric: { en: 'Big Wig', es: 'Pez Gordo', enAbility: 'Each nominee chooses a player: until voting, only they may speak & they are mad the nominee is good or they might die.', esAbility: 'Cada nominado elige un jugador: hasta la votación, solo él puede hablar y debe estar "loco" demostrando que el nominado es bueno, o podría morir.' },
  bootlegger_loric: { en: 'Bootlegger', es: 'Contrabandista', enAbility: 'This script has homebrew characters or rules.', esAbility: 'Este guion contiene personajes o reglas caseras.' },
  Zenomancer_loric: { en: 'Zenomancer', es: 'Zenómante', enAbility: 'One or more players each have a goal. When achieved, that player learns a piece of true info.', esAbility: 'Uno o más jugadores tienen cada uno un objetivo. Cuando se logra, ese jugador aprende una información verdadera.' },
  Hindu_loric: { en: 'Hindu', es: 'Hindú', enAbility: 'The first 4 players to die are immediately reincarnated as Travellers of the same alignment.', esAbility: 'Los primeros 4 jugadores en morir se reencarnan inmediatamente como Viajeros del mismo bando.' },
  godofug_loric: { en: 'God of Ug', es: 'God of Ug', enAbility: 'One Ug hat. When wear Ug hat, must speak one sound at a time but vote twice. If fail, pass Ug hat.', esAbility: 'One Ug hat. When wear Ug hat, must speak one sound at a time but vote twice. If fail, pass Ug hat.' },
  knaves_loric: { en: 'Knaves', es: 'Knaves', enAbility: 'There are 2 Storytellers: one lies & one tells the truth. Once per game, at dusk, they might switch.', esAbility: 'There are 2 Storytellers: one lies & one tells the truth. Once per game, at dusk, they might switch.' },
  ventriloquist_loric: { en: 'Ventriloquist', es: 'Ventriloquist', enAbility: 'If a player is mad as a fresh character during their nomination, they might not die if executed today.', esAbility: 'If a player is mad as a fresh character during their nomination, they might not die if executed today.' },
  pope_loric: { en: 'Pope', es: 'Papa', enAbility: 'There are duplicate good characters in play. They might also be bluffs.', esAbility: 'Hay personajes buenos duplicados en juego. También pueden ser faroles.' },
};

export const getLoricCharacters = (language: string): Character[] =>
  Object.values(Loric).map((r) => {
    const o = I18N[r.id];
    const pick = (zh: string, en?: string, es?: string) =>
      language === 'en' ? (en ?? zh) : language === 'es' ? (es ?? zh) : zh;
    return {
      id: r.id,
      name: pick(r.name, o?.en, o?.es),
      ability: pick(r.ability, o?.enAbility, o?.esAbility),
      team: 'loric',
      image: r.icon || r.image || '',
      firstNight: r.firstNight ?? 0,
      otherNight: r.otherNight ?? 0,
      firstNightReminder: pick(r.firstNightReminder ?? '', o?.enFirstNightReminder, o?.esFirstNightReminder),
      otherNightReminder: r.otherNightReminder ?? '',
      reminders: r.reminders ?? [],
      setup: r.setup ?? false,
    };
  });
