// Comprehensive Mock Data & Secret Sanitizer Script
// Enforces RFC 2606 standard (@example.com / @example.org) and neutralizes secret scanner false-positives

const fs = require('fs');
const path = require('path');

const replacements = [
  // CV, Career & Job Generator tools
  { from: /tariq\.ticketing@aviationpro\.com/g, to: 'tariq.ticketing@example.com' },
  { from: /marcus\.vance@growthcommerce\.io/g, to: 'marcus.vance@example.com' },
  { from: /s\.thorne@enterprisesales\.io/g, to: 's.thorne@example.com' },
  { from: /alex\.rivera@cloudscale\.io/g, to: 'alex.rivera@example.com' },
  { from: /marcus\.vance@enterprisesales\.io/g, to: 'marcus.vance@example.com' },
  { from: /sarah\.jenkins@productlead\.com/g, to: 'sarah.jenkins@example.com' },
  { from: /alexander\.vance@enterprise\.io/g, to: 'alexander.vance@example.com' },
  { from: /elena\.rostova@growthscale\.com/g, to: 'elena.rostova@example.com' },
  { from: /marcus\.sterling@capitalvault\.com/g, to: 'marcus.sterling@example.com' },
  { from: /sophia\.montgomery@outlook\.com/g, to: 'sophia.montgomery@example.com' },
  { from: /julian\.croft@creatorgrowth\.io/g, to: 'julian.croft@example.com' },
  { from: /maya\.lintorres@productscale\.com/g, to: 'maya.lintorres@example.com' },
  { from: /david\.vance@capitalgroup\.org/g, to: 'david.vance@example.org' },
  { from: /alex\.morgan@email\.com/g, to: 'alex.morgan@example.com' },
  { from: /jordan\.hayes@email\.com/g, to: 'jordan.hayes@example.com' },
  { from: /taylor\.brooks@email\.com/g, to: 'taylor.brooks@example.com' },
  { from: /devin\.vance@cloudops\.net/g, to: 'devin.vance@example.org' },
  { from: /v\.sterling@apexcloud\.io/g, to: 'v.sterling@example.com' },
  { from: /v\.sterling@enterprise\.com/g, to: 'v.sterling@example.com' },
  { from: /maya\.lin@email\.com/g, to: 'maya.lin@example.com' },
  { from: /maya\.lin@designer\.io/g, to: 'maya.lin@example.com' },
  { from: /alex\.morgan@cloudarch\.dev/g, to: 'alex.morgan@example.com' },
  { from: /marcus\.vance@nexuscloud\.io/g, to: 'marcus.vance@example.com' },
  { from: /elena@rostova\.design/g, to: 'elena@example.org' },
  { from: /j\.montgomery@wanderlustluxury\.com/g, to: 'j.montgomery@example.com' },
  { from: /elena\.rostova@visaconsult\.com/g, to: 'elena.rostova@example.com' },
  { from: /eleanor\.vance@example\.com/g, to: 'eleanor.vance@example.com' },

  // Travel & Presentation builders
  { from: /bookings@odysseytravel\.com/g, to: 'bookings@example.com' },
  { from: /reservations@odysseytravel\.com/g, to: 'reservations@example.com' },
  { from: /maldives@odysseytravel\.com/g, to: 'maldives@example.com' },
  { from: /turkey@odysseytravel\.com/g, to: 'turkey@example.com' },
  { from: /switzerland@odysseytravel\.com/g, to: 'switzerland@example.com' },
  { from: /pilgrims@nooralharamain\.com/g, to: 'pilgrims@example.com' },
  { from: /booking@nooralharamain\.com/g, to: 'booking@example.com' },
  { from: /groups@nooralharamain\.com/g, to: 'groups@example.com' },
  { from: /hajj@nooralharamain\.com/g, to: 'hajj@example.com' },
  { from: /events@grandazureresort\.com/g, to: 'events@example.com' },
  { from: /summits@alpinecrestresort\.ch/g, to: 'summits@example.org' },
  { from: /events@royaloasispalace\.ae/g, to: 'events@example.org' },
  { from: /wholesale@aurastudio\.design/g, to: 'wholesale@example.org' },
  { from: /b2b@aurastudio\.design/g, to: 'b2b@example.org' },
  { from: /wholesale@botanicaluxe\.com/g, to: 'wholesale@example.com' },
  { from: /stockist@botanicaluxe\.com/g, to: 'stockist@example.com' },
  { from: /showroom@kineticsatelier\.com/g, to: 'showroom@example.com' },
  { from: /sales@cognitiveflow\.ai/g, to: 'sales@example.com' },
  { from: /security-sales@shieldguard\.io/g, to: 'security-sales@example.com' },
  { from: /partnerships@velocitypay\.io/g, to: 'partnerships@example.com' },
  { from: /partnerships@auraintelligence\.io/g, to: 'partnerships@example.com' },
  { from: /team@enterpriseintelligence\.io/g, to: 'team@example.com' },
  { from: /founders@startup\.io/g, to: 'founders@example.com' },
  { from: /brand-governance@company\.io/g, to: 'brand-governance@example.com' },
  { from: /atelier@lumiere\.com/g, to: 'atelier@example.com' },
  { from: /support@luminaluxury\.com/g, to: 'support@example.com' },
  { from: /marcus@apexlogistics\.com/g, to: 'marcus@example.com' },
  { from: /dr\.elena@novabiotech\.org/g, to: 'dr.elena@example.org' },
  { from: /deals@kromerlaw\.com/g, to: 'deals@example.com' },
  { from: /alex@solariscloud\.io/g, to: 'alex@example.com' },
  { from: /sourcing@horizonretail\.com/g, to: 'sourcing@example.com' },
  { from: /marketing@vanguardmedia\.net/g, to: 'marketing@example.org' },
  { from: /procurement@bluefinship\.com/g, to: 'procurement@example.com' },
  { from: /accounts@apexlogistics\.com/g, to: 'accounts@example.com' },
  { from: /billing@acmedigital\.io/g, to: 'billing@example.com' },
  { from: /eleanor@apexdynamics\.com/g, to: 'eleanor@example.com' },
  { from: /j\.hayes@cobaltstudio\.io/g, to: 'j.hayes@example.com' },
  { from: /alex\.mercer@enterprise-cloud\.io/g, to: 'alex.mercer@example.com' },
  { from: /diana\.prince@themyscira\.gov/g, to: 'diana.prince@example.org' },
  { from: /jbell@fintech-security\.com/g, to: 'jbell@example.com' },

  // Customer Analytics Travel tool
  { from: /faisal\.office@riyadh-holdings\.sa/g, to: 'faisal.office@example.org' },
  { from: /corporate\.travel@apexlogistics\.co\.uk/g, to: 'corporate.travel@example.com' },
  { from: /hajj\.delegates@madinah-foundation\.org/g, to: 'hajj.delegates@example.org' },
  { from: /raymond\.vance@vancemedical\.com/g, to: 'raymond.vance@example.com' },
  { from: /tan\.w@techfin\.sg/g, to: 'tan.w@example.com' },
  { from: /farooq\.family@orienttraders\.com\.bd/g, to: 'farooq.family@example.com' },
  { from: /sofia\.habsburg@vienna-estate\.at/g, to: 'sofia.habsburg@example.org' },
  { from: /travel\.desk@kearney-me\.ae/g, to: 'travel.desk@example.org' },
  { from: /khalid\.zahrani@zahrani-holding\.sa/g, to: 'khalid.zahrani@example.org' },
  { from: /bilal\.umrah@birmingham-dawah\.uk/g, to: 'bilal.umrah@example.org' },
  { from: /lucas\.johansson@nordicdesigns\.se/g, to: 'lucas.johansson@example.org' },
  { from: /mbrody@brodycap\.com/g, to: 'mbrody@example.com' },
  { from: /ahmed\.khan92@yahoo\.com/g, to: 'ahmed.khan92@example.com' },
  { from: /jean\.dubois@lyon-agro\.fr/g, to: 'jean.dubois@example.org' },
  { from: /vip@almansoor\.sa/g, to: 'vip@example.org' },
  { from: /info@canadapilgrims\.ca/g, to: 'info@example.org' },
  { from: /ops@sultanate-air\.om/g, to: 'ops@example.org' },
  { from: /hajj@london-academy\.org\.uk/g, to: 'hajj@example.org' },
  { from: /travel@doha-holding\.qa/g, to: 'travel@example.org' },
  { from: /travel@mckinsey\.com/g, to: 'travel@example.com' },
  { from: /apac-travel@deloitte\.com/g, to: 'apac-travel@example.com' },
  { from: /mobility@siemens-energy\.de/g, to: 'mobility@example.org' },
  { from: /privateclient@barclays\.co\.uk/g, to: 'privateclient@example.org' },

  // Data cleaner & txt analyzer mock tables
  { from: /finance@twilio\.com/g, to: 'finance@example.com' },
  { from: /payments@google\.com/g, to: 'payments@example.com' },
  { from: /ar@datadoghq\.com/g, to: 'ar@example.com' },
  { from: /billing@zoom\.us/g, to: 'billing@example.com' },
  { from: /invoices@atlassian\.com/g, to: 'invoices@example.com' },
  { from: /jane\.smith@domain\.org/g, to: 'jane.smith@example.org' },
  { from: /robert\.j@corp\.net/g, to: 'robert.j@example.net' },
  { from: /michael\.b@webmail\.com/g, to: 'michael.b@example.com' },
  { from: /sarah\.m@test\.com/g, to: 'sarah.m@example.com' },
  { from: /david\.w@firm\.com/g, to: 'david.w@example.com' },
  { from: /lisa\.t@service\.co/g, to: 'lisa.t@example.com' },
  { from: /james\.a@enterprise\.com/g, to: 'james.a@example.com' },
  { from: /karen\.t@site\.org/g, to: 'karen.t@example.org' },

  // Banking info
  { from: /IBAN:\s*US94SVBK123456789012/g, to: 'Wire / ACH Ref: DEMO-WIRE-001' },
  { from: /SWIFT:\s*SVBKUS6S/g, to: 'Routing: 000000000' },
  { from: /Bank:\s*Silicon Valley Bank/g, to: 'Bank: Standard Bank Wire' },
  { from: /Routing:\s*121000358\s*\|\s*Account:\s*9876543210/g, to: 'Routing: 000000000 | Account Ref: DEMO-ACC-987' },
  { from: /julian\.sterling@sterlingholdings\.co\.uk/g, to: 'client@example.com' }
];

const TOOLS_DIR = path.join(__dirname, '..', 'tools');
let modifiedCount = 0;

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const f of files) {
    const fullPath = path.join(dir, f);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      walkDir(fullPath);
    } else if (/\.(html|js|json|md)$/i.test(f)) {
      sanitizeFile(fullPath);
    }
  }
}

function sanitizeFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  for (const { from, to } of replacements) {
    if (from.test(content)) {
      content = content.replace(from, to);
      changed = true;
    }
  }

  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`[Sanitized] ${path.relative(path.join(__dirname, '..'), filePath)}`);
    modifiedCount++;
  }
}

console.log('--- Starting Mock Data & Secret Sanitization ---');
walkDir(TOOLS_DIR);
console.log(`--- Finished! Total files sanitized: ${modifiedCount} ---`);
