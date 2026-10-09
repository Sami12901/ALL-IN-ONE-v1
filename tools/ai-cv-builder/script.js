// AI CV Builder - Step-by-Step Composer & Heuristic Engine
// Supports 20+ specialized industry domains, XYZ bullet drafting, live A4 preview, theme switcher, and PDF export.

// 1. Industry Domain Knowledgebase (20+ Specialized Industries)
const INDUSTRY_KNOWLEDGEBASE = {
  'software-engineering': {
    title: 'Software Engineering & Architecture',
    summaries: {
      entry: 'Detail-oriented Software Engineer with strong foundations in data structures, algorithms, and full-stack web development. Passionate about writing clean, testable code and contributing to agile engineering teams.',
      mid: 'Results-driven Full-Stack Engineer with 5+ years designing resilient microservices and distributed web applications. Proven track record of optimizing database queries and boosting API throughput.',
      senior: 'Distinguished Cloud Solutions Architect with 10+ years spearheading large-scale distributed systems, FinOps infrastructure optimization, and multi-region Kubernetes deployments for Fortune 100 enterprises.',
      executive: 'Chief Technology Officer & Engineering Executive with 15+ years orchestrating global engineering organizations of 120+ engineers. Champion of high-velocity DevOps cultures and multi-million dollar cloud transformations.'
    },
    bullets: [
      'Architected distributed microservices handling 45M+ daily API transactions, reducing end-to-end latency by 38% through Redis caching and asynchronous message queues.',
      'Refactored legacy monolith into event-driven architecture utilizing Apache Kafka and Go, improving system fault tolerance and achieving 99.99% operational uptime.',
      'Spearheaded CI/CD automation pipeline overhaul using GitHub Actions and Docker, reducing production deployment cycle times from 4 hours to 11 minutes.'
    ],
    skills: 'Distributed Systems, Microservices, Go, Python, TypeScript, Docker, Kubernetes, AWS, PostgreSQL, Redis, GraphQL, Kafka, CI/CD, Git'
  },
  'data-ai': {
    title: 'Data Science, ML & Artificial Intelligence',
    summaries: {
      entry: 'Analytical Data Scientist with background in statistical modeling, machine learning, and exploratory data analysis. Skilled in Python, Pandas, and building predictive classification models.',
      mid: 'Machine Learning Engineer with 4+ years productionizing deep learning models and real-time inference pipelines. Experienced in model quantization, feature stores, and automated MLOps.',
      senior: 'Lead AI & Machine Learning Scientist with 9+ years delivering production predictive analytics, transformer model fine-tuning, and enterprise computer vision solutions generating $12M+ incremental margin.',
      executive: 'VP of Artificial Intelligence & Data Science with proven leadership translating complex neural architectures and big data assets into proprietary competitive moats.'
    },
    bullets: [
      'Developed and deployed automated customer churn prediction model processing 2.4M records daily, increasing retention by 14.2% and preserving $3.8M in ARR.',
      'Fine-tuned open-source LLM pipelines with custom retrieval-augmented generation (RAG), boosting internal document query accuracy from 61% to 94.6%.',
      'Engineered real-time computer vision quality inspection pipeline utilizing PyTorch and TensorRT, slashing manufacturing defect escape rates by 44%.'
    ],
    skills: 'Python, PyTorch, TensorFlow, MLOps, RAG Architecture, LLM Fine-Tuning, Scikit-Learn, SQL, Snowflake, Apache Spark, Hugging Face, MLflow'
  },
  'cloud-devops': {
    title: 'Cloud Architecture, DevOps & SRE',
    summaries: {
      entry: 'Junior DevOps Engineer with strong foundation in Linux administration, Docker containerization, and automated scripting in Bash and Python.',
      mid: 'Site Reliability Engineer with 5+ years architecting zero-downtime deployment pipelines, infrastructure as code (IaC), and observability frameworks.',
      senior: 'Staff SRE & Infrastructure Architect with 10+ years maintaining multi-cloud Kubernetes clusters with 99.999% availability and rigorous disaster recovery protocols.',
      executive: 'Director of Cloud Operations managing $18M annual AWS/GCP cloud budgets, implementing automated FinOps governance and global compliance.'
    },
    bullets: [
      'Authored Terraform modules governing 1,200+ AWS cloud resources across 4 global regions, achieving 100% Infrastructure-as-Code compliance.',
      'Implemented distributed OpenTelemetry observability suite across 80+ microservices, slashing Mean Time to Resolution (MTTR) by 52%.',
      'Automated autoscaling policies on Amazon EKS clusters, driving a 34% reduction in monthly cloud compute expenditures while maintaining sub-15ms latency.'
    ],
    skills: 'Terraform, Kubernetes, AWS, Google Cloud, Docker, Prometheus, Grafana, OpenTelemetry, Linux, Bash, Helm, Ansible, FinOps, SRE'
  },
  'product-management': {
    title: 'Product Management & Agile Strategy',
    summaries: {
      entry: 'Associate Product Manager passionate about user discovery, rapid prototyping, and data-backed product requirement documentation (PRDs).',
      mid: 'Product Manager with 5+ years scaling SaaS products from MVP to product-market fit. Adept at cross-functional squad leadership and sprint planning.',
      senior: 'Principal Product Lead with 9+ years directing multi-disciplinary teams across payments, marketplace dynamics, and user acquisition driving $24M+ GMV.',
      executive: 'VP of Product with extensive experience defining multi-year product visions, portfolio roadmaps, and M&A platform integrations.'
    },
    bullets: [
      'Conceived and launched self-serve checkout funnel that boosted user onboarding conversion rate by 22.4%, unlocking $4.2M in annual recurring revenue.',
      'Conducted 45+ customer discovery interviews and analyzed behavioral telemetry to redefine product roadmap, increasing 30-day user retention by 18%.',
      'Orchestrated cross-functional collaboration between engineering, design, and growth marketing across 4 agile sprint cycles to launch flagship mobile feature.'
    ],
    skills: 'Product Discovery, Roadmapping, Agile/Scrum, User Journey Mapping, SQL, Amplitude, Mixpanel, Jira, Go-To-Market (GTM), Wireframing'
  },
  'ui-ux': {
    title: 'UI/UX Design & Product Experience',
    summaries: {
      entry: 'User Experience Designer with strong command of Figma, wireframing, interactive prototyping, and user-centered design systems.',
      mid: 'Senior Product Designer with 6+ years designing accessible, consumer-facing mobile and web applications with comprehensive design token systems.',
      senior: 'Principal UI/UX Architect with 10+ years driving end-to-end design strategy, qualitative research labs, and atomic enterprise design systems.',
      executive: 'Head of Design leading 25+ product designers and design systems engineers, fostering human-centered craft and brand consistency.'
    },
    bullets: [
      'Spearheaded enterprise design system tokens across iOS, Android, and Web platforms, reducing frontend UI development time by 40%.',
      'Redesigned complex checkout workflows based on 30 usability test sessions, decreasing user friction and cart abandonment by 27%.',
      'Established high-fidelity interactive prototyping standards in Figma, accelerating executive stakeholder approvals from 3 weeks to 4 business days.'
    ],
    skills: 'Figma, Design Systems, UX Research, Usability Testing, Wireframing, Interaction Design, WCAG 2.1 Accessibility, Information Architecture'
  },
  'marketing-growth': {
    title: 'Digital Marketing, SEO & Growth Ops',
    summaries: {
      entry: 'Growth Marketing Specialist experienced in paid performance advertising, social media campaigns, and Google Analytics conversion tracking.',
      mid: 'Performance Marketing Manager with 5+ years scaling multi-channel paid acquisition budgets with sub-3-month CAC payback cycles.',
      senior: 'Growth Marketing Director with 9+ years managing $6M+ annual marketing budgets, organic SEO dominance, and lifecycle retention funnels.',
      executive: 'Chief Marketing Officer delivering full-funnel customer acquisition, viral loop mechanics, and corporate brand positioning.'
    },
    bullets: [
      'Scaled paid search and programmatic ad spend from $40K to $280K monthly while decreasing Blended Customer Acquisition Cost (CAC) by 31%.',
      'Engineered programmatic SEO content architecture that expanded organic search traffic from 120K to 850K unique monthly visits within 10 months.',
      'Revamped automated customer lifecycle email onboarding series, boosting trial-to-paid conversion rates from 4.8% to 8.2% across 150K subscribers.'
    ],
    skills: 'Performance Marketing, SEO, Paid Search (SEM), Meta Ads, Google Analytics 4, HubSpot, Customer Lifecycle, A/B Testing, CAC/LTV Analysis'
  },
  'sales-enterprise': {
    title: 'Enterprise B2B Sales & Business Development',
    summaries: {
      entry: 'Ambitious Business Development Representative (BDR) with record of cold outreach prospecting and qualified meeting pipeline generation.',
      mid: 'Account Executive with 5+ years managing full-cycle enterprise sales cycles from discovery to contract closure with $1.5M annual quotas.',
      senior: 'Enterprise Strategic Sales Director with 10+ years closing 6- and 7-figure enterprise software licensing contracts with Global 2000 logos.',
      executive: 'VP of Global Sales managing 45+ enterprise account executives and sales engineers, consistently delivering 115%+ annual quota attainment.'
    },
    bullets: [
      'Exceeded annual enterprise revenue quota by 138% ($3.4M closed ARR against $2.5M target) by securing 8 Fortune 500 multi-year contracts.',
      'Spearheaded key account expansion strategy within top 20 accounts, driving a 34% Net Expansion Rate through multi-department cross-selling.',
      'Shortened average complex enterprise sales cycle from 9 months to 5.5 months by standardizing technical proof-of-concept (POC) criteria.'
    ],
    skills: 'Enterprise B2B Sales, MEDDIC, Solution Selling, Salesforce, Account-Based Marketing (ABM), Contract Negotiation, Pipeline Forecasting'
  },
  'finance-banking': {
    title: 'Finance, Investment Banking & FinTech',
    summaries: {
      entry: 'Financial Analyst with strong mastery of discounted cash flow (DCF) modeling, financial statement analysis, and valuation benchmarks.',
      mid: 'Senior Financial Planning & Analysis (FP&A) Analyst with 5+ years developing corporate annual budgets and variance models.',
      senior: 'Director of Corporate Finance with 10+ years leading capital allocation, syndicate debt financing, and M&A financial due diligence.',
      executive: 'Chief Financial Officer (CFO) directing capital structure, investor relations, treasury management, and audit committee compliance.'
    },
    bullets: [
      'Constructed 3-statement financial forecasting model and liquidity scenarios, preserving $14M in working capital during turbulent interest rate shifts.',
      'Led financial due diligence and valuation analysis for $45M strategic acquisition, uncovering $3.2M in post-merger operational cost synergies.',
      'Automated rolling quarterly FP&A variance reporting using SQL and PowerBI, cutting monthly board deck preparation cycle by 6 business days.'
    ],
    skills: 'Financial Modeling, DCF Valuation, FP&A, Budgeting, M&A Due Diligence, ERP Systems, PowerBI, Excel VBA, Treasury, Capital Allocation'
  },
  'cybersecurity': {
    title: 'Cybersecurity, InfoSec & Compliance',
    summaries: {
      entry: 'Junior Information Security Analyst with certifications in CompTIA Security+ and practical experience in vulnerability scanning and SOC triage.',
      mid: 'Cybersecurity Engineer with 5+ years hardening cloud perimeters, configuring SIEM alerts, and executing incident response plans.',
      senior: 'Principal Security Architect with 9+ years designing Zero-Trust architectures, threat modeling, and SOC2/ISO 27001 regulatory certifications.',
      executive: 'Chief Information Security Officer (CISO) responsible for global enterprise cybersecurity governance, board risk reporting, and SecOps.'
    },
    bullets: [
      'Engineered enterprise Zero-Trust network architecture across 4,500 endpoints, eliminating unauthorized lateral network traversal vectors.',
      'Led end-to-end SOC2 Type II and ISO 27001 compliance audit with zero critical non-conformities, unlocking $22M in enterprise sales pipeline.',
      'Spearheaded incident response automation within Splunk SOAR, reducing mean time to detect and contain malicious phishing campaigns by 78%.'
    ],
    skills: 'Zero Trust, SIEM/SOAR, Splunk, Penetration Testing, SOC 2, ISO 27001, Vulnerability Management, Incident Response, IAM, CISSP'
  },
  'healthcare-nursing': {
    title: 'Healthcare, Clinical Practice & Nursing',
    summaries: {
      entry: 'Dedicated Registered Nurse (RN) with acute clinical care training, patient advocacy dedication, and Epic EHR documentation proficiency.',
      mid: 'Clinical Nurse Specialist with 6+ years managing ICU emergency interventions, medication administration protocols, and care coordination.',
      senior: 'Nurse Manager / Clinical Operations Director with 10+ years directing 40+ clinical staff and ensuring Joint Commission compliance standards.',
      executive: 'Chief Nursing Officer / Healthcare Administrator leading patient safety initiatives, multi-million dollar hospital budgets, and clinical excellence.'
    },
    bullets: [
      'Managed 24-bed intensive care unit patient flow, elevating overall patient satisfaction ratings from 78% to 94% through compassionate communication.',
      'Instituted revised CLABSI infection control protocol that eliminated catheter-related bloodstream infections over a 14-month continuous period.',
      'Trained and precepted 18 incoming clinical nurses on Epic EHR documentation, medication safety protocols, and emergency triage workflows.'
    ],
    skills: 'Clinical Patient Care, Critical Care / ICU, Epic EHR, Patient Advocacy, Infection Control, Triage Assessment, BLS/ACLS Certified, Pharmacology'
  },
  'human-resources': {
    title: 'Human Resources, People Ops & Talent Acquisition',
    summaries: {
      entry: 'People Operations Coordinator with strong skills in employee onboarding, applicant tracking systems (ATS), and cultural engagement initiatives.',
      mid: 'HR Business Partner with 5+ years partnering with business unit leaders on talent retention, compensation benchmarking, and performance reviews.',
      senior: 'Head of Talent Acquisition & People Ops with 9+ years scaling teams from 80 to 450+ employees while maintaining high diversity benchmarks.',
      executive: 'Chief People Officer leading global human resources, organizational design, executive compensation, and culture transformations.'
    },
    bullets: [
      'Scaled global engineering and sales headcount by 140+ hires within 12 months while reducing average cost-per-hire by 28% through inbound referral programs.',
      'Designed and executed company-wide compensation leveling matrix and equity benchmarking framework, slashing voluntary employee turnover by 19%.',
      'Rolled out employee engagement pulse surveys with Workday, driving actionable managerial coaching that elevated company eNPS from +18 to +54.'
    ],
    skills: 'Talent Acquisition, People Operations, HRBP, Compensation & Benefits, Workday, Greenhouse, Performance Management, DEI Strategy'
  },
  'supply-chain': {
    title: 'Supply Chain, Logistics & Operations',
    summaries: {
      entry: 'Supply Chain Analyst skilled in inventory tracking, supplier communications, and ERP data reconciliation using SAP and Excel.',
      mid: 'Logistics & Procurement Manager with 5+ years optimizing freight transit routes, warehouse storage velocity, and vendor SLAs.',
      senior: 'Director of Global Supply Chain with 10+ years overseeing international freight forwarding, demand forecasting, and inventory reduction.',
      executive: 'VP of Global Operations directing $65M global distribution networks, automated fulfillment hubs, and lean six sigma methodologies.'
    },
    bullets: [
      'Renegotiated ocean and air freight carrier contracts across 14 logistics partners, generating $1.85M in annualized logistics cost savings.',
      'Implemented dynamic ERP safety-stock algorithms in SAP, reducing inventory holding costs by 22% while boosting order fulfillment rates to 99.4%.',
      'Spearheaded automation transition of 180,000 sq ft regional distribution facility, improving picker throughput from 65 to 110 units per hour.'
    ],
    skills: 'Supply Chain Management, SAP ERP, Demand Forecasting, Inventory Optimization, Logistics & Freight, Vendor Procurement, Lean Six Sigma'
  },
  'legal-compliance': {
    title: 'Legal Affairs, Corporate Governance & IP',
    summaries: {
      entry: 'Junior Legal Counsel / Paralegal with expertise in contract lifecycle management, NDAs, and corporate filing governance.',
      mid: 'Corporate Counsel with 5+ years drafting commercial licensing agreements, SaaS contracts, and managing data privacy compliance (GDPR/CCPA).',
      senior: 'Senior Legal Director with 10+ years directing complex M&A transactions, cross-border intellectual property litigation, and regulatory affairs.',
      executive: 'General Counsel & Corporate Secretary advising executive board on fiduciary responsibilities, capital markets, and international risk.'
    },
    bullets: [
      'Drafted, negotiated, and closed 180+ commercial enterprise customer agreements totaling $38M in contract value with zero material liabilities.',
      'Developed comprehensive enterprise data privacy compliance playbook for GDPR, CCPA, and HIPAA across 12 product lines.',
      'Managed corporate intellectual property portfolio of 42 international patents and trademarks, successfully defending 3 key patent claims.'
    ],
    skills: 'Corporate Law, Commercial Contracts, Data Privacy (GDPR/CCPA), Regulatory Compliance, Intellectual Property, Risk Mitigation, M&A Due Diligence'
  },
  'education-elearning': {
    title: 'Education, Instructional Design & Academia',
    summaries: {
      entry: 'Enthusiastic Educator with background in lesson planning, differentiated student instruction, and digital classroom engagement tools.',
      mid: 'Instructional Designer & Curriculum Specialist with 5+ years developing interactive e-learning modules and SCORM-compliant LMS coursework.',
      senior: 'Academic Dean / Director of Online Learning with 10+ years overseeing faculty development, institutional accreditation, and student outcomes.',
      executive: 'VP of Learning & Development directing enterprise corporate university training curricula for 15,000+ global workforce personnel.'
    },
    bullets: [
      'Designed and deployed 14 asynchronous e-learning certification modules on Canvas LMS, achieving 96% learner completion rate across 4,200 students.',
      'Integrated gamified assessment feedback loops that increased student engagement and elevated standardized test scores by 1.8 grade levels.',
      'Authored university-wide remote instruction pedagogical standards, training 85 faculty members on active digital learning methodologies.'
    ],
    skills: 'Curriculum Development, Instructional Design, LMS (Canvas, Blackboard), SCORM, Adult Learning Theory, Educational Assessment, E-Learning'
  },
  'architecture-construction': {
    title: 'Architecture & Civil Engineering',
    summaries: {
      entry: 'Junior Architect with strong proficiency in AutoCAD, Revit BIM modeling, and municipal zoning code documentation.',
      mid: 'Licensed Project Architect with 6+ years managing commercial mixed-use construction documentation and contractor site administration.',
      senior: 'Senior Architectural Project Director with 12+ years managing $50M+ civic developments, LEED Platinum sustainability, and MEP engineering.',
      executive: 'Principal Architectural Partner managing firm operations, design competitions, and landmark urban development projects.'
    },
    bullets: [
      'Delivered full architectural construction document sets in Revit for $42M commercial mixed-use tower, finishing 3 weeks ahead of milestone schedule.',
      'Spearheaded LEED Gold certification documentation for 120,000 sq ft headquarters, incorporating passive solar cooling to cut energy consumption by 28%.',
      'Coordinated multidisciplinary BIM clash detection between structural and MEP engineering teams, preventing an estimated $340K in field change orders.'
    ],
    skills: 'Revit BIM, AutoCAD, LEED Sustainable Design, Construction Administration, Building Codes, Structural Coordination, Rhino, 3D Rendering'
  },
  'creative-media': {
    title: 'Creative Direction, Multimedia & Journalism',
    summaries: {
      entry: 'Multimedia Journalist & Content Creator skilled in digital storytelling, premiere video editing, audio mixing, and social video hooks.',
      mid: 'Senior Creative Producer with 5+ years directing brand campaigns, video production, and high-impact digital editorial content.',
      senior: 'Creative Director with 10+ years directing global brand identity overhauls, video commercial campaigns, and multi-award winning portfolios.',
      executive: 'VP of Content & Executive Creative Director overseeing multi-platform media publications reaching 30M+ monthly digital readers.'
    },
    bullets: [
      'Directed multi-channel visual rebranding campaign for consumer lifestyle client, resulting in 48% surge in organic social engagement.',
      'Produced award-winning 6-part video documentary series garnering 4.2M cross-platform views and 2 industry film festival nominations.',
      'Managed 12-person creative studio consisting of art directors, animators, and copywriters, consistently delivering 45+ assets per sprint cycle.'
    ],
    skills: 'Creative Direction, Video Production, Adobe Premiere, After Effects, Storyboarding, Copywriting, Brand Identity, Multimedia Journalism'
  },
  'hospitality-tourism': {
    title: 'Hospitality, Luxury Travel & Events',
    summaries: {
      entry: 'Guest Experience Specialist passionate about 5-star concierge services, luxury guest relations, and front-desk property management software.',
      mid: 'Food & Beverage Operations Manager with 5+ years driving high-volume restaurant profitability, banquet execution, and staff training.',
      senior: 'Luxury Hotel General Manager with 10+ years directing 250-room boutique resorts, RevPAR growth, and Forbes 5-Star service standards.',
      executive: 'VP of Hospitality Operations managing portfolio of 14 luxury resort properties with $85M annual room and culinary revenues.'
    },
    bullets: [
      'Elevated resort guest satisfaction score from 84% to 96%, leading property to achieve prestigious Forbes Travel Guide 5-Star status.',
      'Optimized room rate yield management algorithms during high-season events, boosting Revenue Per Available Room (RevPAR) by 18.4%.',
      'Spearheaded private luxury VIP events portfolio hosting high-profile corporate galas, generating $2.1M in incremental catering revenues.'
    ],
    skills: 'Hospitality Management, Guest Relations, RevPAR Yield Management, Opera PMS, Event Production, Luxury Concierge, Food & Beverage Ops'
  },
  'ecommerce-retail': {
    title: 'E-Commerce, Direct-to-Consumer & Retail',
    summaries: {
      entry: 'E-Commerce Specialist experienced with Shopify store configuration, product merchandising, and order fulfillment workflows.',
      mid: 'E-Commerce Merchandising Manager with 5+ years managing online product catalogs, conversion rate optimization (CRO), and promotional calendars.',
      senior: 'Director of E-Commerce with 9+ years managing $25M+ DTC digital storefronts, checkout funnel UX, and omnichannel store integrations.',
      executive: 'VP of Digital Commerce scaling international online retail brands across North America, Europe, and Asia-Pacific markets.'
    },
    bullets: [
      'Scaled Shopify Plus digital storefront from $6M to $22M annual GMV through optimized upsell bundling, increasing Average Order Value (AOV) by 24%.',
      'Orchestrated site-wide page speed optimization and checkout friction audit, decreasing mobile bounce rates by 33% and increasing checkout conversion by 1.6%.',
      'Implemented automated returns and customer exchange portal, slashing support ticket volume by 45% while recovering 28% of refunded revenue into store credits.'
    ],
    skills: 'Shopify Plus, E-Commerce Strategy, CRO, Merchandising, Google Analytics, Klaviyo, AOV Optimization, Inventory Merchandising, DTC Growth'
  },
  'biotech-pharma': {
    title: 'Biotechnology & Pharmaceutical Sciences',
    summaries: {
      entry: 'Research Associate with laboratory experience in cell culture, PCR assays, HPLC chromatography, and strict GLP documentation.',
      mid: 'Senior Scientist with 5+ years leading bioanalytical assay development, pharmacokinetic studies, and bioprocess purification.',
      senior: 'Director of Preclinical Drug Discovery with 10+ years advancing oncology therapeutic candidates from target validation into Phase I trials.',
      executive: 'Chief Scientific Officer (CSO) managing pipeline portfolio of 6 novel biologic therapeutics, FDA IND filings, and scientific advisory boards.'
    },
    bullets: [
      'Led assay development for novel monoclonal antibody candidate, advancing compound through pre-clinical toxicology toward FDA IND filing approval.',
      'Optimized bioreactor mammalian cell expression parameters, increasing recombinant protein yield by 42% and shortening downstream purification cycle.',
      'Authored 4 peer-reviewed manuscripts in high-impact scientific journals and filed 2 international patents for novel target inhibition mechanisms.'
    ],
    skills: 'Bioprocess Engineering, Assay Development, HPLC, Cell Culture, FDA IND Regulatory Protocols, GLP/GMP, Data Analysis, Molecular Biology'
  },
  'executive-csuite': {
    title: 'Executive Management & C-Suite Advisory',
    summaries: {
      entry: 'Executive Chief of Staff with background in corporate strategic planning, board preparation, and cross-functional project governance.',
      mid: 'Managing Director of Strategy with 6+ years orchestrating corporate turnarounds, market entry feasibility, and executive OKR tracking.',
      senior: 'Executive Vice President of Operations with 12+ years directing $100M+ P&L operations, corporate governance, and organizational transformation.',
      executive: 'Chief Executive Officer (CEO) with proven track record leading high-growth technology enterprises through successful exits and public offerings.'
    },
    bullets: [
      'Delivered full P&L oversight for $85M global business unit, expanding operating profit margins from 18% to 28.5% over 3-year transformation roadmap.',
      'Led successful corporate capital raise securing $40M Series C financing round led by premier Tier-1 institutional technology venture funds.',
      'Restructured 250-person organizational matrix into autonomous product squads, accelerating feature delivery velocity by 35%.'
    ],
    skills: 'P&L Management, Executive Leadership, Board Governance, Capital Markets, M&A Strategy, Strategic Planning, Enterprise Transformation'
  }
};

