import React from "react";
import TopPage from "@/components/page/top";

export default function Imprint() {
  return (
    <>
      <TopPage />
      <section className="bg-gray-950 pt-36">
        <div className="container mx-auto px-4 py-10">
          <h1 className="text-2xl font-bold mb-5">LEGAL NOTICE</h1>
          <h2 className="text-xl font-semibold mb-4">Information according to § 5 TMG</h2>
          <p>
            Leo Scherr
            <br />
            c/o Block Services
            <br />
            Stuttgarter Str. 106
            <br />
            70736 Fellbach
            <br />
            Germany
          </p>
          <h2 className="text-xl font-semibold mt-8 mb-4">Contact</h2>
          <p>
            Phone: +49 170 1850492
            <br />
            Email:{" "}
            <a href="mailto:contact@onthepixel.net" className="text-green-400 hover:text-green-300">contact@onthepixel.net</a>
          </p>
          <h2 className="text-xl font-semibold mt-8 mb-4">
            Disclaimer
          </h2>
          <h3 className="text-lg font-semibold mt-4 mb-2">
            Liability for Content
          </h3>
          <p>
            The contents of our website have been created with the utmost care. However, we cannot guarantee the accuracy, 
            completeness, or timeliness of the content. As a service provider, we are responsible for our own content on these 
            pages according to § 7 paragraph 1 TMG and general laws. According to §§ 8 to 10 TMG, we are not obligated to 
            monitor transmitted or stored third-party information or to investigate circumstances that indicate illegal activity. 
            Obligations to remove or block the use of information under general law remain unaffected. However, liability in this 
            regard is only possible from the time of knowledge of a specific infringement. If we become aware of any legal 
            violations, we will remove the content immediately.
          </p>
          <h3 className="text-lg font-semibold mt-4 mb-2">Liability for Links</h3>
          <p>
            Our website contains links to external websites over which we have no control. Therefore, we cannot accept any 
            responsibility for their content. The respective provider or operator of the linked pages is always responsible 
            for the content of the linked pages. The linked sites were checked for possible legal violations at the time of 
            linking. No illegal content was identifiable at the time the links were established. However, continuous monitoring 
            of the content of the linked pages is not reasonable without specific indications of a violation. If we become aware 
            of any legal violations, we will remove such links immediately.
          </p>
          <h3 className="text-lg font-semibold mt-4 mb-2">Copyright</h3>
          <p>
            The content and works created by the site operators on these pages are subject to German copyright law. 
            Duplication, processing, distribution, and any form of commercialization of such material beyond the scope 
            of the copyright law require the prior written consent of the respective author or creator. Downloads and copies 
            of this site are only permitted for private, non-commercial use. Insofar as the content on this site was not 
            created by the operator, the copyrights of third parties are respected. In particular, third-party content is 
            marked as such. Should you nevertheless become aware of a copyright infringement, please inform us accordingly. 
            If we become aware of any legal violations, we will remove such content immediately.
          </p>
          <h2 className="text-xl font-semibold mt-8 mb-4">Data Protection</h2>
          <p>
            The use of our website is generally possible without providing personal data. If personal data (such as name, 
            address, or email addresses) is collected on our pages, this is always done on a voluntary basis whenever possible. 
            This data will not be disclosed to third parties without your explicit consent. We would like to point out that 
            data transmission over the Internet (e.g., when communicating by email) may have security vulnerabilities. Complete 
            protection of data against access by third parties is not possible. We expressly prohibit the use of the contact 
            data published as part of the imprint obligation by third parties for sending unsolicited advertising and information 
            materials. The site operators expressly reserve the right to take legal action in the event of unsolicited sending of 
            advertising information, such as through spam emails.
          </p>
          <h2 className="text-xl font-semibold mt-8 mb-4">Google Analytics</h2>
          <p>
            This website uses Google Analytics, a web analytics service provided by Google Inc. ('Google'). Google Analytics 
            uses 'cookies', which are text files placed on your computer to help the website analyze how visitors use the site. 
            The information generated by the cookie about your use of this website (including your IP address) is transmitted 
            to and stored by Google on servers in the United States. Google will use this information for the purpose of 
            evaluating your use of the website, compiling reports on website activity for website operators, and providing 
            other services relating to website activity and internet usage. Google may also transfer this information to third 
            parties where required to do so by law, or where such third parties process the information on Google's behalf. 
            Google will not associate your IP address with any other data held by Google. You may refuse the use of cookies 
            by selecting the appropriate settings on your browser; however, please note that if you do this, you may not be 
            able to use the full functionality of this website. By using this website, you consent to the processing of data 
            about you by Google in the manner and for the purposes set out above.
          </p>
          <h2 className="text-xl font-semibold mt-8 mb-4">Google AdSense</h2>
          <p>
            This website uses Google AdSense, a web advertisement service of Google Inc., USA ('Google'). Google AdSense uses 
            'cookies' (text files) that are stored on your computer and that enable an analysis of the use of the website. 
            Google AdSense also uses so-called 'web beacons' (small invisible graphics) to collect information. Through the 
            use of web beacons, simple actions such as visitor traffic on the website can be recorded and collected. The 
            information generated by the cookie and/or web beacon about your use of this website (including your IP address) 
            is transmitted to and stored by Google on servers in the United States. Google will use this information for the 
            purpose of evaluating your use of the website in terms of advertisements, compiling reports on website activity 
            and advertisements for the website operators, and providing other services relating to website activity and 
            internet usage. Google may also transfer this information to third parties where required to do so by law, or 
            where such third parties process the information on Google's behalf. Google will not associate your IP address 
            with any other data held by Google. You can prevent the storage of cookies on your hard drive and the display 
            of web beacons by selecting 'do not accept cookies' in your browser settings (in MS Internet Explorer under 
            'Tools > Internet Options > Privacy > Settings'; in Firefox under 'Tools > Settings > Privacy > Cookies'). 
            However, we would like to point out that in this case you may not be able to use all functions of this website 
            in their entirety. By using this website, you consent to the processing of data about you by Google in the 
            manner and for the purposes set out above.
          </p>
          <p className="mt-8 text-gray-400">
            Legal Notice template generated by Impressum Generator of Kanzlei Hasselbach, Frankfurt
          </p>
        </div>
      </section>
    </>
  );
}
