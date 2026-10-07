// AI Marketing Deck Generator Engine
// Zero server dependencies. 100% interactive client-side execution.

let mktgSlides = [];
let activeSlideIndex = 0;
let isPresenting = false;

// Presets Dictionary
const MKTG_PRESETS = {
  'saas-gtm': {
    title: 'Enterprise SaaS GTM Launch: Scaling Pipeline to $10M ARR',
    campaignType: 'Product Launch / GTM',
    slides: [
      {
        kicker: 'GO-TO-MARKET MANDATE',
        title: 'Enterprise SaaS GTM Launch',
        subtitle: 'Accelerating Enterprise Pipeline Velocity from Zero to $10M ARR in 12 Months',
        footerLeft: 'Marketing Strategy Deck',
        cards: [
          { title: 'North Star Objective', desc: 'Secure 120 net new Fortune 1000 accounts with $85k+ Average Contract Value (ACV).' },
          { title: 'Campaign Budget', desc: '$1.4M allocated across paid acquisition, creator content, and event activations.' },
          { title: 'Core Motion', desc: 'Product-Led Sales: Self-serve developer sandbox transitioning to sales-assisted enterprise contracts.' }
        ]
      },
      {
        kicker: 'IDEAL CUSTOMER PROFILE (ICP)',
        title: 'Target Audience & Decision Makers',
        subtitle: 'Focusing resources on high-intent technical buyers and executive budget holders.',
        footerLeft: 'Audience Personas',
        cards: [
          { title: 'Primary Persona: VP of Engineering', desc: 'Pain: Engineering backlogs and developer burnout. Trigger: Needs autonomous team scaling.' },
          { title: 'Secondary Persona: Chief Information Officer', desc: 'Pain: Compliance risk and runaway cloud compute costs. Trigger: Demands SOC2 and ISO27001.' },
          { title: 'End User: Staff Software Architect', desc: 'Pain: Fragile boilerplate code and context switching. Trigger: Loves clean APIs and CLI tooling.' }
        ]
      },
      {
        kicker: 'MESSAGING ARCHITECTURE',
        title: 'Core Messaging & Positioning Matrix',
        subtitle: 'Positioning as the indispensable operating system for autonomous engineering.',
        footerLeft: 'Value Proposition',
        cards: [
          { title: 'Campaign Hook / Tagline', desc: '"Stop Writing Glue Code. Let Autonomous Agents Build Your Enterprise Infrastructure."' },
          { title: 'Primary Differentiator', desc: 'Sub-5ms deterministic execution with zero public model training on proprietary code.' },
          { title: 'Proof-Point Anchor', desc: 'Verified 4.8x developer throughput multiplier audited by independent Tier-1 customers.' }
        ]
      },
      {
        kicker: 'FULL-FUNNEL ARCHITECTURE',
        title: 'Full-Funnel Demand Generation Engine',
        subtitle: 'Seamless customer journey from unbranded discovery to enterprise renewal.',
        footerLeft: 'Funnel Strategy',
        cards: [
          { title: 'Top-of-Funnel: Awareness', desc: 'High-impact technical thought leadership, benchmark research reports, and YouTube podcasts.' },
          { title: 'Middle-of-Funnel: Consideration', desc: 'Interactive interactive ROI calculator, live code playground sandboxes, and architectural whitepapers.' },
          { title: 'Bottom-of-Funnel: Conversion', desc: 'Personalized executive briefings, 14-day production pilots, and dedicated technical architect onboarding.' }
        ]
      },
      {
        kicker: 'OMNICHANNEL STRATEGY',
        title: 'Channel Mix & Acquisition Allocation',
        subtitle: 'Diversified multi-touch attribution minimizing single-platform risk.',
        footerLeft: 'Channel Mix',
        cards: [
          { title: 'Paid Search & Intent (35%)', desc: 'High-intent B2B keywords on Google Ads and Gartner/G2 software buyer intent feeds.' },
          { title: 'Technical Communities (25%)', desc: 'Developer sponsorships on Hacker News, GitHub Trending, and niche engineering newsletters.' },
          { title: 'Account-Based LinkedIn (25%)', desc: 'Targeted account list advertising focusing strictly on Fortune 1000 engineering leaders.' }
        ]
      },
      {
        kicker: 'CREATIVE & CONTENT ENGINE',
        title: 'High-Impact Creative Asset Matrix',
        subtitle: 'Technical credibility paired with compelling cinematic storytelling.',
        footerLeft: 'Creative Formats',
        cards: [
          { title: 'Product Launch Keynote Film', desc: '3-minute cinematic video demonstrating real-time autonomous agent problem resolution.' },
          { title: 'Interactive ROI Benchmark', desc: 'Web tool allowing engineering directors to calculate annual headcount savings.' },
          { title: 'Customer Case Study Series', desc: 'Written & video deep-dives with reference clients highlighting verified 90-day returns.' }
        ]
      },
      {
        kicker: 'BUDGET ALLOCATION & ROAS',
        title: 'Media Spend & Unit Economics',
        subtitle: 'Disciplined capital deployment delivering rapid CAC payback.',
        footerLeft: 'Financial Model',
        cards: [
          { title: 'Blended Target CAC: $11,500', desc: 'Well under the $85,000 first-year ACV, yielding immediate capital efficiency.' },
          { title: 'Projected LTV:CAC Ratio: 6.2x', desc: 'Backed by negative net logo churn and 138% net revenue expansion.' },
          { title: 'CAC Payback Period: 5.4 Months', desc: 'Industry-leading cash conversion efficiency accelerating reinvestment.' }
        ]
      },
      {
        kicker: 'PERFORMANCE SCORECARD',
        title: 'Quarterly KPI Targets & Attribution',
        subtitle: 'Transparent accountability across all go-to-market milestones.',
        footerLeft: 'Attribution Scorecard',
        cards: [
          { title: 'Pipeline Velocity', desc: '$28M in qualified sales pipeline generated across the initial 4 quarters.' },
          { title: 'Conversion Benchmarks', desc: 'Trial-to-pilot conversion target of 32%; pilot-to-contract conversion of 68%.' },
          { title: 'Organic Inbound Share', desc: 'Targeting 45% organic inbound share through viral developer word-of-mouth.' }
        ]
      }
    ]
  },
  'ecommerce-q4': {
    title: 'DTC E-Commerce Q4 Omnichannel Blitz: Black Friday & Holiday Scale',
    campaignType: 'Demand Generation',
    slides: [
      {
        kicker: 'Q4 REVENUE CAMPAIGN',
        title: 'Holiday Omnichannel Blitz',
        subtitle: 'Capturing Peak Q4 Consumer Intent Across Meta, TikTok, and Retention SMS',
        footerLeft: 'E-Commerce Growth Deck',
        cards: [
          { title: 'Campaign Revenue Target', desc: '$8.5M gross merchandise value (GMV) during the 45-day holiday window.' },
          { title: 'Blended ROAS Target', desc: '4.2x return on ad spend across all performance media channels.' },
          { title: 'New Customer Acquisition', desc: '45,000 net new customers with 30-day repeat purchase rate of 28%.' }
        ]
      },
      {
        kicker: 'SHOPPER PSYCHOLOGY',
        title: 'Customer Segments & Buying Triggers',
        subtitle: 'Addressing deal-seekers, luxury gift buyers, and self-purchasers.',
        footerLeft: 'Audience Segments',
        cards: [
          { title: 'The Early Bird Gifter', desc: 'Buys in early November; driven by guaranteed delivery windows and bundled gift wrapping.' },
          { title: 'The Black Friday Deal Hunter', desc: 'High urgency; driven by tier discounts (Spend $150 get $30; Spend $250 get $75).' },
          { title: 'The Last-Minute Scrambler', desc: 'Buys Dec 15-22; driven by expedited shipping guarantees and digital gift cards.' }
        ]
      },
      {
        kicker: 'OFFER ARCHITECTURE',
        title: 'Compelling Holiday Offer Strategy',
        subtitle: 'Protecting gross margins while maximizing average order value (AOV).',
        footerLeft: 'Promotional Matrix',
        cards: [
          { title: 'Tiered Threshold Discounts', desc: 'Incentivizes cart building: 20% off $100, 25% off $200, 30% off $300+.' },
          { title: 'Limited-Edition Holiday Bundles', desc: 'Curated gift boxes with $185 retail value priced at $129 (80% gross margin).' },
          { title: 'Free Luxury Gift With Purchase', desc: 'Exclusive holiday tote and travel kit on orders over $150.' }
        ]
      },
      {
        kicker: 'CHANNEL MIX',
        title: 'Media Spend & Allocation Matrix',
        subtitle: 'Scaling high-performing creative with dynamic budget optimization.',
        footerLeft: 'Channel Breakdown',
        cards: [
          { title: 'Meta Ads (Instagram & FB) - 45%', desc: 'Advantage+ Shopping Campaigns scaling video Reels and UGC unboxing creators.' },
          { title: 'TikTok & Creator Ads - 25%', desc: 'Spark Ads amplifying viral gifting trends and behind-the-scenes product packing.' },
          { title: 'Google Performance Max - 20%', desc: 'Capturing high-intent Google Shopping queries and YouTube shorts retargeting.' }
        ]
      },
      {
        kicker: 'RETENTION & LIFECYCLE',
        title: 'SMS & Email Lifecycle Machine',
        subtitle: 'Generating 35% of total campaign GMV with zero ad spend.',
        footerLeft: 'Retention Engine',
        cards: [
          { title: 'VIP Early Access List', desc: 'SMS subscribers receive 12-hour head start before public sale launch.' },
          { title: 'Cart Abandonment Flow', desc: '3-part automated sequence: 1hr reminder, 12hr limited-time perk, 24hr expiry.' },
          { title: 'Post-Purchase Unboxing', desc: 'Educational video guide building anticipation before the package arrives.' }
        ]
      },
      {
        kicker: 'CREATIVE STRATEGY',
        title: 'High-Converting Ad Creatives',
        subtitle: 'Fast-paced, hook-driven UGC testing 100+ creative variants weekly.',
        footerLeft: 'Creative Engine',
        cards: [
          { title: 'The 3-Second Hook Video', desc: 'Thumb-stopping visual reveals showing dramatic before/after product impact.' },
          { title: 'The "Don’t Buy This Unless" Hook', desc: 'Pattern interrupt ad addressing common competitor flaws directly.' },
          { title: 'Social Proof Carousel', desc: 'Screen recordings of 5-star customer reviews and press accolades.' }
        ]
      },
      {
        kicker: 'FINANCIAL TARGETS',
        title: 'Unit Economics & Margin Health',
        subtitle: 'Ensuring profitable contribution margins on first orders.',
        footerLeft: 'Unit Economics',
        cards: [
          { title: 'Target AOV: $142', desc: 'Increased from $108 baseline via threshold bundles and checkout cross-sells.' },
          { title: 'Target Blended CAC: $34', desc: 'Yielding a Day-1 contribution margin of $48 per customer.' },
          { title: 'Blended ROAS: 4.2x', desc: 'Media spend of $2.0M generating $8.5M gross revenue.' }
        ]
      },
      {
        kicker: 'EXECUTION CALENDAR',
        title: 'Holiday Campaign Flight Schedule',
        subtitle: 'Precise countdown ensuring logistical and operational alignment.',
        footerLeft: 'Execution Timeline',
        cards: [
          { title: 'Oct 15 - Nov 5: Teaser Phase', desc: 'Grow VIP SMS list by 50,000 subscribers with teaser sweepstakes.' },
          { title: 'Nov 6 - Nov 20: Early Bird Sale', desc: 'Exclusive VIP drop capturing early holiday shopping budgets.' },
          { title: 'Nov 21 - Dec 2: Black Friday Cyber Week', desc: 'Full-funnel maximum ad spend blitz with hourly inventory flash alerts.' }
        ]
      }
    ]
  },
  'b2b-abm': {
    title: 'B2B Account-Based Marketing (ABM): Penetrating Top 500 Enterprise Accounts',
    campaignType: 'Demand Generation',
    slides: [
      {
        kicker: 'STRATEGIC ACCOUNT INITIATIVE',
        title: 'Enterprise ABM Growth Engine',
        subtitle: 'Orchestrating Highly Personalized Multi-Touch Campaigns for 500 Target Accounts',
        footerLeft: 'ABM Strategy Deck',
        cards: [
          { title: 'Campaign Objective', desc: 'Book qualified meetings with 35% of the target 500 accounts within 6 months.' },
          { title: 'Average Deal Size', desc: 'Targeting $150k+ initial contract value with Fortune 500 organizations.' },
          { title: 'Sales & Marketing Alignment', desc: 'Shared pipeline quota between SDRs, Account Executives, and ABM growth leads.' }
        ]
      },
      {
        kicker: 'ACCOUNT SELECTION',
        title: 'Tiered Account Architecture',
        subtitle: 'Categorizing accounts by intent signals, tech stack, and contract size.',
        footerLeft: 'Account Tiers',
        cards: [
          { title: 'Tier 1: Bespoke 1:1 (50 Accounts)', desc: 'Custom micro-sites, bespoke architectural teardowns, executive direct mail.' },
          { title: 'Tier 2: Industry 1:Few (150 Accounts)', desc: 'Verticalized sub-industry content for FinTech, Healthcare, and Retail.' },
          { title: 'Tier 3: Programmatic 1:Many (300 Accounts)', desc: 'IP-targeted display advertising and automated contextual SDR cadences.' }
        ]
      },
      {
        kicker: 'INTENT DETECTION',
        title: 'First-Party & Third-Party Intent Triggers',
        subtitle: 'Engaging accounts precisely when their research activity spikes.',
        footerLeft: 'Intent Telemetry',
        cards: [
          { title: 'Bombora Surge Data', desc: 'Alerts SDR team when target accounts research competitive software categories.' },
          { title: 'Website De-Anonymization', desc: 'Identifies enterprise visitor domains visiting pricing and technical documentation.' },
          { title: 'Executive Job Postings', desc: 'Triggers outreach when an account posts roles requiring modern infrastructure.' }
        ]
      },
      {
        kicker: 'MULTI-TOUCH ORCHESTRATION',
        title: 'Coordinated Outreach Playbook',
        subtitle: 'Synchronizing marketing touches with sales direct outreach.',
        footerLeft: 'Campaign Playbook',
        cards: [
          { title: 'Touch 1-3: IP Ads & Awareness', desc: 'Display and LinkedIn ads educating account stakeholders on efficiency gaps.' },
          { title: 'Touch 4: Bespoke Executive Gift', desc: 'Handcrafted leather field notebook and invitation to VIP leadership dinner.' },
          { title: 'Touch 5-7: AE Executive Video Email', desc: 'Custom 60-second video demo showing how our platform solves their specific bottleneck.' }
        ]
      },
      {
        kicker: 'BESPOKE CONTENT',
        title: 'Custom Account Micro-Sites & Audits',
        subtitle: 'Delivering overwhelming value before asking for a sales meeting.',
        footerLeft: 'Content Assets',
        cards: [
          { title: 'Account-Specific Landing Pages', desc: 'company.io/for/acme-corp featuring customized architectural diagram and logo.' },
          { title: 'Free Technical Teardown Report', desc: 'Audited benchmark showing where their current stack incurs latency.' },
          { title: 'Private Peer Executive Dinners', desc: 'Exclusive 12-person dinners hosted in SF, NYC, and London with Michelin dining.' }
        ]
      },
      {
        kicker: 'PIPELINE ECONOMICS',
        title: 'Unit Economics & ROI Forecast',
        subtitle: 'High-touch marketing justified by massive enterprise contract values.',
        footerLeft: 'ABM Financials',
        cards: [
          { title: 'Total Campaign Investment: $450,000', desc: 'Covering media spend, direct gifting, custom micro-sites, and executive dinners.' },
          { title: 'Target Sourced ARR: $7,500,000', desc: 'Based on 50 closed deals at $150,000 average contract value.' },
          { title: 'Projected Campaign ROI: 16.6x', desc: 'Substantial enterprise value generated on a disciplined marketing budget.' }
        ]
      },
      {
        kicker: 'SCORECARD & BENCHMARKS',
        title: 'Account Engagement Scorecard',
        subtitle: 'Tracking account progression through marketing stages.',
        footerLeft: 'ABM Scorecard',
        cards: [
          { title: 'Account Engagement Rate', desc: 'Goal: 70% of target accounts displaying active intent signals within 90 days.' },
          { title: 'Meeting Booking Velocity', desc: 'Goal: 175 qualified enterprise discovery meetings held.' },
          { title: 'Sales Cycle Acceleration', desc: 'Goal: Reduce average enterprise procurement duration from 9 months to 4.5 months.' }
        ]
      },
      {
        kicker: 'GOVERNANCE & NEXT STEPS',
        title: 'Implementation & Sprint Milestones',
        subtitle: 'Clear bi-weekly alignment between marketing and enterprise sales.',
        footerLeft: 'Next Steps',
        cards: [
          { title: 'Week 1-2: List Finalization', desc: 'Finalize top 500 account list with VP of Sales and assign named account owners.' },
          { title: 'Week 3-4: Creative Build', desc: 'Produce bespoke micro-site templates, direct mail kits, and LinkedIn creative.' },
          { title: 'Week 5: Campaign Launch', desc: 'Simultaneous flight across all 500 accounts with daily intent dashboard alerts.' }
        ]
      }
    ]
  },
  'app-growth': {
    title: 'Mobile App Viral User Acquisition: Reaching 1,000,000 Active Users',
    campaignType: 'Product Launch / GTM',
    slides: [
      {
        kicker: 'APP GROWTH SPRINT',
        title: 'Mobile App Viral Scale Strategy',
        subtitle: 'Reaching 1M Monthly Active Users Through Organic Loops, Paid Spark Ads, and ASO',
        footerLeft: 'Mobile Growth Deck',
        cards: [
          { title: 'Growth Objective', desc: 'Scale from 50k to 1,000,000 Monthly Active Users (MAU) in 6 months.' },
          { title: 'Cost Per Install (CPI) Target', desc: 'Blended CPI target under $1.20 across iOS and Android ecosystems.' },
          { title: 'K-Factor Virality Goal', desc: 'Achieve viral coefficient K > 1.25 via built-in referral invites and social sharing.' }
        ]
      },
      {
        kicker: 'VIRAL LOOP DESIGN',
        title: 'In-App Product-Led Referral Flywheel',
        subtitle: 'Engineering organic user-to-user sharing directly into the core product UX.',
        footerLeft: 'Viral Loops',
        cards: [
          { title: 'The Value Give-Get', desc: 'Both inviter and invitee unlock 1 month of premium AI features instantly upon sign-up.' },
          { title: 'Frictionless Social Sharing', desc: 'One-tap deep-link sharing across iMessage, WhatsApp, Instagram Stories, and Discord.' },
          { title: 'Dynamic Onboarding Recognition', desc: 'Welcomes new users with the profile avatar and message of their friend who invited them.' }
        ]
      },
      {
        kicker: 'PAID PERFORMANCE MIX',
        title: 'High-Velocity Paid Acquisition Channels',
        subtitle: 'Capitalizing on high-converting mobile ad formats.',
        footerLeft: 'Paid Channels',
        cards: [
          { title: 'TikTok Spark Ads (40%)', desc: 'Amplifying native creator testimonials demonstrating surprising real-world app use cases.' },
          { title: 'Apple Search Ads (30%)', desc: 'Bidding on competitor app names and high-intent categorical search terms on the App Store.' },
          { title: 'Meta Instagram Reels (30%)', desc: 'Hook-driven short-form reels driving direct app install conversions.' }
        ]
      },
      {
        kicker: 'APP STORE OPTIMIZATION',
        title: 'App Store Optimization (ASO) Playbook',
        subtitle: 'Maximizing organic conversion rates on the App Store and Google Play.',
        footerLeft: 'ASO Strategy',
        cards: [
          { title: 'Keyword Metadata Optimization', desc: 'Targeting high-volume, low-competition keywords in app title and subtitle.' },
          { title: 'A/B Testing App Screenshots', desc: 'Testing bold typographic callouts against lifestyle UI mockups (aiming for +18% CVR).' },
          { title: 'App Preview Video', desc: '15-second fast-paced demonstration showcasing the app’s "magic moment" in the first 3 seconds.' }
        ]
      },
      {
        kicker: 'RETENTION & HABIT LOOPS',
        title: 'Day 1, 7, and 30 Retention Mechanics',
        subtitle: 'Ensuring acquired installs convert into lifelong daily active power users.',
        footerLeft: 'Retention Loops',
        cards: [
          { title: 'Day 1 Onboarding Gamification', desc: 'Progress bar guiding new users to complete their first workflow within 3 minutes.' },
          { title: 'Smart Push Notifications', desc: 'Contextual, personalized notifications triggered by user activity rather than generic blasts.' },
          { title: 'Weekly Recap Digest', desc: 'Sundays report showing personal productivity gains and community rank.' }
        ]
      },
      {
        kicker: 'BUDGET & UNIT ECONOMICS',
        title: 'Acquisition Budget & Monetization Model',
        subtitle: 'Building a sustainable flywheel where subscription revenue funds paid media.',
        footerLeft: 'Growth Financials',
        cards: [
          { title: 'Total Growth Budget: $800,000', desc: 'Allocated across paid acquisition, creator fees, and ASO agency optimization.' },
          { title: 'Free-to-Paid Conversion: 6.8%', desc: 'Freemium tier converting to $9.99/month or $79/year premium subscriptions.' },
          { title: 'LTV to CAC Ratio: 3.8x', desc: '12-month expected LTV of $28.50 against blended CAC of $7.50.' }
        ]
      },
      {
        kicker: 'ANALYTICS & ATTRIBUTION',
        title: 'SKAdNetwork & Mobile Attribution (MMP)',
        subtitle: 'Privacy-compliant measurement navigating Apple iOS privacy frameworks.',
        footerLeft: 'Attribution Model',
        cards: [
          { title: 'Adjust / AppsFlyer MMP', desc: 'Full-funnel install attribution and in-app event tracking across all ad networks.' },
          { title: 'SKAN 4.0 Conversion Schema', desc: 'Optimized conversion values capturing Day-2 revenue and engagement milestones.' },
          { title: 'Cohort Retention Analytics', desc: 'Weekly cohort analysis tracking churn velocity and feature usage correlations.' }
        ]
      },
      {
        kicker: '6-MONTH GROWTH ROADMAP',
        title: 'Phase Gates & Milestone Horizon',
        subtitle: 'Systematic scaling from soft launch to global viral momentum.',
        footerLeft: 'Growth Roadmap',
        cards: [
          { title: 'Month 1-2: Foundation', desc: 'Optimize onboarding funnel; achieve D1 retention > 45%; lock in sub-$1.50 CPI.' },
          { title: 'Month 3-4: Scale Phase', desc: 'Scale ad spend to $150k/mo; launch university campus ambassador program.' },
          { title: 'Month 5-6: Viral Flywheel', desc: 'Cross 1,000,000 active users; expand localized App Store presence in Europe & Japan.' }
        ]
      }
    ]
  },
  'creator-influencer': {
    title: 'Creator & Influencer Ambassador Blitz: 50 Tier-1 Tech Creators',
    campaignType: 'Brand Awareness',
    slides: [
      {
        kicker: 'CREATOR CAMPAIGN STRATEGY',
        title: 'Creator Ambassador Blitz',
        subtitle: 'Partnering with 50 Tier-1 Tech Creators to Drive Massive Community Trust and Conversion',
        footerLeft: 'Creator Strategy Deck',
        cards: [
          { title: 'Campaign Reach Goal', desc: 'Generate 12M+ organic impressions across YouTube, X/Twitter, and TikTok.' },
          { title: 'Campaign Budget', desc: '$650,000 allocated for creator production fees, rev-share, and white-glove onboarding.' },
          { title: 'Direct Attribution Goal', desc: 'Drive 35,000 tracked software signups via personalized creator landing pages.' }
        ]
      },
      {
        kicker: 'CREATOR TIERS',
        title: 'Three-Tier Creator Portfolio',
        subtitle: 'Balancing massive macro credibility with high-converting micro-influencers.',
        footerLeft: 'Creator Portfolio',
        cards: [
          { title: 'Tier 1: Macro Anchor (5 Creators)', desc: '500k+ subscribers on YouTube. Dedicated full-video features and podcast guest appearances.' },
          { title: 'Tier 2: Mid-Tier Power Users (15 Creators)', desc: '100k - 500k subscribers. 60-90s integrated sponsorships and in-depth tutorial walkthroughs.' },
          { title: 'Tier 3: Micro Advocates (30 Creators)', desc: '10k - 50k subscribers. Authentic raw reviews on TikTok, Twitter threads, and Discord communities.' }
        ]
      },
      {
        kicker: 'CREATIVE BRIEF',
        title: 'Guidelines & Creative Freedom',
        subtitle: 'Allowing authentic voice while ensuring non-negotiable message delivery.',
        footerLeft: 'Creative Guidelines',
        cards: [
          { title: 'Mandatory Deliverables', desc: 'Explicit product demo showing live workflow execution in the first 45 seconds.' },
          { title: 'Unique Value Hook', desc: 'Demonstrate how the tool saves 10 hours weekly on complex real-world workflows.' },
          { title: 'Dedicated Call-to-Action', desc: 'Exclusive promo code granting 20% discount and access to the creator’s private template library.' }
        ]
      },
      {
        kicker: 'CO-BRANDED CONVERSION',
        title: 'Custom Creator Landing Pages',
        subtitle: 'Eliminating drop-off between social platforms and software signup.',
        footerLeft: 'Conversion Funnel',
        cards: [
          { title: 'Bespoke URL Structure', desc: 'company.io/creator_handle displaying creator photo, endorsement, and custom starter bundle.' },
          { title: 'Pre-Loaded Starter Templates', desc: 'New users land directly in the software with the creator’s custom workflow pre-configured.' },
          { title: 'Attribution Tracking', desc: 'First-party cookie tracking paired with UTM parameters for 100% clean attribution.' }
        ]
      },
      {
        kicker: 'AMBASSADOR INCENTIVES',
        title: 'Rev-Share & Long-Term Loyalty',
        subtitle: 'Turning one-off sponsored videos into permanent evangelical brand partners.',
        footerLeft: 'Creator Economics',
        cards: [
          { title: 'Upfront Sponsorship Fee', desc: 'Competitive flat rate compensating high production quality and guaranteed delivery dates.' },
          { title: '25% Lifetime Revenue Share', desc: 'Ongoing passive income for creators on every paying customer they refer for 2 years.' },
          { title: 'Exclusive Advisory Council', desc: 'Quarterly private briefings with company founders to test unreleased beta features.' }
        ]
      },
      {
        kicker: 'MEDIA AMPLIFICATION',
        title: 'Whitelisting & Spark Ad Amplification',
        subtitle: 'Boosting top-performing creator videos through our company ad account.',
        footerLeft: 'Paid Amplification',
        cards: [
          { title: 'Creator Whitelisting Rights', desc: 'Securing 60-day advertising rights on top 10 best-performing creator social handles.' },
          { title: 'TikTok Spark Ads', desc: 'Boosting organic viral TikTok videos directly to high-intent audiences with CTA buttons.' },
          { title: 'Retargeting Social Ads', desc: 'Retargeting viewers who watched >50% of creator videos with direct signup ads.' }
        ]
      },
      {
        kicker: 'FINANCIAL TARGETS',
        title: 'Campaign Financial Model & Unit Economics',
        subtitle: 'High-performing creator marketing delivering superior CAC to traditional search ads.',
        footerLeft: 'Financial Model',
        cards: [
          { title: 'Blended Cost Per Acquisition (CPA): $18.50', desc: 'Significantly lower than traditional B2B Google Ads ($65+).' },
          { title: 'Estimated Customer LTV: $240', desc: 'Creator-referred customers demonstrate 35% higher 90-day retention.' },
          { title: 'Total Generated Pipeline: $4.2M', desc: 'Strong commercial payback within 6 months of campaign launch.' }
        ]
      },
      {
        kicker: 'CAMPAIGN HORIZON',
        title: 'Execution Flight & Milestone Schedule',
        subtitle: 'A synchronized 8-week launch creating omnipresence in the developer space.',
        footerLeft: 'Campaign Schedule',
        cards: [
          { title: 'Week 1-3: Contracting & Briefing', desc: 'Finalize contracts with all 50 creators; ship VIP onboarding gift box.' },
          { title: 'Week 4: Content Review & Pre-Flight', desc: 'Review creator draft cuts ensuring accurate messaging and brand voice.' },
          { title: 'Week 5-7: Coordinated Blitz', desc: 'Creators publish within a concentrated 14-day window; activate paid whitelisting.' }
        ]
      }
    ]
  }
};

