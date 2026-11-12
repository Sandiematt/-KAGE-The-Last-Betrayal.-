    const KAGE_PALETTE = {
      shadowCore: '#0c080a',       // Deepest silhouette black
      shadowCloth: '#130d10',      // Dark shinobi jacket tone
      shadowLining: '#1c1114',     // Inner coat fold tone
      crimsonDark: '#591215',      // Dark crimson belt & inner scarf shadow
      crimsonMid: '#8a191d',       // Primary scarf crimson & coat filigree
      crimsonBright: '#c82d29',    // Sharp left-side rim highlight (from SVG)
      crimsonGlow: '#e63b35',      // High-energy slash / lightning rim edge
      warmRim: '#b57866',          // Warm moonlight/sunset rim edge on right side
      bladeSteel: '#d9d4d2',       // Katana edge highlight
      bladeCore: '#45383a',        // Katana dark fuller
      hiltGold: '#8f5d46'          // Tsuba & pommel bronze
    };

    /**
     * Pre-compiled Native HTML5 Canvas Path2D Modular Library.
     * Crafted directly from the reference SVG shapes with (0,0) placed at each joint pivot.
     */
    const KAGE_SVG_PATHS = {
      // -------------------------------------------------------------------------
      // 1. HEAD & 9 SWEPT-BACK ANIME HAIR SPIKES (Pivot 0,0 at Neck Base)
      // Matches the exact swept-back spiky silhouette & crimson top rim edges in image(1).svg
      // -------------------------------------------------------------------------
      headBase: new Path2D(
        "M -6,2 " +
        "C -10,0 -14,-5 -16,-12 " +            // Chin & jawline facing left
        "L -19,-10 L -18,-22 " +               // Front cheek lock
        "L -25,-17 L -21,-32 " +               // Forehead spike 1 (hanging over brow)
        "L -30,-28 L -20,-42 " +               // Forehead spike 2
        "C -16,-52 -8,-63 2,-72 " +            // Tallest front-top spike 3 (crimson-rimmed)
        "L -2,-56 " +
        "C 10,-64 24,-70 36,-73 " +            // Swept-back crown spike 4
        "L 18,-53 " +
        "C 32,-57 48,-60 64,-60 " +            // Long upper-back spike 5
        "L 34,-42 " +
        "C 48,-43 65,-42 78,-39 " +            // Longest horizontal swept spike 6
        "L 42,-27 " +
        "C 52,-25 62,-21 69,-16 " +            // Lower-mid spike 7
        "L 38,-14 " +
        "C 44,-11 50,-7 54,-3 " +              // Nape spike 8
        "L 22,-4 L 10,4 Z"
      ),
      // Crimson top-edge rim highlights on hair spikes (directly from image(1).svg)
      headCrimsonRim: new Path2D(
        "M -28,-27 L -20,-41 C -15,-51 -7,-62 2,-72 L 0,-63 C -7,-55 -13,-46 -17,-38 Z " +
        "M 1,-57 C 12,-64 24,-70 36,-73 L 28,-65 C 18,-61 9,-56 2,-51 Z " +
        "M 20,-53 C 34,-57 49,-60 64,-60 L 52,-54 C 40,-53 29,-51 20,-48 Z " +
        "M -25,-17 L -21,-32 L -18,-27 L -22,-15 Z"
      ),
      // Subtle dark crimson hair separation strands near collar
      headStrandDetail: new Path2D(
        "M -8,-8 C -4,-16 4,-22 14,-24 C 6,-18 0,-12 -4,-4 Z " +
        "M 4,-6 C 12,-14 22,-18 34,-18 C 24,-13 14,-8 8,-2 Z"
      ),

      // -------------------------------------------------------------------------
      // 2. TORSO & HIGH-COLLAR SHINOBI JACKET (Pivot 0,0 at Waist / Belt Center)
      // -------------------------------------------------------------------------
      torsoBase: new Path2D(
        "M -18,2 " +                           // Front waist
        "C -20,-16 -24,-32 -28,-46 " +         // Chest & ribcage slight forward lean
        "L -35,-58 " +                         // High jutting shinobi front collar point
        "C -24,-62 -10,-66 8,-66 " +           // Collar opening
        "L 32,-56 " +                          // Upper back shoulder hood/cowl
        "C 30,-42 24,-24 21,2 " +              // Arching back spine
        "Z"
      ),
      // Subtle crimson jacket seam & lapel trim lines (from image(1).svg)
      torsoSeams: new Path2D(
        "M -35,-58 C -22,-57 -8,-58 10,-62 L 14,-56 C -4,-53 -19,-53 -32,-54 Z " +
        "M -15,-48 C -12,-32 -9,-16 -6,0 L -9,0 C -12,-16 -15,-32 -18,-47 Z " +
        "M -27,-34 L -18,-33 L -19,-12 L -22,-12 L -21,-30 L -27,-31 Z"
      ),

      // -------------------------------------------------------------------------
      // 3. WAIST BELT SASH & KNOT TIES (Pivot 0,0 at Pelvis Root)
      // -------------------------------------------------------------------------
      beltBand: new Path2D(
        "M -21,-5 C -8,-7 8,-7 23,-4 L 22,5 C 8,3 -8,3 -20,4 Z"
      ),
      beltTieFront: new Path2D(
        "M -6,2 L 1,2 L 5,36 L -4,40 Z " +
        "M -14,1 L -7,2 L -18,29 L -24,26 Z"
      ),

      // -------------------------------------------------------------------------
      // 4. SWEEPING BACK LONGCOAT TAIL + ORNATE CRIMSON CLOUD/SWIRL FILIGREE
      // Pivot (0,0) at Rear Waist Belt attachment
      // Replicates the exact sweeping triangular tail & cloud filigree from image(1).svg
      // -------------------------------------------------------------------------
      backCoatBase: new Path2D(
        "M -6,0 " +
        "C 14,22 32,58 55,108 " +              // Inner left edge of back coat panel
        "C 66,94 82,78 102,65 " +              // Arched bottom hem cut
        "C 122,52 142,46 164,53 " +            // Swept-up outer tail tip
        "C 138,24 102,8 62,-2 " +              // Upper flowing back edge of coat
        "L 16,-4 Z"
      ),
      // The ornate crimson cloud/flame border band & spiral swirls along the bottom hem
      backCoatCrimsonHem: new Path2D(
        // Outer bottom border band following the arched hem
        "M 49,95 " +
        "C 64,82 82,66 104,54 " +
        "C 124,43 144,39 164,53 " +
        "C 142,46 122,52 102,65 " +
        "C 82,78 66,94 55,108 Z " +
        // Cloud Scroll Swirl 1 (Lower left hem corner)
        "M 44,84 C 48,76 58,74 63,80 C 66,85 62,92 56,91 C 52,90 52,85 56,84 C 58,84 59,87 56,88 C 60,89 62,84 59,81 C 55,78 49,81 48,88 Z " +
        // Cloud Scroll Swirl 2 (Large central-left cloud motif)
        "M 62,72 C 60,61 70,52 81,55 C 90,57 93,67 86,73 C 80,78 71,75 71,68 C 71,63 77,61 80,64 C 77,64 75,66 76,69 C 77,72 82,72 84,68 C 86,63 81,58 75,59 C 68,60 65,67 68,75 Z " +
        // Cloud Scroll Swirl 3 (Upper-mid S-scroll motif)
        "M 88,56 C 86,46 95,38 106,40 C 115,41 120,50 113,56 C 108,60 100,58 100,52 C 100,48 105,46 108,49 C 105,49 103,51 104,53 C 106,55 110,54 111,50 C 112,45 106,42 100,43 C 93,45 91,51 94,58 Z " +
        // Cloud Scroll Swirl 4 (Rightward trailing flame/cloud tip)
        "M 116,44 C 118,36 128,33 136,37 C 143,40 146,46 140,49 C 135,51 129,48 130,43 C 131,40 135,40 136,42 C 133,42 132,45 135,46 C 138,47 140,43 136,40 C 130,37 123,40 122,47 Z"
      ),
      // Warm rim-light stroke along the coat hem & trailing edge
      backCoatRim: new Path2D(
        "M -2,4 C 16,26 34,60 55,108 C 66,94 82,78 102,65 C 122,52 142,46 164,53"
      ),

      // -------------------------------------------------------------------------
      // 5. FRONT SPLIT COAT FLAP (Pivot 0,0 at Front Left Waist)
      // Covers the upper front thigh with crimson left-edge highlight & lower calf drape
      // -------------------------------------------------------------------------
      frontCoatFlapBase: new Path2D(
        "M -4,0 " +
        "C -24,18 -46,42 -66,72 " +            // Left leading edge of front coat split
        "L -54,75 " +
        "C -36,52 -18,28 2,4 Z"
      ),
      frontCoatFlapCrimson: new Path2D(
        "M -6,2 C -26,20 -47,44 -66,72 L -60,73 C -42,46 -22,22 -2,3 Z"
      ),

      // -------------------------------------------------------------------------
      // 6. FRONT LEG (LEFT ON SCREEN) — THIGH, CALF + INNER COAT DRAPE, BOOT
      // Includes both the restored dark silhouette leg AND the exact red lightning rim
      // -------------------------------------------------------------------------
      frontThighBase: new Path2D(
        "M 0,0 " +
        "C -18,14 -36,34 -50,58 " +            // Upper thigh sweep
        "L -28,66 " +                          // Knee joint width
        "C -14,44 -2,22 10,4 Z"
      ),
      frontThighCrimsonRim: new Path2D(
        "M -4,2 C -21,16 -38,36 -51,58 L -46,60 C -34,38 -17,18 -1,4 Z"
      ),

      // Front Calf (Pivot 0,0 at Front Knee) + Draping Inner Coat Tail behind shin
      frontCalfDrape: new Path2D(
        "M 6,-4 " +
        "C 12,14 16,32 20,52 " +               // Rear dangling inner coat flap behind left knee
        "L -8,46 " +
        "C -6,28 -4,10 0,-4 Z"
      ),
      frontCalfDrapeRim: new Path2D(
        "M 6,-4 C 12,14 16,32 22,58 L 18,52 C 14,34 10,16 4,-2 Z"
      ),
      frontCalfBase: new Path2D(
        "M -12,-4 " +
        "L -24,18 L -18,22 " +                 // Knee guard flare
        "L -32,62 " +                          // Shin leading down to ankle
        "L -14,66 " +                          // Ankle width
        "L 2,24 L 8,-2 Z"
      ),
      // The jagged crimson rim-light down the front shin (preserved from image(1).svg)
      frontCalfCrimsonRim: new Path2D(
        "M -12,-4 L -24,18 L -18,20 L -33,62 L -29,63 L -14,20 L -19,17 L -8,-3 Z"
      ),

      // Front Foot & Shinobi Boot (Pivot 0,0 at Front Ankle)
      frontFootBase: new Path2D(
        "M -8,-4 L -22,12 L -32,18 L -30,23 L -4,22 L 4,14 L 4,-2 Z"
      ),
      frontFootCrimsonRim: new Path2D(
        "M -8,-4 L -16,6 L -14,10 L -25,15 L -32,19 L -31,23 L -29,19 L -19,14 L -11,9 L -5,-3 Z"
      ),

      // -------------------------------------------------------------------------
      // 7. BACK LEG (RIGHT ON SCREEN) — THIGH, CALF GUARD, SHIN & BOOT
      // Matches the anchored back leg emerging from under the ornate coat tail
      // -------------------------------------------------------------------------
      backThighBase: new Path2D(
        "M -8,0 L 12,-4 L 44,54 L 22,62 Z"
      ),
      backCalfBase: new Path2D(
        "M -11,-4 " +
        "L 12,-8 L 22,10 L 17,15 " +           // Bulky shinobi knee/calf cuff wrap
        "L 36,56 L 22,60 " +                   // Tapered shin wrap with warm right highlight
        "L 2,20 L -6,16 Z"
      ),
      backCalfWarmRim: new Path2D(
        "M 17,15 L 36,56 L 33,57 L 14,16 Z"
      ),
      backFootBase: new Path2D(
        "M -6,-2 L 10,-4 L 18,8 L 24,24 L -2,24 L -5,12 Z"
      ),
      backFootWarmRim: new Path2D(
        "M 10,-4 L 18,8 L 24,24 L 21,24 L 15,9 L 8,-3 Z"
      ),

      // -------------------------------------------------------------------------
      // 8. ARMS, GAUNTLETS & TWO-HANDED OVERHEAD SWORD GUARD
      // Restores the dark sleeve silhouette while keeping the red lightning edge from image(1).svg
      // -------------------------------------------------------------------------
      backUpperArmBase: new Path2D(
        "M 0,-8 C -16,-6 -34,0 -48,10 L -40,24 C -24,16 -10,12 4,8 Z"
      ),
      backForearmBase: new Path2D(
        "M -4,4 C -14,-10 -24,-26 -30,-42 L -16,-48 C -8,-32 2,-16 10,-2 Z"
      ),
      backForearmCrimsonRim: new Path2D(
        "M -4,4 C -14,-10 -24,-26 -30,-42 L -26,-44 C -20,-28 -10,-12 0,2 Z"
      ),

      frontUpperArmBase: new Path2D(
        "M 0,-9 C -18,-5 -36,4 -50,16 L -38,30 C -24,20 -8,12 6,8 Z"
      ),
      frontUpperArmCrimsonRim: new Path2D(
        "M -12,1 C -26,6 -39,12 -50,16 L -38,30 L -35,27 L -45,17 C -35,12 -24,7 -12,4 Z"
      ),
      frontForearmBase: new Path2D(
        "M -6,4 C -16,-12 -26,-28 -34,-46 L -18,-54 C -8,-36 2,-18 10,-2 Z"
      ),
      // Preserves the exact red lightning inner/outer forearm highlights from image(1).svg
      frontForearmCrimsonRim: new Path2D(
        "M -6,4 C -16,-12 -26,-28 -34,-46 L -30,-48 C -22,-30 -12,-14 -2,2 Z " +
        "M -16,12 L -26,28 L -14,44 L -18,45 L -30,28 L -20,10 Z"
      ),

      // -------------------------------------------------------------------------
      // 9. HANDS & KATANA (Pivot 0,0 at Two-Handed Hilt Grip)
      // Includes both the clipped stub from image(1).svg and the full razor katana blade!
      // -------------------------------------------------------------------------
      gauntletHands: new Path2D(
        "M -14,-10 C -18,-2 -16,10 -8,14 C 2,18 12,12 14,2 C 16,-8 8,-16 -2,-16 C -8,-16 -12,-14 -14,-10 Z"
      ),
      katanaHiltAndTsuba: new Path2D(
        // Pommel & wrapped tsuka hilt
        "M -26,24 L 12,-14 L 19,-7 L -19,31 Z " +
        // Circular/oval tsuba handguard
        "M 4,-22 C 8,-25 18,-17 26,-9 C 33,-1 36,6 32,9 C 28,12 19,5 11,-3 C 3,-11 0,-19 4,-22 Z"
      ),
      katanaTsubaRim: new Path2D(
        "M 4,-22 C 8,-25 18,-17 26,-9 C 33,-1 36,6 32,9 L 29,6 C 31,4 28,-2 22,-8 C 16,-14 9,-19 6,-18 Z " +
        "M -22,26 L -32,36 L -30,44 L -34,42 L -35,34 L -25,24 Z"
      ),
      // Full tapered katana blade (Restored Mode)
      katanaBladeFull: new Path2D(
        "M 18,-14 " +
        "C 58,-54 104,-100 156,-148 " +        // Slight elegant katana curvature (sori)
        "L 164,-162 " +                        // Kissaki (razor point)
        "C 118,-104 72,-54 25,-6 Z"            // Ha (cutting edge)
      ),
      katanaBladeEdge: new Path2D(
        "M 22,-9 C 69,-56 116,-105 164,-162 L 159,-152 C 112,-99 66,-51 25,-6 Z"
      ),
      katanaCrimsonGroove: new Path2D(
        "M 24,-13 L 95,-84 L 97,-81 L 26,-10 Z"
      ),
      // Clipped short blade stub (Exact match when comparing raw image(1).svg)
      katanaBladeStub: new Path2D(
        "M 18,-14 L 68,-66 L 63,-49 L 25,-6 Z"
      ),
      katanaBladeStubEdge: new Path2D(
        "M 22,-9 L 68,-66 L 63,-49 L 25,-6 Z"
      )
    };

    /**
     * ============================================================================
     * HIERARCHICAL 2D BONE CLASS
     * ============================================================================
     * Each Bone holds a local joint position (x, y) relative to its parent bone,
     * a local rotation in radians, scale, and child bones.
     */
    class Bone2D {
      constructor(name, x = 0, y = 0, rotation = 0, length = 40) {
        this.name = name;
        this.x = x;
        this.y = y;
        this.rotation = rotation;
        this.scaleX = 1;
        this.scaleY = 1;
        this.length = length;
        this.parent = null;
        this.children = [];
        // Cached world coordinates for debug pivot visualization
        this.worldX = 0;
        this.worldY = 0;
        this.worldRotation = 0;
      }

      addChild(childBone) {
        childBone.parent = this;
        this.children.push(childBone);
        return childBone;
      }
    }

    /**
     * ============================================================================
     * KAGE SKELETAL RIG CONTROLLER
     * ============================================================================
     */
    class KageCharacterRig {
      constructor() {
        this.state = 'pose'; // 'pose' | 'idle' | 'run' | 'dash' | 'slash'
        this.time = 0;
        this.stateTime = 0;
        this.timeScale = 1.0;
        this.windForce = 1.0;
        this.characterScale = 1.15;
        this.flipX = false;

        // Visual & Debug flags
        this.showBones = false;
        this.showRimLight = true;
        this.showFiligree = true;
        this.restoreMissingParts = true;

        // Dynamic secondary motion accumulators (scarf & coat spring wave)
        this.windPhase = 0;
        this.slashEffects = [];
        this.afterimages = [];
        this.cameraShake = 0;

        this.initSkeleton();
        this.poseTarget = this.getReferencePoseAngles();
        this.currentAngles = { ...this.poseTarget };
      }

      /**
       * Builds the 19-bone anatomical hierarchy with exact joint offsets.
       */
      initSkeleton() {
        this.bones = {};

        // Root Pelvis (Waist Sash center)
        this.root = new Bone2D('pelvis', 0, 0, 0, 20);
        this.bones.pelvis = this.root;

        // Legs attached to Pelvis
        this.bones.backThigh = this.root.addChild(new Bone2D('backThigh', 10, 4, 0, 58));
        this.bones.backCalf = this.bones.backThigh.addChild(new Bone2D('backCalf', 32, 56, 0, 58));
        this.bones.backFoot = this.bones.backCalf.addChild(new Bone2D('backFoot', 28, 56, 0, 26));

        this.bones.frontThigh = this.root.addChild(new Bone2D('frontThigh', -10, 4, 0, 62));
        this.bones.frontCalf = this.bones.frontThigh.addChild(new Bone2D('frontCalf', -39, 60, 0, 62));
        this.bones.frontFoot = this.bones.frontCalf.addChild(new Bone2D('frontFoot', -23, 62, 0, 28));

        // Coat Panels attached to Waist
        this.bones.backCoatTail = this.root.addChild(new Bone2D('backCoatTail', 12, -2, 0, 145));
        this.bones.frontCoatFlap = this.root.addChild(new Bone2D('frontCoatFlap', -12, 0, 0, 72));
        this.bones.beltSash = this.root.addChild(new Bone2D('beltSash', -4, 2, 0, 36));

        // Torso & Spine attached to Pelvis
        this.bones.torso = this.root.addChild(new Bone2D('torso', 0, 0, 0, 62));

        // Neck / Head attached to top of Torso
        this.bones.head = this.bones.torso.addChild(new Bone2D('head', -4, -58, 0, 55));

        // Twin Crimson Scarf Chains attached to Collar (0, -56)
        this.bones.scarfUpper1 = this.bones.torso.addChild(new Bone2D('scarfUpper1', 8, -56, 0, 48));
        this.bones.scarfUpper2 = this.bones.scarfUpper1.addChild(new Bone2D('scarfUpper2', 48, 0, 0, 48));

        this.bones.scarfLower1 = this.bones.torso.addChild(new Bone2D('scarfLower1', 12, -52, 0, 56));
        this.bones.scarfLower2 = this.bones.scarfLower1.addChild(new Bone2D('scarfLower2', 56, 0, 0, 58));
        this.bones.scarfLower3 = this.bones.scarfLower2.addChild(new Bone2D('scarfLower3', 58, 0, 0, 54));

        // Shoulders & Arms attached to upper Torso
        this.bones.backUpperArm = this.bones.torso.addChild(new Bone2D('backUpperArm', -14, -48, 0, 46));
        this.bones.backForearm = this.bones.backUpperArm.addChild(new Bone2D('backForearm', -42, 16, 0, 48));

        this.bones.frontUpperArm = this.bones.torso.addChild(new Bone2D('frontUpperArm', -8, -46, 0, 48));
        this.bones.frontForearm = this.bones.frontUpperArm.addChild(new Bone2D('frontForearm', -44, 22, 0, 50));
        this.bones.katanaHand = this.bones.frontForearm.addChild(new Bone2D('katanaHand', -26, -48, 0, 140));
      }

      /**
       * Returns the exact joint angles that reproduce image(1).svg and Screenshot 1.
       */
      getReferencePoseAngles() {
        return {
          pelvisX: 0,
          pelvisY: 0,
          pelvisRot: 0,
          torsoRot: 0,
          headRot: 0,
          backCoatRot: 0,
          frontCoatRot: 0,
          beltSashRot: 0,
          frontThighRot: 0,
          frontCalfRot: 0,
          frontFootRot: 0,
          backThighRot: 0,
          backCalfRot: 0,
          backFootRot: 0,
          frontUpperArmRot: 0,
          frontForearmRot: 0,
          backUpperArmRot: 0,
          backForearmRot: 0,
          katanaRot: 0,
          scarfWave: 0
        };
      }

      setState(newState) {
        if (this.state !== newState) {
          this.state = newState;
          this.stateTime = 0;
          if (newState === 'slash') {
            this.slashTriggered = false;
          }
        } else if (newState === 'slash' || newState === 'dash') {
          // Allow re-triggering action states immediately
          this.stateTime = 0;
          this.slashTriggered = false;
        }
      }

      /**
       * Evaluates procedural keyframe curves for each animation state.
       */
      computeTargetAngles(dt) {
        const t = this.stateTime;
        const base = this.getReferencePoseAngles();

        if (this.state === 'pose') {
          // Exact 1:1 Reference Pose with optional subtle scarf breeze if wind > 0
          base.scarfWave = Math.sin(this.windPhase * 1.5) * 0.04 * this.windForce;
          return base;
        }

        if (this.state === 'idle') {
          // Deep rhythmic combat breathing stance
          const breath = Math.sin(t * 2.6);
          const secondary = Math.sin(t * 2.6 - 0.7);

          base.pelvisY = Math.abs(breath) * 3.5;
          base.torsoRot = breath * 0.035;
          base.headRot = -breath * 0.025 + Math.sin(t * 1.3) * 0.02;

          // Compensate knees slightly as pelvis sinks
          base.frontThighRot = -breath * 0.03;
          base.frontCalfRot = breath * 0.05;
          base.frontFootRot = -breath * 0.02;

          base.backThighRot = breath * 0.025;
          base.backCalfRot = -breath * 0.04;
          base.backFootRot = breath * 0.015;

          // Overhead sword guard breathes slightly
          base.frontUpperArmRot = secondary * 0.045;
          base.frontForearmRot = -secondary * 0.03;
          base.backUpperArmRot = secondary * 0.04;
          base.backForearmRot = -secondary * 0.03;
          base.katanaRot = secondary * 0.025;

          // Coat & sash billow in the night wind
          base.backCoatRot = (-0.03 + Math.sin(t * 3.2 - 0.5) * 0.045) * this.windForce;
          base.frontCoatRot = Math.sin(t * 3.2) * 0.03 * this.windForce;
          base.beltSashRot = (0.08 + Math.sin(t * 3.8 - 0.4) * 0.09) * this.windForce;
          base.scarfWave = Math.sin(t * 4.0) * 0.18 * this.windForce;
          return base;
        }

        if (this.state === 'run') {
          // High-speed shinobi forward run cycle
          const speed = 8.5;
          const phase = t * speed;
          const stride = Math.sin(phase);
          const counterStride = Math.sin(phase + Math.PI);
          const bounce = Math.abs(Math.cos(phase));

          base.pelvisY = -bounce * 12 + 6;
          base.pelvisRot = -0.14; // Forward lean
          base.torsoRot = -0.22 + Math.sin(phase * 2) * 0.04;
          base.headRot = 0.24 - Math.sin(phase * 2) * 0.03;

          // Full leg stride cycle with knee flex on recovery pass
          base.frontThighRot = 0.42 + stride * 0.68;
          base.frontCalfRot = 0.25 + Math.max(0, Math.cos(phase)) * 0.85;
          base.frontFootRot = -0.15 + Math.sin(phase - 0.5) * 0.25;

          base.backThighRot = -0.35 + counterStride * 0.68;
          base.backCalfRot = 0.22 + Math.max(0, Math.cos(phase + Math.PI)) * 0.85;
          base.backFootRot = -0.15 + Math.sin(phase + Math.PI - 0.5) * 0.25;

          // Sword held in low trailing shinobi charge guard while running
          base.frontUpperArmRot = -0.95 + counterStride * 0.25;
          base.frontForearmRot = -0.45 + counterStride * 0.15;
          base.backUpperArmRot = -0.35 + stride * 0.45;
          base.backForearmRot = 0.55 + stride * 0.2;
          base.katanaRot = -1.35 + Math.sin(phase * 2) * 0.06;

          // Coat flies back dramatically
          base.backCoatRot = -0.28 - Math.abs(stride) * 0.12 * this.windForce;
          base.frontCoatRot = 0.18 + stride * 0.15;
          base.beltSashRot = 0.45 + Math.sin(phase * 2) * 0.18;
          base.scarfWave = Math.sin(phase * 1.5) * 0.35 * this.windForce;
          return base;
        }

        if (this.state === 'dash') {
          // Explosive low shadow-step lunge with recovery
          const cycle = t % 1.35;
          let dashFactor = 0;
          if (cycle < 0.15) {
            // Quick crouch anticipation
            dashFactor = -(cycle / 0.15) * 0.3;
          } else if (cycle < 0.55) {
            // Burst forward
            dashFactor = Math.sin(((cycle - 0.15) / 0.4) * Math.PI * 0.5);
          } else {
            // Smooth slide deceleration back to guard
            dashFactor = Math.cos(((cycle - 0.55) / 0.8) * Math.PI * 0.5);
          }

          base.pelvisX = -dashFactor * 75;
          base.pelvisY = Math.max(0, dashFactor) * 24;
          base.pelvisRot = -dashFactor * 0.22;
          base.torsoRot = -dashFactor * 0.38;
          base.headRot = dashFactor * 0.36;

          base.frontThighRot = -dashFactor * 0.28;
          base.frontCalfRot = dashFactor * 0.52;
          base.frontFootRot = -dashFactor * 0.2;

          base.backThighRot = dashFactor * 0.42;
          base.backCalfRot = dashFactor * 0.25;
          base.backFootRot = dashFactor * 0.3;

          // Arms sweep sword into horizontal pierce/trail
          base.frontUpperArmRot = -dashFactor * 1.1;
          base.frontForearmRot = -dashFactor * 0.5;
          base.backUpperArmRot = -dashFactor * 0.9;
          base.backForearmRot = -dashFactor * 0.4;
          base.katanaRot = -dashFactor * 1.45;

          base.backCoatRot = -dashFactor * 0.45;
          base.beltSashRot = dashFactor * 0.65;
          base.scarfWave = dashFactor * 0.45 + Math.sin(t * 14) * 0.12;
          return base;
        }

        if (this.state === 'slash') {
          // Signature "SLASH [U] - Your hands remember the sword"
          const cycle = t % 1.45;

          if (cycle < 0.32) {
            // Phase 1: High coiled overhead windup (charging tension)
            const p = cycle / 0.32;
            const ease = Math.sin(p * Math.PI * 0.5);
            base.pelvisX = ease * 14;
            base.pelvisY = -ease * 6;
            base.torsoRot = ease * 0.18;
            base.headRot = -ease * 0.12;
            base.frontUpperArmRot = ease * 0.38;
            base.frontForearmRot = ease * 0.25;
            base.backUpperArmRot = ease * 0.35;
            base.backForearmRot = ease * 0.22;
            base.katanaRot = ease * 0.35;
            base.backCoatRot = ease * 0.12;
            base.frontThighRot = ease * 0.1;
            base.frontCalfRot = -ease * 0.1;
            this.slashTriggered = false;
          } else if (cycle < 0.52) {
            // Phase 2: Explosive downward crescent cleave!
            const p = (cycle - 0.32) / 0.20;
            const snap = 1 - Math.pow(1 - p, 3);

            if (!this.slashTriggered && p > 0.18) {
              this.slashTriggered = true;
              this.cameraShake = 9.0;
              this.slashEffects.push({
                age: 0,
                maxAge: 0.42
              });
            }

            base.pelvisX = 14 - snap * 56;
            base.pelvisY = -6 + snap * 22;
            base.pelvisRot = -snap * 0.16;
            base.torsoRot = 0.18 - snap * 0.52;
            base.headRot = -0.12 + snap * 0.32;

            // Arms & Katana cleave through a 155-degree downward arc
            base.frontUpperArmRot = 0.38 - snap * 1.65;
            base.frontForearmRot = 0.25 - snap * 0.75;
            base.backUpperArmRot = 0.35 - snap * 1.45;
            base.backForearmRot = 0.22 - snap * 0.65;
            base.katanaRot = 0.35 - snap * 1.65;

            base.frontThighRot = 0.1 - snap * 0.26;
            base.frontCalfRot = -0.1 + snap * 0.42;
            base.backThighRot = snap * 0.28;
            base.backCoatRot = 0.12 - snap * 0.48;
            base.beltSashRot = snap * 0.55;
            base.scarfWave = -snap * 0.5;
          } else {
            // Phase 3: Follow-through hold & fluid return to overhead guard
            const p = (cycle - 0.52) / 0.93;
            const recover = 1 - Math.pow(p, 2);

            base.pelvisX = -42 * recover;
            base.pelvisY = 16 * recover;
            base.pelvisRot = -0.16 * recover;
            base.torsoRot = -0.34 * recover;
            base.headRot = 0.20 * recover;

            base.frontUpperArmRot = -1.27 * recover;
            base.frontForearmRot = -0.50 * recover;
            base.backUpperArmRot = -1.10 * recover;
            base.backForearmRot = -0.43 * recover;
            base.katanaRot = -1.30 * recover;

            base.frontThighRot = -0.16 * recover;
            base.frontCalfRot = 0.32 * recover;
            base.backThighRot = 0.28 * recover;
            base.backCoatRot = -0.36 * recover + Math.sin(p * Math.PI * 2) * 0.08;
            base.beltSashRot = 0.55 * recover;
            base.scarfWave = Math.sin(p * Math.PI * 2) * 0.22;
          }
          return base;
        }

        return base;
      }

      /**
       * Updates skeletal transforms, scarf wave physics, and combat VFX.
       */
      update(rawDt) {
        const dt = Math.min(rawDt, 0.05) * this.timeScale;
        this.time += dt;
        this.stateTime += dt;
        this.windPhase += dt * (1.8 + this.windForce * 1.6);

        if (this.cameraShake > 0) {
          this.cameraShake = Math.max(0, this.cameraShake - rawDt * 35);
        }

        const target = this.computeTargetAngles(dt);
        const lerpSpeed = this.state === 'pose' ? 14 : 18;
        const alpha = Math.min(1, dt * lerpSpeed || 0.25);

        for (const key in target) {
          this.currentAngles[key] += (target[key] - this.currentAngles[key]) * alpha;
        }

        const a = this.currentAngles;

        // Apply interpolated angles to our hierarchical Bone2D nodes
        this.bones.pelvis.x = a.pelvisX;
        this.bones.pelvis.y = a.pelvisY;
        this.bones.pelvis.rotation = a.pelvisRot;

        this.bones.torso.rotation = a.torsoRot;
        this.bones.head.rotation = a.headRot;

        this.bones.backCoatTail.rotation = a.backCoatRot;
        this.bones.frontCoatFlap.rotation = a.frontCoatRot;
        this.bones.beltSash.rotation = a.beltSashRot;

        this.bones.frontThigh.rotation = a.frontThighRot;
        this.bones.frontCalf.rotation = a.frontCalfRot;
        this.bones.frontFoot.rotation = a.frontFootRot;

        this.bones.backThigh.rotation = a.backThighRot;
        this.bones.backCalf.rotation = a.backCalfRot;
        this.bones.backFoot.rotation = a.backFootRot;

        this.bones.frontUpperArm.rotation = a.frontUpperArmRot;
        this.bones.frontForearm.rotation = a.frontForearmRot;
        this.bones.backUpperArm.rotation = a.backUpperArmRot;
        this.bones.backForearm.rotation = a.backForearmRot;
        this.bones.katanaHand.rotation = a.katanaRot;

        // Update Scarf Chain Bones for bone visualization
        const w = this.windPhase;
        const wf = this.state === 'pose' ? this.windForce * 0.25 : this.windForce;
        this.bones.scarfUpper1.rotation = -0.15 + Math.sin(w) * 0.08 * wf + a.scarfWave * 0.5;
        this.bones.scarfUpper2.rotation = 0.35 + Math.sin(w - 0.9) * 0.14 * wf + a.scarfWave * 0.7;

        this.bones.scarfLower1.rotation = 0.25 + Math.sin(w - 0.4) * 0.09 * wf + a.scarfWave * 0.6;
        this.bones.scarfLower2.rotation = 0.22 + Math.sin(w - 1.2) * 0.16 * wf + a.scarfWave * 0.8;
        this.bones.scarfLower3.rotation = -0.45 + Math.sin(w - 2.0) * 0.22 * wf + a.scarfWave;

        // Spawn shadow afterimages during Dash or Slash cleave
        if ((this.state === 'dash' || this.state === 'slash') && Math.random() < 0.55 && this.timeScale > 0) {
          this.afterimages.push({
            x: a.pelvisX,
            y: a.pelvisY,
            alpha: 0.42
          });
        }
        for (let i = this.afterimages.length - 1; i >= 0; i--) {
          this.afterimages[i].alpha -= dt * 1.4;
          if (this.afterimages[i].alpha <= 0) this.afterimages.splice(i, 1);
        }

        // Update Slash Arc VFX
        for (let i = this.slashEffects.length - 1; i >= 0; i--) {
          this.slashEffects[i].age += dt;
          if (this.slashEffects[i].age >= this.slashEffects[i].maxAge) {
            this.slashEffects.splice(i, 1);
          }
        }
      }

      /**
       * Renders the twin crimson scarf ribbons using smooth cubic Bezier curves
       * driven by the scarf bone chain so they match image(1).svg in Reference Pose
       * and billow smoothly during movement.
       */
      drawScarfRibbons(ctx) {
        const w = this.windPhase;
        const isPose = this.state === 'pose';
        const amp = isPose ? 2.5 * this.windForce : 14 * this.windForce;
        const lift = this.currentAngles.scarfWave * 45;

        const w1 = Math.sin(w) * amp + lift * 0.4;
        const w2 = Math.sin(w - 1.1) * amp * 1.3 + lift * 0.8;
        const w3 = Math.sin(w - 2.1) * amp * 1.6 + lift * 1.2;

        ctx.save();
        // Collar knot origin
        ctx.translate(-12, -52);

        // 1. UPPER SHORTER ARCHING SCARF RIBBON (Exact curve from image(1).svg)
        ctx.beginPath();
        ctx.moveTo(10, -4);
        ctx.bezierCurveTo(48, -22 + w1 * 0.5, 92, -18 + w1, 118, 15 + w2);
        ctx.lineTo(106, 29 + w2);
        ctx.bezierCurveTo(84, -5 + w1, 44, -12 + w1 * 0.5, 10, 2);
        ctx.closePath();
        ctx.fillStyle = KAGE_PALETTE.crimsonMid;
        ctx.fill();

        // Subtle dark underside fold on upper scarf
        ctx.beginPath();
        ctx.moveTo(10, -1);
        ctx.bezierCurveTo(46, -15 + w1 * 0.5, 86, -8 + w1, 106, 29 + w2);
        ctx.lineTo(102, 23 + w2);
        ctx.bezierCurveTo(80, -4 + w1, 44, -10 + w1 * 0.5, 10, 2);
        ctx.closePath();
        ctx.fillStyle = KAGE_PALETTE.crimsonDark;
        ctx.fill();

        // 2. LOWER LONG S-CURVE SCARF RIBBON (Exact sweeping S-curve from image(1).svg)
        // Dark crimson underside shadow fold
        ctx.beginPath();
        ctx.moveTo(6, -1);
        ctx.bezierCurveTo(44, 6 + w1 * 0.4, 68, 46 + w2, 96, 62 + w2);
        ctx.bezierCurveTo(126, 78 + w2, 156, 42 + w3, 184, 54 + w3);
        ctx.bezierCurveTo(156, 30 + w3, 128, 56 + w2, 98, 44 + w2);
        ctx.bezierCurveTo(68, 32 + w1, 42, -2 + w1 * 0.4, 6, -4);
        ctx.closePath();
        ctx.fillStyle = KAGE_PALETTE.crimsonDark;
        ctx.fill();

        // Main crimson body of lower scarf ribbon
        ctx.beginPath();
        ctx.moveTo(-14, 2);
        ctx.bezierCurveTo(18, -6 + w1 * 0.3, 52, 4 + w1, 78, 38 + w2);
        ctx.bezierCurveTo(104, 72 + w2, 144, 34 + w3, 184, 54 + w3);
        ctx.bezierCurveTo(168, 28 + w3, 140, 22 + w3, 114, 40 + w2);
        ctx.bezierCurveTo(88, 58 + w2, 62, 12 + w1, 22, -6 + w1 * 0.3);
        ctx.closePath();
        ctx.fillStyle = KAGE_PALETTE.crimsonMid;
        ctx.fill();

        // Brighter crimson top highlight ridge along the scarf S-curve
        if (this.showRimLight) {
          ctx.beginPath();
          ctx.moveTo(110, 42 + w2);
          ctx.bezierCurveTo(136, 22 + w3, 164, 24 + w3, 184, 54 + w3);
          ctx.bezierCurveTo(162, 34 + w3, 136, 30 + w3, 114, 44 + w2);
          ctx.closePath();
          ctx.fillStyle = KAGE_PALETTE.crimsonBright;
          ctx.fill();
        }

        ctx.restore();
      }

      /**
       * Renders Kage's complete hierarchical rig onto the provided 2D canvas context.
       */
      render(ctx, centerX, groundY) {
        ctx.save();

        // Apply subtle camera impact shake during Slash
        const shakeX = this.cameraShake > 0 ? (Math.random() - 0.5) * this.cameraShake : 0;
        const shakeY = this.cameraShake > 0 ? (Math.random() - 0.5) * this.cameraShake : 0;

        ctx.translate(centerX + shakeX, groundY + shakeY);
        ctx.scale(
          this.characterScale * (this.flipX ? -1 : 1),
          this.characterScale
        );

        // Ground contact shadow ellipse
        ctx.save();
        ctx.fillStyle = 'rgba(7, 4, 5, 0.72)';
        ctx.beginPath();
        ctx.ellipse(this.bones.pelvis.x - 5, 4, 92, 10, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Elevate Pelvis Root to anatomical hip height (-122px above ground)
        const hipBaseY = -122;

        // =====================================================================
        // ROOT PELVIS TRANSFORM
        // =====================================================================
        ctx.save();
        ctx.translate(this.bones.pelvis.x, hipBaseY + this.bones.pelvis.y);
        ctx.rotate(this.bones.pelvis.rotation);

        // ---------------------------------------------------------------------
        // LAYER 1: BACK LEG (Right side on screen)
        // ---------------------------------------------------------------------
        ctx.save();
        ctx.translate(this.bones.backThigh.x, this.bones.backThigh.y);
        ctx.rotate(this.bones.backThigh.rotation);
        ctx.fillStyle = KAGE_PALETTE.shadowCore;
        ctx.fill(KAGE_SVG_PATHS.backThighBase);

        // Back Calf (Pivot at Back Knee)
        ctx.translate(this.bones.backCalf.x, this.bones.backCalf.y);
        ctx.rotate(this.bones.backCalf.rotation);
        ctx.fillStyle = KAGE_PALETTE.shadowCore;
        ctx.fill(KAGE_SVG_PATHS.backCalfBase);
        if (this.showRimLight) {
          ctx.fillStyle = KAGE_PALETTE.warmRim;
          ctx.fill(KAGE_SVG_PATHS.backCalfWarmRim);
        }

        // Back Foot (Pivot at Back Ankle)
        ctx.translate(this.bones.backFoot.x, this.bones.backFoot.y);
        ctx.rotate(this.bones.backFoot.rotation);
        ctx.fillStyle = KAGE_PALETTE.shadowCore;
        ctx.fill(KAGE_SVG_PATHS.backFootBase);
        if (this.showRimLight) {
          ctx.fillStyle = KAGE_PALETTE.warmRim;
          ctx.fill(KAGE_SVG_PATHS.backFootWarmRim);
        }
        ctx.restore();

        // ---------------------------------------------------------------------
        // LAYER 2: SWEEPING BACK COAT TAIL + ORNATE CRIMSON CLOUD FILIGREE
        // ---------------------------------------------------------------------
        ctx.save();
        ctx.translate(this.bones.backCoatTail.x, this.bones.backCoatTail.y);
        ctx.rotate(this.bones.backCoatTail.rotation);

        // Base dark coat silhouette
        ctx.fillStyle = KAGE_PALETTE.shadowCloth;
        ctx.fill(KAGE_SVG_PATHS.backCoatBase);

        // Clip ornate crimson cloud/swirl filigree strictly inside the coat polygon
        if (this.showFiligree) {
          ctx.save();
          ctx.clip(KAGE_SVG_PATHS.backCoatBase);
          ctx.fillStyle = KAGE_PALETTE.crimsonMid;
          ctx.fill(KAGE_SVG_PATHS.backCoatCrimsonHem);
          ctx.restore();
        }

        // Warm outer rim edge on the coat hem
        if (this.showRimLight) {
          ctx.strokeStyle = KAGE_PALETTE.warmRim;
          ctx.lineWidth = 1.6;
          ctx.stroke(KAGE_SVG_PATHS.backCoatRim);
        }
        ctx.restore();

        // ---------------------------------------------------------------------
        // LAYER 3: FRONT LEG (Left side on screen) + INNER COAT DRAPE
        // ---------------------------------------------------------------------
        ctx.save();
        ctx.translate(this.bones.frontThigh.x, this.bones.frontThigh.y);
        ctx.rotate(this.bones.frontThigh.rotation);

        // Upper Thigh Silhouette & Crimson Rim
        ctx.fillStyle = KAGE_PALETTE.shadowCore;
        ctx.fill(KAGE_SVG_PATHS.frontThighBase);
        if (this.showRimLight) {
          ctx.fillStyle = KAGE_PALETTE.crimsonBright;
          ctx.fill(KAGE_SVG_PATHS.frontThighCrimsonRim);
        }

        // Front Knee Pivot -> Calf & Inner Coat Drape
        ctx.translate(this.bones.frontCalf.x, this.bones.frontCalf.y);
        ctx.rotate(this.bones.frontCalf.rotation);

        // Dangling inner coat panel behind the front knee
        ctx.fillStyle = KAGE_PALETTE.shadowCloth;
        ctx.fill(KAGE_SVG_PATHS.frontCalfDrape);
        if (this.showRimLight) {
          ctx.fillStyle = KAGE_PALETTE.warmRim;
          ctx.fill(KAGE_SVG_PATHS.frontCalfDrapeRim);
        }

        // Restored Full Dark Shin Silhouette (if enabled)
        if (this.restoreMissingParts) {
          ctx.fillStyle = KAGE_PALETTE.shadowCore;
          ctx.fill(KAGE_SVG_PATHS.frontCalfBase);
        }
        // Preserved Crimson Lightning Rim Edge down the left shin
        if (this.showRimLight) {
          ctx.fillStyle = KAGE_PALETTE.crimsonBright;
          ctx.fill(KAGE_SVG_PATHS.frontCalfCrimsonRim);
        }

        // Front Ankle Pivot -> Shinobi Boot
        ctx.translate(this.bones.frontFoot.x, this.bones.frontFoot.y);
        ctx.rotate(this.bones.frontFoot.rotation);
        if (this.restoreMissingParts) {
          ctx.fillStyle = KAGE_PALETTE.shadowCore;
          ctx.fill(KAGE_SVG_PATHS.frontFootBase);
        }
        if (this.showRimLight) {
          ctx.fillStyle = KAGE_PALETTE.crimsonBright;
          ctx.fill(KAGE_SVG_PATHS.frontFootCrimsonRim);
        }
        ctx.restore();

        // ---------------------------------------------------------------------
        // LAYER 4: FRONT COAT FLAP & WAIST BELT SASH
        // ---------------------------------------------------------------------
        ctx.save();
        ctx.translate(this.bones.frontCoatFlap.x, this.bones.frontCoatFlap.y);
        ctx.rotate(this.bones.frontCoatFlap.rotation);
        ctx.fillStyle = KAGE_PALETTE.shadowCloth;
        ctx.fill(KAGE_SVG_PATHS.frontCoatFlapBase);
        if (this.showRimLight) {
          ctx.fillStyle = KAGE_PALETTE.crimsonBright;
          ctx.fill(KAGE_SVG_PATHS.frontCoatFlapCrimson);
        }
        ctx.restore();

        // Belt Sash & Hanging Knot Ties
        ctx.save();
        ctx.fillStyle = KAGE_PALETTE.crimsonDark;
        ctx.fill(KAGE_SVG_PATHS.beltBand);
        ctx.translate(this.bones.beltSash.x, this.bones.beltSash.y);
        ctx.rotate(this.bones.beltSash.rotation);
        ctx.fillStyle = KAGE_PALETTE.shadowCore;
        ctx.fill(KAGE_SVG_PATHS.beltTieFront);
        ctx.restore();

        // ---------------------------------------------------------------------
        // LAYER 5: TORSO, BACK ARM, FLOWING SCARF, HEAD, FRONT ARM & KATANA
        // ---------------------------------------------------------------------
        ctx.save();
        ctx.translate(this.bones.torso.x, this.bones.torso.y);
        ctx.rotate(this.bones.torso.rotation);

        // 5A. Back Arm (Behind Torso & Head)
        ctx.save();
        ctx.translate(this.bones.backUpperArm.x, this.bones.backUpperArm.y);
        ctx.rotate(this.bones.backUpperArm.rotation);
        if (this.restoreMissingParts) {
          ctx.fillStyle = KAGE_PALETTE.shadowCore;
          ctx.fill(KAGE_SVG_PATHS.backUpperArmBase);
        }
        ctx.translate(this.bones.backForearm.x, this.bones.backForearm.y);
        ctx.rotate(this.bones.backForearm.rotation);
        if (this.restoreMissingParts) {
          ctx.fillStyle = KAGE_PALETTE.shadowCore;
          ctx.fill(KAGE_SVG_PATHS.backForearmBase);
        }
        if (this.showRimLight) {
          ctx.fillStyle = KAGE_PALETTE.crimsonMid;
          ctx.fill(KAGE_SVG_PATHS.backForearmCrimsonRim);
        }
        ctx.restore();

        // 5B. Torso Jacket & Seams
        ctx.fillStyle = KAGE_PALETTE.shadowCore;
        ctx.fill(KAGE_SVG_PATHS.torsoBase);
        if (this.showRimLight) {
          ctx.fillStyle = KAGE_PALETTE.crimsonMid;
          ctx.fill(KAGE_SVG_PATHS.torsoSeams);
        }

        // 5C. Twin Flowing Crimson Scarf Ribbons
        this.drawScarfRibbons(ctx);

        // 5D. Head & 9 Swept-Back Anime Hair Spikes (Pivot at Neck)
        ctx.save();
        ctx.translate(this.bones.head.x, this.bones.head.y);
        ctx.rotate(this.bones.head.rotation);
        ctx.fillStyle = KAGE_PALETTE.shadowCore;
        ctx.fill(KAGE_SVG_PATHS.headBase);
        if (this.showRimLight) {
          ctx.fillStyle = KAGE_PALETTE.crimsonBright;
          ctx.fill(KAGE_SVG_PATHS.headCrimsonRim);
          ctx.fillStyle = KAGE_PALETTE.crimsonDark;
          ctx.fill(KAGE_SVG_PATHS.headStrandDetail);
        }
        ctx.restore();

        // 5E. Front Arm & Katana (Pivot at Front Shoulder -> Elbow -> Wrist)
        ctx.save();
        ctx.translate(this.bones.frontUpperArm.x, this.bones.frontUpperArm.y);
        ctx.rotate(this.bones.frontUpperArm.rotation);
        if (this.restoreMissingParts) {
          ctx.fillStyle = KAGE_PALETTE.shadowCore;
          ctx.fill(KAGE_SVG_PATHS.frontUpperArmBase);
        }
        if (this.showRimLight) {
          ctx.fillStyle = KAGE_PALETTE.crimsonBright;
          ctx.fill(KAGE_SVG_PATHS.frontUpperArmCrimsonRim);
        }

        // Front Elbow Pivot -> Forearm
        ctx.translate(this.bones.frontForearm.x, this.bones.frontForearm.y);
        ctx.rotate(this.bones.frontForearm.rotation);
        if (this.restoreMissingParts) {
          ctx.fillStyle = KAGE_PALETTE.shadowCore;
          ctx.fill(KAGE_SVG_PATHS.frontForearmBase);
        }
        if (this.showRimLight) {
          ctx.fillStyle = KAGE_PALETTE.crimsonBright;
          ctx.fill(KAGE_SVG_PATHS.frontForearmCrimsonRim);
        }

        // Wrist Pivot -> Gauntlet Hands & Katana
        ctx.translate(this.bones.katanaHand.x, this.bones.katanaHand.y);
        ctx.rotate(this.bones.katanaHand.rotation);

        // Katana Blade (Full Restored Blade vs Raw Clipped Stub)
        if (this.restoreMissingParts) {
          ctx.fillStyle = KAGE_PALETTE.bladeCore;
          ctx.fill(KAGE_SVG_PATHS.katanaBladeFull);
          ctx.fillStyle = KAGE_PALETTE.bladeSteel;
          ctx.fill(KAGE_SVG_PATHS.katanaBladeEdge);
          if (this.showRimLight) {
            ctx.fillStyle = KAGE_PALETTE.crimsonBright;
            ctx.fill(KAGE_SVG_PATHS.katanaCrimsonGroove);
          }
        } else {
          ctx.fillStyle = KAGE_PALETTE.bladeCore;
          ctx.fill(KAGE_SVG_PATHS.katanaBladeStub);
          ctx.fillStyle = KAGE_PALETTE.bladeSteel;
          ctx.fill(KAGE_SVG_PATHS.katanaBladeStubEdge);
          if (this.showRimLight) {
            ctx.fillStyle = KAGE_PALETTE.crimsonBright;
            ctx.fill(KAGE_SVG_PATHS.katanaCrimsonGroove);
          }
        }

        // Hilt, Tsuba Guard & Hands
        ctx.fillStyle = KAGE_PALETTE.shadowCore;
        ctx.fill(KAGE_SVG_PATHS.katanaHiltAndTsuba);
        if (this.showRimLight) {
          ctx.fillStyle = KAGE_PALETTE.hiltGold;
          ctx.fill(KAGE_SVG_PATHS.katanaTsubaRim);
        }
        ctx.fillStyle = KAGE_PALETTE.shadowCore;
        ctx.fill(KAGE_SVG_PATHS.gauntletHands);

        ctx.restore(); // End Front Arm & Katana
        ctx.restore(); // End Torso
        ctx.restore(); // End Root Pelvis

        // =====================================================================
        // LAYER 6: SLASH CRESCENT ARC VFX (When in Slash State)
        // =====================================================================
        for (const fx of this.slashEffects) {
          const p = fx.age / fx.maxAge;
          const alpha = Math.max(0, 1 - p);
          ctx.save();
          ctx.translate(-35, -135);
          ctx.rotate(-0.35);

          // Outer crimson crescent energy wave
          ctx.beginPath();
          ctx.arc(0, 0, 165 + p * 25, -Math.PI * 0.78, Math.PI * 0.42, false);
          ctx.arc(0, 0, 115 + p * 45, Math.PI * 0.38, -Math.PI * 0.72, true);
          ctx.closePath();
          ctx.fillStyle = `rgba(215, 38, 38, ${alpha * 0.65})`;
          ctx.fill();

          // Inner razor white-gold flash
          ctx.beginPath();
          ctx.arc(0, 0, 160 + p * 25, -Math.PI * 0.68, Math.PI * 0.35, false);
          ctx.arc(0, 0, 142 + p * 32, Math.PI * 0.32, -Math.PI * 0.64, true);
          ctx.closePath();
          ctx.fillStyle = `rgba(255, 240, 225, ${alpha * 0.92})`;
          ctx.fill();
          ctx.restore();
        }

        // =====================================================================
        // LAYER 7: SKELETAL RIG & (0,0) JOINT PIVOT OVERLAY (Debug Mode)
        // =====================================================================
        if (this.showBones) {
          this.renderBoneOverlay(ctx, hipBaseY);
        }

        ctx.restore();
      }

      /**
       * Renders Spine2D-style directional bone teardrops and (0,0) joint pivot crosshairs.
       */
      renderBoneOverlay(ctx, hipBaseY) {
        const drawSingleBone = (bone, boneAngleOffset = 0, color = '#f87171') => {
          ctx.save();
          // Draw directional bone teardrop along the bone's axis
          ctx.save();
          ctx.rotate(boneAngleOffset);
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(bone.length * 0.18, -4.5);
          ctx.lineTo(bone.length, 0);
          ctx.lineTo(bone.length * 0.18, 4.5);
          ctx.closePath();
          ctx.fillStyle = 'rgba(239, 68, 68, 0.28)';
          ctx.fill();
          ctx.strokeStyle = color;
          ctx.lineWidth = 1.2;
          ctx.stroke();
          ctx.restore();

          // Draw (0,0) Joint Pivot Target Ring + Crosshair
          ctx.beginPath();
          ctx.arc(0, 0, 5.5, 0, Math.PI * 2);
          ctx.fillStyle = '#090607';
          ctx.fill();
          ctx.strokeStyle = '#fbbf24';
          ctx.lineWidth = 1.5;
          ctx.stroke();

          ctx.beginPath();
          ctx.arc(0, 0, 2, 0, Math.PI * 2);
          ctx.fillStyle = '#ef4444';
          ctx.fill();
          ctx.restore();
        };

        ctx.save();
        ctx.translate(this.bones.pelvis.x, hipBaseY + this.bones.pelvis.y);
        ctx.rotate(this.bones.pelvis.rotation);
        drawSingleBone(this.bones.pelvis, -Math.PI / 2, '#fbbf24');

        // Back Leg Bones
        ctx.save();
        ctx.translate(this.bones.backThigh.x, this.bones.backThigh.y);
        ctx.rotate(this.bones.backThigh.rotation);
        drawSingleBone(this.bones.backThigh, 1.05);
        ctx.translate(this.bones.backCalf.x, this.bones.backCalf.y);
        ctx.rotate(this.bones.backCalf.rotation);
        drawSingleBone(this.bones.backCalf, 1.10);
        ctx.translate(this.bones.backFoot.x, this.bones.backFoot.y);
        ctx.rotate(this.bones.backFoot.rotation);
        drawSingleBone(this.bones.backFoot, 0.9);
        ctx.restore();

        // Front Leg Bones
        ctx.save();
        ctx.translate(this.bones.frontThigh.x, this.bones.frontThigh.y);
        ctx.rotate(this.bones.frontThigh.rotation);
        drawSingleBone(this.bones.frontThigh, 2.15);
        ctx.translate(this.bones.frontCalf.x, this.bones.frontCalf.y);
        ctx.rotate(this.bones.frontCalf.rotation);
        drawSingleBone(this.bones.frontCalf, 1.92);
        ctx.translate(this.bones.frontFoot.x, this.bones.frontFoot.y);
        ctx.rotate(this.bones.frontFoot.rotation);
        drawSingleBone(this.bones.frontFoot, 2.45);
        ctx.restore();

        // Coat Bone
        ctx.save();
        ctx.translate(this.bones.backCoatTail.x, this.bones.backCoatTail.y);
        ctx.rotate(this.bones.backCoatTail.rotation);
        drawSingleBone(this.bones.backCoatTail, 0.52, '#fb923c');
        ctx.restore();

        // Torso & Upper Hierarchy
        ctx.save();
        ctx.translate(this.bones.torso.x, this.bones.torso.y);
        ctx.rotate(this.bones.torso.rotation);
        drawSingleBone(this.bones.torso, -1.64);

        // Head Bone
        ctx.save();
        ctx.translate(this.bones.head.x, this.bones.head.y);
        ctx.rotate(this.bones.head.rotation);
        drawSingleBone(this.bones.head, -0.75);
        ctx.restore();

        // Scarf Chain Bones
        ctx.save();
        ctx.translate(this.bones.scarfLower1.x, this.bones.scarfLower1.y);
        ctx.rotate(this.bones.scarfLower1.rotation);
        drawSingleBone(this.bones.scarfLower1, 0, '#f43f5e');
        ctx.translate(this.bones.scarfLower2.x, this.bones.scarfLower2.y);
        ctx.rotate(this.bones.scarfLower2.rotation);
        drawSingleBone(this.bones.scarfLower2, 0, '#f43f5e');
        ctx.translate(this.bones.scarfLower3.x, this.bones.scarfLower3.y);
        ctx.rotate(this.bones.scarfLower3.rotation);
        drawSingleBone(this.bones.scarfLower3, 0, '#f43f5e');
        ctx.restore();

        // Front Arm & Katana Bones
        ctx.save();
        ctx.translate(this.bones.frontUpperArm.x, this.bones.frontUpperArm.y);
        ctx.rotate(this.bones.frontUpperArm.rotation);
        drawSingleBone(this.bones.frontUpperArm, 2.68);
        ctx.translate(this.bones.frontForearm.x, this.bones.frontForearm.y);
        ctx.rotate(this.bones.frontForearm.rotation);
        drawSingleBone(this.bones.frontForearm, -2.08);
        ctx.translate(this.bones.katanaHand.x, this.bones.katanaHand.y);
        ctx.rotate(this.bones.katanaHand.rotation);
        drawSingleBone(this.bones.katanaHand, -0.78, '#38bdf8');
        ctx.restore();

        ctx.restore(); // End Torso
        ctx.restore(); // End Pelvis
      }
    }
