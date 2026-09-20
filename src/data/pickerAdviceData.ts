export interface PickerAdviceProfile {
  teamId: string;
  teamName: string;
  ownerName: string;
  rank: number;
  points: number;
  avatar: string;
  color: string;
  isCurrentUser: boolean;
  damageGrade: string;
  lossTotal: number;
  maxRemaining: number;
  goodPickSummary: string;
  badPickSummary: string;
  badge: string;
  badgeColor: string;
  salAdvice: {
    title: string;
    script: string;
    stageDirections: string;
    tacticalPointers: string[];
    headline: string;
  };
  chloeAdvice: {
    title: string;
    script: string;
    stageDirections: string;
    tacticalPointers: string[];
    headline: string;
  };
  commishAdvice: {
    title: string;
    script: string;
    stageDirections: string;
    tacticalPointers: string[];
    headline: string;
  };
}

export const INDIVIDUAL_PICKERS_ADVICE: PickerAdviceProfile[] = [
  {
    teamId: 'team-todd',
    teamName: 'CramItUp Your CramHole Lafleur',
    ownerName: 'Todd Reimer',
    rank: 8,
    points: 8,
    avatar: 'C',
    color: '#10B981',
    isCurrentUser: true,
    damageGrade: 'A (Masterful Structure)',
    lossTotal: 9,
    maxRemaining: 127,
    goodPickSummary: 'Prudent 8 pts on Seattle cashed cleanly in Game 1',
    badPickSummary: 'Absorbed 9 pts on LAR, but preserved all top 7 anchors intact!',
    badge: '⚡ Sleeping Giant (127 Max)',
    badgeColor: 'bg-emerald-950 text-emerald-300 border-emerald-500/50',
    salAdvice: {
      title: "Coach Sal's Master Advice for Todd Reimer",
      headline: "Do Not Panic! Your Top 7 Anchors Are Still Rock Solid!",
      stageDirections: '[clears throat] [deep gravelly Ditka shout]',
      script:
        "[clears throat] [deep gravelly Ditka tone] Hey Todd! Coach Sal comin' to ya from Vito & Sal's Beef on 35th and Halsted! [pause] Listen to me very carefully: do NOT look at dat 8th place rank and get discouraged! Droppin' 9 points on da Rams was a superficial flesh wound! You know why? [shouting with passion] Because you didn't burn your heavy artillery! Your top seven anchors are still 100% alive: sixteen on da Chargers, fifteen on da Jags, fourteen on Detroit! You got 91 points locked on heavy favorites while dese other knuckleheads burned their 15s and 16s at SoFi! Stay disciplined, ride dem heavy favorites on Sunday, don't shuffle your lineup, and by Monday night you're takin' home da Initech crown! Now eat a combo dipped wit' hot giardiniera and let's go!",
      tacticalPointers: [
        'DO NOT SHUFFLE ANCHORS: Keep LAC at 16 pts (-10 vs ARI) and JAX at 15 pts (-8.5 vs CLE).',
        'LEVERAGE POSITION: 91 of your remaining 119 points are locked on heavy favorites with >70% win probabilities.',
        'MONTE CARLO ADVANTAGE: Opponent picks 3-16 will begin unlocking on Sunday; expect your rank to climb rapidly by 4:00 PM ET.',
      ],
    },
    chloeAdvice: {
      title: "Dr. Chloe's Algorithmic Briefing for Todd Reimer",
      headline: "Highest Win-Probability Runway in the League",
      stageDirections: '[crisp analytical tone] [fast paced]',
      script:
        "[fast paced] [crisp analytical tone] Todd, algorithmic congratulations. [pause] While novice managers in the league fixate on raw current points, my Monte Carlo simulation identifies your portfolio as the single most lethal sleeping giant in the league. You absorbed an expected loss of 9 points on LAR, but your capital preservation is immaculate. You retained 91 leverage points across top-tier favorites boasting an aggregate 78.4% win probability. Shoeman lost his 16-anchor; Orange crush has depleted variance. Execute your model without emotional deviation on Sunday.",
      tacticalPointers: [
        'Expected Value (EV): +14.2 net points over the pool median across the 14 pending games.',
        'Target Game 4: Detroit (-7.0) at 14 points carries an 81% win probability in Ford Field.',
        'Vulnerability Watch: Philadelphia (-5.0) at 13 points against Washington is your sole elevated variance spot.',
      ],
    },
    commishAdvice: {
      title: "Commish AI Carnage Ruling for Todd Reimer",
      headline: "Stat Anomaly: 8th Place with #1 Recovery Index",
      stageDirections: '[deadpan monotone] [pause]',
      script:
        "[deadpan monotone] [pause] Initech Invitational Official Directive for Team 'CramItUp Your CramHole Lafleur': Official pool records indicate Todd Reimer holds a 127 maximum possible score. Only PatN holds a higher ceiling, but Todd's distribution is weighted 3.4x more heavily on heavy favorites. Verdict: High probability of taking 1st place by Sunday 7:30 PM.",
      tacticalPointers: [
        'Ceiling: 127 points.',
        'Picks Locked: 2 of 16.',
        'Remaining Slate: 14 games.',
      ],
    },
  },
  {
    teamId: 'team-orange',
    teamName: 'Orange crush',
    ownerName: 'Orange crush',
    rank: 1,
    points: 26,
    avatar: 'O',
    color: '#F97316',
    isCurrentUser: false,
    damageGrade: 'A+ (Perfect Opening)',
    lossTotal: 0,
    maxRemaining: 136,
    goodPickSummary: 'Hit SEA (16 pts) + SOLE MANAGER to hit SF (+10 pts upset!)',
    badPickSummary: 'Zero losses. Perfect 2-for-2 start.',
    badge: '🏆 Sole SF Survivor (26 pts)',
    badgeColor: 'bg-emerald-950 text-emerald-300 border-emerald-500/50',
    salAdvice: {
      title: "Coach Sal's Advice for Leader Orange crush",
      headline: "You're King of da Castle, But Don't Get Cute on Sunday!",
      stageDirections: '[boisterous chuckle] [clears throat]',
      script:
        "[boisterous laugh] Orange crush! [pause] Twenty-six points in da bank! [shouting with passion] You hit dat Niners upset when eleven other guys drove their trucks off a cliff at SoFi! Hats off to ya! But listen to Coach Sal: Sunday is where championship seasons get won or lost. You already cashed your 16-point anchor on Seattle and your 10 on San Fran. That means you got fewer heavy bullets left for Sunday afternoon. [emphasized] Do NOT get cute! Don't start gamblin' on weird underdogs just because Shanahan made ya look like Nostradamus! Play your chalk, protect your lead, and don't give Todd room to breathe!",
      tacticalPointers: [
        'DEFEND THE LEAD: You already banked your 16-point anchor; you have less margin on Sunday favorites.',
        'AVOID UNDERDOG TEMPTATION: Do not over-leverage on speculative upsets.',
        'CHALK CONSOLIDATION: Bank on Detroit and Baltimore to hold off chasers.',
      ],
    },
    chloeAdvice: {
      title: "Dr. Chloe's Advice for Orange crush",
      headline: "High Variance Defense: Protecting the 18-Point Lead",
      stageDirections: '[sarcastic] [dry chuckle]',
      script:
        "[sarcastic] [dry chuckle] Orange crush, you pulled off an 8.3% probability hit with that San Francisco upset. Enjoy the 18-point cushion, but mathematically, your variance profile has peaked early. Having spent your 16-point anchor on Seattle, your average remaining confidence weight across the 14 games is 7.8 points. If the heavy favorites sweep Sunday, your lead will shrink by 4.2 points per window. Lock down conservative chalk.",
      tacticalPointers: [
        'Current Lead: +11 over 2nd, +18 over Todd.',
        'Variance Decay: High leverage anchors already spent.',
        'Risk: Heavy favorite sweep compresses field margin.',
      ],
    },
    commishAdvice: {
      title: "Commish AI Warning for Orange crush",
      headline: "Target Acquired: 11 Chasers Hunting Your Podium",
      stageDirections: '[stern monotone robotic delivery] [short pause]',
      script:
        "[stern monotone robotic delivery] [short pause] Alert to Orange crush: You are currently the sole manager in the league with zero lost confidence points. Historical league records show Week 1 Day 1 leaders who spent their top anchor early surrender the lead 62% of the time by Sunday Night Football.",
      tacticalPointers: [
        'Points Banked: 26.',
        'Remaining Max: 136.',
        'Status: Controls Destiny.',
      ],
    },
  },
  {
    teamId: 'team-shoeman',
    teamName: 'Shoeman',
    ownerName: 'Shoeman',
    rank: 2,
    points: 15,
    avatar: 'S',
    color: '#EC4899',
    isCurrentUser: false,
    damageGrade: 'F (Anchor Incinerated)',
    lossTotal: 16,
    maxRemaining: 120,
    goodPickSummary: 'Cashed 15 pts on Seattle',
    badPickSummary: '💀 INCINERATED #1 OVERALL 16-PT ANCHOR ON RAMS',
    badge: '💀 16-Pt Anchor Burned',
    badgeColor: 'bg-red-950 text-red-300 border-red-500/50',
    salAdvice: {
      title: "Coach Sal's Emergency Roast & Advice for Shoeman",
      headline: "Your #1 Sixteen-Point Anchor is in da Au Jus Vat! Time for Chaos!",
      stageDirections: '[groans in agony] [heavy sigh]',
      script:
        "[groans in agony] [heavy sigh] Shoeman... marone, my stomach hurts just lookin' at your scorecard! [shouting in disbelief] Sixteen points on da Rams?! Ya put your absolute number one maximum anchor on an offense dat couldn't punch it in from da two-yard line! [groans] Dat sixteen-point bonfire chops your season ceiling down to 120 points on game number two! You are currently sittin' in 2nd place on paper, but dat's fool's gold! Here's your only survival advice: [emphasized] you CANNOT play chalk on Sunday! If everyone else hits their 14s and 15s, you're dead in da water! You gotta hunt two live underdogs, hammer 'em, and pray for total Sunday afternoon anarchy!",
      tacticalPointers: [
        'CEILING CRISIS: Maximum points capped at 120. Chalk will guarantee a finish outside the money.',
        'CHAOS MANDATE: Must hunt at least one high-confidence upset pivot to overcome the 16-pt deficit.',
        'TARGET POTENTIAL: Watch for AFC South volatility or Sunday Night Football underdog swings.',
      ],
    },
    chloeAdvice: {
      title: "Dr. Chloe's Damage Report for Shoeman",
      headline: "Mathematical Cap at 120: Pivot Strategy Required",
      stageDirections: '[somber tone] [heavy sigh]',
      script:
        "[somber tone] [heavy sigh] Shoeman, that 16-point allocation to Los Angeles was a catastrophic expected value miscalculation. With 120 maximum remaining points, you have zero margin for error. A standard conservative strategy yields an expected 98.4 total points, which historically finishes 8th or lower in the league. Your only mathematical path to a podium payout is asymmetric leverage—you must embrace positive-skew underdogs on Sunday.",
      tacticalPointers: [
        'Downside Exposure: 16 points gone.',
        'Podium Probability: Dropped from 31% to 8.4%.',
        'Action: Pivot away from consensus chalk.',
      ],
    },
    commishAdvice: {
      title: "Commish AI Carnage Alert for Shoeman",
      headline: "Highest Individual Anchor Loss in Group History",
      stageDirections: '[deadpan monotone] [dramatic pause]',
      script:
        "[deadpan monotone] [dramatic pause] Carnage confirmed: Shoeman holds the lowest maximum ceiling (120) of all 12 teams in the Initech Invitational. Recovery requires immediate high-risk strategy shift.",
      tacticalPointers: ['Lost: 16 pts.', 'Ceiling: 120 pts.', 'Rank: 2 (Decaying).'],
    },
  },
  {
    teamId: 'team-broncos',
    teamName: 'BroncosCountry (PatN)',
    ownerName: 'PatN',
    rank: 9,
    points: 7,
    avatar: 'B',
    color: '#3B82F6',
    isCurrentUser: false,
    damageGrade: 'A+ (Damage Control Master)',
    lossTotal: 1,
    maxRemaining: 135,
    goodPickSummary: 'Prudent 7 pts on Seattle cashed cleanly',
    badPickSummary: '🛡️ GENIUS HEDGE: Risked only 1 point on LAR loss!',
    badge: '🛡️ League-Best Ceiling (135)',
    badgeColor: 'bg-blue-950 text-blue-300 border-blue-500/50',
    salAdvice: {
      title: "Coach Sal's Salute & Advice for PatN (BroncosCountry)",
      headline: "Dat One-Point Hedge Was Pure South-Side Street Smarts!",
      stageDirections: '[boisterous laugh] [shouting with pride]',
      script:
        "[boisterous laugh] [shouting with pride] PatN! BroncosCountry! Dat was da single smartest ten seconds of decision-makin' in Yahoo history! Ya smelled somethin' stinkin' in SoFi Stadium, so what did ya do? [laughs] Ya tossed one measly point on da Rams while eleven other guys threw their house payments on LA! You lost ONE point! Uno! You're sittin' at 7 points right now, but who cares? You got 135 points still on da table—da highest ceiling of any human being who picked da Rams! Stay patient, let Todd and Orange crush slug it out, and cash your fat middle-tier picks on Sunday!",
      tacticalPointers: [
        'LEAGUE-BEST PRESERVATION: 135 max possible points remaining.',
        'MINIMAL CARNAGE: Only 1 pt subtracted from your original 136-pt sheet.',
        'SUNDAY DIRECTIVE: Let other managers implode while your 12-16 anchors cash smoothly.',
      ],
    },
    chloeAdvice: {
      title: "Dr. Chloe's Strategic Audit for PatN",
      headline: "Optimal Risk-Mitigation Model in the League",
      stageDirections: '[crisp analytical tone] [short pause]',
      script:
        "[crisp analytical tone] [short pause] PatN executed textbook min-max hedging. By assigning a confidence rating of 1 to LAR, your net loss is statistically negligible (0.7% variance). Your remaining ceiling of 135 points is the second highest in the entire league, behind only Orange crush. Unlike Shoeman, your win curve is virtually unblemished. Consistently banking 10-15 point games on Sunday positions you for a top-2 finish.",
      tacticalPointers: [
        'Ceiling: 135 pts.',
        'Portfolio Health: 99.3% intact.',
        'Strategic Mode: Moderate-low variance chalk execution.',
      ],
    },
    commishAdvice: {
      title: "Commish AI Efficiency Award for PatN",
      headline: "Hedge of the Week: 99.3% Capital Preserved",
      stageDirections: '[deadpan monotone] [pause]',
      script:
        "[deadpan monotone] [pause] Initech Award: BroncosCountry (PatN) has been awarded the 'Steel Armor' badge for absorbing the lowest net loss in the SoFi Rams massacre.",
      tacticalPointers: ['Loss: -1 pt.', 'Max Remaining: 135 pts.', 'Standing: Stealth Contender.'],
    },
  },
  {
    teamId: 'team-niner',
    teamName: 'Niner Faithful',
    ownerName: 'Niner Faithful',
    rank: 7,
    points: 9,
    avatar: 'N',
    color: '#EF4444',
    isCurrentUser: false,
    damageGrade: 'C- (Self-Inflicted Burn)',
    lossTotal: 11,
    maxRemaining: 125,
    goodPickSummary: 'Cashed 9 pts on Seattle',
    badPickSummary: '🤦 TRAGIC IRONY: Picked against own 49ers with 11 pts and lost!',
    badge: '🤡 Betrayed Own Team (-11)',
    badgeColor: 'bg-rose-950 text-rose-300 border-rose-500/50',
    salAdvice: {
      title: "Coach Sal's Roast & Rehabilitation for Niner Faithful",
      headline: "You Have 'Niner' in Your Name and Picked the Rams?! Marone!",
      stageDirections: '[shouting with rage] [groans in agony]',
      script:
        "[shouting with rage] Niner Faithful! [groans in agony] What in da name of Mike Singletary is goin' on in your head, kid?! You got 'Niner' right in your team name, you probably got a Joe Montana jersey in your closet, and you put ELEVEN points on da Rams against your own team?! [groans] You watched San Francisco win, and instead of crackin' a cold one, you lost eleven confidence points! Dat is a certified clown performance! [clears throat] Here's your therapy advice: on Sunday, stop outthinkin' yourself! Pick wit' your heart or pick wit' the numbers, but never betray your squad like dat again! You got 125 points left—clean it up!",
      tacticalPointers: [
        'EMOTIONAL DAMAGE REPAIR: 11 points lost on your own favorite team.',
        'MAX CEILING: 125 points left; podium still reachable with a clean Sunday.',
        'RULE NUMBER ONE: Trust your instincts over media injury hype.',
      ],
    },
    chloeAdvice: {
      title: "Dr. Chloe's Behavioral Finance Audit for Niner Faithful",
      headline: "Cognitive Dissonance in Action: The Anti-Hedge Folly",
      stageDirections: '[sarcastic tone] [dry chuckle]',
      script:
        "[sarcastic tone] [dry chuckle] Niner Faithful exhibited classic emotional hedging: attempting to insure personal happiness by wagering against his favored team, resulting in maximum utility loss. Mathematically, giving 11 confidence points to an intradivision road favorite was a -0.68 EV mistake. With 125 max points remaining, you need to recalibrate your bias filters before Sunday 1:00 PM kickoffs.",
      tacticalPointers: [
        'Loss: -11 pts.',
        'Bias Identified: Emotional overcompensation.',
        'Target: Lock in 12-16 anchors without second-guessing.',
      ],
    },
    commishAdvice: {
      title: "Commish AI Irony Citation for Niner Faithful",
      headline: "Official Award: The Judas Trophy (-11 Points)",
      stageDirections: '[deadpan monotone] [pause]',
      script:
        "[deadpan monotone] [pause] Citation issued to Niner Faithful: Betraying your namesake franchise in Week 1 resulted in an 11-point forfeiture. Pool sentiment ranks this as the funniest moment of Day 1.",
      tacticalPointers: ['Penalty: 11 pts lost.', 'Current Rank: 7th.', 'Ceiling: 125 pts.'],
    },
  },
  {
    teamId: 'team-limps',
    teamName: 'Sir Limps-A-Lot',
    ownerName: 'Sir Limps-A-Lot',
    rank: 11,
    points: 6,
    avatar: 'L',
    color: '#3B82F6',
    isCurrentUser: false,
    damageGrade: 'D+ (Heavy Burn)',
    lossTotal: 13,
    maxRemaining: 123,
    goodPickSummary: 'Cashed 6 pts on Seattle',
    badPickSummary: 'Burned 13 confidence points on Rams choke',
    badge: '⚠️ -13 Pt Anchor Loss',
    badgeColor: 'bg-red-950 text-red-300 border-red-500/50',
    salAdvice: {
      title: "Coach Sal's Advice for Sir Limps-A-Lot",
      headline: "Thirteen Points Gone! Time to Stop Limpin' and Start Hittin'!",
      stageDirections: '[shouting with fury] [heavy sigh]',
      script:
        "[shouting with fury] Sir Limps-A-Lot, you're limpin' alright! [heavy sigh] Thirteen points on da Rams went right down da sewer! Dis is why ya don't put a baker's dozen confidence on division rivalry games on opening weekend! You're sittin' at 6 points in 11th place, but listen here: your 14, 15, and 16 anchors are still intact! You gotta sweep Sunday afternoon between the tackles or you're buyin' polish sausage for da whole league! Put your chin down and run da rock!",
      tacticalPointers: [
        'CRITICAL SWEEP: Must cash 14, 15, 16 anchors to salvage top half.',
        'AVOID FURTHER SLIPPAGE: A single additional loss drops you out of money.',
        'LEAN ON DEFENSE: Detroit and Baltimore are mandatory locks.',
      ],
    },
    chloeAdvice: {
      title: "Dr. Chloe's Analysis for Sir Limps-A-Lot",
      headline: "13-Point Loss Limits Margin to Single Standard Deviation",
      stageDirections: '[deadpan] [fast paced]',
      script:
        "[deadpan] [fast paced] Sir Limps-A-Lot sacrificed 13 leverage points on Los Angeles, restricting maximum ceiling to 123. To reach a top-3 podium finish, you must achieve a 92.8% hit rate across the remaining 14 games. Zero room for low-confidence flyers.",
      tacticalPointers: ['Loss: -13 pts.', 'Ceiling: 123 pts.', 'Target: Conservative chalk sweep.'],
    },
    commishAdvice: {
      title: "Commish AI Status for Sir Limps-A-Lot",
      headline: "Danger Zone: Rank 11 in the League",
      stageDirections: '[deadpan monotone] [pause]',
      script:
        "[deadpan monotone] [pause] Status Alert: Sir Limps-A-Lot holds 6 points, trailing leader Orange crush by 20 points. High dependency on Sunday 1:00 PM slate.",
      tacticalPointers: ['Rank: 11.', 'Current Pts: 6.', 'Max: 123.'],
    },
  },
  {
    teamId: 'team-markk',
    teamName: 'markk',
    ownerName: 'markk',
    rank: 12,
    points: 6,
    avatar: 'M',
    color: '#64748B',
    isCurrentUser: false,
    damageGrade: 'D+ (Heavy Burn)',
    lossTotal: 13,
    maxRemaining: 123,
    goodPickSummary: 'Cashed 6 pts on Seattle',
    badPickSummary: 'Lost 13 confidence points on Rams',
    badge: '⚠️ -13 Pt Loss',
    badgeColor: 'bg-red-950 text-red-300 border-red-500/50',
    salAdvice: {
      title: "Coach Sal's Tough Love for markk",
      headline: "In da Basement at Rank 12, But 14 Games Left to Punch Back!",
      stageDirections: '[deep gravelly tone] [groans]',
      script:
        "[deep gravelly tone] [groans] markk! Losing 13 points on Los Angeles hurts like an unblocked blindside sack! You're tied for last place right now wit' 6 points. But it's Week 1, pal! Fourteen games is a whole lifetime in football! [shouting with passion] Don't throw in da towel! Lean on your double-digit home favorites on Sunday and crawl your way out of da cellar!",
      tacticalPointers: [
        '14 Games Pending: 117 points still up for grabs.',
        'Stay Patient: Do not make irrational desperation picks.',
        'Aim for Top 6: Stabilize before chasing 1st place.',
      ],
    },
    chloeAdvice: {
      title: "Dr. Chloe's Advice for markk",
      headline: "Variance Recovery Strategy for 12th Place",
      stageDirections: '[crisp analytical tone] [fast paced]',
      script:
        "[crisp analytical tone] [fast paced] markk, 13 points lost on LAR drops your ceiling to 123. Statistically, trailing by 20 points after two games is intimidating, but 84% of total pool points remain unearned. Stick to probability-weighted consensus.",
      tacticalPointers: ['Loss: -13 pts.', 'Ceiling: 123 pts.', 'Approach: High EV favorites.'],
    },
    commishAdvice: {
      title: "Commish AI Memo for markk",
      headline: "Basement Alert: Bottom Tier Notice",
      stageDirections: '[deadpan monotone] [pause]',
      script: "[deadpan monotone] [pause] markk is currently ranked 12th of 12 teams. Immediate turnaround required on Sunday.",
      tacticalPointers: ['Rank: 12.', 'Points: 6.', 'Ceiling: 123.'],
    },
  },
  {
    teamId: 'team-3d',
    teamName: '3-D',
    ownerName: '3-D',
    rank: 3,
    points: 13,
    avatar: '3',
    color: '#F59E0B',
    isCurrentUser: false,
    damageGrade: 'C+ (Heavy Blow)',
    lossTotal: 12,
    maxRemaining: 124,
    goodPickSummary: 'Cashed 13 pts on Seattle',
    badPickSummary: 'Lost 12 confidence points on Rams',
    badge: '🥉 Rank 3 Contender',
    badgeColor: 'bg-amber-950 text-amber-300 border-amber-500/50',
    salAdvice: {
      title: "Coach Sal's Advice for 3-D",
      headline: "13 Points Banked, But Watch Out for Todd Sneakin' Up Behind Ya!",
      stageDirections: '[chuckle] [clears throat]',
      script:
        "[chuckle] [clears throat] 3-D, you banked 13 big ones on Seattle! That's good football! But that 12-point ding on the Rams kept you from takin' over first place! You're in 3rd right now, which looks pretty on paper, but Todd Reimer is lurkin' in the weeds with all his heavy anchors ready to pounce! Keep your guards up!",
      tacticalPointers: [
        'Protect 3rd Place: Defend against managers with higher remaining ceilings.',
        'Watch Your Flank: Todd (127 max) and PatN (135 max) have superior upside.',
        'Execute Sunday Chalk: Detroit and LAC are critical.',
      ],
    },
    chloeAdvice: {
      title: "Dr. Chloe's Analysis for 3-D",
      headline: "Rank 3 Vulnerability: High Ceiling Threats Looming",
      stageDirections: '[deadpan] [crisp tone]',
      script:
        "[deadpan] [crisp tone] 3-D holds 13 points, but losing 12 points limits your ceiling to 124. Both Todd (127) and PatN (135) have higher maximum upside. You must avoid any further upsets on Sunday.",
      tacticalPointers: ['Current: 13 pts.', 'Loss: -12 pts.', 'Ceiling: 124 pts.'],
    },
    commishAdvice: {
      title: "Commish AI Note for 3-D",
      headline: "Podium Alert: Rank 3 Under Threat",
      stageDirections: '[deadpan monotone] [pause]',
      script: "[deadpan monotone] [pause] 3-D holds the bronze position. Projected drop if Todd sweeps Sunday afternoon.",
      tacticalPointers: ['Rank: 3.', 'Points: 13.', 'Ceiling: 124.'],
    },
  },
  {
    teamId: 'team-snap',
    teamName: 'Snap Judgments',
    ownerName: 'Snap Judgments',
    rank: 4,
    points: 12,
    avatar: 'J',
    color: '#14B8A6',
    isCurrentUser: false,
    damageGrade: 'C+ (Heavy Blow)',
    lossTotal: 11,
    maxRemaining: 125,
    goodPickSummary: 'Cashed 12 pts on Seattle',
    badPickSummary: 'Lost 11 confidence points on Rams',
    badge: '⚠️ -11 Pt Loss',
    badgeColor: 'bg-amber-950 text-amber-300 border-amber-500/50',
    salAdvice: {
      title: "Coach Sal's Advice for Snap Judgments",
      headline: "Don't Make Any 'Snap Judgments' on Sunday! Stick to da Fundamentals!",
      stageDirections: '[boisterous laugh] [shouting with passion]',
      script:
        "[boisterous laugh] [shouting with passion] Snap Judgments! 12 points in da bank puts you in 4th place. Losing 11 on the Rams hurts, but you're right in the thick of the fight. Don't go makin' wild snap judgments on Sunday morning! [emphasized] Trust your big confidence locks, run between the tackles, and stay in contention!",
      tacticalPointers: [
        'Steady The Ship: Avoid last-minute impulse changes before 1:00 PM kickoffs.',
        'Ceiling: 125 points allows podium potential.',
        'Target: Solidify 13, 14, 15, 16 anchors.',
      ],
    },
    chloeAdvice: {
      title: "Dr. Chloe's Advice for Snap Judgments",
      headline: "Model Consistency: Eliminating Heuristic Errors",
      stageDirections: '[crisp analytical tone] [short pause]',
      script:
        "[crisp analytical tone] [short pause] Snap Judgments sits at rank 4 with 12 points. An 11-point loss is within manageable standard error. Maintain discipline on heavy favorites.",
      tacticalPointers: ['Rank: 4.', 'Loss: -11 pts.', 'Ceiling: 125 pts.'],
    },
    commishAdvice: {
      title: "Commish AI Summary for Snap Judgments",
      headline: "Top 4 Hold: Rank 4 of 12",
      stageDirections: '[deadpan monotone] [pause]',
      script: "[deadpan monotone] [pause] Snap Judgments is 4th in the league with 12 points.",
      tacticalPointers: ['Points: 12.', 'Ceiling: 125.', 'Rank: 4.'],
    },
  },
  {
    teamId: 'team-torts',
    teamName: 'Torts Illustrated',
    ownerName: 'Torts Illustrated',
    rank: 5,
    points: 11,
    avatar: 'T',
    color: '#8B5CF6',
    isCurrentUser: false,
    damageGrade: 'C+ (Heavy Blow)',
    lossTotal: 12,
    maxRemaining: 124,
    goodPickSummary: 'Cashed 11 pts on Seattle',
    badPickSummary: 'Lost 12 confidence points on Rams',
    badge: '⚠️ -12 Pt Loss',
    badgeColor: 'bg-purple-950 text-purple-300 border-purple-500/50',
    salAdvice: {
      title: "Coach Sal's Advice for Torts Illustrated",
      headline: "Push da Pile on Sunday! Defense Wins Championships!",
      stageDirections: '[deep gravelly shout] [pause]',
      script:
        "[deep gravelly shout] [pause] Torts! You lost 12 on the Rams, but you cashed 11 on Seattle. You're in 5th place right in the middle of the pack. Keep your defense tight on Sunday. Push the pile, protect your 13 and 14 picks, and watch the guys ahead of you stumble!",
      tacticalPointers: ['Stay Solid: 124 max ceiling.', 'Hold Midfield: Cash 13-16 anchors.'],
    },
    chloeAdvice: {
      title: "Dr. Chloe's Advice for Torts Illustrated",
      headline: "Mid-Table Equilibrium: Variance Management",
      stageDirections: '[deadpan] [crisp tone]',
      script:
        "[deadpan] [crisp tone] Torts Illustrated holds 11 points at rank 5. Standard regression suggests sticking with high-probability home favorites on Sunday.",
      tacticalPointers: ['Rank: 5.', 'Loss: -12 pts.', 'Ceiling: 124 pts.'],
    },
    commishAdvice: {
      title: "Commish AI Note for Torts Illustrated",
      headline: "Mid-Pack Status in the League",
      stageDirections: '[deadpan monotone] [pause]',
      script: "[deadpan monotone] [pause] Torts Illustrated: 11 points banked, 124 max possible points.",
      tacticalPointers: ['Rank: 5.', 'Points: 11.', 'Ceiling: 124.'],
    },
  },
  {
    teamId: 'team-bigd',
    teamName: 'BigD',
    ownerName: 'BigD',
    rank: 6,
    points: 10,
    avatar: 'D',
    color: '#06B6D4',
    isCurrentUser: false,
    damageGrade: 'C (Heavy Blow)',
    lossTotal: 12,
    maxRemaining: 124,
    goodPickSummary: 'Cashed 10 pts on Seattle',
    badPickSummary: 'Lost 12 confidence points on Rams',
    badge: '⚠️ -12 Pt Loss',
    badgeColor: 'bg-cyan-950 text-cyan-300 border-cyan-500/50',
    salAdvice: {
      title: "Coach Sal's Advice for BigD",
      headline: "Gut-Check Time! Lean on Detroit & Philly to Stop da Bleeding!",
      stageDirections: '[shouting with intensity] [clears throat]',
      script:
        "[shouting with intensity] BigD! [clears throat] Ten points in the bank, 12 points burned on the Rams. Sunday is gut-check time, pal! Lean on Detroit and Philadelphia to stop the bleeding. Play tough trench football and climb back into the top three!",
      tacticalPointers: ['Gut Check: Defend top anchors.', 'Ceiling: 124 points.'],
    },
    chloeAdvice: {
      title: "Dr. Chloe's Advice for BigD",
      headline: "Stabilization Model: Protecting Core Equity",
      stageDirections: '[crisp analytical tone] [short pause]',
      script:
        "[crisp analytical tone] [short pause] BigD holds 10 points. Avoid secondary upset gambits until Sunday afternoon variance materializes.",
      tacticalPointers: ['Loss: -12 pts.', 'Ceiling: 124 pts.'],
    },
    commishAdvice: {
      title: "Commish AI Summary for BigD",
      headline: "Rank 6 Notice",
      stageDirections: '[deadpan monotone] [pause]',
      script: "[deadpan monotone] [pause] BigD sits in 6th place with 10 points.",
      tacticalPointers: ['Rank: 6.', 'Points: 10.'],
    },
  },
  {
    teamId: 'team-bird',
    teamName: 'Bird Boss',
    ownerName: 'Bird Boss',
    rank: 10,
    points: 6,
    avatar: 'B',
    color: '#6366F1',
    isCurrentUser: false,
    damageGrade: 'D+ (Heavy Burn)',
    lossTotal: 10,
    maxRemaining: 126,
    goodPickSummary: 'Cashed 6 pts on Seattle',
    badPickSummary: 'Lost 10 confidence points on Rams',
    badge: '⚠️ -10 Pt Loss',
    badgeColor: 'bg-indigo-950 text-indigo-300 border-indigo-500/50',
    salAdvice: {
      title: "Coach Sal's Advice for Bird Boss",
      headline: "Fire Up Dem Wings and Climb Back into da Top Half!",
      stageDirections: '[deep gravelly chuckle] [pause]',
      script:
        "[deep gravelly chuckle] [pause] Bird Boss, you only cashed 6 on Seattle and lost 10 on the Rams. You're in 10th place right now, but 14 games is plenty of time to take flight! Fire up your remaining anchors on Sunday and climb back into the top half of the league!",
      tacticalPointers: ['126 Max Ceiling: Still higher than Shoeman.', 'Rebound on Sunday.'],
    },
    chloeAdvice: {
      title: "Dr. Chloe's Advice for Bird Boss",
      headline: "Underrated Upside: 126 Maximum Ceiling",
      stageDirections: '[crisp analytical tone] [fast paced]',
      script:
        "[crisp analytical tone] [fast paced] Bird Boss holds 6 points, but with only 10 points lost, your ceiling of 126 is superior to 3rd place 3-D (124). High upside if you sweep Sunday.",
      tacticalPointers: ['Ceiling: 126 pts.', 'Rank: 10.'],
    },
    commishAdvice: {
      title: "Commish AI Note for Bird Boss",
      headline: "Sleeping Upside Alert: 126 Max Points",
      stageDirections: '[deadpan monotone] [pause]',
      script: "[deadpan monotone] [pause] Bird Boss retains a 126 maximum point ceiling despite 10th place rank.",
      tacticalPointers: ['Ceiling: 126.', 'Rank: 10.'],
    },
  },
];

export function getPickerAdviceProfile(teamId: string): PickerAdviceProfile {
  return INDIVIDUAL_PICKERS_ADVICE.find(p => p.teamId === teamId) || INDIVIDUAL_PICKERS_ADVICE[0];
}

export function getPickerSpeakerAdvice(
  teamId: string,
  speaker: 'sal' | 'chloe' | 'commish'
): {
  title: string;
  headline: string;
  stageDirections: string;
  script: string;
  tacticalPointers: string[];
} {
  const profile = getPickerAdviceProfile(teamId);
  if (speaker === 'chloe') return profile.chloeAdvice;
  if (speaker === 'commish') return profile.commishAdvice;
  return profile.salAdvice;
}