// Generate Marketing Proposal Deck
function generateMarketingDeck(promptText, campaignType, count) {
  const mktgTitle = promptText.split(':')[0].trim() || 'Marketing Strategy';
  const desc = promptText.includes(':') ? promptText.split(':')[1].trim() : promptText;

  const slides = [
    {
      kicker: 'CAMPAIGN MANDATE',
      title: mktgTitle,
      subtitle: desc || 'Comprehensive Strategic Marketing Plan & Growth Architecture',
      footerLeft: 'Marketing Strategy Deck',
      cards: [
        { title: `Campaign Focus: ${campaignType}`, desc: 'Targeted acquisition framework engineered for measurable business impact.' },
        { title: 'Core Mandate', desc: 'Drive high-velocity customer acquisition while defending healthy unit economics.' },
        { title: 'Attribution Rigor', desc: 'Full-funnel multi-touch attribution tracking every marketing dollar to revenue.' }
      ]
    },
    {
      kicker: 'AUDIENCE & ICP',
      title: 'Target Audience & Customer Personas',
      subtitle: 'Clear definition of high-intent buyers, pain points, and purchase triggers.',
      footerLeft: 'Target ICP',
      cards: [
        { title: 'Primary Decision Maker', desc: 'Executive budget holder seeking scalable operational efficiency and verifiable ROI.' },
        { title: 'Core Pain Points', desc: 'Frustrated by slow legacy tooling, high overhead costs, and lack of integration.' },
        { title: 'Purchase Triggers', desc: 'Urgent quarterly performance mandates and competitive pressure from market innovators.' }
      ]
    },
    {
      kicker: 'MESSAGING MATRIX',
      title: 'Core Value Proposition & Hooks',
      subtitle: 'Differentiated positioning designed to break through market noise.',
      footerLeft: 'Brand Positioning',
      cards: [
        { title: 'The Core Hook', desc: 'Bold, memorable tagline communicating immediate transformation.' },
        { title: 'The Competitive Wedge', desc: 'Why our solution wins decisively against established legacy alternatives.' },
        { title: 'Empirical Proof Point', desc: 'Audited customer benchmarks substantiating performance claims.' }
      ]
    },
    {
      kicker: 'FULL-FUNNEL ARCHITECTURE',
      title: 'Full-Funnel Demand Generation Strategy',
      subtitle: 'Systematic pipeline from initial brand discovery down to contract renewal.',
      footerLeft: 'Funnel Architecture',
      cards: [
        { title: 'Top of Funnel: Awareness', desc: 'Thought leadership, viral short-form content, and broad educational campaigns.' },
        { title: 'Middle of Funnel: Intent', desc: 'Interactive ROI tools, customer case studies, and comparative teardowns.' },
        { title: 'Bottom of Funnel: Conversion', desc: 'High-touch executive demos, free pilot sandboxes, and accelerated onboarding.' }
      ]
    },
    {
      kicker: 'OMNICHANNEL MIX',
      title: 'Multi-Channel Channel Allocation',
      subtitle: 'Diversified media allocation balancing paid velocity and organic compounding.',
      footerLeft: 'Channel Mix',
      cards: [
        { title: 'High-Intent Paid Acquisition (40%)', desc: 'Search ads, sponsored feeds, and programmatic display targeting verified intent.' },
        { title: 'Content & Community (30%)', desc: 'SEO-optimized knowledge hubs, developer advocacy, and creator partnerships.' },
        { title: 'Lifecycle & Retention (30%)', desc: 'Behavioral email sequences, in-app messaging, and automated upsell triggers.' }
      ]
    },
    {
      kicker: 'CREATIVE ASSET MATRIX',
      title: 'High-Converting Creative Formats',
      subtitle: 'Rapid iteration of high-performing visual and video assets.',
      footerLeft: 'Creative Formats',
      cards: [
        { title: 'Hook-Driven Video Creatives', desc: 'Short-form videos testing multiple 3-second visual and auditory hooks.' },
        { title: 'Interactive Conversion Tools', desc: 'Custom web calculators and sandboxes proving immediate product utility.' },
        { title: 'Social Proof Wall', desc: 'Dynamic showcase of client logos, quotes, and audited performance gains.' }
      ]
    },
    {
      kicker: 'BUDGET & UNIT ECONOMICS',
      title: 'Financial Projections & CAC Payback',
      subtitle: 'Disciplined unit economics ensuring positive contribution margins.',
      footerLeft: 'Financial Model',
      cards: [
        { title: 'Blended Target CAC', desc: 'Calibrated to ensure a sub-6-month payback against customer lifetime value.' },
        { title: 'Projected ROAS Multiple', desc: 'Targeting 4x+ return on performance ad spend across mature cohorts.' },
        { title: 'Compounding LTV', desc: 'Expansion revenue and low churn multiplying long-term campaign profitability.' }
      ]
    },
    {
      kicker: 'SCORECARD & GOVERNANCE',
      title: 'KPI Scorecard & Execution Milestones',
      subtitle: 'Weekly accountability benchmarks ensuring continuous optimization.',
      footerLeft: 'Scorecard & KPIs',
      cards: [
        { title: 'Pipeline Velocity', desc: 'Target volume of marketing-qualified and sales-accepted leads per quarter.' },
        { title: 'Funnel Conversion Rates', desc: 'Continuous testing to lift landing page and trial checkout conversion.' },
        { title: 'Continuous Experimentation', desc: 'Weekly creative refresh cycle preventing audience ad fatigue.' }
      ]
    }
  ];

  if (count >= 10) {
    slides.push({
      kicker: 'EXECUTION TIMELINE',
      title: '12-Week Campaign Sprint Milestones',
      subtitle: 'Clear phase gates guiding cross-functional marketing and sales teams.',
      footerLeft: 'Sprint Schedule',
      cards: [
        { title: 'Weeks 1-3: Preparation & Creative', desc: 'Finalize creative assets, tracking pixels, and conversion landing pages.' },
        { title: 'Weeks 4-8: Initial Flight & Testing', desc: 'Launch multi-channel ad spend; run multivariate tests on top hooks.' },
        { title: 'Weeks 9-12: Scale & Optimize', desc: 'Reallocate 80% of budget to top-performing channel winners; scale retargeting.' }
      ]
    });

    slides.push({
      kicker: 'OPTIMIZATION CADENCE',
      title: 'Governance & Experimentation Backlog',
      subtitle: 'Continuous growth engineering through structured experiment cycles.',
      footerLeft: 'Growth Governance',
      cards: [
        { title: 'Weekly Growth Standup', desc: 'Review CPA by channel, pause underperforming variants, scale winners.' },
        { title: 'Creative Refresh Cadence', desc: 'Deploy 5 new creative concepts weekly to prevent ad fatigue.' },
        { title: 'Executive Monthly Review', desc: 'Report net revenue contribution and blended payback metrics to executive board.' }
      ]
    });
  }

  return slides;
}

