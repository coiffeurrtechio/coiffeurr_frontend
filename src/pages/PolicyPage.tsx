import React from 'react'

// function PolicyPage() {
const PolicyPage: React.FC = () => {

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm" >
            <div className="glass-card rounded-t-[2rem] sm:rounded-3xl p-5 sm:p-8 w-full max-w-2xl mx-auto animate-in fade-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-start mb-4 sm:mb-6">
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
                        Terms of Service & Privacy Policy
                    </h2>

                </div>

                <div className="space-y-4 sm:space-y-6 text-white/80 text-xs sm:text-sm">
                    <div>
                        <p className="text-[10px] sm:text-xs text-white/50 mb-3 sm:mb-4">Last Updated: April 1, 2026</p>
                        <p className="mb-3 sm:mb-4">Welcome to Coiffeurr ("Platform", "we", "our", "us"). By accessing or using our website, mobile application, or services ("Services"), you agree to these Terms. If you do not agree, please do not use the Platform.</p>
                    </div>

                    <div>
                        <h3 className="text-base sm:text-lg font-bold text-[#D4AF37] mb-2">1. Nature of Service</h3>
                        <p className="mb-2">Coiffeurr is an intermediary platform connecting users ("Customers") with independent salons and service providers ("Service Providers").</p>
                        <p className="mb-2">We do not:</p>
                        <ul className="list-disc list-inside space-y-1 ml-4">
                            <li>Own, operate, or control any salon</li>
                            <li>Provide salon services directly</li>
                            <li>Guarantee quality, safety, or suitability of services</li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-lg font-bold text-[#D4AF37] mb-2">2. User Responsibilities</h3>
                        <p className="mb-2">You agree to:</p>
                        <ul className="list-disc list-inside space-y-1 ml-4">
                            <li>Provide accurate information</li>
                            <li>Arrive on time for appointments</li>
                            <li>Follow salon policies</li>
                            <li>Use the Platform lawfully</li>
                        </ul>
                        <p className="mt-2 mb-2">You are responsible for:</p>
                        <ul className="list-disc list-inside space-y-1 ml-4">
                            <li>Your booking decisions</li>
                            <li>Informing salons about allergies or conditions</li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-lg font-bold text-[#D4AF37] mb-2">3. No Liability</h3>
                        <p className="mb-2">To the maximum extent permitted by law, Coiffeurr is not liable for:</p>
                        <ul className="list-disc list-inside space-y-1 ml-4">
                            <li>Injuries, allergic reactions, or health issues</li>
                            <li>Poor service or dissatisfaction</li>
                            <li>Loss, theft, or damage at salon premises</li>
                            <li>Misconduct or negligence by Service Providers</li>
                            <li>Delays, cancellations, or rescheduling</li>
                        </ul>
                        <p className="mt-2">All services are used at your own risk.</p>
                    </div>

                    <div>
                        <h3 className="text-lg font-bold text-[#D4AF37] mb-2">4. No Warranty</h3>
                        <p className="mb-2">The Platform is provided "as-is" and "as-available" without warranties, including:</p>
                        <ul className="list-disc list-inside space-y-1 ml-4">
                            <li>No guarantee of availability</li>
                            <li>No assurance of accuracy of listings or pricing</li>
                            <li>No guarantee of uninterrupted or error-free service</li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-lg font-bold text-[#D4AF37] mb-2">5. Payments & Refunds</h3>
                        <ul className="list-disc list-inside space-y-1 ml-4">
                            <li>Payments are processed via third-party gateways</li>
                            <li>We are not responsible for payment issues caused by them</li>
                            <li>Refunds depend on salon and platform policies</li>
                            <li>Refunds may be denied in case of misuse</li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-lg font-bold text-[#D4AF37] mb-2">6. Cancellations & No-Shows</h3>
                        <ul className="list-disc list-inside space-y-1 ml-4">
                            <li>Users must follow the cancellation policy at booking</li>
                            <li>Repeated no-shows may lead to account suspension</li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-lg font-bold text-[#D4AF37] mb-2">7. Third-Party Services</h3>
                        <p className="mb-2">Service Providers are independent entities.</p>
                        <p className="mb-2">We do not:</p>
                        <ul className="list-disc list-inside space-y-1 ml-4">
                            <li>Conduct background checks (unless stated)</li>
                            <li>Guarantee certifications</li>
                            <li>Take responsibility for their actions</li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-lg font-bold text-[#D4AF37] mb-2">8. Limitation of Liability</h3>
                        <ul className="list-disc list-inside space-y-1 ml-4">
                            <li>We are not liable for indirect or consequential damages</li>
                            <li>Total liability (if any) is limited to the booking amount</li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-lg font-bold text-[#D4AF37] mb-2">9. Indemnification</h3>
                        <p className="mb-2">You agree to indemnify Coiffeurr from claims arising from:</p>
                        <ul className="list-disc list-inside space-y-1 ml-4">
                            <li>Your use of the Platform</li>
                            <li>Interactions with Service Providers</li>
                            <li>Violation of these Terms</li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-lg font-bold text-[#D4AF37] mb-2">10. Account Termination</h3>
                        <p className="mb-2">We may suspend or terminate accounts for:</p>
                        <ul className="list-disc list-inside space-y-1 ml-4">
                            <li>Misuse or fraud</li>
                            <li>Violation of Terms</li>
                        </ul>
                        <p className="mt-2">We may modify or discontinue the Platform at any time.</p>
                    </div>

                    <div>
                        <h3 className="text-lg font-bold text-[#D4AF37] mb-2">11. Privacy</h3>
                        <p>Your use of the Platform is subject to our Privacy Policy.</p>
                    </div>

                    <div>
                        <h3 className="text-lg font-bold text-[#D4AF37] mb-2">12. Security</h3>
                        <p className="mb-2">We take your security seriously and implement industry-standard measures to protect your information.</p>
                        <ul className="list-disc list-inside space-y-1 ml-4">
                            <li>Your personal data is encrypted and stored securely</li>
                            <li>We use secure payment gateways for all transactions</li>
                            <li>Regular security updates protect your account</li>
                            <li>We monitor for suspicious activity to prevent unauthorized access</li>
                            <li>Your information is never shared without your consent</li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-lg font-bold text-[#D4AF37] mb-2">13. Governing Law</h3>
                        <ul className="list-disc list-inside space-y-1 ml-4">
                            <li>These Terms are governed by the laws of India.</li>
                            <li>Disputes are subject to the courts of Assam.</li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-lg font-bold text-[#D4AF37] mb-2">14. Changes to Terms</h3>
                        <p>We may update these Terms at any time. Continued use means acceptance.</p>
                    </div>

                    <div className="border-t border-white/10 pt-6">
                        <h3 className="text-lg font-bold text-[#D4AF37] mb-3">Support</h3>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <span className="text-white/60">Email:</span>
                                <span className="text-white">mrmrscoiffeurr@gmail.com</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-white/60">WhatsApp:</span>
                                <span className="text-white">+91-7045464907</span>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    )
}

export default PolicyPage
