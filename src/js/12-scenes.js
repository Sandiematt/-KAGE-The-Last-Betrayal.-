/* KAGE — story scenes: pure data (no DOM, canvas or audio), read by Logic and played by StoryPlayer (68-story.js).

   A scene is an ordered list of steps, played one after another:
     { say: speakerId, text }            a dialogue line in the bottom panel: portrait medallion, name, typewriter text.
                                          Speakers are SPEAKERS in 52-story-art.js (kage, rem, takashi, raikon, akari,
                                          witness, narrator, recording). Optional `name` overrides the shown name
                                          (for example 'Young Rem'); optional `memory: true` styles just this line.
     { illus: illustrationId, caption? } shows a full-screen illustration (ILLUSTRATIONS in 52-story-art.js); it stays
                                          behind the following lines until another `illus` or `{ illus: null }`.
                                          With a caption the step waits for a press (the caption reads as narration);
                                          without one the scene moves straight on.
     { video: 'one-line description' }   the full-screen black VIDEO PLACEHOLDER card. Exactly ONE exists in the game,
                                          at the start of the Prologue (tests/story.test.js holds this). Never add another.
     { wait: seconds }                   a silent beat.
     { flag: name }                      records a story flag on the save (Logic.setStoryFlag), for later choices.
   Scene options: `memory: true` plays the whole scene as a flashback (violet tint, softened panel).

   Scenes are attached by id:
     - to a campaign stage (CAMPAIGN in 10-data.js): `scenes: { before, after, defeat }`
         before  plays as the stage starts, before the fight or stretch begins (a `scene`-kind stage, the Epilogue,
                 is only its `before` scene);
         defeat  plays the moment a boss (or any arena foe) is beaten, before the outro;
         after   plays after a won stage, just before the result screen;
     - to a stretch clue: `clues: [{ id, x, label, scene }]` plays when the clue is picked up.
   Logic.stageScene(stageId, hook) and Logic.clueScene(stageId, clueId) answer which scene plays. */