// Render Thumbnails
function renderThumbnails() {
  const container = document.getElementById('mktg-thumbs-container');
  if (!container) return;

  container.innerHTML = '';
  mktgSlides.forEach((slide, idx) => {
    const card = document.createElement('div');
    card.className = `mktg-thumb-card ${idx === activeSlideIndex ? 'active' : ''}`;
    card.onclick = () => selectSlide(idx);

    card.innerHTML = `
      <span style="font-weight: 800; font-size: 0.75rem; color: var(--accent);">#${idx + 1}</span>
      <div style="flex: 1; overflow: hidden;">
        <div style="font-size: 0.7rem; color: var(--text-secondary); text-transform: uppercase;">${escapeHtml(slide.kicker || 'STRATEGY')}</div>
        <div style="font-size: 0.82rem; font-weight: 600; color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${escapeHtml(slide.title || 'Untitled')}</div>
      </div>
    `;
    container.appendChild(card);
  });

  const counter = document.getElementById('counter-active-slide');
  if (counter) counter.textContent = `${activeSlideIndex + 1} / ${mktgSlides.length}`;

  const badgeTotal = document.getElementById('badge-total-slides');
  if (badgeTotal) badgeTotal.textContent = `${mktgSlides.length} Slides`;
}

// Render Slide Content to DOM
function renderMarketingSlide(slide, targetEl, isFullscreen = false) {
  if (!slide || !targetEl) return;

  let bodyHtml = '';
  if (slide.cards) {
    bodyHtml = `
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-top: 1.25rem;">
        ${slide.cards.map(c => `
          <div style="background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 1.25rem; display: flex; flex-direction: column; justify-content: space-between;">
            <h4 style="font-size: 1.05rem; font-weight: 700; color: #fff; margin-bottom: 0.4rem;">${escapeHtml(c.title)}</h4>
            <p style="font-size: 0.85rem; color: #94a3b8; line-height: 1.45; margin: 0;">${escapeHtml(c.desc)}</p>
          </div>
        `).join('')}
      </div>
    `;
  }

  targetEl.innerHTML = `
    <div>
      <div style="display: inline-block; padding: 0.25rem 0.65rem; background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.15); border-radius: 9999px; font-size: 0.72rem; font-weight: 700; text-transform: uppercase; color: #f43f5e; margin-bottom: 0.6rem;">
        ${escapeHtml(slide.kicker || 'CAMPAIGN')}
      </div>
      <h2 style="font-size: ${isFullscreen ? '2.4rem' : '1.9rem'}; font-weight: 800; line-height: 1.15; margin-bottom: 0.4rem; color: #fff;">
        ${escapeHtml(slide.title || '')}
      </h2>
      <p style="font-size: ${isFullscreen ? '1.15rem' : '0.95rem'}; color: #94a3b8; margin-bottom: 1rem;">
        ${escapeHtml(slide.subtitle || '')}
      </p>
      ${bodyHtml}
    </div>
    <div style="display: flex; justify-content: space-between; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 0.75rem; font-size: 0.72rem; color: #64748b; margin-top: 1rem;">
      <span>${escapeHtml(slide.footerLeft || 'Marketing Strategy Presentation')}</span>
      <span>Slide ${activeSlideIndex + 1} of ${mktgSlides.length}</span>
    </div>
  `;
}

