import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Separator } from '../components/ui/separator';
import { Button } from '../components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PrivacyPolicy = () => {
    const navigate = useNavigate();

    const handleBack = () => {
        navigate(-1);
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="w-full px-4">
                {/* Back Button */}
                <div className="mb-6">
                    <Button 
                        variant="outline" 
                        onClick={handleBack}
                        className="flex items-center gap-2"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back
                    </Button>
                </div>
                <Card className="shadow-lg">
                    <CardHeader className="text-center bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
                        <CardTitle className="text-3xl font-bold">Privacy Policy</CardTitle>
                        <p className="text-blue-100 mt-2">Last Updated: {new Date().toLocaleDateString()}</p>
                    </CardHeader>
                    <CardContent className="p-8 space-y-6">
                        <div className="prose prose-lg max-w-none">
                            <p className="text-gray-700 leading-relaxed">
                                HireAccel ("we," "our," or "us") values your trust and is committed to protecting your privacy. 
                                This Privacy Policy explains how we collect, use, disclose, and safeguard your personal information 
                                when you use our website hireaccel.in, mobile application, or any related services (collectively, the "Services").
                            </p>
                            <p className="text-gray-700 leading-relaxed font-medium">
                                By using our Services, you agree to the terms of this Privacy Policy. If you do not agree, please discontinue use immediately.
                            </p>
                        </div>

                        <Separator />

                        <section>
                            <h2 className="text-2xl font-bold text-gray-800 mb-4">1. Information We Collect</h2>
                            <p className="text-gray-700 mb-4">
                                We collect the following types of information to provide and improve our Services:
                            </p>
                            
                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-xl font-semibold text-gray-800 mb-2">a) Information You Provide</h3>
                                    <ul className="space-y-2 text-gray-700">
                                        <li><strong>For Candidates:</strong> name, email address, phone number, resume/CV, educational background, work experience, skills, and job preferences.</li>
                                        <li><strong>For Employers/Recruiters:</strong> company name, designation, contact details, and job postings.</li>
                                        <li><strong>For All Users:</strong> account registration details, communication preferences, and any content you upload or submit.</li>
                                    </ul>
                                </div>

                                <div>
                                    <h3 className="text-xl font-semibold text-gray-800 mb-2">b) Automatically Collected Information</h3>
                                    <ul className="space-y-2 text-gray-700">
                                        <li>IP address, browser type, operating system, and device information.</li>
                                        <li>Usage data such as pages visited, time spent, and clicks.</li>
                                        <li>Cookies and similar technologies (see Section 6).</li>
                                    </ul>
                                </div>

                                <div>
                                    <h3 className="text-xl font-semibold text-gray-800 mb-2">c) Third-Party Data</h3>
                                    <p className="text-gray-700">
                                        We may receive information from partners, affiliates, or publicly available sources to enhance our Services.
                                    </p>
                                </div>
                            </div>
                        </section>

                        <Separator />

                        <section>
                            <h2 className="text-2xl font-bold text-gray-800 mb-4">2. How We Use Your Information</h2>
                            <p className="text-gray-700 mb-4">We use your data to:</p>
                            <ul className="space-y-2 text-gray-700">
                                <li>• Create and manage your account.</li>
                                <li>• Facilitate job applications and candidate shortlisting.</li>
                                <li>• Enable AI-driven matchmaking between candidates and employers (typically within 48 hours).</li>
                                <li>• Communicate updates, alerts, and promotional offers.</li>
                                <li>• Improve website functionality, security, and user experience.</li>
                                <li>• Comply with legal obligations.</li>
                            </ul>
                        </section>

                        <Separator />

                        <section>
                            <h2 className="text-2xl font-bold text-gray-800 mb-4">3. How We Share Your Information</h2>
                            <p className="text-gray-700 mb-4">
                                We do not sell your personal data. However, we may share it with:
                            </p>
                            <ul className="space-y-2 text-gray-700">
                                <li>• <strong>Employers/Recruiters:</strong> Candidate details relevant to job opportunities.</li>
                                <li>• <strong>Candidates:</strong> Information about companies and job postings.</li>
                                <li>• <strong>Service Providers:</strong> Trusted third-party vendors for hosting, analytics, and support.</li>
                                <li>• <strong>Legal Authorities:</strong> When required by law or to protect rights, property, or safety.</li>
                            </ul>
                        </section>

                        <Separator />

                        <section>
                            <h2 className="text-2xl font-bold text-gray-800 mb-4">4. Data Security</h2>
                            <p className="text-gray-700">
                                We use industry-standard measures (encryption, secure servers, access controls) to protect your information. 
                                While we strive to ensure security, no system can guarantee 100% protection.
                            </p>
                        </section>

                        <Separator />

                        <section>
                            <h2 className="text-2xl font-bold text-gray-800 mb-4">5. Data Retention</h2>
                            <ul className="space-y-2 text-gray-700">
                                <li>• Candidate and employer data is retained as long as necessary to provide Services.</li>
                                <li>• You may request deletion of your account and personal information anytime by contacting us at <a href="mailto:support@hireaccel.in" className="text-blue-600 hover:underline">support@hireaccel.in</a>.</li>
                            </ul>
                        </section>

                        <Separator />

                        <section>
                            <h2 className="text-2xl font-bold text-gray-800 mb-4">6. Cookies and Tracking</h2>
                            <p className="text-gray-700 mb-4">We use cookies and similar technologies to:</p>
                            <ul className="space-y-2 text-gray-700">
                                <li>• Improve site performance and personalization.</li>
                                <li>• Analyze traffic and user behavior.</li>
                                <li>• Deliver relevant ads and marketing campaigns.</li>
                            </ul>
                            <p className="text-gray-700 mt-4">
                                You can disable cookies via browser settings, but some features may not work properly.
                            </p>
                        </section>

                        <Separator />

                        <section>
                            <h2 className="text-2xl font-bold text-gray-800 mb-4">7. Your Rights</h2>
                            <p className="text-gray-700 mb-4">
                                Depending on your location, you may have the right to:
                            </p>
                            <ul className="space-y-2 text-gray-700">
                                <li>• Access, correct, or delete your personal information.</li>
                                <li>• Restrict or object to processing of your data.</li>
                                <li>• Withdraw consent for marketing communications.</li>
                                <li>• Request a copy of your stored data.</li>
                            </ul>
                            <p className="text-gray-700 mt-4">
                                To exercise these rights, please email us at <a href="mailto:support@hireaccel.in" className="text-blue-600 hover:underline">support@hireaccel.in</a>.
                            </p>
                        </section>

                        <Separator />

                        <section>
                            <h2 className="text-2xl font-bold text-gray-800 mb-4">8. Children's Privacy</h2>
                            <p className="text-gray-700">
                                Our Services are not intended for individuals under 18. We do not knowingly collect data from minors. 
                                If we discover such data, we will delete it promptly.
                            </p>
                        </section>

                        <Separator />

                        <section>
                            <h2 className="text-2xl font-bold text-gray-800 mb-4">9. Third-Party Links</h2>
                            <p className="text-gray-700">
                                Our website may contain links to third-party sites. We are not responsible for their privacy practices 
                                and encourage you to review their policies separately.
                            </p>
                        </section>

                        <Separator />

                        <section>
                            <h2 className="text-2xl font-bold text-gray-800 mb-4">10. Changes to This Policy</h2>
                            <p className="text-gray-700">
                                We may update this Privacy Policy from time to time. Changes will be posted on this page with the updated 
                                "Last Updated" date. Continued use of our Services indicates your acceptance of the revised terms.
                            </p>
                        </section>

                        <Separator />

                        <section>
                            <h2 className="text-2xl font-bold text-gray-800 mb-4">11. Contact Us</h2>
                            <p className="text-gray-700 mb-4">
                                If you have questions or concerns about this Privacy Policy, please contact us:
                            </p>
                            <div className="bg-gray-100 p-4 rounded-lg">
                                <p className="text-gray-700 font-semibold mb-2">HireAccel</p>
                                <p className="text-gray-700">Email: <a href="mailto:support@hireaccel.in" className="text-blue-600 hover:underline">support@hireaccel.in</a></p>
                                <p className="text-gray-700">Website: <a href="https://www.hireaccel.in" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">www.hireaccel.in</a></p>
                            </div>
                        </section>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default PrivacyPolicy;