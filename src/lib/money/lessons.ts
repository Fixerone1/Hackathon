export type MoneyLesson = {
  id: string;
  title: string;
  duration: string;
  summary: string;
  sections: { heading: string; text: string; action?: string }[];
  quiz: { question: string; choices: string[]; answer: number; explanation: string }[];
  action: { label: string; href: string };
  sources: { label: string; href: string }[];
};

export const moneyLessons: MoneyLesson[] = [
  {
    id: 'reading-a-payslip',
    title: 'Reading your payslip',
    duration: '5 min',
    summary: 'Know what gross pay, PAYE, UIF, benefits and net pay mean before you plan your month.',
    sections: [
      { heading: 'Start with gross pay', text: 'Gross pay is the amount earned before deductions. Your offer might show a monthly amount, an annual amount, an hourly rate or a stipend. Check the period, expected hours, and whether the amount is before tax. A monthly salary of R15 000 is not the same as R15 000 a year.' },
      { heading: 'Read the deductions', text: 'PAYE is employees’ tax withheld by an employer and paid to SARS. UIF is a contribution for qualifying unemployment benefits; the payslip amount is limited by the current earnings ceiling. Retirement and medical aid deductions may also appear. Ask payroll when a line is unfamiliar; do not assume every deduction is tax.' },
      { heading: 'Find the amount you can plan with', text: 'Net pay is what remains after the deductions on that payslip. Compare your payslip with your employment contract, then use take-home rather than gross pay for a budget. A tax estimate is only a starting point: payroll timing, benefits, tax directives and your full circumstances can change the result.' },
    ],
    quiz: [
      { question: 'Which pay amount is the best starting point for a monthly budget?', choices: ['Gross pay', 'Net take-home pay', 'The highest possible overtime'], answer: 1, explanation: 'Plan from the amount left after the deductions shown on your payslip.' },
      { question: 'What does PAYE mean?', choices: ['Tax withheld by an employer for SARS', 'A bank account fee', 'A guaranteed refund'], answer: 0, explanation: 'PAYE is employees’ tax withheld by an employer and paid to SARS.' },
      { question: 'Your offer says R18 000, but the period is unclear. What should you do?', choices: ['Assume it is monthly take-home', 'Confirm the period and whether it is before deductions', 'Budget the full amount immediately'], answer: 1, explanation: 'Confirm the pay period and gross/net basis before making decisions.' },
    ],
    action: { label: 'Estimate take-home pay', href: '/app/money?tab=salary' },
    sources: [
      { label: 'SARS: Rates of tax for individuals', href: 'https://www.sars.gov.za/tax-rates/income-tax/rates-of-tax-for-individuals/' },
      { label: 'SARS: Employees’ tax', href: 'https://www.sars.gov.za/types-of-tax/pay-as-you-earn/' },
    ],
  },
  {
    id: 'irregular-income',
    title: 'Budgeting with irregular income',
    duration: '5 min',
    summary: 'Build a plan for stipends, piece jobs, casual shifts and side-hustle income that changes month to month.',
    sections: [
      { heading: 'Use a safe baseline', text: 'List income that is confirmed and likely to arrive, not a best-case week. If your earnings change, look at recent months and choose a cautious baseline. Treat extra shifts, tips and one-off sales as uncertain until they are paid. Keep work costs such as data, stock or travel visible.' },
      { heading: 'Prioritise the essentials', text: 'Write down dates and minimum amounts for housing, food, transport, utilities, family support and debt commitments. Match due dates to expected pay dates. If income falls short, contact providers early and ask about an affordable arrangement rather than using expensive credit without understanding the full cost.' },
      { heading: 'Give extra income a job', text: 'When more money arrives than expected, cover urgent essentials first, then build a small buffer for a low-income week. Set aside amounts for upcoming costs before they are due. Review the plan weekly; a flexible budget is a tool to make choices, not a reason to blame yourself for income you cannot control.' },
    ],
    quiz: [
      { question: 'What is a sensible baseline for irregular income?', choices: ['Your biggest recent month', 'Confirmed, cautious expected income', 'Income you hope to earn next month'], answer: 1, explanation: 'A cautious baseline makes fixed commitments more manageable.' },
      { question: 'When should you contact a provider if you may miss a payment?', choices: ['Before the due date if possible', 'Only after ignoring all messages', 'Never'], answer: 0, explanation: 'Early contact can help you understand available arrangements.' },
      { question: 'What can you do with income above your baseline?', choices: ['Plan for essentials and a buffer', 'Assume it will arrive every month', 'Spend it before checking upcoming costs'], answer: 0, explanation: 'Use extra income deliberately for upcoming needs and a buffer.' },
    ],
    action: { label: 'Build a flexible budget', href: '/app/money?tab=salary' },
    sources: [{ label: 'National Credit Regulator', href: 'https://www.ncr.org.za/' }],
  },
  {
    id: 'emergency-fund',
    title: 'Emergency fund basics',
    duration: '5 min',
    summary: 'Start with a small buffer for genuine surprises and compare saving options carefully.',
    sections: [
      { heading: 'Start small and specific', text: 'An emergency fund is money set aside for an unexpected essential cost, such as urgent travel or a lost work shift. Begin with a target that feels possible, even R100 or R500. Keep predictable costs, like school fees or annual licences, as separate planned goals so the emergency fund can do its job.' },
      { heading: 'Choose access and safety', text: 'Consider how quickly you may need the money, what fees or notice periods apply, whether the institution is regulated, and how the balance is protected. A bank savings account, notice account, stokvel or tax-free savings account each has different rules and risks. This lesson does not recommend a product.' },
      { heading: 'Make saving repeatable', text: 'Choose an amount and a date that fit your cash flow. You can save a small amount regularly or add money when extra income arrives. Track the balance and pause contributions if an essential need arises. Compare terms directly with the provider and check current official guidance before opening an account.' },
    ],
    quiz: [
      { question: 'What is a good first emergency-fund target?', choices: ['A realistic amount you can start building', 'A target that forces unaffordable borrowing', 'Only a large fixed amount'], answer: 0, explanation: 'Small, achievable steps can start a useful buffer.' },
      { question: 'What should you check before choosing a place to keep savings?', choices: ['Access, fees, rules and risks', 'Only the advert headline', 'Whether a friend chose it'], answer: 0, explanation: 'Understand access, fees and risks directly from official provider information.' },
      { question: 'Should planned annual costs automatically be emergencies?', choices: ['Yes, always', 'No, plan for predictable costs separately', 'Only if they are expensive'], answer: 1, explanation: 'Separate predictable costs from unexpected emergencies.' },
    ],
    action: { label: 'Start a savings goal', href: '/app/money?tab=goals' },
    sources: [
      { label: 'FSCA: Consumer information', href: 'https://www.fsca.co.za/Consumer%20Education/Pages/default.aspx' },
      { label: 'SARS: Tax-free investments', href: 'https://www.sars.gov.za/types-of-tax/personal-income-tax/tax-free-investments/' },
    ],
  },
  {
    id: 'debt-and-credit',
    title: 'Debt, credit and your rights',
    duration: '6 min',
    summary: 'Understand credit costs, credit records, and where to ask for help with unfair lending.',
    sections: [
      { heading: 'Compare the full cost', text: 'A loan or store account can cost more than the amount borrowed. Check the interest rate, fees, repayment dates, total amount repayable and what happens if a payment is late. Ask for the terms in writing and take time to read them. Never sign a blank form or hand over your bank card or PIN.' },
      { heading: 'Credit records are not a score you can buy', text: 'Credit providers may report account and repayment information to registered credit bureaux. You can request your credit information and dispute inaccurate details. A credit record does not guarantee approval, and paying for a “quick fix” or a guaranteed loan can expose you to scams.' },
      { heading: 'Get help safely', text: 'Mashonisas may charge unlawful amounts or use threats. Do not share identity documents, PINs or one-time passwords with strangers. Contact the National Credit Regulator or a registered debt counsellor to check your options. If you feel unsafe, contact the police or a trusted support person.' },
    ],
    quiz: [
      { question: 'What should you compare before taking credit?', choices: ['Only the cash you receive', 'Interest, fees, dates and total repayment', 'The colour of the advert'], answer: 1, explanation: 'The full repayment and fees show more than the amount borrowed.' },
      { question: 'A caller promises to erase your credit history for a fee. What is safest?', choices: ['Pay immediately', 'Check with a registered credit bureau or NCR', 'Send your PIN to verify your identity'], answer: 1, explanation: 'Use official channels and never send PINs or passwords.' },
      { question: 'Who regulates credit providers and debt counsellors in South Africa?', choices: ['NCR', 'SABRIC', 'A social media account'], answer: 0, explanation: 'The National Credit Regulator oversees the credit industry.' },
    ],
    action: { label: 'Add debt repayments to your budget', href: '/app/money?tab=salary' },
    sources: [
      { label: 'National Credit Regulator', href: 'https://www.ncr.org.za/' },
      { label: 'FSCA: Consumer information', href: 'https://www.fsca.co.za/Consumer%20Education/Pages/default.aspx' },
    ],
  },
  {
    id: 'banking-and-mobile-money',
    title: 'Banking and mobile money safety',
    duration: '5 min',
    summary: 'Spot common payment scams and protect your PINs, passwords and SIM.',
    sections: [
      { heading: 'Stop before you send', text: 'Scammers may pretend to be a bank, employer, delivery company or family member. They create urgency and ask you to move money, install an app or share an OTP. Call the organisation using a number from its official website or your card, not the number in a suspicious message.' },
      { heading: 'Protect your accounts', text: 'Use a unique passcode, lock your phone and turn on security features. Never share your PIN, password, card security code or one-time password, even with someone claiming to be staff. Keep your SIM registration information private. If your phone suddenly loses network, contact your mobile provider using its official channel.' },
      { heading: 'Report quickly', text: 'If you approved a suspicious payment or lost access, contact your bank immediately using the official fraud number and ask it to secure the account. Save messages and reference numbers. Report fraud to the relevant authorities. A bank or legitimate support agent should not ask you to reveal your secret credentials.' },
    ],
    quiz: [
      { question: 'A caller asks for the OTP sent to your phone. What should you do?', choices: ['Read it out if they know your name', 'Do not share it; contact the bank independently', 'Send your PIN too'], answer: 1, explanation: 'Never share OTPs or secret credentials with callers.' },
      { question: 'Your SIM suddenly stops working and you did not request a change. What is a safe next step?', choices: ['Ignore it', 'Contact your mobile provider through its official channel', 'Post your account details online'], answer: 1, explanation: 'A sudden loss of service can be a warning sign; verify with your provider.' },
      { question: 'Where should you find a bank fraud contact number?', choices: ['A suspicious message link', 'The bank’s official site or card', 'A stranger in a group chat'], answer: 1, explanation: 'Use a trusted official contact source.' },
    ],
    action: { label: 'Review your budget and payment dates', href: '/app/money?tab=salary' },
    sources: [{ label: 'SABRIC: Banking and payment safety', href: 'https://www.sabric.co.za/' }],
  },
  {
    id: 'stokvels-and-burial-societies',
    title: 'Stokvels and burial societies',
    duration: '5 min',
    summary: 'Know what to agree in writing and how to reduce misunderstandings in a group.',
    sections: [
      { heading: 'Agree on the rules', text: 'Before joining, write down the contribution amount and dates, how payouts are decided, who keeps records, what happens when a member cannot pay, and how someone can leave. Every member should receive the same rules and a record of payments. Do not rely only on spoken promises.' },
      { heading: 'Check money handling', text: 'Know who can access the account and how two or more members will approve withdrawals. Keep receipts and reconcile the record regularly. Avoid keeping group savings in one person’s personal account without clear written agreement. Never share banking passwords or approve a transaction you do not understand.' },
      { heading: 'Understand the risks', text: 'A stokvel is not automatically a bank deposit or an investment protected by the same rules. A group can lose money through fraud, poor records or disagreements. Ask questions, take time before joining and verify legal or financial claims with official sources. Burial society terms and benefits should be clear in writing.' },
    ],
    quiz: [
      { question: 'What should members agree before contributing?', choices: ['Contribution and payout rules in writing', 'Only who is most trusted', 'Nothing until there is a problem'], answer: 0, explanation: 'Written shared rules help everyone understand responsibilities.' },
      { question: 'What is safer for group withdrawals?', choices: ['One person acts alone with no record', 'Clear approvals and receipts', 'Sharing everyone’s PIN'], answer: 1, explanation: 'Documented approvals and records improve accountability.' },
      { question: 'Is every stokvel protected like a bank account?', choices: ['Yes', 'No, understand the group and its risks', 'Only during holidays'], answer: 1, explanation: 'Do not assume a group arrangement has bank-deposit protections.' },
    ],
    action: { label: 'Plan a community or business savings goal', href: '/app/money?tab=goals' },
    sources: [{ label: 'FSCA: Consumer information', href: 'https://www.fsca.co.za/Consumer%20Education/Pages/default.aspx' }],
  },
  {
    id: 'starting-to-invest',
    title: 'Starting to invest',
    duration: '6 min',
    summary: 'Learn the basics of time, risk and tax-free savings without product recommendations.',
    sections: [
      { heading: 'Saving and investing are different', text: 'Savings are usually set aside for access and short-term goals. Investing means putting money into assets that can rise or fall in value over time. A longer time horizon can help you ride out some ups and downs, but it never removes risk or guarantees a return.' },
      { heading: 'Understand fees and risk', text: 'Before committing money, find out what you own, what it costs, how quickly you can access it, and what could make it lose value. Do not invest rent, food or emergency money in something you do not understand. Be cautious of pressure, guaranteed high returns and requests to recruit others.' },
      { heading: 'Know the tax-free account rules', text: 'A tax-free savings or investment account has SARS contribution limits and rules that can change. Contributions above the annual or lifetime limit may attract tax. Check current SARS information before opening or contributing, and compare options using official provider documents. This lesson is general education, not a product recommendation.' },
    ],
    quiz: [
      { question: 'Does investing guarantee a return?', choices: ['Yes, always', 'No, values can rise or fall', 'Only if a friend recommends it'], answer: 1, explanation: 'Investments involve risk and returns are not guaranteed.' },
      { question: 'Where should you verify current tax-free investment limits?', choices: ['Current SARS guidance', 'An old social post', 'A guaranteed-return advert'], answer: 0, explanation: 'Check current limits and rules directly with SARS.' },
      { question: 'What is a warning sign?', choices: ['Written fees and risks', 'Pressure to act immediately and promised high returns', 'Time to read the terms'], answer: 1, explanation: 'Pressure and guaranteed high returns warrant caution.' },
    ],
    action: { label: 'Build a goal before investing', href: '/app/money?tab=goals' },
    sources: [
      { label: 'SARS: Tax-free investments', href: 'https://www.sars.gov.za/types-of-tax/personal-income-tax/tax-free-investments/' },
      { label: 'FSCA: Consumer information', href: 'https://www.fsca.co.za/Consumer%20Education/Pages/default.aspx' },
    ],
  },
  {
    id: 'first-tax-return',
    title: 'Your first tax return',
    duration: '5 min',
    summary: 'Understand SARS eFiling, keep useful records and know where to confirm your tax duties.',
    sections: [
      { heading: 'A return is a record of your tax position', text: 'SARS may require you to submit an income tax return, depending on your circumstances and current rules. PAYE on a payslip does not automatically mean you never need to file. Check the filing requirements and dates for the relevant tax year on SARS; rules can change.' },
      { heading: 'Use official channels', text: 'SARS eFiling is the official online service for tax matters. Go directly to the SARS website and protect your login details. Do not follow an unexpected link asking for your tax number, password, OTP or bank details. SARS will not need you to disclose a password to a caller.' },
      { heading: 'Keep records and ask for help', text: 'Keep payslips, IRP5/IT3(a) certificates and records of relevant income or expenses. Use SARS guides and contact SARS through published channels if you are unsure. If you need professional assistance, verify the person’s credentials and do not hand over control of your account.' },
    ],
    quiz: [
      { question: 'Where should you check whether you need to file?', choices: ['Current SARS guidance', 'A random message link', 'Only a friend’s experience'], answer: 0, explanation: 'Filing requirements depend on circumstances and can change.' },
      { question: 'What should you do with a surprise message asking for your SARS password?', choices: ['Reply with the password', 'Do not share it; contact SARS independently', 'Forward your OTP too'], answer: 1, explanation: 'Protect credentials and verify messages through official channels.' },
      { question: 'Which records may help with tax filing?', choices: ['Payslips and IRP5/IT3(a) certificates', 'Only social media posts', 'A bank PIN'], answer: 0, explanation: 'Keep relevant income certificates and payslip records.' },
    ],
    action: { label: 'Estimate your salary deductions', href: '/app/money?tab=salary' },
    sources: [
      { label: 'SARS: eFiling', href: 'https://www.sarsefiling.co.za/' },
      { label: 'SARS: Rates of tax for individuals', href: 'https://www.sars.gov.za/tax-rates/income-tax/rates-of-tax-for-individuals/' },
    ],
  },
];