// 2. Preset Full Profiles for Instant One-Click Pre-fill
const PRESETS = {
  tech: {
    fullName: 'Alexander Vance',
    headline: 'Senior Principal Cloud Solutions Architect',
    email: 'alexander.vance@example.com',
    phone: '+1 (555) 019-2834',
    location: 'San Francisco, CA',
    website: 'linkedin.com/in/alexvance',
    industry: 'cloud-devops',
    targetRole: 'Senior Principal Cloud Solutions Architect',
    seniority: 'senior',
    summary: 'Distinguished Cloud Solutions Architect with 12+ years spearheading large-scale distributed cloud systems, FinOps infrastructure optimization, and multi-region Kubernetes deployments for Fortune 100 enterprise organizations.',
    experiences: [
      {
        id: 'exp-1',
        title: 'Principal Cloud Architect',
        company: 'Vanguard Systems Cloud Global',
        location: 'San Francisco, CA',
        dates: '2022 - Present',
        bullets: 'Architected distributed multi-region Kubernetes clusters on AWS handling 65M+ daily requests with 99.995% uptime.\nInstituted automated FinOps governance frameworks slashing cloud infrastructure expenditure by $1.4M annually.\nMentored 16 senior platform engineers and standardized Infrastructure-as-Code modules using Terraform and Terragrunt.'
      },
      {
        id: 'exp-2',
        title: 'Lead DevOps & SRE Engineer',
        company: 'Apex Data Networks',
        location: 'San Jose, CA',
        dates: '2018 - 2022',
        bullets: 'Orchestrated automated zero-downtime CI/CD deployment pipelines across 90+ microservices using GitHub Actions and Helm.\nIntegrated end-to-end distributed tracing with OpenTelemetry and Grafana, reducing Mean Time to Resolution (MTTR) by 48%.\nLed disaster recovery tabletop simulations and automated cross-region failover protocols.'
      }
    ],
    educations: [
      {
        id: 'edu-1',
        degree: 'Master of Science (M.S.)',
        major: 'Computer Science & Distributed Systems',
        institution: 'Stanford University',
        year: '2016',
        honors: 'Summa Cum Laude, GPA: 3.94'
      },
      {
        id: 'edu-2',
        degree: 'Bachelor of Science (B.S.)',
        major: 'Electrical Engineering & Computer Science',
        institution: 'UC Berkeley',
        year: '2014',
        honors: 'Dean\'s Honors List'
      }
    ],
    certifications: 'AWS Certified Solutions Architect Professional, Certified Kubernetes Administrator (CKA), HashiCorp Certified Terraform Associate',
    skills: 'Distributed Systems, Kubernetes, AWS, Terraform, Docker, Go, Python, OpenTelemetry, Helm, Kafka, Linux Kernel, FinOps, SRE',
    softSkills: 'Cross-Functional Technical Leadership, Architecture Review Board (ARB), Cloud Governance, Mentorship',
    languages: 'English (Native), German (Professional Working)'
  },
  marketing: {
    fullName: 'Elena Rostova',
    headline: 'VP of Growth & Performance Marketing',
    email: 'elena.rostova@example.com',
    phone: '+1 (415) 890-4122',
    location: 'New York, NY',
    website: 'linkedin.com/in/elenarostova',
    industry: 'marketing-growth',
    targetRole: 'VP of Growth & Performance Marketing',
    seniority: 'executive',
    summary: 'Data-driven Growth Marketing Executive with 11+ years directing $15M+ annual paid media portfolios, programmatic SEO content engines, and high-converting product lifecycle retention funnels across B2B SaaS and consumer tech.',
    experiences: [
      {
        id: 'exp-1',
        title: 'Global Head of Growth Marketing',
        company: 'Hyperion Analytics Corp',
        location: 'New York, NY',
        dates: '2021 - Present',
        bullets: 'Scaled monthly marketing pipeline from $1.8M to $6.5M in qualified enterprise ARR while reducing blended CAC by 29%.\nManaged $14M annual performance budget spanning Meta, Google Search, LinkedIn Ads, and programmatic display.\nArchitected viral referral loop and onboarding gamification that increased user product activation by 34%.'
      },
      {
        id: 'exp-2',
        title: 'Director of Demand Generation',
        company: 'PulseMetrics Media',
        location: 'Boston, MA',
        dates: '2017 - 2021',
        bullets: 'Engineered programmatic SEO content architecture that expanded organic web traffic from 250K to 1.8M monthly visits.\nRestructured marketing ops and HubSpot attribution models, giving executive leadership multi-touch conversion clarity.\nSupervised 14-person performance marketing, copywriting, and design studio.'
      }
    ],
    educations: [
      {
        id: 'edu-1',
        degree: 'Master of Business Administration (MBA)',
        major: 'Marketing & Data Analytics',
        institution: 'Columbia Business School',
        year: '2017',
        honors: 'Beta Gamma Sigma Honors'
      },
      {
        id: 'edu-2',
        degree: 'Bachelor of Arts (B.A.)',
        major: 'Communications & Economics',
        institution: 'New York University',
        year: '2014',
        honors: 'Magna Cum Laude'
      }
    ],
    certifications: 'Google Analytics 4 Certified, HubSpot Marketing Hub Inbound Master, Reforge Growth Series Alum',
    skills: 'Performance Marketing, Paid Search, Paid Social, SEO Strategy, HubSpot, Google Analytics 4, Mixpanel, LTV/CAC Optimization, Attribution Modeling',
    softSkills: 'P&L Ownership, Cross-Functional Team Leadership, Creative Direction, Executive Stakeholder Alignment',
    languages: 'English (Native), French (Fluent)'
  },
  finance: {
    fullName: 'Marcus Sterling',
    headline: 'Head of Product - FinTech & Capital Infrastructure',
    email: 'marcus.sterling@example.com',
    phone: '+1 (312) 774-9021',
    location: 'Chicago, IL',
    website: 'linkedin.com/in/marcussterling',
    industry: 'product-management',
    targetRole: 'Head of Product - Payments & FinTech',
    seniority: 'senior',
    summary: 'Principal FinTech Product Leader with 10+ years spearheading global payment rails, automated treasury operations, and merchant API infrastructure processing over $4.5B in cumulative annualized transaction volume.',
    experiences: [
      {
        id: 'exp-1',
        title: 'Principal Product Manager - Core Payments',
        company: 'Nexus Financial Technologies',
        location: 'Chicago, IL',
        dates: '2021 - Present',
        bullets: 'Spearheaded launch of real-time ACH and cross-border settlement rails processing $280M monthly transaction volume.\nReduced payment settlement processing failures by 41% through intelligent multi-processor failover routing algorithms.\nDirected 3 agile engineering squads and collaborated with compliance officers to adhere to PCI-DSS Level 1 standards.'
      },
      {
        id: 'exp-2',
        title: 'Senior Product Manager',
        company: 'Starlight Merchant Solutions',
        location: 'Chicago, IL',
        dates: '2017 - 2021',
        bullets: 'Redesigned merchant developer documentation and onboarding SDKs, cutting partner integration time from 6 weeks to 4 days.\nLaunched modular fraud prevention screening tool that slashed fraudulent chargebacks by 52% in its first year.\nFormulated product strategy for mobile point-of-sale checkout hardware used by 12,000+ retail storefronts.'
      }
    ],
    educations: [
      {
        id: 'edu-1',
        degree: 'Master of Science (M.S.)',
        major: 'Financial Engineering',
        institution: 'University of Chicago',
        year: '2016',
        honors: 'Dean\'s Scholar'
      },
      {
        id: 'edu-2',
        degree: 'Bachelor of Science (B.S.)',
        major: 'Applied Mathematics & Economics',
        institution: 'Northwestern University',
        year: '2013',
        honors: 'Cum Laude'
      }
    ],
    certifications: 'Pragmatic Institute Certified (PMC-III), Scrum Alliance Certified Scrum Product Owner (CSPO)',
    skills: 'FinTech Strategy, Payment Rails (ACH/Wire/SEPA), API Architecture, SQL, JIRA, Amplitude, PCI-DSS Compliance, Fraud Prevention',
    softSkills: 'Product Strategy, Executive Roadmapping, Risk Management, Stakeholder Negotiation',
    languages: 'English (Native), Mandarin (Conversational)'
  }
};

