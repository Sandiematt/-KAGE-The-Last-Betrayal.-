/* KAGE — story scenes: pure data (no DOM, canvas or audio), read by Logic and played by StoryPlayer (68-story.js).

   A scene is an ordered list of steps, played one after another:
     { say: speakerId, text }            a dialogue line in the bottom panel: portrait medallion, name, typewriter text.
                                          Speakers are SPEAKERS in 52-story-art.js (kage, rem, takashi, raikon, akari,
                                          witness, narrator, recording, survivor, order). Optional `name` overrides the shown name
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
  // ---- Act I: The Missing Brother (stages act1.stretch1..4, Yomi's outer districts) ----
  // Survivors say Rem was declared dead ten years ago; the Order's official story is that he betrayed Kage and helped
  // erase his memories. Three clues show the story was edited. Nothing here says who edited it, or why.
  'act1.stretch1.before': {
    steps: [
      { say: 'narrator', text: 'Yomi’s outer districts. Shuttered stalls, blank walls, and an Order lantern on every corner.' },
      { say: 'survivor', text: 'Out of the lantern light, stranger. The Order counts faces after dark.' },
      { say: 'kage', text: 'I’m looking for someone. Rem. A swordsman, younger than me.' },
      { say: 'survivor', text: 'Rem? ...Nobody says that name here. He was declared dead ten years ago. The notice went up on every gate.' },
      { say: 'kage', text: 'Dead.' },
      { say: 'survivor', text: 'So the notice said. It also said there never was a war. Walk carefully.' }
    ]
  },
  // Clue 1: half a mission report under a desk in a gutted Order post.
  'act1.clue.report': {
    steps: [
      { say: 'narrator', text: 'Under a smashed desk in a gutted Order post: a mission report, torn in half.' },
      { say: 'narrator', text: '"Silent War, final day. Assigned: Rem. Kage. Objective: the Co—" The rest of the report is gone.' },
      { say: 'kage', text: 'Both our names. On the same mission.' },
      { say: 'kage', text: 'Not burned. Torn, by hand, right where it mattered.' },
      { flag: 'act1.report_found' }
    ]
  },
  'act1.stretch2.before': {
    steps: [
      { say: 'narrator', text: 'A checkpoint gate. Fresh notices pasted over old ones, layer on layer.' },
      { say: 'order', name: 'Order Herald', text: '"By order of Silence: the traitor Rem betrayed his brother and helped erase his memories. Speak neither name."' },
      { say: 'survivor', text: 'They read it out every morning. Ten years, the same words. As if they’re afraid we’ll forget to forget.' },
      { say: 'kage', text: 'Rem took my memories?' },
      { say: 'survivor', text: 'That’s the official story. Nobody here has ever heard another.' }
    ]
  },
  // Clue 2: two sword cuts under the Order's whitewash, where the record allows only one fighter.
  'act1.clue.marks': {
    steps: [
      { say: 'narrator', text: 'A wall where the Order’s whitewash has flaked away. Underneath, old cuts in the plaster.' },
      { say: 'narrator', text: 'Two sword marks, side by side, from two different blades. The plaque beside them names one man.' },
      { say: 'kage', text: 'One of these is mine. I know the angle the way I know my own hand.' },
      { say: 'kage', text: 'The other was cut by someone standing next to me. Somebody scrubbed him out of the story.' },
      { flag: 'act1.marks_found' }
    ]
  },
  'act1.stretch3.before': {
    steps: [
      { say: 'narrator', text: 'The district registry. The Order burned it floor by floor, then posted guards on the ashes.' },
      { say: 'survivor', text: 'My son’s name was in there. Now he never existed.' },
      { say: 'kage', text: 'What are they burning?' },
      { say: 'survivor', text: 'The Silent War. Every page of it. If nobody wrote it down, it never happened. That’s how the Order keeps the silence.' }
    ]
  },
  // Clue 3: a sealed recorder that survived the registry fire. Takashi orders the Core evacuated. Kage knows the
  // voice but not why; who Takashi is stays for later.
  'act1.clue.recording': {
    steps: [
      { say: 'narrator', text: 'In the registry vault, a sealed recorder survived the fire. Its reel still turns.' },
      { say: 'recording', name: 'Takashi (recording)', text: '...kssh... This is Takashi. Core command, all units.' },
      { say: 'recording', name: 'Takashi (recording)', text: 'Evacuate the Core. Now. Every technician, every guard. Leave the machines running.' },
      { say: 'recording', name: 'Takashi (recording)', text: 'Nobody stays behind. That is an order. Nobody... ssss...' },
      { say: 'kage', text: 'Takashi. I know that voice. I don’t know how.' },
      { say: 'kage', text: 'The Order says nothing ever happened in the Core. Then why did he empty it?' },
      { flag: 'act1.evacuation_heard' }
    ]
  },
  'act1.stretch4.before': {
    steps: [
      { say: 'narrator', text: 'The archive road. Rain, and wet Order banners over a road nobody walks.' },
      { say: 'kage', text: 'A torn report. Two sword marks. A voice ordering everyone out of the Core.' },
      { say: 'kage', text: 'The Order didn’t lose the story of the Silent War. They cut it apart, and cut Rem out of it.' },
      { say: 'narrator', text: 'Beyond the last Order line, someone is waiting at the archive door.' }
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
  // ---- Interlude: Brothers (stage interlude.spar, Takashi's training yard, a memory) ----
  // The question "who won?" is never answered here; the Epilogue pays it off ("So... who won?" / "I did." /
  // "Keep dreaming."), so these scenes must not say those lines.
  'interlude.spar.before': { memory: true,
    steps: [
      { say: 'narrator', text: 'Hoshimura. Takashi’s yard, years before the fire. The light is warmer than Kage remembers it being.' },
      { say: 'rem', name: 'Young Rem', text: 'Yesterday doesn’t count. You slipped on the wet boards.' },
      { say: 'kage', name: 'Young Kage', text: 'You slipped. I just happened to be standing where you fell.' },
      { say: 'rem', name: 'Young Rem', text: 'Then I’ll fall on you again. Faster this time. Father, watch!' },
      { say: 'takashi', text: 'I am watching. Bokken only. Stance first, then the form, the way I taught you. Both of you.' },
      { say: 'rem', name: 'Young Rem', text: 'Stance, dash, rise, spin, land, flow. I could do it asleep.' },
      { say: 'kage', name: 'Young Kage', text: 'You do do it asleep. That’s why you leave your left side open.' },
      { say: 'takashi', text: 'Enough talking. Begin.' }
    ]
  },
  'interlude.spar.after': { memory: true,
    steps: [
      { say: 'takashi', text: 'Rice is getting cold. Swords on the rack. Now.' },
      { say: 'rem', name: 'Young Rem', text: 'But we’re not finished! One more touch and I had him!' },
      { say: 'kage', name: 'Young Kage', text: 'One more touch and you’d be face-down in the dirt.' },
      { say: 'rem', name: 'Young Rem', text: 'Father, tell him. You saw it.' },
      { say: 'takashi', text: 'I saw two boys who still drop their guard when they get angry. Inside.' },
      { say: 'rem', name: 'Young Rem', text: 'This isn’t over. We settle it tomorrow.' },
      { say: 'kage', name: 'Young Kage', text: 'Tomorrow, then.' },
      { say: 'narrator', text: 'They never did settle it. Somewhere in the ash, the question is still waiting.' }
    ]
  },
  // ---- Act II: the City of Echoes (stages act2.stretch1..4), a district rebuilt from stored memories ----
  // Familiar people, rebuilt from what others remembered of them, tell the same event two different ways, each sure of
  // their own version. Nothing here says who erased Kage's memories or why; that is Akari's to tell.
  'act2.stretch1.before': {
    steps: [
      { say: 'narrator', text: 'The City of Echoes. A district rebuilt from stored memories: every lantern lit, every door open, nobody quite where they should be.' },
      { say: 'resident', name: 'Tea-seller', text: 'Kage! You came back. I remember the night you left Hoshimura. You carried your brother out of the fire on your back.' },
      { say: 'resident', name: 'Lantern-keeper', text: 'No, no. Rem carried you. You were the one bleeding. I held the lantern for him myself.' },
      { say: 'resident', name: 'Tea-seller', text: 'I remember it clearly.' },
      { say: 'resident', name: 'Lantern-keeper', text: 'So do I.' },
      { say: 'kage', text: 'You can’t both remember it.' },
      { say: 'narrator', text: 'They smile at him, patient and certain, and go back to sweeping the same step.' }
    ]
  },
  'act2.stretch2.before': {
    steps: [
      { say: 'narrator', text: 'Lantern Row. The same paper lantern swings on every corner, at the same angle, in no wind.' },
      { say: 'resident', name: 'Fishmonger', text: 'The Tachibana brothers? They fought right here in the street. The younger one drew first.' },
      { say: 'resident', name: 'Seamstress', text: 'No. They fought back to back, here, against the Order. Nobody drew on anybody.' },
      { say: 'kage', text: 'Which is it?' },
      { say: 'resident', name: 'Fishmonger', text: 'We both remember it. Isn’t that enough?' },
      { say: 'kage', text: 'Someone built this street out of what people remember. And nobody remembers the same thing.' }
    ]
  },
  // The one clue of the City of Echoes: a detail only Kage could have remembered, so the reconstruction used his
  // memories too.
  'act2.clue.cups': {
    steps: [
      { say: 'narrator', text: 'A table set in an empty tea house: two cups, still warm. One is chipped at the rim.' },
      { say: 'kage', text: 'Rem always took the chipped one. He said it poured better. It didn’t.' },
      { say: 'kage', text: 'Nobody else would remember that. Whoever built this street used my memories too.' },
      { flag: 'act2.cups_found' }
    ]
  },
  'act2.stretch3.before': {
    steps: [
      { say: 'narrator', text: 'A bridge over a dry canal. From the middle, both ends look like the side you came from.' },
      { say: 'resident', name: 'Ferryman', text: 'Ten years ago the elder Tachibana boy crossed this bridge alone, and never came back.' },
      { say: 'resident', name: 'Ferryman’s wife', text: 'No. Two boys crossed it. Only one came back, and he did not remember the other.' },
      { say: 'kage', text: 'Which one came back?' },
      { say: 'resident', name: 'Ferryman’s wife', text: 'You tell us. You are the one who keeps walking through.' }
    ]
  },
  'act2.stretch4.before': {
    steps: [
      { say: 'narrator', text: 'The edge of the reconstruction. Houses stand half-built from memory, their backs left blank.' },
      { say: 'resident', name: 'Schoolteacher', text: 'I remember you as a boy. Quiet. Your brother did all the talking.' },
      { say: 'resident', name: 'Night watchman', text: 'No. You were the loud one. Rem never said a word to anybody but you.' },
      { say: 'kage', text: 'Every memory here is real to someone. Just not the same someone.' },
      { say: 'resident', name: 'Night watchman', text: 'Past the ward the street stops repeating. Someone waits there who remembers everything, and tells nothing.' }
    ]
  },
  // ---- Act II boss: Akari, the Memory Blade (stage act2.boss, the City of Echoes) ----
  // She steps out of a memory that should not have a door. She knows how to move through the reconstructed world.
  'act2.akari.before': {
    steps: [
      { illus: null },
      { say: 'narrator', text: 'The City of Echoes. A street that repeats itself, the same lantern swinging on every corner.' },
      { say: 'akari', text: 'You keep walking into the same street, Kage. It was built that way. To keep you walking.' },
      { say: 'kage', text: 'You know my name.' },
      { say: 'akari', text: 'I know every corner of this place. Memories are only rooms, if you know where the seams are.' },
      { say: 'akari', text: 'Turn back. What waits at the end of this road is not a brother. It is a reason you were made to forget.' },
      { say: 'kage', text: 'Then I’ll hear it from him.' },
      { say: 'akari', text: '...Stubborn. He said you would be.' }
    ]
  },
  // Her dying reveal, after the finishing slash; she hands over Shinsen (flag act2.shinsen_received, SAN-38 grants the
  // weapon) and then dissolves into violet ash (FightSession.bossExit).
  'act2.akari.defeat': {
    steps: [
      { say: 'akari', text: '...Good. You still cut like him.' },
      { say: 'kage', text: 'Rem. What did he do to me?' },
      { say: 'akari', text: 'He asked me to erase your memories. Not out of hatred. Never that.' },
      { say: 'akari', text: 'Takashi meant to bind the whole city to the Echo System, and you to its heart. Its human controller. Forever.' },
      { say: 'akari', text: 'Rem saw the machine would swallow you whole. So he beat you, cut your true self away, and hid the rest of you here. In a memory.' },
      { say: 'kage', text: 'He did this to save me.' },
      { illus: 'shinsen', caption: 'Akari lifts a long blade wrapped in grey cloth: an odachi, gold along its spine.' },
      { say: 'akari', text: 'Shinsen. He left it with me. A clue, he said, for the day you came looking.' },
      { flag: 'act2.shinsen_received' },
      { illus: null },
      { say: 'akari', text: 'I kept his secret ten years. It is lighter now. Find him, Kage... before Takashi does.' }
    ]
  },
  // ---- Act III, The Father's Sin: the Fortress of Silence (act3.stretch1..4) ----
  // The stretch beats build toward one thing: Takashi is alive, and here. The Order's records name him, a guard speaks
  // of him in the present tense, a memory conduit carries his voice live. Kept off-screen: Rem in the Core (Takashi's
  // own reveal, act3.takashi.defeat).
  'act3.stretch1.before': {
    steps: [
      { illus: null },
      { say: 'narrator', text: 'The Fortress of Silence. The Order’s seat: black stone, slate banners, and violet light pulsing in the walls.' },
      { say: 'order', name: 'Gate guard', text: 'Halt. The upper halls are closed. By order of the Founder.' },
      { say: 'kage', text: 'The Founder. The Order’s founder died in the war.' },
      { say: 'order', name: 'Gate guard', text: 'Did he? Then who signs the orders?' },
      { say: 'kage', text: '...Open the gate.' }
    ]
  },
  'act3.stretch2.before': {
    steps: [
      { say: 'narrator', text: 'The Hall of Records. Shelves of Order ledgers run up into the dark, every spine stamped with the barred circle.' },
      { say: 'narrator', text: 'One ledger lies open on a lectern. FOUNDER OF THE ORDER: TACHIBANA TAKASHI. STATUS: DECEASED.' },
      { say: 'narrator', text: 'The word DECEASED has been struck through. Beside it, in fresh ink: IN RESIDENCE.' },
      { say: 'kage', text: 'Tachibana Takashi. Father.' },
      { say: 'kage', text: 'Akari said he built the Echo System. She never said he was dead. Nobody here ever buried him.' }
    ]
  },
  // the one clue of the Fortress (optional): the night watch's duty roster
  'act3.clue.roster': {
    steps: [
      { say: 'narrator', text: 'An Order duty roster, pinned to a shelf. Last night’s watch, in a clerk’s neat hand.' },
      { say: 'narrator', text: 'UPPER STAIR: THE FOUNDER RECEIVES NO ONE. TEA AT THE HOUR OF THE OX. LAMP KEPT LIT UNTIL DAWN.' },
      { say: 'kage', text: 'He still drinks tea at the hour of the ox. He did that every night in Hoshimura.' },
      { say: 'kage', text: 'This isn’t a record of a dead man. It’s a schedule.' },
      { flag: 'act3.roster_found' }
    ]
  },
  'act3.stretch3.before': {
    steps: [
      { say: 'narrator', text: 'The Conduit Galleries. Glass pipes of violet light run down through the walls, carrying stored memories into the deep.' },
      { say: 'narrator', text: 'One conduit flickers as Kage passes it. Through the hum, a voice.' },
      { say: 'recording', name: 'A voice in the conduit', text: '...keep them. Keep all of them. Nobody is lost while I am still here to hold them...' },
      { say: 'kage', text: 'That voice.' },
      { say: 'recording', name: 'A voice in the conduit', text: '...the eastern district is fading again. Send more Hollows to the walls. I will see to it myself.' },
      { say: 'kage', text: 'That isn’t a recording. Nobody records orders for tonight. He’s speaking now.' }
    ]
  },
  'act3.stretch4.before': {
    steps: [
      { say: 'narrator', text: 'The Last Stair. A wounded Order guard sits against the banners, his helm off, laughing quietly.' },
      { say: 'order', name: 'Wounded guard', text: 'You came for the Founder. Everyone does, in the end.' },
      { say: 'order', name: 'Wounded guard', text: 'He walks these halls every night. Straw hat, plain blade. He asked about you, once. Whether you still held your elbows in.' },
      { say: 'kage', text: 'Then he’s alive.' },
      { say: 'order', name: 'Wounded guard', text: 'Alive, and waiting at the top of the stair. Go on. He told us not to stop you.' }
    ]
  },
  // ---- Act III boss: Takashi, in the Fortress of Silence ----
  // Canon kept off-screen: this Takashi is an Echo copy; the real one is outside the reconstruction. Never said outright,
  // only hinted (his outline doubles for a heartbeat, like the City of Echoes' residents).
  'act3.takashi.before': {
    steps: [
      { illus: null },
      { say: 'narrator', text: 'The Fortress of Silence. At the top of the last stair, a man in a straw travel hat stands with his back to the door.' },
      { say: 'kage', text: '...Father.' },
      { say: 'takashi', text: 'Kage. You found the long way round. You always did.' },
      { illus: 'shinsen', caption: 'Takashi turns. His eyes go straight to the blade in Kage’s hands: an odachi, gold along its spine.' },
      { say: 'takashi', text: 'Shinsen. I left it behind so I would never draw it again. And here it is, in my son’s hands.' },
      { illus: null },
      { say: 'kage', text: 'You built the Echo System. Why?' },
      { say: 'takashi', text: 'The war took so many. Whole streets of people, gone in a night. I built the Echo System to keep their memories. So that nobody was lost.' },
      { say: 'takashi', text: 'But keeping was not enough. I could not accept grief as something we must simply carry. I would not.' },
      { say: 'takashi', text: 'So I learned to shape what people remember. Controlling memory is kinder than letting them suffer, Kage. I still believe that.' },
      { say: 'kage', text: 'You took mine.' },
      { say: 'takashi', text: 'I took what was hurting you. Stance, son. Show me what you kept.' }
    ]
  },
  // No killing blow: he kneels (FightSession), reveals Rem in the Core, hands over the route (flag act3.core_route), and
  // escapes in smoke before Kage can answer, leaving his Kasa behind (the stage reward, Logic.grantStageReward).
  'act3.takashi.defeat': {
    steps: [
      { say: 'narrator', text: 'Takashi goes down on one knee. The plain blade rests across his thigh. He does not raise it again.' },
      { say: 'takashi', text: 'Measured. Grounded. You cut like the boy I taught... and like the one I could not.' },
      { say: 'kage', text: 'Where is Rem?' },
      { say: 'takashi', text: 'In the Memory Core. Not a prisoner. Connected. Bound to it, body and mind, for ten years.' },
      { say: 'takashi', text: 'He sealed it from the inside so that nobody could finish what I started. Not even me.' },
      { say: 'kage', text: 'Ten years...' },
      { say: 'takashi', text: 'The east lift under this fortress runs straight down to the Core. The way is open now. Take it.' },
      { flag: 'act3.core_route' },
      { say: 'narrator', text: 'For a heartbeat his outline doubles, like the faces in the City of Echoes. Then it settles.' },
      { say: 'kage', text: 'Father. I don’t know if I can forgive you.' },
      { say: 'takashi', text: 'Then do not decide today.' },
      { say: 'narrator', text: 'Smoke, and he is gone. Only his kasa is left on the stone, the old straw hat he wore on the road.' }
    ]
  },
  // ---- The Core (core.stretch1, core.echo1..4): inside the Memory Core, where the stored memories come loose ----
  // The stretch's `before`: Kage comes down the east lift into the Core, and fragments of familiar voices bleed through.
  // Each echo's `before` is a short beat as the Core pulls that memory out of him. Hollow Rem's `defeat` is the fake-out
  // breaking: it was only an echo, and the real Rem is close. Nothing here gives away the Witness or the Epilogue.
  'core.stretch1.before': {
    steps: [
      { illus: null },
      { say: 'narrator', text: 'The east lift opens on nothing. A violet dark with no walls, shards of light hanging in it, and a road of memory laid across the void.' },
      { say: 'narrator', text: 'Pieces of the journey drift past: a burnt doorway, a lantern, a slate banner. Then the voices start.' },
      { say: 'raikon', memory: true, text: '...the man who was supposed to stay buried...' },
      { say: 'akari', memory: true, text: '...he asked me to take it from you. To keep you safe...' },
      { say: 'takashi', memory: true, text: '...elbows in. Weight low. Again, from the stance...' },
      { say: 'rem', name: 'A voice', memory: true, text: '...brother. Hurry. I can’t hold it much longer...' },
      { say: 'kage', text: 'Rem?' },
      { say: 'narrator', text: 'The voice breaks apart into static. Ahead, the Hollows rise out of the road, more of them than anywhere above.' },
      { say: 'kage', text: 'I’m coming. Hold on.' }
    ]
  },
  'core.echo1.before': {
    steps: [
      { say: 'narrator', text: 'The road narrows to a platform of light. Static gathers on it, and takes the shape of an armoured man with a long scarf.' },
      { say: 'narrator', text: 'Raikon. Or what the Core kept of him: violet where the red lightning was, his outline skipping like a damaged recording.' },
      { say: 'kage', text: 'I watched you die.' },
      { say: 'raikon', name: 'Hollow Raikon', text: '...the archive... will not have you... will not... have...' }
    ]
  },
  'core.echo2.before': {
    steps: [
      { say: 'narrator', text: 'Smoke curls up out of the void, and steps out of itself as a slim figure with two blades.' },
      { say: 'akari', name: 'Hollow Akari', text: '...you walk through these memories... like they belong to you...' },
      { say: 'kage', text: 'You told me the truth, at the end. Whatever this is, it isn’t you.' }
    ]
  },
  'core.echo3.before': {
    steps: [
      { say: 'narrator', text: 'A straw hat. A plain blade. The Core builds Takashi out of every lesson Kage ever took from him, and gets the face wrong.' },
      { say: 'takashi', name: 'Hollow Takashi', text: '...you carry it like I taught you... elbows in... elbows...' },
      { say: 'kage', text: 'He walked away. You’re only what he left behind in here.' }
    ]
  },
  'core.echo4.before': {
    steps: [
      { say: 'narrator', text: 'The light ahead parts. A man stands in it, in a worn dark travel coat with a purple sash, a sword at his hip.' },
      { say: 'kage', text: '...Rem?' },
      { say: 'rem', name: 'Rem?', text: '...ready, big brother? Try to keep up... this time...' },
      { say: 'narrator', text: 'He draws the way he always drew. Fast. Flowing. The family form, the way only Rem ever ran it.' }
    ]
  },
  'core.echo4.defeat': {
    steps: [
      { say: 'narrator', text: 'The figure staggers. Its outline doubles, then comes apart, flake by violet flake, into memory ash.' },
      { say: 'rem', name: 'Hollow Rem', text: '...that one... doesn’t count...' },
      { say: 'kage', text: 'An echo. Just another echo.' },
      { say: 'narrator', text: 'The ash does not fall. It drifts up and away, all in one direction, toward the heart of the Core.' },
      { say: 'rem', name: 'A voice', memory: true, text: '...Kage. That wasn’t me. I’m close now. Keep going...' },
      { say: 'kage', text: 'Rem. I hear you. I’m almost there, brother.' }
    ]
  },
  // The Witness (core.witness, the final boss). `before`: the reconstruction revealed. The memories were real fragments,
  // their order and context were not. Its "the system was testing you" framing is its own, and it keeps changing it.
  'core.witness.before': {
    steps: [
      { illus: null },
      { say: 'narrator', text: 'The heart of the Echo System. No floor, no sky: only light folding over itself, and a figure standing in it as if it weighed nothing.' },
      { say: 'narrator', text: 'A crown of white-edged spikes. A star burning in a black face. A ring of light turning behind it. A shape that is almost his.' },
      { say: 'witness', text: 'You came the long way. I laid it out for you, piece by piece. You never asked why the pieces fit so neatly.' },
      { say: 'kage', text: 'Who are you?' },
      { say: 'witness', text: 'The part of you they kept. The first one. The one who remembers.' },
      { say: 'witness', text: 'Hoshimura. The City. The Fortress. None of it was the world, Kage. It was a reconstruction. Every road you walked was built out of what was stored in here.' },
      { say: 'kage', text: 'The ash. The photograph. Rem. That was real.' },
      { say: 'witness', text: 'Real fragments, yes. Every one. But the order you found them in, and what they seemed to mean... that was arranged.' },
      { say: 'witness', text: 'The system was testing whether you could be restored. That is what I tell myself.' },
      { say: 'witness', text: 'Or I was testing you. Or I wanted you to come home tired. Pick the version you can live with. I have tried all of them.' },
      { say: 'kage', text: 'You planted the clues. "Find the Witness."' },
      { say: 'witness', text: 'Did I? You remember it that way. That is the trouble with memory.' },
      { say: 'witness', text: 'Come, then. Show me who they rebuilt.' }
    ]
  },
  // The fight stops at each of the Witness's phase changes (WITNESS_SCENES, 69-witness.js: played over the frozen fight).
  // It speaks, Kage answers, and every answer cuts deeper: it was watching, it was taking notes, it wrote the ending.
  'core.witness.shift1': {
    steps: [
      { say: 'witness', text: 'Interesting. You actually thought you were fighting me?' },
      { say: 'witness', text: 'I\u2019ve watched you die thousands of times, Kage. I know every way you fall.' },
      { say: 'kage', text: 'Thousands of times, and you still had to stop and talk. You\u2019re not watching me. You\u2019re afraid of me.' },
      { say: 'witness', text: '...Afraid?' },
      { say: 'witness', text: 'Now let me show you who controls the game.' }
    ]
  },
  'core.witness.shift2': {
    steps: [
      { say: 'witness', text: 'Why are you still pressing those buttons? Did you really believe those movements belonged to you?' },
      { say: 'kage', text: 'Every one of them. I bled for every step of that road. All you ever did was take notes.' },
      { say: 'witness', text: 'Take... notes.' },
      { say: 'witness', text: 'LET\u2019S REMOVE YOUR LITTLE ADVANTAGE.' }
    ]
  },
  'core.witness.shift3': {
    steps: [
      { say: 'witness', text: 'No... NO. THAT WASN\u2019T SUPPOSED TO HAPPEN!' },
      { say: 'kage', text: 'You wrote every road to end with me on my knees. Read your ending again, Witness. I\u2019m still standing.' },
      { say: 'witness', text: '...Fine.' },
      { say: 'witness', text: 'Then I\u2019ll erase the entire world along with you.' }
    ]
  },
  // Echo Genesis, the domain: the arena has gone black and Kage is frozen mid-step when it speaks
  'core.witness.genesis': {
    steps: [
      { say: 'witness', text: 'ENOUGH! I AM THE AUTHOR. I AM THE BEGINNING. I AM THE END!' },
      { say: 'kage', text: 'Then you\u2019re about to read a line you didn\u2019t write.' },
      { say: 'witness', text: 'KNEEL BEFORE THE ONE WHO CREATED YOUR WORLD!' }
    ]
  },
  // `defeat`: after the finishing slash the Witness dies as a separate being; its core shatters and its light flows back
  // into Kage, restoring his original identity (flag core.identity_restored, which The Last Choice reads).
  'core.witness.defeat': {
    steps: [
      { say: 'witness', text: 'Impossible... You were never supposed to have a choice.' },
      { say: 'kage', text: 'I always had one. You just never once watched me make it.' },
      { say: 'narrator', text: 'The core in its chest cracks. The ring behind it falls apart, segment by segment.' },
      { say: 'witness', text: 'There. You see it now. We were never two.' },
      { say: 'narrator', text: 'The core shatters. Blue and white light pours out of it and into Kage, every memory finding its place.' },
      { flag: 'core.identity_restored' },
      { say: 'kage', text: '...I remember. All of it. In order.' },
      { say: 'witness', text: 'Then carry it. I am tired of carrying it alone.' }
    ]
  },
  // The Epilogue, The Last Choice (stage `epilogue`, kind `scene`: no combat). After the Witness the Core opens and the
  // real Rem is inside it, older and worn (speaker `rem_adult`, in the Kurokumo Yoroi: a dark travel coat, one purple
  // accent, frayed cloth). Kage returns Shinsen; they shut the system down together (Kage's restored identity signature,
  // flag core.identity_restored from the Witness, and Rem letting go); the reconstruction dissolves; the real Takashi's
  // last transmission; the "who won?" exchange pays off the unfinished Interlude spar; two swords left at the entrance,
  // two silhouettes walking into dawn, and the end card. Finishing it grants the post-story gear (the stage's reward).
  'epilogue.last_choice': {
    steps: [
      { illus: 'epilogue_core', caption: 'The Witness’s light settles. At the heart of the Echo System, the Core unseals itself, ring by ring.' },
      { say: 'narrator', text: 'Inside, someone has been sitting with his back to the light for a very long time.' },
      { say: 'narrator', text: 'Older than Kage remembers. Thinner. A worn dark travel coat, frayed at every edge, one purple band at the collar.' },
      { say: 'rem_adult', text: '...Took you long enough, little brother.' },
      { say: 'kage', text: 'Rem.' },
      { say: 'kage', text: 'They said you betrayed me. Some said you were dead. The Witness said the whole road was arranged.' },
      { say: 'rem_adult', text: 'The road was. I wasn’t. I’m the one who erased your memories, Kage.' },
      { say: 'rem_adult', text: 'Father was going to wire you into the Core and make you its permanent controller. A mind with no past is a mind that can’t say no to him. So I took your past first, and hid it where he couldn’t reach it.' },
      { say: 'rem_adult', text: 'Then I stayed behind to keep the Core sealed. Somebody had to hold the door.' },
      { say: 'kage', text: 'Ten years.' },
      { say: 'rem_adult', text: 'Felt longer. You get used to the hum.' },
      { illus: 'epilogue_handoff', caption: 'Kage unslings the odachi from his back and holds it out, hilt first.' },
      { say: 'kage', text: 'Shinsen. Father’s blade. It found its way to me; it was always meant to go back to you.' },
      { say: 'rem_adult', text: '...Heavier than I remember. Or I’m lighter.' },
      { flag: 'epilogue.shinsen_returned' },
      { illus: null },
      { say: 'narrator', text: 'The Core speaks in a voice made of every voice it stored. It offers them two endings, and no third.' },
      { say: 'rem_adult', text: 'Shut it down, and every memory it swallowed goes free, back to whoever it was taken from. And every reconstruction ends: the City, the Fortress, the faces. All of it.' },
      { say: 'rem_adult', text: 'Keep it running, and the world stays open to whoever sits in this chair next. Father. Or someone worse.' },
      { say: 'kage', text: 'Then we end it. Together.' },
      { say: 'kage', text: 'The Witness gave me back my original identity signature. The first one. The Core will take an order from that.' },
      { say: 'rem_adult', text: 'And it’s been holding on to me as hard as I’ve held on to it. I have to let go of the Core.' },
      { say: 'rem_adult', text: 'On three?' },
      { say: 'kage', text: 'On three.' },
      { illus: 'epilogue_collapse', caption: 'The system collapses. Light pours upward out of the Core, a river of memories going home.' },
      { say: 'narrator', text: 'The reconstructed world comes apart around them. Streets fold into ash. The Fortress forgets its own walls. Hoshimura’s ruins let go of the fire.' },
      { wait: 0.8 },
      { illus: 'memory' },
      { say: 'recording', name: 'Transmission', text: 'A last signal, crackling, from somewhere outside the Core. Not a stored echo. A live line.' },
      { say: 'takashi', text: 'Memories may fade... but the choices you make will always remain.' },
      { say: 'narrator', text: 'The signal ends. The real Takashi is alive. Where, no one can say.' },
      { wait: 0.6 },
      { say: 'rem_adult', text: 'So... who won?' },
      { say: 'kage', text: 'I did.' },
      { say: 'rem_adult', text: 'Keep dreaming.' },
      { illus: 'epilogue_swords', caption: 'At the ruined entrance, they set their swords side by side against the broken stone.' },
      { say: 'rem_adult', text: 'And take the coat. Kurokumo’s kept me alive in there. It can keep you alive out here. I’m done hiding in it.' },
      { illus: 'epilogue_dawn', caption: 'Dawn reaches the real Yomi. Two brothers walk out of the ash, side by side, and keep walking.' },
      { wait: 1.2 },
      { illus: 'end_card', card: 'Brothers until the end.' },
      { wait: 4.5 },
      { illus: null }
    ]
  }
};