const SCENES = {
  // ---- Prologue: The Man With No Past (stage prologue.1, Hoshimura) ----
  // Canon kept off-screen here: Rem planted the clues from inside the Core, and "he" in the second message is Takashi.
  // The Prologue never says either; it stays a mystery.
  'prologue.open': {
    steps: [
      { video: 'Kage wakes in the ashes of Hoshimura under a red moon, alone, with no memory of the fire.' },
      { illus: 'hoshimura_ruins', caption: 'Hoshimura. What the fire left of it.' },
      { say: 'kage', text: '...Ash. Still warm.' },
      { say: 'kage', text: 'I know these beams. These roofs. I don’t know how I know them.' },
      { say: 'kage', text: 'My name... Kage. That much stayed. The rest is smoke.' },
      { illus: null },
      { say: 'kage', text: 'A sword at my hip. My hands know its weight. They don’t know why.' },
      { say: 'narrator', text: 'The road runs east through the empty village. Something on it is waiting to be found.' }
    ]
  },
  // Clue 1: a broken recorder in a roadside shrine, looping one phrase.
  'prologue.clue.recording': {
    steps: [
      { say: 'narrator', text: 'A cracked recorder sits in the shrine, its light still blinking. It was left here on purpose.' },
      { say: 'recording', text: '...ssss... find the... kssh... Find the Witness.' },
      { say: 'recording', text: 'Find the Witness. Find the... Find the Witness.' },
      { say: 'kage', text: 'Whose voice is that? It knows me. I can hear it knowing me.' },
      { say: 'kage', text: 'The Witness. Witness to what?' },
      { flag: 'prologue.recording_heard' }
    ]
  },
  // Clue 2: inside a burnt-out house, a photograph with every face scratched away except Rem's.
  'prologue.clue.photograph': {
    steps: [
      { say: 'narrator', text: 'Inside the house, one frame hangs straight on a wall that is barely standing.' },
      { illus: 'photograph', caption: 'Three figures: a tall man, and two boys beside him. Every face is scratched out but one.' },
      { say: 'kage', text: 'That boy... Rem. His name is Rem. I know it the way I know the sword.' },
      { say: 'kage', text: 'And the other boy is me. Someone took a blade to my face. And to his.' },
      { say: 'kage', text: 'Only Rem was left untouched. As if someone wanted me to remember him first.' },
      { illus: null },
      { say: 'kage', text: 'Rem. Brother. Where are you?' },
      { flag: 'prologue.photo_found' }
    ]
  },
  // Clue 3: a second message, scratched into a door beside the road's end.
  'prologue.clue.message': {
    steps: [
      { say: 'narrator', text: 'Words cut into a charred door, fresh as the ash. The same careful hand.' },
      { say: 'narrator', text: '"If you remember everything, he will find you."' },
      { say: 'kage', text: 'He. Who is he?' },
      { say: 'kage', text: 'Someone took my past and left me a trail instead. A warning, and a way forward.' },
      { flag: 'prologue.warning_read' }
    ]
  },
  // The road out: Kage follows a trail of violet memory ash. Closes the Prologue; Act I opens after it.
  'prologue.close': {
    steps: [
      { say: 'kage', text: 'That thing wore my stance. It breathed when I breathed.' },
      { say: 'kage', text: 'And when it broke, it turned to this.' },
      { illus: 'memory_ash', caption: 'Violet ash lifts from the road and drifts east, as if something is waiting for him to follow.' },
      { say: 'kage', text: 'Find the Witness. Find Rem. Remember... but not everything.' },
      { say: 'narrator', text: 'Kage left Hoshimura with no past, following the ash.' },
      { illus: null },
      { flag: 'prologue.complete' }
    ]
  },
  // Act I boss: Raikon blocks the route to the old military archive. He is an Echo copy, bound to guard it against his will.
  'act1.raikon.before': {
    steps: [
      { illus: null },
      { say: 'narrator', text: 'The route to the old military archive. Rain hisses on a sword that is already drawn.' },
      { say: 'raikon', text: 'So. The man who was supposed to stay buried.' },
      { say: 'kage', text: 'You know me.' },
      { say: 'raikon', text: 'I know what you were. I know what they did to make you forget it.' },
      { say: 'raikon', text: 'The Echo System woke me up and chained me to this door. "Guard the archive." As if I asked to be remembered.' },
      { say: 'kage', text: 'Then step aside.' },
      { say: 'raikon', text: 'I can’t. The binding won’t let me. If you want what’s behind me, you’ll have to cut through what’s left of me.' },
      { say: 'raikon', text: 'Draw, shadow. And don’t you dare hold back.' }
    ]
  },
  // Raikon’s dying words, after the finishing slash; then he dissolves into violet ash (FightSession, 60-engine.js).
  'act1.raikon.defeat': {
    steps: [
      { say: 'raikon', text: '...Heh. So that’s what you still have in you.' },
      { say: 'raikon', text: 'Listen, before the echo lets go. Your brother. Rem. He did not die.' },
      { say: 'kage', text: 'Rem is alive?' },
      { say: 'raikon', text: 'The last time anyone saw him, he was walking into the Core. Alone. He never came out.' },
      { say: 'raikon', text: 'And your memories... they weren’t lost in the fire. They were removed. On purpose.' },
      { say: 'kage', text: 'By who? Why?' },
      { say: 'raikon', text: 'I don’t know if Rem did it to betray you... or to save you. I never got to ask him.' },
      { illus: 'access_token', caption: 'Raikon presses something into Kage’s hand: an archive access token, cracked down the middle.' },
      { say: 'raikon', text: 'Take it. It’s damaged, but the archive door still remembers it.' },
      { flag: 'act1.access_token' },
      { illus: null },
      { say: 'raikon', text: 'Losing to you... it broke the binding. For the first time since they woke me, nobody is holding the chain.' },
      { say: 'raikon', text: 'It feels like rain. Go, shadow. Find him.' }
    ]
  },
  // Stub; SAN-44 writes the real Epilogue.
  'epilogue.stub': {
    steps: [
      { illus: 'memory', caption: 'Dawn over the Echo System. The ash has settled.' },
      { say: 'narrator', text: 'The Last Choice is still to be written.' },
      { illus: null }
    ]
  }
};