// 3. Application State
const state = {
  currentStep: 1,
  theme: 'midnight-luxury',
  experiences: [],
  educations: []
};

// 4. Initialize DOM & Listeners
document.addEventListener('DOMContentLoaded', () => {
  initDOM();
  loadProfileData(PRESETS.tech);
});

function initDOM() {
  // Stepper buttons
  document.querySelectorAll('.stepper-nav .step-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const step = parseInt(btn.dataset.step, 10);
      goToStep(step);
    });
  });

  // Next / Prev step buttons
  document.querySelectorAll('.next-step-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const next = parseInt(btn.dataset.next, 10);
      goToStep(next);
    });
  });

  document.querySelectorAll('.prev-step-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const prev = parseInt(btn.dataset.prev, 10);
      goToStep(prev);
    });
  });

  // Preset Buttons
  document.getElementById('btnLoadTechPreset')?.addEventListener('click', () => loadProfileData(PRESETS.tech));
  document.getElementById('btnLoadMarketingPreset')?.addEventListener('click', () => loadProfileData(PRESETS.marketing));
  document.getElementById('btnLoadFinancePreset')?.addEventListener('click', () => loadProfileData(PRESETS.finance));
  document.getElementById('btnResetForm')?.addEventListener('click', resetAllFields);

  // Experience and Education Add Buttons
  document.getElementById('btnAddExperience')?.addEventListener('click', () => {
    addExperienceRow();
    updateLivePreview();
  });

  document.getElementById('btnAddEducation')?.addEventListener('click', () => {
    addEducationRow();
    updateLivePreview();
  });

  // AI Generators
  document.getElementById('btnDraftAISummary')?.addEventListener('click', generateAISummary);
  document.getElementById('btnSuggestIndustrySkills')?.addEventListener('click', suggestIndustrySkills);

  // Theme Selector
  document.querySelectorAll('.theme-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('.theme-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      const chosenTheme = chip.dataset.theme;
      setCVTheme(chosenTheme);
    });
  });

  // Input Change Listeners for Instant Live Preview
  const reactiveInputs = [
    'inputFullName', 'inputHeadline', 'inputEmail', 'inputPhone', 
    'inputLocation', 'inputWebsite', 'inputTargetRole', 'inputSummary',
    'inputCertifications', 'inputSkills', 'inputSoftSkills', 'inputLanguages'
  ];

  reactiveInputs.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('input', updateLivePreview);
    }
  });

  // Action Buttons
  document.getElementById('btnCopyCVText')?.addEventListener('click', copyFormattedCVText);
  document.getElementById('btnPrintCV')?.addEventListener('click', () => window.print());
  document.getElementById('btnScrollToPreview')?.addEventListener('click', () => {
    const previewEl = document.getElementById('previewArea');
    if (previewEl) {
      previewEl.scrollIntoView({ behavior: 'smooth' });
    }
  });
}