// Select Slide
function selectSlide(idx) {
  if (idx < 0 || idx >= mktgSlides.length) return;
  activeSlideIndex = idx;
  renderThumbnails();

  const stage = document.getElementById('mktg-slide-stage');
  if (stage) renderMarketingSlide(mktgSlides[activeSlideIndex], stage, false);

  const cur = mktgSlides[activeSlideIndex];
  if (cur) {
    const inTitle = document.getElementById('inp-edit-title');
    const inKicker = document.getElementById('inp-edit-kicker');
    const inSub = document.getElementById('inp-edit-sub');
    const inContent = document.getElementById('inp-edit-content');

    if (inTitle) inTitle.value = cur.title || '';
    if (inKicker) inKicker.value = cur.kicker || '';
    if (inSub) inSub.value = cur.subtitle || '';

    if (inContent && cur.cards) {
      inContent.value = cur.cards.map(c => `${c.title}: ${c.desc}`).join('\n');
    }
  }

  if (isPresenting) {
    updateFullscreen();
  }
}

// Sync Editor into Slide
function syncEditorToSlide() {
  const cur = mktgSlides[activeSlideIndex];
  if (!cur) return;

  const inTitle = document.getElementById('inp-edit-title');
  const inKicker = document.getElementById('inp-edit-kicker');
  const inSub = document.getElementById('inp-edit-sub');
  const inContent = document.getElementById('inp-edit-content');

  if (inTitle) cur.title = inTitle.value;
  if (inKicker) cur.kicker = inKicker.value;
  if (inSub) cur.subtitle = inSub.value;

  if (inContent) {
    const lines = inContent.value.split('\n').map(l => l.trim()).filter(Boolean);
    cur.cards = lines.map(line => {
      if (line.includes(':')) {
        const parts = line.split(':');
        return { title: parts[0].trim(), desc: parts.slice(1).join(':').trim() };
      }
      return { title: line, desc: '' };
    });
  }

  renderThumbnails();
  const stage = document.getElementById('mktg-slide-stage');
  if (stage) renderMarketingSlide(cur, stage, false);
}

