import React from "react";
import TopPage from "@/components/page/top";

export default function Privacy() {
  return (
    <>
      <TopPage />
      <section className="bg-gray-950 pt-36">
        <div className="container mx-auto px-4 py-10">
          <h1 className="text-2xl font-bold mb-5">PRIVACY POLICY</h1>
          
          <h2 className="text-xl font-semibold mt-8 mb-4">1. Overview</h2>
          <p>
            This Privacy Policy outlines how OnThePixel.net ("we", "our", or "us") collects, uses, and protects your 
            personal data when you use our Minecraft server, website, or any of our related services. We are committed 
            to ensuring that your privacy is protected and that we comply with applicable data protection laws.
          </p>
          
          <h2 className="text-xl font-semibold mt-8 mb-4">2. Information We Collect</h2>
          <p>
            We may collect the following information:
          </p>
          <ul className="list-disc pl-6 mt-2 mb-4 space-y-2">
            <li>Minecraft username and UUID</li>
            <li>Discord ID and username (if you link your account)</li>
            <li>IP addresses(for 30 days)</li>
            <li>Game statistics and in-game activity</li>
            <li>Chat messages sent within our server</li>
            <li>Website usage data and analytics</li>
            <li>Information you provide when contacting our support team</li>
          </ul>
          
          <h2 className="text-xl font-semibold mt-8 mb-4">3. How We Use Your Information</h2>
          <p>
            We use the collected information for the following purposes:
          </p>
          <ul className="list-disc pl-6 mt-2 mb-4 space-y-2">
            <li>To provide and maintain our services</li>
            <li>To enforce our server rules and community guidelines</li>
            <li>To improve our website and services</li>
            <li>To create and maintain player statistics and leaderboards</li>
            <li>To communicate with you regarding server updates, events, and important notices</li>
            <li>To respond to your inquiries and support requests</li>
            <li>To prevent fraud, cheating, and other prohibited activities</li>
          </ul>
          
          <h2 className="text-xl font-semibold mt-8 mb-4">4. Legal Basis for Processing</h2>
          <p>
            We process your personal data on the following legal bases:
          </p>
          <ul className="list-disc pl-6 mt-2 mb-4 space-y-2">
            <li>Your consent when you voluntarily provide information</li>
            <li>The necessity to perform our contractual obligations to you</li>
            <li>Our legitimate interests in operating, improving, and securing our services</li>
            <li>Compliance with legal obligations</li>
          </ul>
          
          <h2 className="text-xl font-semibold mt-8 mb-4">5. Data Retention</h2>
          <p>
            We will retain your personal data only for as long as is necessary for the purposes set out in this Privacy Policy. 
            We will retain and use your information to the extent necessary to comply with our legal obligations, resolve disputes, 
            and enforce our policies.
          </p>
          
          <h2 className="text-xl font-semibold mt-8 mb-4">6. Third-Party Services</h2>
          <p>
            We may use third-party services such as Vercel Analytics, Discord, and other services to help us operate our services and 
            website. These services may collect information sent by your browser as part of their operations. These third parties have 
            their own privacy policies addressing how they use such information.
          </p>
          
          <h3 className="text-lg font-semibold mt-4 mb-2">6.1. Vercel Analytics</h3>
          <p>
            We use Vercel Analytics to analyze the use of our website. Vercel Analytics gathers anonymous information about website use to help 
            us understand how visitors interact with our site. This information is used to create reports about the use of our website. 
            Vercel's privacy policy is available at: 
            <a href="https://vercel.com/legal/privacy-policy" className="text-green-400 hover:text-green-300"> https://vercel.com/legal/privacy-policy</a>
          </p>
          
          <h2 className="text-xl font-semibold mt-8 mb-4">7. Data Security</h2>
          <p>
            We implement appropriate technical and organizational measures to protect your personal data against unauthorized or 
            unlawful processing, accidental loss, destruction, or damage. However, please note that no method of transmission over 
            the Internet or method of electronic storage is 100% secure.
          </p>
          
          <h2 className="text-xl font-semibold mt-8 mb-4">8. Your Rights</h2>
          <p>
            Depending on your location, you may have the following rights regarding your personal data:
          </p>
          <ul className="list-disc pl-6 mt-2 mb-4 space-y-2">
            <li>The right to access, update, or delete your personal information</li>
            <li>The right to rectification if your information is inaccurate or incomplete</li>
            <li>The right to object to our processing of your personal data</li>
            <li>The right to request restriction of processing your personal data</li>
            <li>The right to data portability</li>
            <li>The right to withdraw consent</li>
          </ul>
          
          <h2 className="text-xl font-semibold mt-8 mb-4">9. Children's Privacy</h2>
          <p>
            Our services are not directed to individuals under the age of 13, or the applicable age of digital consent in your country. 
            If we become aware that we have collected personal data from children without verification of parental consent, 
            we take steps to remove that information from our servers.
          </p>
          
          <h2 className="text-xl font-semibold mt-8 mb-4">10. Changes to This Privacy Policy</h2>
          <p>
            We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page 
            and updating the "Last Updated" date. You are advised to review this Privacy Policy periodically for any changes.
          </p>
          
          <h2 className="text-xl font-semibold mt-8 mb-4">11. Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact us at:
          </p>
          <p className="mt-2">
            Email: <a href="mailto:contact@onthepixel.net" className="text-green-400 hover:text-green-300">contact@onthepixel.net</a>
          </p>
          <p className="mt-2">
            Discord: <a href="https://discord.com/invite/Dpx3eK9t3z" className="text-green-400 hover:text-green-300">https://discord.com/invite/Dpx3eK9t3z</a>
          </p>
          
          <p className="mt-8 text-gray-400">Last Updated: March 13, 2025</p>
        </div>
      </section>
    </>
  );
}