// 5. Stepper Navigation
function goToStep(stepNumber) {
  state.currentStep = stepNumber;

  // Update tabs
  document.querySelectorAll('.stepper-nav .step-btn').forEach(btn => {
    const step = parseInt(btn.dataset.step, 10);
    btn.classList.toggle('active', step === stepNumber);
    btn.classList.toggle('completed', step < stepNumber);
  });

  // Update panes
  document.querySelectorAll('.step-pane').forEach((pane, idx) => {
    pane.classList.toggle('active', (idx + 1) === stepNumber);
  });
}

// 6. Experience Management
function addExperienceRow(data = null) {
  const newId = 'exp-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
  const expItem = data || {
    id: newId,
    title: 'Senior Professional Role',
    company: 'Enterprise Technology Corp',
    location: 'San Francisco, CA',
    dates: '2021 - Present',
    bullets: 'Spearheaded key initiatives driving high-impact organizational outcomes.\nOptimized core workflows and reduced operating friction across multi-disciplinary teams.'
  };

  state.experiences.push(expItem);
  renderExperienceList();
  updateLivePreview();
}

function removeExperienceRow(id) {
  state.experiences = state.experiences.filter(item => item.id !== id);
  renderExperienceList();
  updateLivePreview();
}

function renderExperienceList() {
  const container = document.getElementById('experienceList');
  if (!container) return;

  container.innerHTML = '';

  state.experiences.forEach((exp, index) => {
    const card = document.createElement('div');
    card.className = 'dynamic-card';
    card.dataset.id = exp.id;

    card.innerHTML = `
      <div class="dynamic-card-header">
        <span style="font-size: 0.85rem; font-weight: 700; color: var(--accent);">Position #${index + 1}</span>
        <button type="button" class="remove-card-btn" data-id="${exp.id}">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          Remove
        </button>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
        <div class="form-group">
          <label>Job Title</label>
          <input type="text" class="form-input exp-title" value="${escapeHtml(exp.title)}" placeholder="Job Title">
        </div>
        <div class="form-group">
          <label>Company / Organization</label>
          <input type="text" class="form-input exp-company" value="${escapeHtml(exp.company)}" placeholder="Company Name">
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
        <div class="form-group">
          <label>Location</label>
          <input type="text" class="form-input exp-location" value="${escapeHtml(exp.location)}" placeholder="e.g. San Francisco, CA">
        </div>
        <div class="form-group">
          <label>Date Range</label>
          <input type="text" class="form-input exp-dates" value="${escapeHtml(exp.dates)}" placeholder="e.g. 2022 - Present">
        </div>
      </div>

      <div class="form-group">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.25rem;">
          <label>Achievement Bullet Points (One per line)</label>
          <button type="button" class="ai-pill-btn btn-suggest-exp-bullets" data-id="${exp.id}">✨ AI Suggest Bullets</button>
        </div>
        <textarea class="form-textarea exp-bullets" style="min-height: 90px;" placeholder="• Accomplished X as measured by Y...">${escapeHtml(exp.bullets)}</textarea>
      </div>
    `;

    // Listeners for this card
    const removeBtn = card.querySelector('.remove-card-btn');
    removeBtn?.addEventListener('click', () => removeExperienceRow(exp.id));

    const suggestBtn = card.querySelector('.btn-suggest-exp-bullets');
    suggestBtn?.addEventListener('click', () => suggestBulletsForExperience(exp.id));

    const inputs = card.querySelectorAll('input, textarea');
    inputs.forEach(input => {
      input.addEventListener('input', () => {
        exp.title = card.querySelector('.exp-title').value;
        exp.company = card.querySelector('.exp-company').value;
        exp.location = card.querySelector('.exp-location').value;
        exp.dates = card.querySelector('.exp-dates').value;
        exp.bullets = card.querySelector('.exp-bullets').value;
        updateLivePreview();
      });
    });

    container.appendChild(card);
  });
}