// Fullscreen Presenter Mode
function openFullscreen() {
  const modal = document.getElementById('fs-mktg-modal');
  if (!modal) return;
  isPresenting = true;
  modal.classList.add('active');
  updateFullscreen();

  if (document.documentElement.requestFullscreen) {
    document.documentElement.requestFullscreen().catch(() => {});
  }
}

function closeFullscreen() {
  const modal = document.getElementById('fs-mktg-modal');
  if (!modal) return;
  isPresenting = false;
  modal.classList.remove('active');

  if (document.fullscreenElement && document.exitFullscreen) {
    document.exitFullscreen().catch(() => {});
  }
}

function updateFullscreen() {
  const target = document.getElementById('fs-slide-content');
  const counter = document.getElementById('fs-slide-num');
  if (!target) return;

  renderMarketingSlide(mktgSlides[activeSlideIndex], target, true);
  if (counter) counter.textContent = `${activeSlideIndex + 1} / ${mktgSlides.length}`;
}

// Slide Management
function addSlide() {
  const newSlide = {
    kicker: 'CAMPAIGN ELEMENT',
    title: 'Custom Marketing Initiative',
    subtitle: 'Tactical execution details for this growth vector.',
    cards: [
      { title: 'Core Activity', desc: 'Description of specific marketing activation.' },
      { title: 'Target Metric', desc: 'Expected conversion benchmark.' },
      { title: 'Resource Need', desc: 'Budget and creative team allocation.' }
    ]
  };
  mktgSlides.splice(activeSlideIndex + 1, 0, newSlide);
  selectSlide(activeSlideIndex + 1);
}

