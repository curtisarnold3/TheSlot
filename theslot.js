// theslot.js — shared data, storage, and challenge engine for The Slot.
// Loaded by index.html (the map) and game.html (the roller) BEFORE their inline
// scripts. Classic script: top-level const/let are shared globals across pages.
// Rendering lives in each page; this file is data + storage + the engine only.

// Coerces rather than assuming a string: esc() runs during init(), so one bad
// data type would take down the whole page instead of one card (D-013). Escapes
// double quotes too — rung labels and aria strings are interpolated into SVG
// attributes, where an unescaped quote would break the markup.
function esc(s){return (s==null?"":String(s))
  .replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/"/g,"&quot;");}

const FAMS = [
  {id:"foundation",name:"Foundations",n:"00",desc:"Not moves — the physics the moves ride on. If these leak, nothing above them holds. You rebuild these every single day."},
  {id:"push",name:"The Push family",n:"01",desc:"The follower is led toward you and sent back to the same spot. Deceptively hard: it needs a connection both toward and away. Every push variation is this shape with a knob turned."},
  {id:"pass",name:"The Pass & Tuck family",n:"02",desc:"Passes send the follower down the slot past you. Add a tuck, a roll, a spin, or flip the direction and the whole family opens — including the tuck's mirror twin, the cinnamon roll."},
  {id:"whip",name:"The Whip family",n:"03",desc:"An eight-count pattern: led past, then redirected back. The deepest, branchiest trunk in the dance — most of the fancy stuff you admire is a whip with knobs turned."},
  {id:"turn",name:"Turns & spins",n:"04",desc:"Not a family so much as the levers themselves, standing alone. Own these cleanly and you can bolt them onto almost anything above."},
  {id:"footwork",name:"Anchor & footwork",n:"05",desc:"Here's the secret straight from the pros: a true anchor isn't a foot position — it's the settle-back connection from Foundations. So any footwork that keeps that stretch can BE your anchor. That makes this the richest playground in the dance, and the single fastest thing a beginner can drill alone at home. Same settle, endless feet."}
];

// lever -> {glyph, cssvar}
const LV = {
  "hand change":{g:"⇄",c:"var(--lv-hand)"},
  "add a turn":{g:"↻",c:"var(--lv-turn)"},
  "reverse it":{g:"↺",c:"var(--lv-rev)"},
  "new entry":{g:"⤵",c:"var(--lv-entry)"},
  "new exit":{g:"⤴",c:"var(--lv-exit)"}
};

const MOVES = [
  // foundations
  {id:"f-time",fam:"foundation",name:"Timing",count:"1 2 3&4 5&6",diff:1,q:"west coast swing timing finding the beat",blurb:"Land every weight change exactly on the beat. The judge's first filter, and the thing you rebuild every day."},
  {id:"f-slot",fam:"foundation",name:"The Slot",diff:1,q:"west coast swing slot explained",blurb:"Your invisible lane. The follower travels it; the leader stays mostly to the side and sends her along it."},
  {id:"f-starter",fam:"foundation",name:"Starter Step",count:"1&2 3&4",diff:1,q:"west coast swing starter step",blurb:"How the dance begins from closed position — the on-ramp onto the slot before your first real pattern."},
  {id:"f-anchor",fam:"foundation",name:"The Anchor",count:"5&6",diff:1,q:"west coast swing anchor step technique",blurb:"Settle back and stretch at the end of every pattern — the elastic 'boing' that makes it West Coast Swing and not a walk. It's a connection, not a foot position — which is why there's a whole footwork family built on it below."},
  {id:"f-roll",fam:"foundation",name:"Rolling feet",diff:2,q:"west coast swing footwork rolling through feet",blurb:"Roll ball-to-heel like a wheel instead of stamping. Small steps. This is the smoothness everyone's chasing."},
  {id:"f-conn",fam:"foundation",name:"Connection",diff:2,q:"west coast swing connection leverage compression",blurb:"Leverage (away) and compression (toward) through a firm-but-soft frame, driven by your body — never a yanking arm."},

  // push
  {id:"p-sugar",fam:"push",name:"Sugar Push",aka:"Push Break, six-count basic",count:"1 2 3&4 5&6",diff:1,video:"https://www.youtube.com/watch?v=4zV_TJ7PZyg",blurb:"Follower led toward you and returned to the same spot. Needs both a toward and an away connection — the hardest easy move in the dance."},
  {id:"p-roll",fam:"push",name:"Push w/ Inside Roll",diff:2,builds:"Sugar Push",lever:"new exit",q:"west coast swing sugar push inside roll",blurb:"Trade the plain return for an inside rolling turn. Same push, new way out."},
  {id:"p-tuck",fam:"push",name:"Sugar Tuck",count:"1 2 3&4 5&6",diff:2,builds:"Sugar Push",lever:"add a turn",video:"https://www.youtube.com/watch?v=o10RKoM-1cE",blurb:"A push with a tuck on 4 — the follower turns away, then back under your arm to face you again."},
  {id:"p-yoyo",fam:"push",name:"Yo-Yo",diff:3,builds:"Sugar Push",lever:"new exit",q:"west coast swing yoyo push variation",blurb:"Send-and-return without a full release, so she springs back out like a yo-yo. A playful push exit."},
  {id:"p-hc",fam:"push",name:"Goofy-Hand Push",aka:"hand-change push",diff:3,builds:"Sugar Push",lever:"hand change",q:"west coast swing goofy hand push variation",blurb:"Switch to a same-side or 'wrong' hand mid-push. This one knob opens a whole new set of exits."},
  {id:"p-sun",fam:"push",name:"Sunburst Push",diff:3,builds:"Sugar Push",lever:"new exit",q:"west coast swing sunburst push",blurb:"A push dressed up with an opening-and-closing 'sunburst' shape and styling on the send-back."},
  {id:"p-tuckin",fam:"push",name:"Sugar Tuck w/ Inside Turn",diff:3,builds:"Sugar Tuck",lever:"add a turn",q:"west coast swing sugar tuck inside turn",blurb:"Add a rotation as she comes out of the tuck. Your sugar tuck, now with a spin on the exit."},
  {id:"p-tuckclosed",fam:"push",name:"Tuck from Closed Position",diff:3,builds:"Sugar Tuck",lever:"new entry",q:"west coast swing tuck from closed position",blurb:"Enter the same tuck from a closed hold instead of an open one. New doorway into a move you already own."},

  // pass
  {id:"pa-lsp",fam:"pass",name:"Left Side Pass",count:"1 2 3&4 5&6",diff:1,video:"https://www.youtube.com/watch?v=4zV_TJ7PZyg",blurb:"Send the follower down the slot past your left side. The cleanest travelling basic there is."},
  {id:"pa-rsp",fam:"pass",name:"Right Side Pass",aka:"Underarm Turn",count:"1 2 3&4 5&6",diff:1,video:"https://www.youtube.com/watch?v=4zV_TJ7PZyg",blurb:"Follower passes on your right, usually turning under your raised arm. Your everyday underarm turn."},
  {id:"pa-lspin",fam:"pass",name:"Left Side Pass w/ Inside Turn",aka:"inside roll",diff:2,builds:"Left Side Pass",lever:"add a turn",q:"west coast swing left side pass inside turn",blurb:"A left side pass with an inside turn folded in as she travels — a lot of scenes call this an inside roll. Probably the first variation you'll ever lead."},
  {id:"pa-turning",fam:"pass",name:"Turning Side Pass",diff:2,builds:"Left Side Pass",lever:"add a turn",q:"west coast swing turning side pass",blurb:"You rotate with her instead of staying put. Opens up direction changes and closed-position exits."},
  {id:"pa-tuck",fam:"pass",name:"Tuck Turn",count:"1 2 3&4 5&6",diff:2,builds:"Right Side Pass",lever:"add a turn",video:"https://www.youtube.com/playlist?list=PLeZ__vwnEDu9yNXLF-aX0hm-5U9CtKcfA",blurb:"Tuck the follower toward you, reverse, then send her under the arm to turn. A cornerstone you'll reuse forever."},
  {id:"pa-hc",fam:"pass",name:"Underarm w/ Hand Change",diff:2,builds:"Right Side Pass",lever:"hand change",q:"west coast swing underarm turn hand change",blurb:"Same pass, switch hands as she goes by (ending, say, right-to-right). Sets up a stack of new exits."},
  {id:"pa-pullby",fam:"pass",name:"Pull-By",diff:2,builds:"Underarm w/ Hand Change",lever:"new exit",q:"west coast swing pull by",blurb:"From a right-to-right hold, she's pulled straight past — no turn. The plainest exit off the hand change."},
  {id:"pa-rspout",fam:"pass",name:"Right Side Pass w/ Outside Turn",diff:3,builds:"Right Side Pass",lever:"add a turn",q:"west coast swing right side pass outside turn",blurb:"Flip her rotation to the outside as she passes. The mirror of the inside-turn pass."},
  {id:"pa-2hand",fam:"pass",name:"Two-Hand Tuck",diff:3,builds:"Tuck Turn",lever:"new entry",q:"west coast swing two hand tuck",blurb:"The tuck led with both hands — more control, and the launchpad for wraps and hammerlocks."},
  {id:"pa-cinn",fam:"pass",name:"Cinnamon Roll",aka:"reverse tuck",diff:3,builds:"Tuck Turn",lever:"reverse it",q:"west coast swing cinnamon roll reverse tuck",blurb:"The tuck's mirror twin — the turn spirals the opposite way, wrapping and unwrapping the arms. Same move, flipped."},
  {id:"pa-spin",fam:"pass",name:"Spinning Side Pass",diff:3,builds:"Left Side Pass",lever:"add a turn",q:"west coast swing spinning side pass",blurb:"Add a free-spinning turn as the follower travels past. Your first taste of continuous rotation."},
  {id:"pa-hammer",fam:"pass",name:"Hammerlock",diff:4,builds:"Two-Hand Tuck",lever:"new exit",q:"west coast swing hammerlock",blurb:"Exit the two-hand tuck into a wrapped hammerlock shape, then unwind. Where wraps start."},
  {id:"pa-double",fam:"pass",name:"Tuck w/ Double Underarm",diff:4,builds:"Tuck Turn",lever:"add a turn",q:"west coast swing tuck double underarm turn",blurb:"Two rotations out of the tuck instead of one. Now it's about clean prep and spotting."},
  {id:"pa-mult",fam:"pass",name:"Multiple-Turn Pass",diff:4,builds:"Right Side Pass",lever:"add a turn",q:"west coast swing multiple turn side pass",blurb:"Two or more rotations down the slot. Prep, spotting, and clean momentum — not force."},

  // whip
  {id:"w-basic",fam:"whip",name:"Whip",aka:"basic 8-count",count:"1 2 3&4 5 6 7&8",diff:2,video:"https://www.youtube.com/watch?v=5vVeFs6q9os",blurb:"Led past, then redirected back to the end of the slot over 8 counts. The root of the deepest branch in the dance."},
  {id:"w-basket",fam:"whip",name:"Basket Whip",aka:"sweetheart / lock / walkaround / cradle",diff:3,builds:"Whip",lever:"new exit",video:"https://www.youtube.com/playlist?list=PLeZ__vwnEDu8Lf_OAAuIhOHP5jK1UFBPF",blurb:"Both hands 'basket' the follower into a wrap, then release. One entry — and a fistful of different exit hands (and names, like the cradle) hang off it."},
  {id:"w-basket-pullby",fam:"whip",name:"Basket → Pull-By Exit",aka:"pull-through whip",diff:4,builds:"Basket Whip",lever:"new exit",q:"west coast swing basket whip pull by exit",blurb:"Same basket, released straight down the slot — a lot of folks call this the pull-through. Exit #1 of several off the basket."},
  {id:"w-basket-walk",fam:"whip",name:"Basket → Walkaround Exit",diff:4,builds:"Basket Whip",lever:"new exit",q:"west coast swing basket whip walk around exit",blurb:"Same basket, but you walk around each other before the release. Exit #2 — one move, many endings."},
  {id:"w-jhook",fam:"whip",name:"J-Hook Whip",aka:"inside whip",diff:3,builds:"Whip",lever:"add a turn",q:"west coast swing j hook whip",blurb:"The whip where the follower's inside turn hooks her path into a J. Some scenes call this an inside whip — in Colorado it's the J-hook, and it's a launchpad for several endings."},
  {id:"w-jhook-spin",fam:"whip",name:"J-Hook → Free-Spin Exit",diff:4,builds:"J-Hook Whip",lever:"add a turn",q:"west coast swing j hook whip free spin",blurb:"Release the J into a free spin. One way to do a J-hook — layer a rotation on the way out."},
  {id:"w-jhook-hc",fam:"whip",name:"J-Hook → Hand-Change Exit",diff:4,builds:"J-Hook Whip",lever:"hand change",q:"west coast swing j hook whip hand change",blurb:"Swap hands out of the hook for a different shape. Another way to do 'the same' J-hook whip."},
  {id:"w-tommy",fam:"whip",name:"Texas Tommy",aka:"Apache",diff:4,builds:"Whip",lever:"hand change",q:"west coast swing texas tommy whip",blurb:"A crossed-hand whip that wraps behind the back and unwinds. A classic that drills clean hand-offs."},
  {id:"w-bbhc",fam:"whip",name:"Behind-the-Back Hand Change",aka:"BBHC",diff:4,builds:"Whip",lever:"hand change",q:"west coast swing behind the back hand change whip",blurb:"Pass the hand behind your own back mid-whip. A signature switch that itself sets up a stack of variations."},
  {id:"w-decap",fam:"whip",name:"Decap Whip",aka:"decapitator, decapitive whip",diff:4,builds:"Whip",lever:"hand change",video:"https://www.youtube.com/watch?v=u3OfTtISSvk",blurb:"The joined hands sweep up and over the follower's head through the whip — hence the name 'decapitator.' Handy for cutoffs and side changes, and one of the classic set of core whips."},
  {id:"w-reverse",fam:"whip",name:"Reverse Whip",aka:"outside whip, whip w/ outside turn",diff:3,builds:"Whip",lever:"reverse it",video:"https://www.youtube.com/watch?v=2Zvz7e_MXXo",blurb:"The whip run the other direction, turning the follower outside. Depending on the room it's an outside whip or a whip with an outside turn — here it's the reverse whip. Several holds: normal, handshake, reverse."},
  {id:"w-reverse-hs",fam:"whip",name:"Reverse Whip → Handshake Hold",diff:4,builds:"Reverse Whip",lever:"hand change",video:"https://www.youtube.com/watch?v=2Zvz7e_MXXo",blurb:"The reverse whip entered from a handshake (or reverse) hold. Same shape, different connection in your hands."},
  {id:"w-freespin",fam:"whip",name:"Whip w/ Free Spin",diff:4,builds:"Whip",lever:"add a turn",video:"https://www.youtube.com/watch?v=HgASX23pVDE",blurb:"Release into an unassisted spin out of the whip. Now the follower's balance and your prep do all the work."},
  {id:"w-hustle",fam:"whip",name:"Hustle Whip",diff:4,builds:"Whip",lever:"new entry",q:"west coast swing hustle whip",blurb:"A whip that borrows hustle's compact, quick redirect. New way in for a familiar 8-count."},

  // turns
  {id:"t-prep",fam:"turn",name:"Spin Prep & Spotting",diff:2,video:"https://www.youtube.com/watch?v=RMq9VK5qGOQ",blurb:"The enabling skill under every turn: a clean prep, a spotted head, a balanced axis. Learn this before adding spins anywhere."},
  {id:"t-inside",fam:"turn",name:"Inside Turn",diff:2,builds:"Spin Prep & Spotting",lever:"add a turn",q:"west coast swing inside turn technique",blurb:"Follower turns toward your center. The rotation you'll bolt onto passes, pushes, and whips most often."},
  {id:"t-outside",fam:"turn",name:"Outside Turn",diff:2,builds:"Inside Turn",lever:"reverse it",q:"west coast swing outside turn technique",blurb:"Follower turns away from you — the mirror of the inside turn. The other half of the toolkit."},
  {id:"t-free",fam:"turn",name:"Free Spin",diff:3,builds:"Spin Prep & Spotting",lever:"add a turn",q:"west coast swing free spin follower",blurb:"An unassisted rotation — you set it up and let go. Lives or dies on prep and balance, not muscle."},
  {id:"t-travel",fam:"turn",name:"Traveling Turns",diff:3,builds:"Free Spin",lever:"new exit",q:"west coast swing traveling turns",blurb:"Spins that move down the slot instead of turning on the spot. Adds direction to your rotation."},
  {id:"t-mult",fam:"turn",name:"Multiple Rotations",diff:4,builds:"Free Spin",lever:"add a turn",q:"west coast swing multiple spins technique",blurb:"Doubles and triples. Spotting, a clean axis, and honest momentum — the calling card of a dancer who's past the basics."},

  // anchor & footwork
  {id:"a-anchor",fam:"footwork",name:"Anchor Step",count:"5 & 6",diff:1,q:"west coast swing anchor step footwork",blurb:"The standard triple in place — ball-change-ball, settling back into third position. This is the plain footwork every variation below dresses up."},
  {id:"a-side3",fam:"footwork",name:"Side-and-Third Anchor",count:"5 & 6",diff:3,builds:"Anchor Step",q:"west coast swing side and third anchor",blurb:"Step to the side, then close to third. The gentlest variation — it still lands in third position, so the away-stretch stays automatic."},
  {id:"a-cross3",fam:"footwork",name:"Cross-and-Third Anchor",count:"5 & 6",diff:3,builds:"Side-and-Third Anchor",q:"west coast swing cross and third anchor",blurb:"Cross behind, then third. A touch more sass, same safe landing spot."},
  {id:"a-touch",fam:"footwork",name:"Touch Step",count:"touch, step",diff:2,builds:"Anchor Step",q:"west coast swing touch step footwork drill",blurb:"Touch the floor with no weight on the downbeat, then step onto it on the upbeat. The single simplest footwork drill there is — do it side to side for days."},
  {id:"a-steptouch",fam:"footwork",name:"Step Touch",count:"step, touch",diff:2,builds:"Touch Step",q:"west coast swing step touch footwork",blurb:"The mirror image: step on the downbeat, touch on the upbeat. Drilling both directions wires up your ankles and your timing at once."},
  {id:"a-point",fam:"footwork",name:"Point Step",count:"point, step",diff:2,builds:"Touch Step",q:"west coast swing point step footwork",blurb:"A touch, but prettier — point the toe to the floor, then step. Clean lines, instant polish."},
  {id:"a-coaster",fam:"footwork",name:"Coaster Step",count:"step-together-step",diff:2,builds:"Anchor Step",q:"west coast swing coaster step",blurb:"A step-together-step triple borrowed from country and ballroom. Handy for changing direction — but keep the away-stretch, or it becomes the dreaded drift forward."},
  {id:"a-kbc",fam:"footwork",name:"Kick-Ball-Change",count:"kick & a",diff:3,builds:"Anchor Step",q:"west coast swing kick ball change anchor",blurb:"Kick on the downbeat, then a quick ball-change back to where you started. If the song shouts KICK on that beat, this is instant, cheap musicality."},
  {id:"a-pbc",fam:"footwork",name:"Point-Ball-Change",count:"point & a",diff:3,builds:"Kick-Ball-Change",q:"west coast swing point ball change",blurb:"Same rhythm as the kick, but point and touch the toe instead of kicking. A signature look — Thibault Ramirez practically lives on this one."},
  {id:"a-sbc",fam:"footwork",name:"Step-Ball-Change",count:"step & a",diff:3,builds:"Kick-Ball-Change",q:"west coast swing step ball change",blurb:"The plainest of the ball-change family — step, then ball-change. A quiet workhorse you'll reach for constantly."},
  {id:"a-swivelbc",fam:"footwork",name:"Swivel-Ball-Change",count:"swivel & a",diff:4,builds:"Kick-Ball-Change",q:"west coast swing swivel ball change",blurb:"Swivel the free foot sideways instead of kicking, then ball-change. The swivel accents a change of direction before you settle."},
  {id:"a-hitch",fam:"footwork",name:"Hitch",count:"6 & a 1",diff:4,builds:"Anchor Step",q:"west coast swing hitch footwork",blurb:"Same rhythm as a kick-ball-change, but instead of a kick you just keep stretching — rolling the anchor foot through an extra beat. Pure connection styling; your partner should feel you haven't settled yet."},
  {id:"a-sync",fam:"footwork",name:"Syncopated Triple",count:"& a",diff:4,builds:"Anchor Step",q:"west coast swing syncopated triple footwork",blurb:"Slip the & in before the downbeat to punch the beat. Powerful — and the number-one cause of rushing your anchor, so treat it with respect."},
  {id:"a-sweep",fam:"footwork",name:"Sweep",count:"smear, step",diff:3,builds:"Anchor Step",q:"west coast swing sweep footwork",blurb:"Drag or smear the free foot across the floor before you step. A smooth, grounded flourish that doesn't change your timing."},
  {id:"a-ronde",fam:"footwork",name:"Ronde",count:"sweep, step",diff:4,builds:"Sweep",q:"west coast swing ronde footwork",blurb:"A sweep taken all the way around — a circular arc of the free leg. Elegant, showy, and a crowd favorite when the music opens up."},
  {id:"a-swivels",fam:"footwork",name:"Swivels",count:"swivel swivel",diff:4,builds:"Anchor Step",q:"west coast swing swivels footwork",blurb:"Swivel the feet and hips in place. A little goes a long way — overdo it and it reads as fidgety, so save it for the right moment."}
];

const DRILLS = [
  // Rolling feet — f-roll
  {id:"d-peel", fnd:"f-roll", lvl:1, name:"Peel the foot", mins:4, partner:false,
   develops:"foot articulation",
   blurb:"Stand with your feet together, weight fully on one foot. Slowly lift the other foot by peeling it off the floor — heel first, then the middle, then the ball, then the toes. Exaggerate it. Most people can't roll down through a step because they never articulate on the way up.",
   cue:"Heel, middle, ball, toe. Peel it like tape."},

  {id:"d-rolldown", fnd:"f-roll", lvl:2, name:"Roll it back down", mins:4, partner:false,
   develops:"smooth weight transfer",
   blurb:"Same drill, reversed. Place the foot toe first, then the ball, then the middle, then the heel, and take your time getting there. Aim to touch down with the smallest part of the foot you can and travel through the whole arch on the way.",
   cue:"Land on a dime, roll through the whole foot."},

  {id:"d-leads", fnd:"f-roll", lvl:3, name:"Heel lead vs. toe lead", mins:5, partner:false,
   develops:"deliberate footfalls",
   blurb:"Walk slowly across the room leading with the heel. Then walk back leading with the toe. Both are correct — the point is that you're choosing one instead of defaulting. Slow forward walks usually want the heel.",
   cue:"Pick one on purpose. Don't let your feet decide."},

  {id:"d-track", fnd:"f-roll", lvl:4, name:"Single tracking", mins:5, partner:false,
   develops:"clean lines down the slot",
   blurb:"Walk forward and backward keeping both heels on one imaginary line, like a balance beam. Your feet should brush past each other on every step. Two separate tracks make you waddle down the slot, and it shows.",
   cue:"One line. Feet brush as they pass."},

  {id:"d-turnout", fnd:"f-roll", lvl:5, name:"Turnout and knee direction", mins:5, partner:false,
   develops:"the smooth look",
   blurb:"Freestyle around the room keeping your feet turned out somewhere between 30 and 45 degrees. Then add the real fix for the marching look: as each foot peels off the floor, let the knee travel forward rather than up. Watch it in a mirror — the difference is obvious.",
   cue:"Knee forward, not up. That's the whole marching fix."},

  {id:"d-calf", fnd:"f-roll", lvl:0, name:"Ankle strength", mins:3, partner:false,
   develops:"control through the arch",
   blurb:"Stand on a stair with your heels hanging off the edge. Lower them slowly below the step, then rise back up, slowly. Dancers without arch and calf strength collapse through the foot and look flat even when they're trying to roll. Sore is fine. Sharp pain is not — stop if you feel it.",
   cue:"Slow down. Slow is the whole exercise."},

  // The anchor — f-anchor
  {id:"d-anchor-time", fnd:"f-anchor", lvl:1, name:"Anchor on time", mins:4, partner:false,
   develops:"anchor timing",
   blurb:"Put on a slow song and dance nothing but anchor triples in place, on 5&6, over and over. Three weight changes, landing exactly where the music says. No pattern, no travel, no styling. Just the settle, on time, until it's boring.",
   cue:"Three weight changes. Land them all."},

  {id:"d-behind-heel", fnd:"f-anchor", lvl:2, name:"Behind the heel", mins:5, partner:false,
   develops:"the away position",
   blurb:"Here's the actual technical test, and it isn't about how your feet look: at the end of the anchor, your center of balance should sit behind the heel of your forward foot, feet in third position. Set up in an anchor, freeze, and check. If your weight is over the front foot, you haven't anchored — you've just stopped.",
   cue:"Center behind the front heel. Check it, don't guess."},

  {id:"d-stay", fnd:"f-anchor", lvl:3, name:"Stay in it", mins:6, partner:false,
   develops:"holding the settle",
   blurb:"Grab a doorframe or a counter as a pretend partner and anchor against it, holding the settle a full beat longer than feels natural. The two ways this breaks are opposite. Leaders arrive carrying momentum and keep creeping forward, which leaves the follower no room to settle at all. Followers get momentum flowing into the away connection and bounce out early. Drill whichever one is yours.",
   cue:"Arrive, settle, wait. The music will tell you when."},

  {id:"d-stretch", fnd:"f-anchor", lvl:4, name:"Stretch the &a1", mins:6, partner:false,
   develops:"elasticity",
   blurb:"The stretch comes from two centers moving apart while the hands stay put. Holding your doorframe, fill the whole stretch of time from the 6& through the &a and into the 1 — transfer your weight backward one inch at a time, staying balanced over the foot the entire way. If you feel tippy, you went too far back. This is the boing everyone's chasing.",
   cue:"Fill every inch of the time. Don't rush to the 1."},

  {id:"d-newfeet", fnd:"f-anchor", lvl:5, name:"Borrow some feet", mins:8, partner:false,
   develops:"anchor variations",
   blurb:"Pick any footwork card from the Anchor & Footwork family above — a touch step, a kick-ball-change, a ronde — and dance it in place of your usual anchor triple. One rule decides whether it worked: did the away-stretch survive? If it did, that's an anchor. If it didn't, they're just fancy feet.",
   cue:"New feet, same stretch. The stretch is the anchor."},

  // Timing — f-time
  {id:"d-find1", fnd:"f-time", lvl:1, name:"Find the 1", mins:4, partner:false,
   develops:"hearing the downbeat",
   blurb:"Put on any song you'd dance to and count out loud: one, two, three, four, five, six, seven, eight — then start over. Out loud matters; counting in your head lets you quietly fix your mistakes. Songs are usually built in chunks of eight, and the top of a chunk usually announces itself. Once it's easy, skip to a random point in the track and find the 1 from a cold start.",
   cue:"Say it out loud. Silent counting hides the misses."},

  {id:"d-onbeat", fnd:"f-time", lvl:2, name:"Land on the beat", mins:5, partner:false,
   develops:"exact timing",
   blurb:"Set a metronome — free apps and in-browser ones are a search away — to around 90. Step in place, one step per click, and aim to land with the click rather than just near it. Most beginners drift slightly early; you'll hear it as a flam, your foot arriving a hair before the sound. Close your eyes for the last minute. Your ears are better at this than your eyes.",
   cue:"Land on the click, not before it."},

  {id:"d-triple-straight", fnd:"f-time", lvl:3, name:"Triple, straight", mins:5, partner:false,
   develops:"the triple rhythm",
   blurb:"Three weight changes packed into two beats: step, step, step across the 3&4. Do them in place, evenly spaced, with the metronome still running. Even is the whole assignment — no rolling, no styling, no travel. Most rushed triples are really two fast steps and one late one.",
   cue:"Three changes, two beats, evenly spread."},

  {id:"d-triple-rolling", fnd:"f-time", lvl:4, name:"Triple, rolling", mins:5, partner:false,
   develops:"smooth triples",
   blurb:"Same triple, now with the weight rolling through each foot instead of stamping — and let the \"&\" sit slightly later than feels natural. That delay is what makes a triple look unhurried instead of scampering.",
   cue:"If it sounds like a drum roll, you rushed it."},

  {id:"d-choose-count", fnd:"f-time", lvl:5, name:"Choose your count", mins:6, partner:false,
   develops:"rhythm choices",
   blurb:"Dance in place and swap the rhythm on purpose: a triple, then two walks in the same two beats, then a triple again. Same time, different number of steps. This is the first real musicality tool you own — a slow section wants walks, a busy one wants triples.",
   cue:"Decide before the beat, not during it."},

  // The Slot — f-slot
  {id:"d-see-lane", fnd:"f-slot", lvl:1, name:"See the lane", mins:3, partner:false,
   develops:"spatial awareness",
   blurb:"Find a line already on your floor — a grout line, a floorboard, the edge of a rug — or lay down painter's tape. Stand at one end and walk it, heel to heel. That's the slot: an invisible bowling lane your partner travels while you mostly stay out of the way. Three minutes of just looking at it does more than you'd think.",
   cue:"The lane is real. Pick one and use it."},

  {id:"d-stay-in-it", fnd:"f-slot", lvl:2, name:"Stay in it", mins:5, partner:false,
   develops:"travelling straight",
   blurb:"Walk the line end to end, forward and backward, without drifting off it. Add your basic footwork and keep going. Drifting sideways is the follower's most common invisible error — invisible because nothing feels wrong until the leader has to reach for you.",
   cue:"Off the line is off the dance."},

  {id:"d-step-off", fnd:"f-slot", lvl:3, name:"Leader steps off", mins:5, partner:false,
   develops:"clearing the path",
   blurb:"Leader's job, and the one that changes the most. Stand on the line, then step off it to one side as though sending someone past you, then return. The lane has to be empty when your partner travels it. Standing in your own slot is why some leads feel cramped and nobody can say why.",
   cue:"Send her down it, then get out of it."},

  {id:"d-slot-track", fnd:"f-slot", lvl:4, name:"Single tracking", mins:4, partner:false,
   develops:"a narrow travel path",
   blurb:"Walk the line with both heels landing on it rather than either side of it, so your feet brush as they pass. Same shape as the rolling-feet version, different purpose: there it's about how the foot moves, here it's about not widening the lane as you travel.",
   cue:"One line, both feet, all the way down."},

  {id:"d-move-slot", fnd:"f-slot", lvl:5, name:"Move the slot", mins:5, partner:false,
   develops:"floorcraft",
   blurb:"On a packed social the lane doesn't stay put. Practise re-aiming it: dance a pattern down your taped line, then pick a new direction and dance the next one along that. The slot belongs to the two of you, and you can rotate it whenever the floor demands.",
   cue:"When the floor closes in, turn the lane — not the pattern."},

  // Starter Step — f-starter
  {id:"d-starter-place", fnd:"f-starter", lvl:1, name:"In place", mins:4, partner:false,
   develops:"the on-ramp",
   blurb:"Dance the starter step by itself, on the spot, to music: 1&2 3&4, no travel, no send. It's the on-ramp onto the slot and nothing more. Beginners either skip it and start cold on a random beat, or rush it. Neither reads as confident.",
   cue:"Get on the beat before you go anywhere."},

  {id:"d-sendout-left", fnd:"f-starter", lvl:2, name:"Sendout to left pass", mins:5, partner:false,
   develops:"connecting the entry",
   blurb:"Starter step, then send an imaginary partner down your left side into a left side pass. Do it ten times. The point isn't the pass, it's that the seam between the two is invisible — the send should feel like the second half of the starter, not a separate decision.",
   cue:"One motion, not two. No pause at the seam."},

  {id:"d-sendout-right", fnd:"f-starter", lvl:3, name:"Sendout to right pass", mins:5, partner:false,
   develops:"entry variety",
   blurb:"Same drill, now sending down your right side into a right side pass. Alternate: left, right, left, right, through a whole song. Whichever one feels clumsier is the one you owe another five minutes to.",
   cue:"Alternate sides. Drill the ugly one twice."},

  {id:"d-sendout-push", fnd:"f-starter", lvl:4, name:"Sugar push sendout", mins:5, partner:false,
   develops:"measured sends",
   blurb:"Starter into a sugar push — and here the send is short. A push only travels far enough to be brought back. Leaders routinely oversend into a push and then have to haul the follower home, which feels exactly as rough as it sounds.",
   cue:"Send only as far as you plan to bring her back from."},

  {id:"d-sendout-tuck", fnd:"f-starter", lvl:5, name:"Tuck sendouts", mins:6, partner:false,
   develops:"entries into a turn",
   blurb:"Starter step straight into a sugar tuck, then into a tuck turn. You're stacking two things you already own into one continuous entry. If the tuck arrives late, the starter step was the thing that ran long — fix that end, not the tuck.",
   cue:"Two moves, one breath."},

  // Connection — f-conn
  {id:"d-frame", fnd:"f-conn", lvl:1, name:"Frame & tone", mins:4, partner:false,
   develops:"a quiet arm",
   blurb:"Stand with your working arm out as if connected: elbow soft and in front of your ribs, shoulder down, wrist neutral. Hold it there for a full song while you walk around. Nothing else. You're teaching your arm to hold a shape without gripping — that's what \"quiet arms\" actually means, and it's boring on purpose.",
   cue:"The arm holds a shape. It doesn't do the work."},

  {id:"d-leverage", fnd:"f-conn", lvl:2, name:"Leverage (away)", mins:5, partner:false,
   develops:"the away connection",
   blurb:"Loop a towel around a doorknob and hold the ends. Keeping your arm shape frozen, lean your weight back into your heels until the towel goes taut. The tension should arrive because your body moved away, not because your arm pulled. Freeze and check: has the elbow angle changed? Then it was the arm.",
   cue:"Body creates the stretch. Arm just carries it."},

  {id:"d-compression", fnd:"f-conn", lvl:3, name:"Compression (toward)", mins:5, partner:false,
   develops:"the toward connection",
   blurb:"Same setup, opposite direction — press gently into a doorframe or a wall with the same frozen arm, and let the pressure come from your body moving toward it. This is the half most people skip, which is why the sugar push is the hardest easy move in the dance. It needs both directions and beginners only ever build one.",
   cue:"Same rule, pushing. The arm still doesn't move."},

  {id:"d-from-center", fnd:"f-conn", lvl:4, name:"Move from center", mins:6, partner:false,
   develops:"body-led movement",
   blurb:"Hold your frame and move your connected hand across the room using only your feet and torso — no elbow, no shoulder. Watch it in a mirror if you have one. Once you feel how far the hand travels without the arm doing anything, arm-leading starts to feel like cheating, because it is.",
   cue:"The feet move the hand. Nothing else does."},

  {id:"d-match", fnd:"f-conn", lvl:5, name:"Match your partner", mins:5, partner:false,
   develops:"adjustable tone",
   blurb:"The one you can't finish alone. Against your towel, deliberately vary how much tension you offer — light, then firm, then light again — and notice how different each one feels through your hand. Then take it to a person at the next social; this rung graduates off the doorframe.",
   cue:"Nobody feels the same. Noticing that is the skill."},

  // Footwork family — one drill per card. `move` names the footwork card the drill
  // advances; `fnd` carries the Anchor credit (D-008). `lvl` orders this group only.
  {id:"d-fw-anchor", fnd:"f-anchor", move:"a-anchor", lvl:1, name:"Anchor Step", mins:4, partner:false,
   develops:"the baseline",
   blurb:"The plain triple in place — ball, change, ball — settling back into third. Drill it to a slow song until it's dull. Everything else in this family is this with decoration, so if this one is shaky, decorating it only makes the shakiness harder to see.",
   cue:"Boring and correct beats interesting and early."},

  {id:"d-fw-touch", fnd:"f-anchor", move:"a-touch", lvl:1, name:"Touch Step", mins:3, partner:false,
   develops:"ankle control and timing",
   blurb:"Touch the floor on the downbeat, then step onto it on the \"and.\" Side to side, over and over. The simplest footwork drill on the site and probably the best value — you can do it while the kettle boils.",
   cue:"If it holds you up, it's a step."},

  {id:"d-fw-steptouch", fnd:"f-anchor", move:"a-steptouch", lvl:1, name:"Step Touch", mins:3, partner:false,
   develops:"the mirror rhythm",
   blurb:"The reverse: step on the downbeat, touch on the \"and.\" Drill it back to back with the touch step so your ankles stop caring which order they're in.",
   cue:"Same two things, swapped. Do both directions."},

  {id:"d-fw-point", fnd:"f-anchor", move:"a-point", lvl:1, name:"Point Step", mins:3, partner:false,
   develops:"clean lines",
   blurb:"A touch with the toe pointed, then step. Same rhythm as the touch step, better lines. The whole difference is whether you bothered to finish the foot.",
   cue:"Point at the floor, not at the wall."},

  {id:"d-fw-coaster", fnd:"f-anchor", move:"a-coaster", lvl:2, name:"Coaster Step", mins:4, partner:false,
   develops:"direction changes",
   blurb:"Step, together, step — borrowed from country and ballroom, handy for changing direction. It's also the footwork most likely to drift you forward, which turns your anchor into a stop.",
   cue:"Three steps that go somewhere, over a body that doesn't."},

  {id:"d-fw-side3", fnd:"f-anchor", move:"a-side3", lvl:3, name:"Side-and-Third Anchor", mins:4, partner:false,
   develops:"gentle variation",
   blurb:"Step to the side, then close to third. Because it still lands in third, the away-stretch takes care of itself — which makes this the safest first variation anyone can add.",
   cue:"Wander sideways, land in third anyway."},

  {id:"d-fw-cross3", fnd:"f-anchor", move:"a-cross3", lvl:3, name:"Cross-and-Third Anchor", mins:4, partner:false,
   develops:"styled anchors",
   blurb:"Cross behind, then close to third. A little more sass, same safe landing. Check that the cross doesn't pull your weight forward as you go — that's the one way this breaks.",
   cue:"Sass above, third position below."},

  {id:"d-fw-sweep", fnd:"f-anchor", move:"a-sweep", lvl:4, name:"Sweep", mins:4, partner:false,
   develops:"grounded flourish",
   blurb:"Drag or smear the free foot across the floor before you step. It's smooth, it's grounded, and it changes nothing about your timing — which is exactly why it's a good first flourish.",
   cue:"Drag it. Don't lift it."},

  {id:"d-fw-ronde", fnd:"f-anchor", move:"a-ronde", lvl:4, name:"Ronde", mins:5, partner:false,
   develops:"a showy line",
   blurb:"A sweep taken all the way around: a circular arc of the free leg. Elegant when the music opens up, silly when it doesn't. Keep the supporting knee soft and the arc low.",
   cue:"If the floor's full, save it."},

  {id:"d-fw-kbc", fnd:"f-anchor", move:"a-kbc", lvl:5, name:"Kick-Ball-Change", mins:4, partner:false,
   develops:"accented anchors",
   blurb:"Kick on the downbeat, quick ball-change back to where you started. When a song shouts on that beat, this is cheap, instant musicality. Keep the kick low — knee-height kicks on a crowded floor make enemies.",
   cue:"Kick from the ankle, not the knee."},

  {id:"d-fw-pbc", fnd:"f-anchor", move:"a-pbc", lvl:5, name:"Point-Ball-Change", mins:4, partner:false,
   develops:"polish",
   blurb:"Same rhythm as the kick, but point and touch instead of kicking. It reads as more finished for exactly zero extra difficulty, which is the best trade in the family.",
   cue:"Same rhythm. Prettier foot."},

  {id:"d-fw-sbc", fnd:"f-anchor", move:"a-sbc", lvl:5, name:"Step-Ball-Change", mins:3, partner:false,
   develops:"a workhorse rhythm",
   blurb:"Step, then ball-change. The plainest of the family and the one you'll reach for most. Drill it until it's automatic and it becomes the thing your feet do when your brain is busy.",
   cue:"The one you'll use when you're not thinking."},

  {id:"d-fw-swivelbc", fnd:"f-anchor", move:"a-swivelbc", lvl:5, name:"Swivel-Ball-Change", mins:5, partner:false,
   develops:"accented direction change",
   blurb:"Swivel the free foot sideways instead of kicking, then ball-change. The swivel marks a change of direction just before you settle.",
   cue:"Swivel below the ribs. Shoulders stay out of it."},

  {id:"d-fw-swivels", fnd:"f-anchor", move:"a-swivels", lvl:6, name:"Swivels", mins:4, partner:false,
   develops:"hip and foot articulation",
   blurb:"Swivel feet and hips in place. A little goes a long way — overdone it reads as fidgety rather than confident. Drill it to a slow song and stop before you want to.",
   cue:"Two is styling. Six is fidgeting."},

  {id:"d-fw-hitch", fnd:"f-anchor", move:"a-hitch", lvl:7, name:"Hitch", mins:5, partner:false,
   develops:"stretch styling",
   blurb:"Same rhythm as a kick-ball-change, but instead of kicking you just keep stretching, rolling the anchor foot through an extra beat. Pure connection styling. Drill it against a doorframe so you can check the stretch is real.",
   cue:"The beat passes. You keep stretching."},

  {id:"d-fw-sync", fnd:"f-anchor", move:"a-sync", lvl:8, name:"Syncopated Triple", mins:5, partner:false,
   develops:"rhythmic punch",
   blurb:"Slip an extra \"and\" in before the downbeat to punch the beat. Powerful, and the single biggest cause of a rushed anchor on this whole list — the extra step tempts you forward. Drill it slowly.",
   cue:"The punch is worth nothing if the anchor left early."}
];

// The six foundations' progression rungs. Keys are foundation move ids in MOVES.
// lvl 0 + bonus:true sorts after the numbered rungs. Exactly one rung carries
// pointsToFootwork — the Anchor's L5, which the renderer marks with the
// new-exit arrow as a wink toward the footwork family.
const LADDERS = {
  "f-time": [
    {lvl:1, label:"Find the 1"},
    {lvl:2, label:"Land on the beat"},
    {lvl:3, label:"Triple, straight"},
    {lvl:4, label:"Triple, rolling"},
    {lvl:5, label:"Choose your count"},
    {lvl:0, label:"Syncopated triple", bonus:true}
  ],
  "f-slot": [
    {lvl:1, label:"See the lane"},
    {lvl:2, label:"Stay in it"},
    {lvl:3, label:"Leader steps off"},
    {lvl:4, label:"Single tracking"},
    {lvl:5, label:"Move the slot"}
  ],
  "f-starter": [
    {lvl:1, label:"In place"},
    {lvl:2, label:"Sendout to left pass"},
    {lvl:3, label:"Sendout to right pass"},
    {lvl:4, label:"Sugar push sendout"},
    {lvl:5, label:"Tuck sendouts"}
  ],
  "f-anchor": [
    {lvl:1, label:"Anchor on time"},
    {lvl:2, label:"Behind the heel"},
    {lvl:3, label:"Stay in it"},
    {lvl:4, label:"Stretch the &a1"},
    {lvl:5, label:"Borrow any footwork", pointsToFootwork:true}
  ],
  "f-roll": [
    {lvl:1, label:"Peel the foot"},
    {lvl:2, label:"Roll it down"},
    {lvl:3, label:"Heel vs. toe lead"},
    {lvl:4, label:"Single tracking"},
    {lvl:5, label:"Turnout & knee"},
    {lvl:0, label:"Ankle strength", bonus:true}
  ],
  "f-conn": [
    {lvl:1, label:"Frame & tone"},
    {lvl:2, label:"Leverage (away)"},
    {lvl:3, label:"Compression (toward)"},
    {lvl:4, label:"Move from center"},
    {lvl:5, label:"Match your partner"}
  ]
};

const STORE_KEY="wcs-progress-v1";
let state={};

// Progress persists in the browser's localStorage (per-device, per-browser).
function load(){
  try{ const raw=localStorage.getItem(STORE_KEY); if(raw) state=JSON.parse(raw)||{}; }catch(e){ state={}; }
}
function save(){
  try{ localStorage.setItem(STORE_KEY, JSON.stringify(state)); }catch(e){}
}

// markStatus — the data half of the map's setStatus, shared so /game can mark a
// move through the one and only wcs-progress-v1 write path (save()). Pure setter:
// pass "none" to clear. The map's setStatus() computes the toggle and re-renders.
function markStatus(id,status){
  if(status==="none") delete state[id]; else state[id]=status;
  save();
}
// A page sets this so shared mutators can trigger that page's re-render without
// theslot.js depending on any page's render functions.
let onRungChange=null;

// ---- Game-layer storage -----------------------------------------------------
// Deliberately parallel to the move-progress path above, never part of it:
// its own key, its own object. Nothing here reads or writes STORE_KEY or
// `state`, so a bug in the game layer cannot reach a dancer's saved moves.
// Storage failure (private browsing, quota) degrades rung marking to
// non-persistent — it never throws.
const GAME_KEY="wcs-game-v1";
function defaultGame(){
  return {v:3, rungs:{}, credited:[], history:[], totals:{drills:0,minutes:0,moves:0},
    dates:[], open:{map:null,game:null}, settings:{sound:false}};
}
let gameState=defaultGame();

// One place that knows the key format. Rung identity is foundation id + level,
// not the label — two foundations share the label "Stay in it".
function rungKey(fid,lvl){ return `${fid}-${lvl}`; }

// Coerces any stored shape into a valid v2 object without losing rungs. A missing
// `v` is a v1 store ({rungs} only): keep the rungs, default the rest. Arrays and
// non-objects are rejected wholesale (L-005) — an array passes typeof "object" but
// JSON.stringify drops added props, silently eating every later write.
function normalizeGame(p){
  const g=defaultGame();
  const obj=o=>o && typeof o==="object" && !Array.isArray(o);
  if(!obj(p)) return g;
  if(obj(p.rungs)) g.rungs=p.rungs;               // rungs carry forward from every version
  if(p.v===2 || p.v===3){
    if(Array.isArray(p.credited)) g.credited=p.credited;
    if(Array.isArray(p.history)) g.history=p.history.slice(-200);
    if(Array.isArray(p.dates)) g.dates=p.dates;
    if(obj(p.totals)) g.totals={drills:+p.totals.drills||0, minutes:+p.totals.minutes||0, moves:+p.totals.moves||0};
  }
  // open: v3 is {map,game}; a v2 flat open becomes open.map; v1 has none.
  if(p.v===3 && obj(p.open)){
    g.open={ map: obj(p.open.map)?p.open.map:null, game: obj(p.open.game)?p.open.game:null };
  }else if(obj(p.open)){
    g.open={ map:p.open, game:null };
  }
  if(p.v===3 && obj(p.settings)) g.settings={ sound: !!p.settings.sound };
  return g;
}

function loadGame(){
  let parsed=null;
  try{ const raw=localStorage.getItem(GAME_KEY); if(raw) parsed=JSON.parse(raw); }catch(e){ parsed=null; }
  gameState=normalizeGame(parsed);
}
function saveGame(){
  try{ localStorage.setItem(GAME_KEY, JSON.stringify(gameState)); }catch(e){}
}

// Append a history event, newest kept, capped at 200 so storage can't grow forever.
// Each event carries `via` — which page produced it; a page sets logVia at startup.
let logVia="map";
function logEvent(ev){
  if(!ev.via) ev.via=logVia;
  gameState.history.push(ev);
  if(gameState.history.length>200) gameState.history=gameState.history.slice(-200);
}
// Stamp today's date (local YYYY-MM-DD) into the activity set, once per day.
function markToday(){
  const d=new Date(), p=n=>String(n).padStart(2,"0");
  const key=`${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}`;
  if(!gameState.dates.includes(key)) gameState.dates.push(key);
}

function isRungReached(fid,lvl){ return !!gameState.rungs[rungKey(fid,lvl)]; }

// Reached rungs are stored as present-and-true; unreached ones are deleted
// rather than stored as false, so the object stays a set of what's earned.
function toggleRung(fid,lvl){
  const k=rungKey(fid,lvl);
  if(gameState.rungs[k]) delete gameState.rungs[k]; else gameState.rungs[k]=true;
  saveGame();
  if(onRungChange) onRungChange();
}
// ---- end game-layer storage -------------------------------------------------

// ---- challenge engine -------------------------------------------------------
// The user picks the category; the engine picks the item (D-023).

// A move counts as "reached" once it's learning or got — the unlock threshold (D-028).
function reached(id){ const s=state[id]||"none"; return s==="got"||s==="learning"; }

// Families with at least one drawable move right now: not a foundation, not got, and
// its prerequisite reached. The wheel is built from this, so an exhausted family drops off.
function eligibleFamilies(){
  const byName={}; MOVES.forEach(m=>{ byName[m.name]=m; });
  const fams=new Set();
  MOVES.forEach(m=>{
    if(m.fam==="foundation" || (state[m.id]||"none")==="got") return;
    if(!m.builds || (byName[m.builds] && reached(byName[m.builds].id))) fams.add(m.fam);
  });
  return [...fams];
}

// pickMove: an ownable move to learn next. Skips foundations (they're ladders, not
// ownable) and anything already got. Prerequisite-aware — a move with a `builds`
// parent is only eligible once that parent is got. Prefers the lowest diff, then
// something not offered recently, then random. If nothing is eligible the user has
// outrun the tree: fall back to the lowest-diff un-got move and flag it.
function pickMove(){
  const byName={}; MOVES.forEach(m=>{ byName[m.name]=m; });
  const notGot=MOVES.filter(m=>m.fam!=="foundation" && (state[m.id]||"none")!=="got");
  if(!notGot.length) return null;                     // every ownable move is got
  // D-028: a prerequisite unlocks once its parent is *reached* (learning OR got),
  // not only got — so completing a challenge immediately opens its children and
  // the wheel never starves.
  const eligible=notGot.filter(m=>!m.builds || (byName[m.builds] && reached(byName[m.builds].id)));
  const outran=eligible.length===0;
  const pool=outran?notGot:eligible;
  const minDiff=Math.min(...pool.map(m=>m.diff));
  let tier=pool.filter(m=>m.diff===minDiff);
  const recent=new Set(gameState.history.slice(-10).filter(h=>h.type==="move"&&h.action==="offered").map(h=>h.id));
  const fresh=tier.filter(m=>!recent.has(m.id));
  if(fresh.length) tier=fresh;
  return {move:tier[Math.floor(Math.random()*tier.length)], outran};
}

// pickDrill: prefer footwork whose move hasn't yet fed the Anchor ladder (D-010's
// breadth rule as a preference, not a lock), then drills on foundations with an
// unreached rung, then anything.
function pickDrill(){
  if(!DRILLS.length) return null;
  const credited=new Set(gameState.credited);
  const hasUnreached=fid=>(LADDERS[fid]||[]).some(r=>!isRungReached(fid,r.lvl));
  const tier1=DRILLS.filter(d=>d.move && !credited.has(d.move));
  const tier2=DRILLS.filter(d=>hasUnreached(d.fnd));
  const pool=tier1.length?tier1:(tier2.length?tier2:DRILLS);
  return pool[Math.floor(Math.random()*pool.length)];
}
// ---- end challenge engine ---------------------------------------------------