function suggestBulletsForExperience(expId) {
  const indKey = document.getElementById('selectIndustry')?.value || 'software-engineering';
  const domain = INDUSTRY_KNOWLEDGEBASE[indKey] || INDUSTRY_KNOWLEDGEBASE['software-engineering'];
  
  const expObj = state.experiences.find(e => e.id === expId);
  if (expObj) {
    const bulletsFormatted = domain.bullets.join('\n');
    expObj.bullets = bulletsFormatted;
    renderExperienceList();
    updateLivePreview();
  }
}

// 7. Education Management
function addEducationRow(data = null) {
  const newId = 'edu-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
  const eduItem = data || {
    id: newId,
    degree: 'Bachelor of Science (B.S.)',
    major: 'Computer Science',
    institution: 'State University',
    year: '2020',
    honors: 'Dean\'s Honor List'
  };

  state.educations.push(eduItem);
  renderEducationList();
  updateLivePreview();
}

function removeEducationRow(id) {
  state.educations = state.educations.filter(item => item.id !== id);
  renderEducationList();
  updateLivePreview();
}

function renderEducationList() {
  const container = document.getElementById('educationList');
  if (!container) return;

  container.innerHTML = '';

  state.educations.forEach((edu, index) => {
    const card = document.createElement('div');
    card.className = 'dynamic-card';
    card.dataset.id = edu.id;

    card.innerHTML = `
      <div class="dynamic-card-header">
        <span style="font-size: 0.85rem; font-weight: 700; color: var(--accent);">Degree #${index + 1}</span>
        <button type="button" class="remove-card-btn" data-id="${edu.id}">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          Remove
        </button>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
        <div class="form-group">
          <label>Degree / Qualification</label>
          <input type="text" class="form-input edu-degree" value="${escapeHtml(edu.degree)}" placeholder="e.g. Master of Science (M.S.)">
        </div>
        <div class="form-group">
          <label>Field of Study / Major</label>
          <input type="text" class="form-input edu-major" value="${escapeHtml(edu.major)}" placeholder="e.g. Computer Science">
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 0.75rem;">
        <div class="form-group">
          <label>University or College</label>
          <input type="text" class="form-input edu-institution" value="${escapeHtml(edu.institution)}" placeholder="University Name">
        </div>
        <div class="form-group">
          <label>Graduation Year</label>
          <input type="text" class="form-input edu-year" value="${escapeHtml(edu.year)}" placeholder="e.g. 2018">
        </div>
      </div>

      <div class="form-group">
        <label>Honors / Distinction / GPA (Optional)</label>
        <input type="text" class="form-input edu-honors" value="${escapeHtml(edu.honors || '')}" placeholder="e.g. Summa Cum Laude, GPA: 3.9">
      </div>
    `;

    const removeBtn = card.querySelector('.remove-card-btn');
    removeBtn?.addEventListener('click', () => removeEducationRow(edu.id));

    const inputs = card.querySelectorAll('input');
    inputs.forEach(input => {
      input.addEventListener('input', () => {
        edu.degree = card.querySelector('.edu-degree').value;
        edu.major = card.querySelector('.edu-major').value;
        edu.institution = card.querySelector('.edu-institution').value;
        edu.year = card.querySelector('.edu-year').value;
        edu.honors = card.querySelector('.edu-honors').value;
        updateLivePreview();
      });
    });

    container.appendChild(card);
  });
}