function duplicateSlide() {
  if (!mktgSlides[activeSlideIndex]) return;
  const clone = JSON.parse(JSON.stringify(mktgSlides[activeSlideIndex]));
  clone.title += ' (Copy)';
  mktgSlides.splice(activeSlideIndex + 1, 0, clone);
  selectSlide(activeSlideIndex + 1);
}

function deleteSlide() {
  if (mktgSlides.length <= 1) {
    alert('Marketing deck must contain at least 1 slide.');
    return;
  }
  mktgSlides.splice(activeSlideIndex, 1);
  if (activeSlideIndex >= mktgSlides.length) {
    activeSlideIndex = mktgSlides.length - 1;
  }
  selectSlide(activeSlideIndex);
}

function moveSlideUp() {
  if (activeSlideIndex <= 0) return;
  const temp = mktgSlides[activeSlideIndex];
  mktgSlides[activeSlideIndex] = mktgSlides[activeSlideIndex - 1];
  mktgSlides[activeSlideIndex - 1] = temp;
  selectSlide(activeSlideIndex - 1);
}

function moveSlideDown() {
  if (activeSlideIndex >= mktgSlides.length - 1) return;
  const temp = mktgSlides[activeSlideIndex];
  mktgSlides[activeSlideIndex] = mktgSlides[activeSlideIndex + 1];
  mktgSlides[activeSlideIndex + 1] = temp;
  selectSlide(activeSlideIndex + 1);
}

