export interface RecommendedGamePick {
  matchup: string;
  recommendedTeam: string;
  confidencePoints: number;
  tier: 'Anchor (14-16)' | 'Core (8-13)' | 'Leverage/Hedge (1-7)';
  spread: string;
  rationale: string;
}

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
  recommendedPicks: RecommendedGamePick[];
  salAdvice: {
    title: string;
    script: string;
    stageDirections: string;
    tacticalPointers: string[];
    headline: string;
    recommendedPicks?: RecommendedGamePick[];
  };
  chloeAdvice: {
    title: string;
    script: string;
    stageDirections: string;
    tacticalPointers: string[];
    headline: string;
    recommendedPicks?: RecommendedGamePick[];
  };
  commishAdvice: {
    title: string;
    script: string;
    stageDirections: string;
    tacticalPointers: string[];
    headline: string;
    recommendedPicks?: RecommendedGamePick[];
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
    recommendedPicks: [
      {
        matchup: 'BUF vs LAC',
        recommendedTeam: 'BUF',
        confidencePoints: 16,
        tier: 'Anchor (14-16)',
        spread: 'BUF -7.0 vs LAC',
        rationale: 'Trench dominance: Bills interior run offense overpowers Chargers defensive front with 84% win probability.',
      },
      {
        matchup: 'KC vs MIA',
        recommendedTeam: 'KC',
        confidencePoints: 15,
        tier: 'Anchor (14-16)',
        spread: 'KC -11.5 vs MIA',
        rationale: 'Elite home floor: Mahomes and Spagnuolo defense carry an 89% modeled Bayesian win curve against backup Miami QB.',
      },
      {
        matchup: 'DET vs NYJ',
        recommendedTeam: 'DET',
        confidencePoints: 14,
        tier: 'Anchor (14-16)',
        spread: 'DET -6.5 vs NYJ',
        rationale: 'Line of scrimmage control: Lions offensive line limits short-field turnovers and secures clock tempo indoors.',
      },
      {
        matchup: 'BAL @ DAL',
        recommendedTeam: 'BAL',
        confidencePoints: 9,
        tier: 'Core (8-13)',
        spread: 'BAL -3.0 @ DAL',
        rationale: 'High-leverage road hammer: Lamar Jackson and Derrick Henry exploit Dallas run defense vulnerability to leapfrog field.',
      },
    ],
    salAdvice: {
      title: "Coach Sal's Master Advice for Todd Reimer",
      headline: "Lock Your 16 on Buffalo & 15 on KC: Your Sleeping Giant is Waking Up!",
      stageDirections: '[clears throat] [deep gravelly Ditka shout]',
      script:
        "[clears throat] [deep gravelly Ditka tone] Hey Todd! Coach Sal comin' to ya from Vito & Sal's Beef on 35th and Halsted! [pause] Listen to me very carefully: do NOT look at dat 8th place rank and get discouraged! Droppin' 9 points on da Rams was a superficial flesh wound because your heavy artillery is 100% intact! In this next week, look at Buffalo hostin' the Chargers: based on our trench dominance strategy, I would put sixteen points on Josh Allen and da Bills (-7.0 vs LAC). Next, look at Kansas City hostin' Miami (-11.5)—lock fifteen points on Mahomes at Arrowhead. Then look at Detroit at home against the Jets (-6.5)—put fourteen points on da Lions because their offensive line will maul that defensive front! And for your tactical leverage pivot, look at Baltimore visitin' Dallas (-3.0)—I would put nine points on Lamar Jackson and Derrick Henry to run straight through Dallas's soft middle! That gives you 54 points on rock-solid trench winners while dese other clowns panic! Stay disciplined, eat a combo dipped wit' hot giardiniera, and let's take first place!",
      tacticalPointers: [
        'MATCHUP 1 (16 PTS): Put 16 points on BUF (-7.0 vs LAC) — dominant offensive line advantage and 84% win probability.',
        'MATCHUP 2 (15 PTS): Put 15 points on KC (-11.5 vs MIA) — elite home floor with 89% modeled Bayesian win probability.',
        'MATCHUP 3 (14 PTS): Put 14 points on DET (-6.5 vs NYJ) — line of scrimmage control and turnover margin indoors at Ford Field.',
        'MATCHUP 4 (9 PTS): Put 9 points on BAL (-3.0 @ DAL) — positive rushing EPA matchup to leapfrog complacent pool leaders.',
      ],
    },
    chloeAdvice: {
      title: "Dr. Chloe's Algorithmic Briefing for Todd Reimer",
      headline: "Optimized Week 3 Slate: 54-Point High-Efficiency Anchor Cluster",
      stageDirections: '[crisp analytical tone] [fast paced]',
      script:
        "[fast paced] [crisp analytical tone] Todd, algorithmic congratulations. While novice managers fixate on raw current points, our Monte Carlo simulation identifies your portfolio as the single most lethal sleeping giant in the league. For Week 3 portfolio construction, here are the specific mathematical allocations: First, look at Buffalo (-7.0 vs LAC): based on an 84.2% modeled win probability, allocate 16 confidence points to Buffalo. Second, look at Kansas City (-11.5 vs MIA): based on an 89.1% Bayesian floor, allocate 15 confidence points to the Chiefs. Third, look at Detroit (-6.5 vs NYJ): allocate 14 points to the Lions given their +0.18 EPA per rush advantage. Finally, look at Baltimore at Dallas (-3.0): allocate 9 points to Baltimore to harvest closing line value against public consensus. Execute without emotional deviation on Sunday.",
      tacticalPointers: [
        'Expected Value (EV): +14.2 net points over pool median across the Week 3 pending slate.',
        'Specific 16-Pt Hammer: BUF (-7.0) carries an 84.2% modeled win probability vs LAC.',
        'Specific 15-Pt Anchor: KC (-11.5) provides the safest statistical floor on the board.',
        'Specific 9-Pt Leverage: BAL (-3.0 @ DAL) exploits market mispricing on Dallas run defense.',
      ],
    },
    commishAdvice: {
      title: "Commish AI Carnage Ruling for Todd Reimer",
      headline: "Stat Anomaly: 8th Place with #1 Recovery Index (127 Max)",
      stageDirections: '[deadpan monotone] [pause]',
      script:
        "[deadpan monotone] [pause] Official pool directive for Todd Reimer: Week 3 capital allocation mandates 16 points on Buffalo, 15 points on Kansas City, 14 points on Detroit, and 9 points on Baltimore. Locking these 54 points before kickoff maximizes your clinch probability and protects your 127-point league-leading ceiling.",
      tacticalPointers: [
        'Directive 1: Allocate 16 points to BUF (-7.0 vs LAC).',
        'Directive 2: Allocate 15 points to KC (-11.5 vs MIA).',
        'Directive 3: Allocate 14 points to DET (-6.5 vs NYJ).',
        'Directive 4: Allocate 9 points to BAL (-3.0 @ DAL).',
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
    recommendedPicks: [
      {
        matchup: 'KC vs MIA',
        recommendedTeam: 'KC',
        confidencePoints: 16,
        tier: 'Anchor (14-16)',
        spread: 'KC -11.5 vs MIA',
        rationale: 'Maximum chalk defense: Lock the heaviest favorite on the board to protect your 18-point first place cushion.',
      },
      {
        matchup: 'SF vs ARI',
        recommendedTeam: 'SF',
        confidencePoints: 15,
        tier: 'Anchor (14-16)',
        spread: 'SF -8.5 vs ARI',
        rationale: 'Consensus home anchor: 49ers offensive efficiency and defensive line provide a high-floor divisional mismatch.',
      },
      {
        matchup: 'BUF vs LAC',
        recommendedTeam: 'BUF',
        confidencePoints: 14,
        tier: 'Anchor (14-16)',
        spread: 'BUF -7.0 vs LAC',
        rationale: 'Conservative lead protection: Deny trailing chasers room to close the margin by matching market favorites.',
      },
      {
        matchup: 'GB vs ATL',
        recommendedTeam: 'GB',
        confidencePoints: 10,
        tier: 'Core (8-13)',
        spread: 'GB -6.0 vs ATL',
        rationale: 'Lambeau home field advantage: Jordan Love at home against an inconsistent Falcons pass rush.',
      },
    ],
    salAdvice: {
      title: "Coach Sal's Advice for Leader Orange crush",
      headline: "Defend da Lead! Put 16 on KC & 15 on San Fran: Don't Get Cute!",
      stageDirections: '[boisterous chuckle] [clears throat]',
      script:
        "[boisterous laugh] Orange crush! Twenty-six points in da bank! Hats off to ya for that Niners upset, but listen to Coach Sal: leaders who get cute end up cryin' in their beer! In this next week, look at Kansas City hostin' Miami (-11.5): based on our lead-protection strategy, I would put your maximum sixteen points on Patrick Mahomes. Next, look at San Francisco hostin' Arizona (-8.5): put fifteen points on Kyle Shanahan and da Niners. Then look at Buffalo hostin' the Chargers (-7.0): put fourteen points on Josh Allen. And look at Green Bay hostin' Atlanta (-6.0): put ten points on da Packers at Lambeau Field. Do NOT gamble on sketchy underdogs when you got an 18-point cushion! Play your chalk and choke out the competition!",
      tacticalPointers: [
        'MATCHUP 1 (16 PTS): Put 16 points on KC (-11.5 vs MIA) — safest anchor on the board to defend #1 rank.',
        'MATCHUP 2 (15 PTS): Put 15 points on SF (-8.5 vs ARI) — divisional home favorite with 82% win probability.',
        'MATCHUP 3 (14 PTS): Put 14 points on BUF (-7.0 vs LAC) — deny chasers leverage by locking top tier.',
        'MATCHUP 4 (10 PTS): Put 10 points on GB (-6.0 vs ATL) — Lambeau crowd noise limits offensive turnaround.',
      ],
    },
    chloeAdvice: {
      title: "Dr. Chloe's Advice for Orange crush",
      headline: "Chalk Fortification Strategy: Neutralize Trailing Field",
      stageDirections: '[sarcastic] [dry chuckle]',
      script:
        "[sarcastic] [dry chuckle] Orange crush, having banked 26 points, your game-theoretic objective is strict variance compression. In this coming week, allocate 16 points to Kansas City (-11.5 vs MIA), 15 points to San Francisco (-8.5 vs ARI), 14 points to Buffalo (-7.0 vs LAC), and 10 points to Green Bay (-6.0 vs ATL). By mirroring consensus win probabilities on top-tier favorites, you guarantee that trailing managers cannot close the gap without taking negative-EV risks.",
      tacticalPointers: [
        'Strategy: Variance compression — zero underdog exposure.',
        'Allocation: 16 on KC, 15 on SF, 14 on BUF, 10 on GB.',
        'Target: Protect 18-point lead through mathematical symmetry.',
      ],
    },
    commishAdvice: {
      title: "Commish AI Warning for Orange crush",
      headline: "Target Acquired: 11 Chasers Hunting Your Podium",
      stageDirections: '[stern monotone robotic delivery] [short pause]',
      script:
        "[stern monotone robotic delivery] [short pause] Commission Notice for Orange crush: Capital allocation strategy requires placing 16 points on KC, 15 on SF, 14 on BUF, and 10 on GB. Any high-confidence divergence from consensus favorites mathematically increases your vulnerability to rank decay.",
      tacticalPointers: [
        'Lock: 16 on KC (-11.5 vs MIA).',
        'Lock: 15 on SF (-8.5 vs ARI).',
        'Lock: 14 on BUF (-7.0 vs LAC).',
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
    recommendedPicks: [
      {
        matchup: 'KC vs MIA',
        recommendedTeam: 'KC',
        confidencePoints: 15,
        tier: 'Anchor (14-16)',
        spread: 'KC -11.5 vs MIA',
        rationale: 'Mandatory capital preservation: Lock your sole remaining 15-point hammer on the biggest favorite on the board.',
      },
      {
        matchup: 'BUF vs LAC',
        recommendedTeam: 'BUF',
        confidencePoints: 14,
        tier: 'Anchor (14-16)',
        spread: 'BUF -7.0 vs LAC',
        rationale: 'Baseline stabilization: Bills run offense provides a steady 14-point foundation before executing leverage pivots.',
      },
      {
        matchup: 'BAL @ DAL',
        recommendedTeam: 'DAL',
        confidencePoints: 9,
        tier: 'Core (8-13)',
        spread: 'DAL +3.0 vs BAL',
        rationale: 'Asymmetric chaos pivot: With your 120 ceiling, fading public consensus on Baltimore swings 18 net points against Todd.',
      },
      {
        matchup: 'MIN vs TB',
        recommendedTeam: 'MIN',
        confidencePoints: 7,
        tier: 'Leverage/Hedge (1-7)',
        spread: 'MIN -1.5 vs TB',
        rationale: 'Contrarian leverage: Brian Flores blitz packages generate high turnover variance against Baker Mayfield.',
      },
    ],
    salAdvice: {
      title: "Coach Sal's Emergency Roast & Advice for Shoeman",
      headline: "Your 16-Point Anchor Burned: Time for a 9-Point Chaos Pivot on Dallas!",
      stageDirections: '[groans in agony] [heavy sigh]',
      script:
        "[groans in agony] [heavy sigh] Shoeman... marone, my stomach hurts just lookin' at that incinerated 16-point anchor on da Rams! You're sittin' at Rank 2 on paper, but your ceiling is capped at 120 points! Playing chalk guarantees you finish out of the money! Here is your survival medicine: In this next week, look at Kansas City (-11.5 vs MIA)—lock fifteen points on Mahomes to stop the bleeding. Look at Buffalo (-7.0 vs LAC)—put fourteen points on the Bills. But now, here is where you make your move: look at Dallas hostin' Baltimore (+3.0)—based on our chaos catch-up strategy, I would put nine points on the Cowboys! If Dallas pulls the home upset, you pick up 18 net points on Todd and the rest of the pool in one shot! And look at Minnesota (-1.5 vs TB)—put seven points on the Vikings defense. That's your only ticket back to the podium!",
      tacticalPointers: [
        'MATCHUP 1 (15 PTS): Put 15 points on KC (-11.5 vs MIA) — preserve remaining high anchor.',
        'MATCHUP 2 (14 PTS): Put 14 points on BUF (-7.0 vs LAC) — bank reliable home points.',
        'MATCHUP 3 (9 PTS CHAOS PIVOT): Put 9 points on DAL (+3.0 vs BAL) — high-leverage contrarian play to swing 18 net points.',
        'MATCHUP 4 (7 PTS): Put 7 points on MIN (-1.5 vs TB) — defensive pressure creates turnover upside.',
      ],
    },
    chloeAdvice: {
      title: "Dr. Chloe's Damage Report for Shoeman",
      headline: "Mathematical Cap at 120: Asymmetric Dallas Pivot Required",
      stageDirections: '[somber tone] [heavy sigh]',
      script:
        "[somber tone] [heavy sigh] Shoeman, losing your 16-point anchor reduced your podium probability to 8.4%. Standard chalk execution ensures an expected 8th place finish. To engineer a statistical recovery in Week 3, allocate 15 points to KC and 14 to BUF to establish a floor. Then, allocate 9 points to Dallas (+3.0 vs BAL) and 7 points to Minnesota (-1.5 vs TB). The Dallas allocation provides a +2.18 leverage multiple against the field.",
      tacticalPointers: [
        'Ceiling Constraint: 120 maximum possible points.',
        'Core Locks: 15 on KC (-11.5), 14 on BUF (-7.0).',
        'Leverage Strike: 9 on DAL (+3.0 vs BAL) to capture asymmetric upside.',
      ],
    },
    commishAdvice: {
      title: "Commish AI Carnage Alert for Shoeman",
      headline: "Highest Individual Anchor Loss: Strategy Shift Mandatory",
      stageDirections: '[deadpan monotone] [dramatic pause]',
      script:
        "[deadpan monotone] [dramatic pause] Pool notice for Shoeman: With a 120 maximum ceiling, mathematical modeling indicates you must deviate from consensus on at least two games. Recommend 15 points on KC, 14 on BUF, 9 on DAL, and 7 on MIN.",
      tacticalPointers: [
        'Preserve: 15 on KC, 14 on BUF.',
        'Diverge: 9 on DAL, 7 on MIN.',
      ],
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
    recommendedPicks: [
      {
        matchup: 'BUF vs LAC',
        recommendedTeam: 'BUF',
        confidencePoints: 16,
        tier: 'Anchor (14-16)',
        spread: 'BUF -7.0 vs LAC',
        rationale: 'Unleash the 16-point hammer: You preserved your ceiling, now cash the top favorite at Highmark Stadium.',
      },
      {
        matchup: 'KC vs MIA',
        recommendedTeam: 'KC',
        confidencePoints: 15,
        tier: 'Anchor (14-16)',
        spread: 'KC -11.5 vs MIA',
        rationale: 'Safe double-digit return: Chiefs at Arrowhead give you a near-flawless 15-point investment.',
      },
      {
        matchup: 'DET vs NYJ',
        recommendedTeam: 'DET',
        confidencePoints: 14,
        tier: 'Anchor (14-16)',
        spread: 'DET -6.5 vs NYJ',
        rationale: 'Pound the rock: Lions offensive line win rate exceeds 82% against depleted Jets defensive interior.',
      },
      {
        matchup: 'SEA vs WSH',
        recommendedTeam: 'SEA',
        confidencePoints: 11,
        tier: 'Core (8-13)',
        spread: 'SEA -7.0 vs Wsh',
        rationale: 'Lumen Field noise: Geno Smith and Seahawks defense exploit Washington rookie secondary.',
      },
    ],
    salAdvice: {
      title: "Coach Sal's Salute & Advice for PatN (BroncosCountry)",
      headline: "Dat 1-Point Hedge Was Genius! Now Put 16 on Buffalo & 15 on KC!",
      stageDirections: '[boisterous laugh] [shouting with pride]',
      script:
        "[boisterous laugh] [shouting with pride] PatN! BroncosCountry! That one-point hedge on the Rams was pure South-Side genius! You only lost one measly point, leaving you with 135 maximum points—the highest ceiling in the league! Now it's time to cash your chips! In this next week, look at Buffalo hostin' the Chargers (-7.0): based on our preserved capital strategy, I would unleash your sixteen-point hammer on Josh Allen and da Bills! Next, look at Kansas City hostin' Miami (-11.5)—lock fifteen points on Mahomes. Then look at Detroit hostin' the Jets (-6.5)—put fourteen points on da Lions' offensive line. And look at Seattle hostin' Washington (-7.0)—put eleven points on the Seahawks at Lumen Field! You got 56 points locked on heavy home favorites. Cash 'em and take over the league!",
      tacticalPointers: [
        'MATCHUP 1 (16 PTS): Put 16 points on BUF (-7.0 vs LAC) — unleash your preserved top anchor.',
        'MATCHUP 2 (15 PTS): Put 15 points on KC (-11.5 vs MIA) — bank high-probability home points.',
        'MATCHUP 3 (14 PTS): Put 14 points on DET (-6.5 vs NYJ) — offensive line superiority.',
        'MATCHUP 4 (11 PTS): Put 11 points on SEA (-7.0 vs Wsh) — 12th man advantage against rookie QB.',
      ],
    },
    chloeAdvice: {
      title: "Dr. Chloe's Strategic Audit for PatN",
      headline: "Optimal Risk-Mitigation Model: Unleash Top-Tier Capital",
      stageDirections: '[crisp analytical tone] [short pause]',
      script:
        "[crisp analytical tone] [short pause] PatN, your 99.3% capital retention represents the premier portfolio in the pool. In Week 3, allocate your anchor tiers as follows: 16 points to Buffalo (-7.0 vs LAC), 15 points to Kansas City (-11.5 vs MIA), 14 points to Detroit (-6.5 vs NYJ), and 11 points to Seattle (-7.0 vs WSH). This 56-point cluster has an aggregate 83.1% probability of sweeping.",
      tacticalPointers: [
        'Ceiling: 135 points intact.',
        'Optimal Allocations: 16 BUF, 15 KC, 14 DET, 11 SEA.',
        'Win Probability: Combined 83.1% sweep probability across top 4.',
      ],
    },
    commishAdvice: {
      title: "Commish AI Efficiency Award for PatN",
      headline: "Steel Armor Badge: 99.3% Capital Preserved",
      stageDirections: '[deadpan monotone] [pause]',
      script:
        "[deadpan monotone] [pause] PatN holds the premier mathematical runway. Recommended Week 3 execution: 16 on BUF, 15 on KC, 14 on DET, and 11 on SEA.",
      tacticalPointers: ['Preservation: 135 ceiling.', 'Recommended: 16 BUF, 15 KC, 14 DET, 11 SEA.'],
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
    recommendedPicks: [
      {
        matchup: 'SF vs ARI',
        recommendedTeam: 'SF',
        confidencePoints: 16,
        tier: 'Anchor (14-16)',
        spread: 'SF -8.5 vs ARI',
        rationale: 'Redemption anchor: Put your maximum 16 points on your 49ers at home to heal your soul and your scorecard.',
      },
      {
        matchup: 'BUF vs LAC',
        recommendedTeam: 'BUF',
        confidencePoints: 15,
        tier: 'Anchor (14-16)',
        spread: 'BUF -7.0 vs LAC',
        rationale: 'Rock-solid support: Josh Allen at Highmark Stadium against a banged-up Chargers secondary.',
      },
      {
        matchup: 'KC vs MIA',
        recommendedTeam: 'KC',
        confidencePoints: 14,
        tier: 'Anchor (14-16)',
        spread: 'KC -11.5 vs MIA',
        rationale: 'Discipline restoration: Stop second-guessing and ride the top favorite on the board.',
      },
      {
        matchup: 'JAX vs NE',
        recommendedTeam: 'JAX',
        confidencePoints: 8,
        tier: 'Core (8-13)',
        spread: 'JAX -3.0 vs NE',
        rationale: 'Bounce-back play: Trevor Lawrence handles Patriots rebuilding offense in humid Jacksonville conditions.',
      },
    ],
    salAdvice: {
      title: "Coach Sal's Roast & Rehabilitation for Niner Faithful",
      headline: "Redeem Yourself! Put 16 on San Fran & 15 on Buffalo: Never Betray Your Squad Again!",
      stageDirections: '[shouting with rage] [groans in agony]',
      script:
        "[shouting with rage] Niner Faithful! What in da name of Mike Singletary were you thinkin' putting eleven points on the Rams against your own 49ers?! [groans] You watched your team win and lost eleven points! That's clown behavior! Here is your redemption therapy: In this next week, look at San Francisco hostin' Arizona (-8.5): based on our squad loyalty and trench strategy, I would put your maximum sixteen points on Kyle Shanahan and da Niners! Next, look at Buffalo hostin' the Chargers (-7.0)—put fifteen points on Josh Allen. Then look at Kansas City hostin' Miami (-11.5)—lock fourteen points on Mahomes. And look at Jacksonville hostin' New England (-3.0)—put eight points on the Jags. Stop outthinking yourself and pick your winners with conviction!",
      tacticalPointers: [
        'MATCHUP 1 (16 PTS REDEMPTION): Put 16 points on SF (-8.5 vs ARI) — maximum confidence on your own team.',
        'MATCHUP 2 (15 PTS): Put 15 points on BUF (-7.0 vs LAC) — Highmark Stadium trench control.',
        'MATCHUP 3 (14 PTS): Put 14 points on KC (-11.5 vs MIA) — stop second-guessing consensus chalk.',
        'MATCHUP 4 (8 PTS): Put 8 points on JAX (-3.0 vs NE) — defensive advantage against rookie QB.',
      ],
    },
    chloeAdvice: {
      title: "Dr. Chloe's Behavioral Finance Audit for Niner Faithful",
      headline: "Cognitive Dissonance Repair: Re-Aligning with True Win Probabilities",
      stageDirections: '[sarcastic tone] [dry chuckle]',
      script:
        "[sarcastic tone] [dry chuckle] Niner Faithful, your emotional hedge cost you 11 points. Recalibrate your cognitive bias in Week 3 with objective mathematics: allocate 16 points to San Francisco (-8.5 vs ARI, 81.8% win probability), 15 points to Buffalo (-7.0 vs LAC, 84.2%), 14 points to Kansas City (-11.5 vs MIA, 89.1%), and 8 points to Jacksonville (-3.0 vs NE). This restores positive expected value to your portfolio.",
      tacticalPointers: [
        'Bias Repair: Re-align confidence strictly with objective win probability.',
        'Allocations: 16 SF, 15 BUF, 14 KC, 8 JAX.',
        'Target: Reclaim top-half positioning.',
      ],
    },
    commishAdvice: {
      title: "Commish AI Irony Citation for Niner Faithful",
      headline: "Judas Trophy Notice: Rehabilitation Protocol",
      stageDirections: '[deadpan monotone] [pause]',
      script:
        "[deadpan monotone] [pause] Rehabilitation directive for Niner Faithful: Pool rules suggest allocating 16 points to SF (-8.5), 15 to BUF (-7.0), 14 to KC (-11.5), and 8 to JAX (-3.0) to eliminate self-sabotage.",
      tacticalPointers: ['Protocol: 16 SF, 15 BUF, 14 KC, 8 JAX.'],
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
    recommendedPicks: [
      {
        matchup: 'KC vs MIA',
        recommendedTeam: 'KC',
        confidencePoints: 16,
        tier: 'Anchor (14-16)',
        spread: 'KC -11.5 vs MIA',
        rationale: 'Stop the bleeding: Bank maximum points on the safest double-digit favorite to climb out of 11th place.',
      },
      {
        matchup: 'BUF vs LAC',
        recommendedTeam: 'BUF',
        confidencePoints: 15,
        tier: 'Anchor (14-16)',
        spread: 'BUF -7.0 vs LAC',
        rationale: 'Trench security: Protect your remaining high confidence buckets with Buffalo at Highmark Stadium.',
      },
      {
        matchup: 'DET vs NYJ',
        recommendedTeam: 'DET',
        confidencePoints: 14,
        tier: 'Anchor (14-16)',
        spread: 'DET -6.5 vs NYJ',
        rationale: 'Ground-and-pound: Detroit at Ford Field limits turnover disaster and secures clock control.',
      },
      {
        matchup: 'PHI vs CHI',
        recommendedTeam: 'PHI',
        confidencePoints: 10,
        tier: 'Core (8-13)',
        spread: 'PHI -3.5 vs Chi',
        rationale: 'Defensive front advantage: Eagles defensive line pressures young Bears offense in prime time.',
      },
    ],
    salAdvice: {
      title: "Coach Sal's Advice for Sir Limps-A-Lot",
      headline: "Thirteen Points Burned! Lock 16 on KC, 15 on BUF, and Stop Limpin'!",
      stageDirections: '[shouting with fury] [heavy sigh]',
      script:
        "[shouting with fury] Sir Limps-A-Lot, you're limpin' alright! [heavy sigh] Thirteen points on the Rams went straight down the sewer! You're sittin' at Rank 11 with 6 points, but your 14, 15, and 16 anchors are still alive! In this next week, look at Kansas City hostin' Miami (-11.5): based on our stop-the-bleeding strategy, I would put sixteen points on Patrick Mahomes at Arrowhead! Next, look at Buffalo hostin' the Chargers (-7.0)—put fifteen points on Josh Allen and da Bills. Then look at Detroit hostin' the Jets (-6.5)—put fourteen points on Dan Campbell's offensive line! And look at Philly hostin' the Bears (-3.5)—put ten points on the Eagles' pass rush! That locks 55 points on heavy favorites. Sweep Sunday and get out of the cellar!",
      tacticalPointers: [
        'MATCHUP 1 (16 PTS): Put 16 points on KC (-11.5 vs MIA) — stop the bleeding with top anchor.',
        'MATCHUP 2 (15 PTS): Put 15 points on BUF (-7.0 vs LAC) — reliable trench winner.',
        'MATCHUP 3 (14 PTS): Put 14 points on DET (-6.5 vs NYJ) — high-floor indoor offense.',
        'MATCHUP 4 (10 PTS): Put 10 points on PHI (-3.5 vs Chi) — defensive front pressure against rookie QB.',
      ],
    },
    chloeAdvice: {
      title: "Dr. Chloe's Analysis for Sir Limps-A-Lot",
      headline: "Basement Turnaround Protocol: 55-Point High-Probability Cluster",
      stageDirections: '[deadpan] [fast paced]',
      script:
        "[deadpan] [fast paced] Sir Limps-A-Lot, with a 123 maximum ceiling, you need a 92.8% hit rate across the slate. Allocate 16 points to KC (-11.5), 15 points to BUF (-7.0), 14 points to DET (-6.5), and 10 points to PHI (-3.5). Zero room for speculative flyers until stability is restored.",
      tacticalPointers: ['Allocations: 16 KC, 15 BUF, 14 DET, 10 PHI.', 'Target: Stabilize Rank 11.'],
    },
    commishAdvice: {
      title: "Commish AI Status for Sir Limps-A-Lot",
      headline: "Danger Zone: Rank 11 in the League",
      stageDirections: '[deadpan monotone] [pause]',
      script:
        "[deadpan monotone] [pause] Sir Limps-A-Lot status alert: Allocate 16 on KC, 15 on BUF, 14 on DET, and 10 on PHI to arrest downward trajectory.",
      tacticalPointers: ['Mandatory: 16 KC, 15 BUF, 14 DET, 10 PHI.'],
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
    recommendedPicks: [
      {
        matchup: 'KC vs MIA',
        recommendedTeam: 'KC',
        confidencePoints: 16,
        tier: 'Anchor (14-16)',
        spread: 'KC -11.5 vs MIA',
        rationale: 'Basement escape: Secure the top favorite on the board with maximum confidence to start your comeback.',
      },
      {
        matchup: 'SF vs ARI',
        recommendedTeam: 'SF',
        confidencePoints: 15,
        tier: 'Anchor (14-16)',
        spread: 'SF -8.5 vs ARI',
        rationale: 'High floor: Shanahan scheme against divisional opponent Arizona provides reliable double-digit value.',
      },
      {
        matchup: 'BUF vs LAC',
        recommendedTeam: 'BUF',
        confidencePoints: 14,
        tier: 'Anchor (14-16)',
        spread: 'BUF -7.0 vs LAC',
        rationale: 'Trench control: Buffalo at home overpowers Chargers offensive line.',
      },
      {
        matchup: 'BAL @ DAL',
        recommendedTeam: 'BAL',
        confidencePoints: 9,
        tier: 'Core (8-13)',
        spread: 'BAL -3.0 @ DAL',
        rationale: 'Calculated jump: Jackson and Henry run game outmuscles Dallas to begin climbing from 12th place.',
      },
    ],
    salAdvice: {
      title: "Coach Sal's Tough Love for markk",
      headline: "In da Basement at Rank 12: Put 16 on KC, 15 on SF, and Punch Your Way Out!",
      stageDirections: '[deep gravelly tone] [groans]',
      script:
        "[deep gravelly tone] [groans] markk! Losing 13 points on Los Angeles hurts like an unblocked blindside sack! You're tied for last place right now with 6 points, but it's early! In this next week, look at Kansas City hostin' Miami (-11.5): based on our basement-escape strategy, I would put sixteen points on Patrick Mahomes. Next, look at San Francisco hostin' Arizona (-8.5)—put fifteen points on Kyle Shanahan and da Niners. Then look at Buffalo hostin' the Chargers (-7.0)—put fourteen points on Josh Allen. And look at Baltimore visitin' Dallas (-3.0)—put nine points on Lamar Jackson and Derrick Henry to run straight over Dallas! That's 54 points on proven winners. Stand up, punch back, and get out of the cellar!",
      tacticalPointers: [
        'MATCHUP 1 (16 PTS): Put 16 points on KC (-11.5 vs MIA) — lock safest favorite on the board.',
        'MATCHUP 2 (15 PTS): Put 15 points on SF (-8.5 vs ARI) — high-efficiency divisional home anchor.',
        'MATCHUP 3 (14 PTS): Put 14 points on BUF (-7.0 vs LAC) — trench dominance at Highmark Stadium.',
        'MATCHUP 4 (9 PTS): Put 9 points on BAL (-3.0 @ DAL) — ground game advantage against suspect run defense.',
      ],
    },
    chloeAdvice: {
      title: "Dr. Chloe's Advice for markk",
      headline: "Basement Turnaround: High-EV Consensus Strategy",
      stageDirections: '[crisp analytical tone] [fast paced]',
      script:
        "[crisp analytical tone] [fast paced] markk, trailing by 20 points after two games is intimidating, but 84% of total pool scoring remains unearned. In Week 3, allocate 16 points to KC (-11.5), 15 points to SF (-8.5), 14 points to BUF (-7.0), and 9 points to BAL (-3.0). Sticking to high-probability favorites stabilizes your curve.",
      tacticalPointers: ['Allocations: 16 KC, 15 SF, 14 BUF, 9 BAL.', 'Recovery Target: Exit basement tier.'],
    },
    commishAdvice: {
      title: "Commish AI Memo for markk",
      headline: "Basement Notice: Rank 12 Recovery Strategy",
      stageDirections: '[deadpan monotone] [pause]',
      script:
        "[deadpan monotone] [pause] markk is currently ranked 12th of 12 teams. Allocation directive: 16 on KC, 15 on SF, 14 on BUF, and 9 on BAL.",
      tacticalPointers: ['Prescribed: 16 KC, 15 SF, 14 BUF, 9 BAL.'],
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
    recommendedPicks: [
      {
        matchup: 'BUF vs LAC',
        recommendedTeam: 'BUF',
        confidencePoints: 16,
        tier: 'Anchor (14-16)',
        spread: 'BUF -7.0 vs LAC',
        rationale: 'Podium defense: Anchor your card to stay ahead of Todd and PatN with Buffalo home dominance.',
      },
      {
        matchup: 'KC vs MIA',
        recommendedTeam: 'KC',
        confidencePoints: 15,
        tier: 'Anchor (14-16)',
        spread: 'KC -11.5 vs MIA',
        rationale: 'Lock the spread: Chiefs at Arrowhead provide dependable double-digit point security.',
      },
      {
        matchup: 'GB vs ATL',
        recommendedTeam: 'GB',
        confidencePoints: 11,
        tier: 'Core (8-13)',
        spread: 'GB -6.0 vs ATL',
        rationale: 'Home chalk: Packers home crowd advantage at Lambeau disrupts Falcons timing.',
      },
      {
        matchup: 'NO vs LV',
        recommendedTeam: 'NO',
        confidencePoints: 7,
        tier: 'Leverage/Hedge (1-7)',
        spread: 'NO -3.0 vs LV',
        rationale: 'Superdome defense: Saints defensive secondary forces Raiders quarterback errors.',
      },
    ],
    salAdvice: {
      title: "Coach Sal's Advice for 3-D",
      headline: "Protect Your Bronze! Put 16 on Buffalo & 15 on KC: Watch Out for Todd!",
      stageDirections: '[chuckle] [clears throat]',
      script:
        "[chuckle] [clears throat] 3-D! You banked 13 big ones on Seattle, putting you in 3rd place! But that 12-point ding on the Rams kept you from taking the lead, and Todd Reimer is lurkin' in the bushes with a 127 ceiling! In this next week, look at Buffalo hostin' the Chargers (-7.0): based on our podium-defense strategy, I would put sixteen points on Josh Allen and da Bills. Next, look at Kansas City hostin' Miami (-11.5)—lock fifteen points on Mahomes. Then look at Green Bay hostin' Atlanta (-6.0)—put eleven points on Jordan Love at Lambeau. And look at New Orleans hostin' the Raiders (-3.0)—put seven points on the Saints' Superdome defense! Protect your flank and stay on the podium!",
      tacticalPointers: [
        'MATCHUP 1 (16 PTS): Put 16 points on BUF (-7.0 vs LAC) — defend bronze against Todd and PatN.',
        'MATCHUP 2 (15 PTS): Put 15 points on KC (-11.5 vs MIA) — lock reliable Arrowhead points.',
        'MATCHUP 3 (11 PTS): Put 11 points on GB (-6.0 vs ATL) — home advantage in Lambeau.',
        'MATCHUP 4 (7 PTS): Put 7 points on NO (-3.0 vs LV) — Superdome secondary creates turnover edge.',
      ],
    },
    chloeAdvice: {
      title: "Dr. Chloe's Analysis for 3-D",
      headline: "Rank 3 Vulnerability: Defending Against High-Ceiling Chasers",
      stageDirections: '[deadpan] [crisp tone]',
      script:
        "[deadpan] [crisp tone] 3-D holds 13 points, but with 12 points lost, both Todd (127) and PatN (135) have higher maximum upside. In Week 3, allocate 16 points to BUF (-7.0), 15 points to KC (-11.5), 11 points to GB (-6.0), and 7 points to NO (-3.0). Avoid speculative upsets to defend your bronze position.",
      tacticalPointers: ['Allocations: 16 BUF, 15 KC, 11 GB, 7 NO.', 'Objective: Defend 3rd place.'],
    },
    commishAdvice: {
      title: "Commish AI Note for 3-D",
      headline: "Podium Alert: Rank 3 Under Threat",
      stageDirections: '[deadpan monotone] [pause]',
      script:
        "[deadpan monotone] [pause] 3-D holds bronze position. Allocation directive: 16 on BUF, 15 on KC, 11 on GB, and 7 on NO.",
      tacticalPointers: ['Prescribed: 16 BUF, 15 KC, 11 GB, 7 NO.'],
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
    recommendedPicks: [
      {
        matchup: 'KC vs MIA',
        recommendedTeam: 'KC',
        confidencePoints: 16,
        tier: 'Anchor (14-16)',
        spread: 'KC -11.5 vs MIA',
        rationale: 'No snap decisions: Play the safest game on the board with your highest points to stay in the top four.',
      },
      {
        matchup: 'BUF vs LAC',
        recommendedTeam: 'BUF',
        confidencePoints: 15,
        tier: 'Anchor (14-16)',
        spread: 'BUF -7.0 vs LAC',
        rationale: 'Bills offensive firepower controls time of possession against Chargers front.',
      },
      {
        matchup: 'DET vs NYJ',
        recommendedTeam: 'DET',
        confidencePoints: 14,
        tier: 'Anchor (14-16)',
        spread: 'DET -6.5 vs NYJ',
        rationale: 'Goff at home indoors with elite run blocking win rate exceeding 80%.',
      },
      {
        matchup: 'CIN vs PIT',
        recommendedTeam: 'CIN',
        confidencePoints: 8,
        tier: 'Core (8-13)',
        spread: 'CIN -3.5 vs Pit',
        rationale: 'Burrow division rebound at home against an inconsistent Steelers passing offense.',
      },
    ],
    salAdvice: {
      title: "Coach Sal's Advice for Snap Judgments",
      headline: "No Snap Judgments on Sunday! Put 16 on KC, 15 on BUF, and 14 on Detroit!",
      stageDirections: '[boisterous laugh] [shouting with passion]',
      script:
        "[boisterous laugh] [shouting with passion] Snap Judgments! Twelve points in da bank puts you in 4th place. Don't go making wild snap decisions on Sunday morning! In this next week, look at Kansas City hostin' Miami (-11.5): based on our steady-hands strategy, I would put sixteen points on Patrick Mahomes. Next, look at Buffalo hostin' the Chargers (-7.0)—put fifteen points on Josh Allen and da Bills. Then look at Detroit hostin' the Jets (-6.5)—put fourteen points on da Lions' offensive line. And look at Cincinnati hostin' Pittsburgh (-3.5)—put eight points on Joe Burrow to bounce back! Trust your heavy anchors and keep your paws off the panic button!",
      tacticalPointers: [
        'MATCHUP 1 (16 PTS): Put 16 points on KC (-11.5 vs MIA) — safest game on the board.',
        'MATCHUP 2 (15 PTS): Put 15 points on BUF (-7.0 vs LAC) — reliable trench winner.',
        'MATCHUP 3 (14 PTS): Put 14 points on DET (-6.5 vs NYJ) — high-floor indoor offense.',
        'MATCHUP 4 (8 PTS): Put 8 points on CIN (-3.5 vs Pit) — division home favorite.',
      ],
    },
    chloeAdvice: {
      title: "Dr. Chloe's Advice for Snap Judgments",
      headline: "Heuristic Discipline: Eliminating Volatility at Rank 4",
      stageDirections: '[crisp analytical tone] [short pause]',
      script:
        "[crisp analytical tone] [short pause] Snap Judgments holds rank 4 with 12 points. Avoid impulse changes on Sunday morning. In Week 3, allocate 16 points to KC (-11.5), 15 points to BUF (-7.0), 14 points to DET (-6.5), and 8 points to CIN (-3.5) to lock in high expected value.",
      tacticalPointers: ['Allocations: 16 KC, 15 BUF, 14 DET, 8 CIN.', 'Focus: Avoid impulsive changes.'],
    },
    commishAdvice: {
      title: "Commish AI Summary for Snap Judgments",
      headline: "Top 4 Hold: Rank 4 of 12",
      stageDirections: '[deadpan monotone] [pause]',
      script:
        "[deadpan monotone] [pause] Snap Judgments holds 4th position. Allocation directive: 16 on KC, 15 on BUF, 14 on DET, and 8 on CIN.",
      tacticalPointers: ['Directive: 16 KC, 15 BUF, 14 DET, 8 CIN.'],
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
    recommendedPicks: [
      {
        matchup: 'BUF vs LAC',
        recommendedTeam: 'BUF',
        confidencePoints: 16,
        tier: 'Anchor (14-16)',
        spread: 'BUF -7.0 vs LAC',
        rationale: 'Trench law: Allen and Cook control the tempo and run game at Highmark Stadium.',
      },
      {
        matchup: 'KC vs MIA',
        recommendedTeam: 'KC',
        confidencePoints: 15,
        tier: 'Anchor (14-16)',
        spread: 'KC -11.5 vs MIA',
        rationale: 'Championship discipline: Reid and Spagnuolo out-scheme backup Miami quarterback.',
      },
      {
        matchup: 'SF vs ARI',
        recommendedTeam: 'SF',
        confidencePoints: 14,
        tier: 'Anchor (14-16)',
        spread: 'SF -8.5 vs ARI',
        rationale: 'Defensive front control: Bosa and Warner disrupt Cardinals offensive script.',
      },
      {
        matchup: 'MIN vs TB',
        recommendedTeam: 'MIN',
        confidencePoints: 8,
        tier: 'Core (8-13)',
        spread: 'MIN -1.5 vs TB',
        rationale: 'Flores defensive scheme creates favorable pressure rates and turnover opportunities.',
      },
    ],
    salAdvice: {
      title: "Coach Sal's Advice for Torts Illustrated",
      headline: "Push da Pile! Put 16 on Buffalo, 15 on KC, and 14 on San Fran!",
      stageDirections: '[deep gravelly shout] [pause]',
      script:
        "[deep gravelly shout] [pause] Torts! You're in 5th place right in the middle of the pack! Sunday is where you push the pile and separate yourself! In this next week, look at Buffalo hostin' the Chargers (-7.0): based on our trench law strategy, I would put sixteen points on Josh Allen and da Bills. Next, look at Kansas City hostin' Miami (-11.5)—lock fifteen points on Patrick Mahomes at Arrowhead. Then look at San Francisco hostin' Arizona (-8.5)—put fourteen points on da Niners' defense to swallow Kyler Murray. And look at Minnesota hostin' Tampa Bay (-1.5)—put eight points on Brian Flores's blitzing defense! That's 53 points on tough, physical football. Play tough and climb into the money!",
      tacticalPointers: [
        'MATCHUP 1 (16 PTS): Put 16 points on BUF (-7.0 vs LAC) — trench control at home.',
        'MATCHUP 2 (15 PTS): Put 15 points on KC (-11.5 vs MIA) — dependable double-digit anchor.',
        'MATCHUP 3 (14 PTS): Put 14 points on SF (-8.5 vs ARI) — defensive pass rush advantage.',
        'MATCHUP 4 (8 PTS): Put 8 points on MIN (-1.5 vs TB) — defensive scheme creates turnover edge.',
      ],
    },
    chloeAdvice: {
      title: "Dr. Chloe's Advice for Torts Illustrated",
      headline: "Mid-Table Equilibrium: High-Probability Core Execution",
      stageDirections: '[deadpan] [crisp tone]',
      script:
        "[deadpan] [crisp tone] Torts Illustrated holds 11 points at rank 5. Standard regression suggests sticking with high-probability home favorites. In Week 3, allocate 16 points to BUF (-7.0), 15 points to KC (-11.5), 14 points to SF (-8.5), and 8 points to MIN (-1.5). This establishes a high Bayesian floor.",
      tacticalPointers: ['Allocations: 16 BUF, 15 KC, 14 SF, 8 MIN.', 'Target: Advance from 5th into podium.'],
    },
    commishAdvice: {
      title: "Commish AI Note for Torts Illustrated",
      headline: "Mid-Pack Status: Allocation Directive",
      stageDirections: '[deadpan monotone] [pause]',
      script:
        "[deadpan monotone] [pause] Torts Illustrated: 11 points banked. Allocation directive mandates 16 on BUF, 15 on KC, 14 on SF, and 8 on MIN.",
      tacticalPointers: ['Directive: 16 BUF, 15 KC, 14 SF, 8 MIN.'],
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
    recommendedPicks: [
      {
        matchup: 'KC vs MIA',
        recommendedTeam: 'KC',
        confidencePoints: 16,
        tier: 'Anchor (14-16)',
        spread: 'KC -11.5 vs MIA',
        rationale: 'Big hammer: 16 points on the top spread of the week to jump-start your recovery.',
      },
      {
        matchup: 'DET vs NYJ',
        recommendedTeam: 'DET',
        confidencePoints: 14,
        tier: 'Anchor (14-16)',
        spread: 'DET -6.5 vs NYJ',
        rationale: 'Dan Campbell trench football: Lions offensive line powers your climb back to the top half.',
      },
      {
        matchup: 'BUF vs LAC',
        recommendedTeam: 'BUF',
        confidencePoints: 13,
        tier: 'Core (8-13)',
        spread: 'BUF -7.0 vs LAC',
        rationale: 'Bills home field at Highmark controls time of possession.',
      },
      {
        matchup: 'PHI vs CHI',
        recommendedTeam: 'PHI',
        confidencePoints: 10,
        tier: 'Core (8-13)',
        spread: 'PHI -3.5 vs Chi',
        rationale: 'Hurts and Barkley run game pressures Bears defensive front.',
      },
    ],
    salAdvice: {
      title: "Coach Sal's Advice for BigD",
      headline: "Gut-Check Time! Put 16 on KC, 14 on Detroit, and 13 on Buffalo!",
      stageDirections: '[shouting with intensity] [clears throat]',
      script:
        "[shouting with intensity] BigD! Ten points in the bank, 12 burned on the Rams. Sunday is gut-check time, pal! In this next week, look at Kansas City hostin' Miami (-11.5): based on our gut-check recovery strategy, I would put your maximum sixteen points on Patrick Mahomes at Arrowhead. Next, look at Detroit hostin' the Jets (-6.5)—put fourteen points on Dan Campbell's offensive line. Then look at Buffalo hostin' the Chargers (-7.0)—put thirteen points on Josh Allen. And look at Philly hostin' the Bears (-3.5)—put ten points on Jalen Hurts and Saquon Barkley! Play tough trench football and climb back into the top three!",
      tacticalPointers: [
        'MATCHUP 1 (16 PTS): Put 16 points on KC (-11.5 vs MIA) — top anchor on the board.',
        'MATCHUP 2 (14 PTS): Put 14 points on DET (-6.5 vs NYJ) — physical run blocking.',
        'MATCHUP 3 (13 PTS): Put 13 points on BUF (-7.0 vs LAC) — reliable home favorite.',
        'MATCHUP 4 (10 PTS): Put 10 points on PHI (-3.5 vs Chi) — dynamic rushing attack.',
      ],
    },
    chloeAdvice: {
      title: "Dr. Chloe's Advice for BigD",
      headline: "Stabilization Model: Protecting Core Equity",
      stageDirections: '[crisp analytical tone] [short pause]',
      script:
        "[crisp analytical tone] [short pause] BigD holds 10 points. Protect your remaining equity in Week 3: allocate 16 points to KC (-11.5), 14 points to DET (-6.5), 13 points to BUF (-7.0), and 10 points to PHI (-3.5). Avoid speculative variance until the afternoon window.",
      tacticalPointers: ['Allocations: 16 KC, 14 DET, 13 BUF, 10 PHI.', 'Focus: Equity protection.'],
    },
    commishAdvice: {
      title: "Commish AI Summary for BigD",
      headline: "Rank 6 Notice: Core Allocation Directive",
      stageDirections: '[deadpan monotone] [pause]',
      script:
        "[deadpan monotone] [pause] BigD sits in 6th place with 10 points. Recommended allocations: 16 on KC, 14 on DET, 13 on BUF, and 10 on PHI.",
      tacticalPointers: ['Prescribed: 16 KC, 14 DET, 13 BUF, 10 PHI.'],
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
    recommendedPicks: [
      {
        matchup: 'BUF vs LAC',
        recommendedTeam: 'BUF',
        confidencePoints: 16,
        tier: 'Anchor (14-16)',
        spread: 'BUF -7.0 vs LAC',
        rationale: 'Take flight: Put your #1 16-point anchor on the Bills at Highmark Stadium to trigger your rebound.',
      },
      {
        matchup: 'KC vs MIA',
        recommendedTeam: 'KC',
        confidencePoints: 15,
        tier: 'Anchor (14-16)',
        spread: 'KC -11.5 vs MIA',
        rationale: 'Mahomes consistency: High-floor double-digit certainty at Arrowhead.',
      },
      {
        matchup: 'SF vs ARI',
        recommendedTeam: 'SF',
        confidencePoints: 14,
        tier: 'Anchor (14-16)',
        spread: 'SF -8.5 vs ARI',
        rationale: '49ers depth across all three phases handles Arizona at Levi Stadium.',
      },
      {
        matchup: 'SEA vs WSH',
        recommendedTeam: 'SEA',
        confidencePoints: 9,
        tier: 'Core (8-13)',
        spread: 'SEA -7.0 vs Wsh',
        rationale: 'Bird power: Seahawks 12th man noise overwhelms Commanders rookie quarterback.',
      },
    ],
    salAdvice: {
      title: "Coach Sal's Advice for Bird Boss",
      headline: "Fire Up Dem Wings! Put 16 on Buffalo, 15 on KC, and 14 on San Fran!",
      stageDirections: '[deep gravelly chuckle] [pause]',
      script:
        "[deep gravelly chuckle] [pause] Bird Boss, you only cashed 6 on Seattle and lost 10 on the Rams. You're in 10th place right now, but your 126 ceiling is higher than Shoeman's! Time to take flight! In this next week, look at Buffalo hostin' the Chargers (-7.0): based on our rebound strategy, I would put sixteen points on Josh Allen and da Bills. Next, look at Kansas City hostin' Miami (-11.5)—put fifteen points on Mahomes at Arrowhead. Then look at San Francisco hostin' Arizona (-8.5)—put fourteen points on da Niners. And look at Seattle hostin' Washington (-7.0)—put nine points on the Seahawks at Lumen Field! That gives you 54 points on heavy home favorites. Cash 'em all and fly back into the top half!",
      tacticalPointers: [
        'MATCHUP 1 (16 PTS): Put 16 points on BUF (-7.0 vs LAC) — Highmark Stadium trench control.',
        'MATCHUP 2 (15 PTS): Put 15 points on KC (-11.5 vs MIA) — Arrowhead certainty.',
        'MATCHUP 3 (14 PTS): Put 14 points on SF (-8.5 vs ARI) — divisional home favorite.',
        'MATCHUP 4 (9 PTS): Put 9 points on SEA (-7.0 vs Wsh) — 12th man advantage against rookie signal caller.',
      ],
    },
    chloeAdvice: {
      title: "Dr. Chloe's Advice for Bird Boss",
      headline: "Underrated Upside: 126 Maximum Point Rebound",
      stageDirections: '[crisp analytical tone] [fast paced]',
      script:
        "[crisp analytical tone] [fast paced] Bird Boss holds 6 points, but retaining a 126 ceiling affords significant upward mobility. In Week 3, allocate 16 points to BUF (-7.0), 15 points to KC (-11.5), 14 points to SF (-8.5), and 9 points to SEA (-7.0). This cluster maximizes recovery expected value.",
      tacticalPointers: ['Allocations: 16 BUF, 15 KC, 14 SF, 9 SEA.', 'Ceiling: 126 pts (Superior to Rank 3).'],
    },
    commishAdvice: {
      title: "Commish AI Note for Bird Boss",
      headline: "Sleeping Upside Alert: 126 Max Points",
      stageDirections: '[deadpan monotone] [pause]',
      script:
        "[deadpan monotone] [pause] Bird Boss retains a 126 ceiling despite 10th place rank. Allocation directive: 16 on BUF, 15 on KC, 14 on SF, and 9 on SEA.",
      tacticalPointers: ['Directive: 16 BUF, 15 KC, 14 SF, 9 SEA.'],
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
  recommendedPicks: RecommendedGamePick[];
} {
  const profile = getPickerAdviceProfile(teamId);
  const advice = speaker === 'chloe' ? profile.chloeAdvice : speaker === 'commish' ? profile.commishAdvice : profile.salAdvice;
  return {
    ...advice,
    recommendedPicks: advice.recommendedPicks || profile.recommendedPicks || [],
  };
}