// 8. AI Generators
function generateAISummary() {
  const indKey = document.getElementById('selectIndustry')?.value || 'software-engineering';
  const seniority = document.getElementById('selectSeniority')?.value || 'senior';
  const domain = INDUSTRY_KNOWLEDGEBASE[indKey] || INDUSTRY_KNOWLEDGEBASE['software-engineering'];

  const generated = domain.summaries[seniority] || domain.summaries.senior;
  const summaryInput = document.getElementById('inputSummary');
  if (summaryInput) {
    summaryInput.value = generated;
  }
  updateLivePreview();
}

function suggestIndustrySkills() {
  const indKey = document.getElementById('selectIndustry')?.value || 'software-engineering';
  const domain = INDUSTRY_KNOWLEDGEBASE[indKey] || INDUSTRY_KNOWLEDGEBASE['software-engineering'];
  const skillsInput = document.getElementById('inputSkills');
  if (skillsInput && domain.skills) {
    skillsInput.value = domain.skills;
  }
  updateLivePreview();
}

// 9. Live Preview Rendering
function updateLivePreview() {
  // Contact
  const fullName = document.getElementById('inputFullName')?.value || 'Your Name';
  const headline = document.getElementById('inputHeadline')?.value || 'Professional Title';
  const email = document.getElementById('inputEmail')?.value || 'email@example.com';
  const phone = document.getElementById('inputPhone')?.value || '+1 (555) 000-0000';
  const location = document.getElementById('inputLocation')?.value || 'City, Country';
  const website = document.getElementById('inputWebsite')?.value || '';

  const elName = document.getElementById('previewFullName');
  const elHeadline = document.getElementById('previewHeadline');
  const elEmail = document.getElementById('previewEmail');
  const elPhone = document.getElementById('previewPhone');
  const elLocation = document.getElementById('previewLocation');
  const elWebsite = document.getElementById('previewWebsite');

  if (elName) elName.textContent = fullName;
  if (elHeadline) elHeadline.textContent = headline;
  if (elEmail) elEmail.textContent = email;
  if (elPhone) elPhone.textContent = phone;
  if (elLocation) elLocation.textContent = location;
  if (elWebsite) elWebsite.textContent = website;

  // Summary
  const summary = document.getElementById('inputSummary')?.value || '';
  const summarySection = document.getElementById('previewSummarySection');
  const previewSummary = document.getElementById('previewSummary');
  if (summarySection && previewSummary) {
    if (summary.trim()) {
      summarySection.style.display = 'block';
      previewSummary.textContent = summary;
    } else {
      summarySection.style.display = 'none';
    }
  }

  // Experiences
  const expContainer = document.getElementById('previewExperienceList');
  if (expContainer) {
    expContainer.innerHTML = '';
    state.experiences.forEach(exp => {
      const expDiv = document.createElement('div');
      expDiv.className = 'cv-item';

      const bulletLines = (exp.bullets || '')
        .split('\n')
        .map(b => b.trim().replace(/^[•\-\*]\s*/, ''))
        .filter(b => b.length > 0);

      const bulletHtml = bulletLines.length > 0
        ? `<ul class="cv-bullets">${bulletLines.map(line => `<li>${escapeHtml(line)}</li>`).join('')}</ul>`
        : '';

      expDiv.innerHTML = `
        <div class="cv-item-header">
          <div>
            <span class="cv-item-role">${escapeHtml(exp.title)}</span>
            <span class="cv-item-company"> — ${escapeHtml(exp.company)}</span>
          </div>
          <div class="cv-item-date cv-text-muted">${escapeHtml(exp.dates)} | ${escapeHtml(exp.location)}</div>
        </div>
        ${bulletHtml}
      `;
      expContainer.appendChild(expDiv);
    });
  }

  // Education
  const eduContainer = document.getElementById('previewEducationList');
  if (eduContainer) {
    eduContainer.innerHTML = '';
    state.educations.forEach(edu => {
      const eduDiv = document.createElement('div');
      eduDiv.className = 'cv-item';

      const honorsText = edu.honors ? ` • <em>${escapeHtml(edu.honors)}</em>` : '';

      eduDiv.innerHTML = `
        <div class="cv-item-header">
          <div>
            <span class="cv-item-role">${escapeHtml(edu.degree)} in ${escapeHtml(edu.major)}</span>
            <span class="cv-item-company"> — ${escapeHtml(edu.institution)}</span>
            ${honorsText}
          </div>
          <div class="cv-item-date cv-text-muted">${escapeHtml(edu.year)}</div>
        </div>
      `;
      eduContainer.appendChild(eduDiv);
    });
  }

  // Certifications
  const certs = document.getElementById('inputCertifications')?.value || '';
  const certsBlock = document.getElementById('previewCertificationsBlock');
  const previewCerts = document.getElementById('previewCertifications');
  if (certsBlock && previewCerts) {
    if (certs.trim()) {
      certsBlock.style.display = 'block';
      previewCerts.textContent = certs;
    } else {
      certsBlock.style.display = 'none';
    }
  }

  // Skills
  const skillsStr = document.getElementById('inputSkills')?.value || '';
  const skillsContainer = document.getElementById('previewSkillsList');
  if (skillsContainer) {
    skillsContainer.innerHTML = '';
    const skillTags = skillsStr.split(',').map(s => s.trim()).filter(s => s.length > 0);
    skillTags.forEach(skill => {
      const tag = document.createElement('span');
      tag.className = 'cv-tag';
      tag.textContent = skill;
      skillsContainer.appendChild(tag);
    });
  }

  // Soft Skills
  const softSkills = document.getElementById('inputSoftSkills')?.value || '';
  const softSkillsBlock = document.getElementById('previewSoftSkillsBlock');
  const previewSoftSkills = document.getElementById('previewSoftSkills');
  if (softSkillsBlock && previewSoftSkills) {
    if (softSkills.trim()) {
      softSkillsBlock.style.display = 'block';
      previewSoftSkills.textContent = softSkills;
    } else {
      softSkillsBlock.style.display = 'none';
    }
  }

  // Languages
  const langs = document.getElementById('inputLanguages')?.value || '';
  const langsBlock = document.getElementById('previewLanguagesBlock');
  const previewLangs = document.getElementById('previewLanguages');
  if (langsBlock && previewLangs) {
    if (langs.trim()) {
      langsBlock.style.display = 'block';
      previewLangs.textContent = langs;
    } else {
      langsBlock.style.display = 'none';
    }
  }
}