// Exports
function exportStandaloneHtml() {
  const mktgTitle = mktgSlides[0]?.title || 'Marketing Strategy Presentation';
  const slidesJson = JSON.stringify(mktgSlides);

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${escapeHtml(mktgTitle)} - Marketing Presentation</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: #07040a; color: #f8fafc; font-family: -apple-system, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; }
    .viewport { width: 95vw; max-width: 1300px; aspect-ratio: 16/9; background: radial-gradient(circle at 85% 15%, rgba(244,63,94,0.18), transparent 50%), radial-gradient(circle at 15% 85%, rgba(99,102,241,0.12), transparent 50%), #110815; border-radius: 16px; border: 1px solid rgba(255,255,255,0.12); padding: 3.5rem; display: flex; flex-direction: column; justify-content: space-between; }
    .badge { font-size: 0.75rem; text-transform: uppercase; color: #f43f5e; font-weight: 700; margin-bottom: 0.5rem; }
    h1 { font-size: 2.3rem; margin-bottom: 0.4rem; }
    .sub { font-size: 1.1rem; color: #94a3b8; margin-bottom: 1.5rem; }
    .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-top: 1rem; }
    .card { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 1.25rem; }
    .card h3 { font-size: 1.05rem; margin-bottom: 0.4rem; color: #fff; }
    .card p { font-size: 0.85rem; color: #94a3b8; line-height: 1.45; }
    .nav { position: fixed; bottom: 1.5rem; display: flex; gap: 1rem; align-items: center; background: rgba(15,23,42,0.9); padding: 0.5rem 1.25rem; border-radius: 9999px; border: 1px solid rgba(255,255,255,0.15); }
    button { background: transparent; border: none; color: #fff; font-weight: 700; cursor: pointer; padding: 0.3rem 0.6rem; }
  </style>
</head>
<body>
  <div class="viewport" id="root"></div>
  <div class="nav">
    <button id="p">&larr; Prev</button>
    <span id="c" style="color: #f43f5e; font-weight: 700;"></span>
    <button id="n">Next &rarr;</button>
  </div>
  <script>
    const slides = ${slidesJson};
    let cur = 0;
    function render() {
      const s = slides[cur];
      let b = '<div class="grid">' + (s.cards||[]).map(c => '<div class="card"><h3>' + c.title + '</h3><p>' + c.desc + '</p></div>').join('') + '</div>';
      document.getElementById('root').innerHTML = '<div><div class="badge">' + (s.kicker||'') + '</div><h1>' + (s.title||'') + '</h1><p class="sub">' + (s.subtitle||'') + '</p>' + b + '</div><div style="display:flex;justify-content:space-between;border-top:1px solid rgba(255,255,255,0.1);padding-top:0.75rem;font-size:0.8rem;color:#64748b;"><span>Marketing Strategy Deck</span><span>Slide ' + (cur+1) + ' of ' + slides.length + '</span></div>';
      document.getElementById('c').textContent = (cur+1) + ' / ' + slides.length;
    }
    document.getElementById('p').onclick = () => { if (cur > 0) { cur--; render(); } };
    document.getElementById('n').onclick = () => { if (cur < slides.length - 1) { cur++; render(); } };
    window.addEventListener('keydown', e => {
      if (e.key === 'ArrowRight' || e.key === ' ') { if (cur < slides.length - 1) { cur++; render(); } }
      if (e.key === 'ArrowLeft') { if (cur > 0) { cur--; render(); } }
    });
    render();
  </script>
</body>
</html>`;

  downloadBlob(html, `${mktgTitle.toLowerCase().replace(/[^a-z0-9]/g, '_')}_marketing_deck.html`, 'text/html');
}

function exportDeckJson() {
  const jsonStr = JSON.stringify(mktgSlides, null, 2);
  downloadBlob(jsonStr, `marketing_strategy_deck.json`, 'application/json');
}

function importDeckJson(file) {
  const reader = new FileReader();
  reader.onload = e => {
    try {
      const data = JSON.parse(e.target.result);
      if (Array.isArray(data) && data.length > 0) {
        mktgSlides = data;
        activeSlideIndex = 0;
        renderThumbnails();
        selectSlide(0);
      } else {
        alert('Invalid JSON: Must be an array of slide objects.');
      }
    } catch (err) {
      alert('Failed to parse JSON.');
    }
  };
  reader.readAsText(file);
}

function printMarketingPdf() {
  const printTarget = document.getElementById('mktg-print-target');
  if (!printTarget) return;

  printTarget.innerHTML = '';
  mktgSlides.forEach((slide, idx) => {
    const page = document.createElement('div');
    page.className = 'print-mktg-slide';
    renderMarketingSlide(slide, page, false);
    printTarget.appendChild(page);
  });

  window.print();
}

function downloadBlob(content, filename, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Initialization & Event Binding
document.addEventListener('DOMContentLoaded', () => {
  const promptInput = document.getElementById('inp-mktg-prompt');
  const typeSelect = document.getElementById('select-campaign-type');
  const countSelect = document.getElementById('select-slide-count');

  // Load Initial Preset
  const initPreset = MKTG_PRESETS['saas-gtm'];
  mktgSlides = JSON.parse(JSON.stringify(initPreset.slides));

  renderThumbnails();
  selectSlide(0);

  // Generate Button
  document.getElementById('btn-generate-mktg-deck')?.addEventListener('click', () => {
    const p = promptInput ? promptInput.value.trim() : 'GTM Strategy';
    const t = typeSelect ? typeSelect.value : 'Product Launch / GTM';
    const c = countSelect ? parseInt(countSelect.value, 10) : 8;
    mktgSlides = generateMarketingDeck(p, t, c);
    activeSlideIndex = 0;
    renderThumbnails();
    selectSlide(0);
  });

  // Presets
  const presetPills = document.querySelectorAll('.mktg-pill');
  presetPills.forEach(pill => {
    pill.addEventListener('click', () => {
      const key = pill.getAttribute('data-preset');
      const preset = MKTG_PRESETS[key];
      if (preset) {
        if (promptInput) promptInput.value = preset.title;
        if (typeSelect) typeSelect.value = preset.campaignType;
        const tag = document.getElementById('badge-campaign-tag');
        if (tag) tag.textContent = preset.campaignType;

        mktgSlides = JSON.parse(JSON.stringify(preset.slides));
        activeSlideIndex = 0;
        renderThumbnails();
        selectSlide(0);
      }
    });
  });

  // Type change tag update
  if (typeSelect) {
    typeSelect.addEventListener('change', () => {
      const tag = document.getElementById('badge-campaign-tag');
      if (tag) tag.textContent = typeSelect.value;
    });
  }

  // Editor Inputs
  ['inp-edit-title', 'inp-edit-kicker', 'inp-edit-sub', 'inp-edit-content'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', syncEditorToSlide);
  });

  // Reordering & Management
  document.getElementById('btn-add-slide')?.addEventListener('click', addSlide);
  document.getElementById('btn-slide-up')?.addEventListener('click', moveSlideUp);
  document.getElementById('btn-slide-down')?.addEventListener('click', moveSlideDown);
  document.getElementById('btn-slide-duplicate')?.addEventListener('click', duplicateSlide);
  document.getElementById('btn-slide-delete')?.addEventListener('click', deleteSlide);

  // Fullscreen Presenter
  document.getElementById('btn-present-fullscreen')?.addEventListener('click', openFullscreen);
  document.getElementById('fs-btn-exit')?.addEventListener('click', closeFullscreen);
  document.getElementById('fs-btn-next')?.addEventListener('click', () => {
    if (activeSlideIndex < mktgSlides.length - 1) selectSlide(activeSlideIndex + 1);
  });
  document.getElementById('fs-btn-prev')?.addEventListener('click', () => {
    if (activeSlideIndex > 0) selectSlide(activeSlideIndex - 1);
  });

  // Keybindings
  window.addEventListener('keydown', e => {
    if (e.key === 'F5') {
      e.preventDefault();
      openFullscreen();
    } else if (e.key === 'Escape' && isPresenting) {
      closeFullscreen();
    } else if (e.key === 'ArrowRight' || e.key === ' ') {
      if (isPresenting && activeSlideIndex < mktgSlides.length - 1) {
        e.preventDefault();
        selectSlide(activeSlideIndex + 1);
      }
    } else if (e.key === 'ArrowLeft') {
      if (isPresenting && activeSlideIndex > 0) {
        e.preventDefault();
        selectSlide(activeSlideIndex - 1);
      }
    }
  });

  // Exports
  document.getElementById('btn-export-html')?.addEventListener('click', exportStandaloneHtml);
  document.getElementById('btn-export-json')?.addEventListener('click', exportDeckJson);
  document.getElementById('btn-export-pdf')?.addEventListener('click', printMarketingPdf);

  const importInput = document.getElementById('input-import-json');
  if (importInput) {
    importInput.addEventListener('change', e => {
      if (e.target.files && e.target.files[0]) {
        importDeckJson(e.target.files[0]);
      }
    });
  }
});