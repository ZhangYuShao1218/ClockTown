import type { Character } from '../../types';
import { Fabled } from '../../../../../data/roles';

/**
 * ⚠️ 單一資料源：傳奇角色一律取自主專案 `src/data/roles/fabled.ts`（中文 + 圖示）。
 * 要新增 / 移除 / 修改傳奇角色，只需改那份檔案。
 *
 * 下方 I18N 只是「英 / 西語系」的靜態翻譯覆寫（劇本工具是三語），
 * 不影響中文，也不是需要日常維護的資料。缺項時 fallback 回中文。
 */
interface FabledI18n { en: string; es: string; enAbility: string; esAbility: string; }
const I18N: Record<string, FabledI18n> = {
  angel: { en: 'Angel', es: 'Ángel', enAbility: 'Something bad might happen to whoever is most responsible for the death of a new player.', esAbility: 'Algo malo podría sucederle a quien sea el más responsable de la muerte de un jugador nuevo.' },
  bootlegger: { en: 'Bootlegger', es: 'Contrabandista', enAbility: 'This script has homebrew characters or rules.', esAbility: 'Este guion contiene personajes o reglas caseras.' },
  buddhist: { en: 'Buddhist', es: 'Buda', enAbility: 'For the first 2 minutes of each day, veteran players may not talk.', esAbility: 'Durante los primeros 2 minutos de cada día, los jugadores veteranos no pueden hablar.' },
  deusexfiasco: { en: 'Deus Ex Fiasco', es: 'Deus Ex Fiasco', enAbility: 'At least once per game, the Storyteller will make a mistake, correct it, and publicly admit to it.', esAbility: 'Al menos una vez por partida, el Narrador cometerá un error, lo corregirá y lo admitirá públicamente.' },
  deus_ex_fiasco2: { en: 'Deus Ex Fiasco 2', es: 'Dios Terco', enAbility: 'This god controls all the rules in this game.', esAbility: 'El dios controla todas las reglas de esta partida.' },
  djinn: { en: 'Djinn', es: 'Genio', enAbility: "Use the Djinn's special rule. All players know what it is.", esAbility: 'Usa la regla especial del Genio. Todos los jugadores saben cuál es.' },
  doomsayer: { en: 'Doomsayer', es: 'Profeta del Fin', enAbility: 'If 4 or more players live, each living player may publicly choose (once per game) that a player of their own alignment dies.', esAbility: 'Si 4 o más jugadores viven, cada jugador vivo puede elegir públicamente (una vez por partida) que muera un jugador de su propio bando.' },
  duchess: { en: 'Duchess', es: 'Duquesa', enAbility: 'Each day, 3 players may choose to visit you. At night, each visitor learns how many visitors are evil, but 1 gets false info.', esAbility: 'Cada día, 3 jugadores pueden elegir visitarte. Por la noche, cada visitante sabe cuántos visitantes son malvados, pero 1 recibe información falsa.' },
  ferryman: { en: 'Ferryman', es: 'Barquero', enAbility: 'On the final day, all dead players regain their vote token.', esAbility: 'En el último día, todos los jugadores muertos recuperan su ficha de voto.' },
  fiddler: { en: 'Fiddler', es: 'Violinista', enAbility: 'Once per game, the Demon secretly chooses an opposing player: all players choose which of these 2 players win.', esAbility: 'Una vez por partida, el Demonio elige secretamente a un jugador del bando opuesto: todos los jugadores eligen cuál de estos 2 jugadores gana.' },
  fibbin: { en: 'Fibbin', es: 'Embustero', enAbility: "Once per game, a good player might learn 'problematic' information.", esAbility: "Una vez por partida, un jugador bueno podría recibir información 'problemática'." },
  gardener: { en: 'Gardener', es: 'Jardinero', enAbility: "The Storyteller assigns 1 or more players' characters.", esAbility: 'El Narrador asigna los personajes de 1 o más jugadores.' },
  hells_librarian: { en: "Hell's Librarian", es: 'Bibliotecario del Infierno', enAbility: 'Something bad might happen to whoever talks when the Storyteller has asked for silence.', esAbility: 'Algo malo podría sucederle a quien hable cuando el Narrador haya pedido silencio.' },
  revolutionary: { en: 'Revolutionary', es: 'Revolucionario', enAbility: '2 neighboring players are known to be the same alignment. Once per game, 1 of them registers falsely.', esAbility: '2 jugadores vecinos se sabe que son del mismo bando. Una vez por partida, 1 de ellos se registra falsamente.' },
  sentinel: { en: 'Sentinel', es: 'Centinela', enAbility: 'There might be 1 extra or 1 fewer Outsider in play.', esAbility: 'Podría haber 1 Forastero extra o 1 menos en juego.' },
  spirit_of_ivory: { en: 'Spirit of Ivory', es: 'Espíritu de Marfil', enAbility: "There can't be more than 1 extra evil player.", esAbility: 'No puede haber más de 1 jugador malvado extra.' },
  stormcatcher: { en: 'Storm Catcher', es: 'Cazatormentas', enAbility: 'Name a good character. If in play, they can only die by execution, but evil players learn which player it is.', esAbility: 'Nombra un personaje bueno. Si está en juego, solo puede morir por ejecución, pero los jugadores malvados saben quién es.' },
  toymaker: { en: 'Toymaker', es: 'Fabricante de Juguetes', enAbility: 'The Demon may choose not to attack — must do this at least once per game. Evil players get normal starting info.', esAbility: 'El Demonio puede elegir no atacar, pero debe hacerlo al menos una vez por partida. Los jugadores malvados reciben información inicial normal.' },
  qilin: { en: 'Qilin', es: 'Qilin', enAbility: 'On the last day of the game, something good happens to the luckiest players.', esAbility: 'En el último día del juego, algo bueno le sucede a los jugadores más afortunados.' },
};

export const getFabledCharacters = (language: string): Character[] =>
  Object.values(Fabled).map((r) => {
    const o = I18N[r.id];
    const name = language === 'en' ? (o?.en ?? r.name) : language === 'es' ? (o?.es ?? r.name) : r.name;
    const ability = language === 'en' ? (o?.enAbility ?? r.ability) : language === 'es' ? (o?.esAbility ?? r.ability) : r.ability;
    return {
      id: r.id,
      name,
      ability,
      team: 'fabled',
      image: r.icon || r.image || '',
      firstNight: r.firstNight ?? 0,
      otherNight: r.otherNight ?? 0,
      firstNightReminder: r.firstNightReminder ?? '',
      otherNightReminder: r.otherNightReminder ?? '',
      reminders: r.reminders ?? [],
      setup: r.setup ?? false,
    };
  });