// 10. Theme Control
function setCVTheme(themeName) {
  state.theme = themeName;
  const paper = document.getElementById('cvPaper');
  if (paper) {
    paper.setAttribute('data-theme', themeName);
  }
}

// 11. Profile Loader & Reset
function loadProfileData(preset) {
  if (!preset) return;

  document.getElementById('inputFullName').value = preset.fullName;
  document.getElementById('inputHeadline').value = preset.headline;
  document.getElementById('inputEmail').value = preset.email;
  document.getElementById('inputPhone').value = preset.phone;
  document.getElementById('inputLocation').value = preset.location;
  document.getElementById('inputWebsite').value = preset.website;

  const indSelect = document.getElementById('selectIndustry');
  if (indSelect) indSelect.value = preset.industry;

  const senSelect = document.getElementById('selectSeniority');
  if (senSelect) senSelect.value = preset.seniority;

  document.getElementById('inputTargetRole').value = preset.targetRole;
  document.getElementById('inputSummary').value = preset.summary;

  state.experiences = JSON.parse(JSON.stringify(preset.experiences));
  renderExperienceList();

  state.educations = JSON.parse(JSON.stringify(preset.educations));
  renderEducationList();

  document.getElementById('inputCertifications').value = preset.certifications;
  document.getElementById('inputSkills').value = preset.skills;
  document.getElementById('inputSoftSkills').value = preset.softSkills;
  document.getElementById('inputLanguages').value = preset.languages;

  updateLivePreview();
}

