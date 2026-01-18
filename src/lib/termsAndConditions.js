export const TERMS_AND_CONDITIONS = {
  title: "Terms and Conditions - LEO Badminton Club",
  lastUpdated: "December 2024",
  sections: [
    {
      heading: "1. Membership Agreement",
      content: "By registering with LEO Badminton Club, you agree to abide by all club rules, regulations, and decisions made by the club management and administrators."
    },
    {
      heading: "2. Code of Conduct",
      content: "Members must conduct themselves in a respectful, fair, and sportsmanlike manner at all times toward fellow members, guests, coaches, officials, and staff. Harassment, discrimination, abuse, or any form of inappropriate or unsafe behavior will not be tolerated and may result in disciplinary action, including suspension or termination of membership, at the sole discretion of Club management."
    },
    {
      heading: "3. Health & Safety",
      content: "You confirm that you are physically fit to participate in badminton activities. You agree to inform the club of any medical conditions that may affect your participation. Members are responsible for proper warm-ups and must participate in a safe and responsible manner. The club does not provide any medical assistance. The club is not liable for any injuries sustained during play."
    },
    {
      heading: "4. Waiver of Liability",
      content: "You acknowledge that participating in sports activities involves inherent risks. You agree to release and hold harmless LEO Badminton Club, its organizers, coaches, and members from any claims, damages, or liabilities arising from your participation."
    },
    {
      heading: "5. Payment & Fees",
      content: "Members are responsible for maintaining sufficient account balance (minimum CA$ 25) to participate in scheduled sessions. Court fees are subject to change with prior notice to members. All payments are non-refundable unless otherwise stated by club management."
    },
    {
      heading: "6. Facility Rules",
      content: "Members must follow all facility rules and regulations. Proper sports attire and non-marking shoes are required. Members are responsible for their personal belongings."
    },
    {
      heading: "7. Booking & Cancellation",
      content: "Session bookings must be made through the club portal. Cancellations must be made at least 24 hours in advance. Late cancellations or no-shows may result in balance deductions."
    },
    {
      heading: "8. Privacy & Data",
      content: "Your personal information will be stored securely and used only for club operations, communication, and emergency purposes. We will not share your data with third parties without consent. Profile images are provided by Google through Google Sign-In. Images and related profile information are owned and controlled by the respective users and Google. This website does not store or modify profile images without user consent."
    },
    {
      heading: "9. Photography & Media",
      content: "The club may take photographs or videos during events for promotional purposes. By registering, you consent to your image being used in club materials unless you opt out in writing."
    },
    {
      heading: "10. Membership Termination",
      content: "The club reserves the right to terminate membership for violations of terms, non-payment, or inappropriate behavior. Members may cancel their membership at any time with written notice."
    },
    {
      heading: "11. Age Requirement",
      content: "All members must be 18 years or older to register independently. Minors must be accompanied by a parent or legal guardian."
    },
    {
      heading: "12. Amendments",
      content: "LEO Badminton Club reserves the right to modify these terms at any time. Members will be notified of significant changes via email."
    }
  ]
};

export const getTermsText = () => {
  return TERMS_AND_CONDITIONS.sections
    .map(section => `${section.heading}\n${section.content}`)
    .join('\n\n');
};

export const getTermsSummary = () => {
  return `By accepting, you agree to the LEO Badminton Club Terms and Conditions including: membership responsibilities, code of conduct, health & safety waiver, payment obligations, facility rules, and data privacy policies.`;
};