function resetAllFields() {
  if (!confirm('Are you sure you want to reset all fields?')) return;

  document.getElementById('inputFullName').value = '';
  document.getElementById('inputHeadline').value = '';
  document.getElementById('inputEmail').value = '';
  document.getElementById('inputPhone').value = '';
  document.getElementById('inputLocation').value = '';
  document.getElementById('inputWebsite').value = '';
  document.getElementById('inputTargetRole').value = '';
  document.getElementById('inputSummary').value = '';
  document.getElementById('inputCertifications').value = '';
  document.getElementById('inputSkills').value = '';
  document.getElementById('inputSoftSkills').value = '';
  document.getElementById('inputLanguages').value = '';

  state.experiences = [];
  state.educations = [];

  renderExperienceList();
  renderEducationList();
  updateLivePreview();
}

// 12. Copy Formatted CV Plain Text
function copyFormattedCVText() {
  const name = document.getElementById('inputFullName')?.value || '';
  const headline = document.getElementById('inputHeadline')?.value || '';
  const email = document.getElementById('inputEmail')?.value || '';
  const phone = document.getElementById('inputPhone')?.value || '';
  const loc = document.getElementById('inputLocation')?.value || '';
  const web = document.getElementById('inputWebsite')?.value || '';
  const summary = document.getElementById('inputSummary')?.value || '';
  const certs = document.getElementById('inputCertifications')?.value || '';
  const skills = document.getElementById('inputSkills')?.value || '';
  const soft = document.getElementById('inputSoftSkills')?.value || '';
  const langs = document.getElementById('inputLanguages')?.value || '';

  let text = `${name.toUpperCase()}\n${headline}\n${email} | ${phone} | ${loc} | ${web}\n\n`;
  
  if (summary) {
    text += `EXECUTIVE PROFILE\n${summary}\n\n`;
  }

  if (state.experiences.length > 0) {
    text += `PROFESSIONAL EXPERIENCE\n`;
    state.experiences.forEach(exp => {
      text += `${exp.title} — ${exp.company} (${exp.dates}) [${exp.location}]\n`;
      if (exp.bullets) {
        exp.bullets.split('\n').forEach(b => {
          if (b.trim()) text += `• ${b.trim().replace(/^[•\-\*]\s*/, '')}\n`;
        });
      }
      text += '\n';
    });
  }

  if (state.educations.length > 0) {
    text += `EDUCATION\n`;
    state.educations.forEach(edu => {
      text += `${edu.degree} in ${edu.major} — ${edu.institution} (${edu.year})`;
      if (edu.honors) text += ` • ${edu.honors}`;
      text += '\n';
    });
    text += '\n';
  }

  if (certs) text += `CERTIFICATIONS\n${certs}\n\n`;
  if (skills) text += `CORE SKILLS\n${skills}\n\n`;
  if (soft) text += `LEADERSHIP & STRATEGY\n${soft}\n\n`;
  if (langs) text += `LANGUAGES\n${langs}\n`;

  navigator.clipboard.writeText(text).then(() => {
    alert('CV text copied to clipboard!');
  }).catch(() => {
    alert('Failed to copy to clipboard.');
  });
}

function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}